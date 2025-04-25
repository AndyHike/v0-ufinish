import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { z } from "zod"
import crypto from "crypto"

// This is the secret key that RemOnline will use to authenticate the webhook
const REMONLINE_ORDER_WEBHOOK_SECRET = process.env.REMONLINE_ORDER_WEBHOOK_SECRET
if (!REMONLINE_ORDER_WEBHOOK_SECRET) {
  console.warn("REMONLINE_ORDER_WEBHOOK_SECRET is not set. Webhook verification will be skipped.")
}

// Define a schema for the RemOnline webhook payload
const remonlineOrderWebhookSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  created_at_ts: z.number(),
  event_name: z.string(),
  context: z.object({
    object_id: z.number(),
    object_type: z.string(),
  }),
  metadata: z.object({
    order: z.object({
      id: z.number(),
      name: z.string(),
      type: z.number(),
    }),
    client: z.object({
      id: z.number(),
      fullname: z.string(),
    }),
    status: z.object({
      id: z.number(),
    }),
    asset: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .optional(),
  }),
  "x-signature": z.string().optional(),
  employee: z.object({
    id: z.number(),
    full_name: z.string(),
    email: z.string().email(),
  }),
})

// Map of RemOnline status IDs to our status names
const statusIdMap: Record<number, string> = {
  3153189: "Новий", // New order status ID
  // Add more status mappings as needed
}

export async function POST(request: NextRequest) {
  try {
    // Log the request URL to debug routing issues
    console.log(`Webhook received at: ${request.url}`)

    // Log all headers for debugging
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
      console.log(`Header: ${key}: ${value}`)
    })

    // Clone the request to access the body as text
    const clonedRequest = request.clone()
    const requestText = await clonedRequest.text()

    // Log the received webhook
    console.log("RemOnline order webhook received")

    // Parse the request body
    let payload
    try {
      payload = JSON.parse(requestText)
      console.log("Webhook payload:", JSON.stringify(payload, null, 2))
    } catch (e) {
      console.error("Failed to parse webhook payload:", e)
      // Return 200 OK even for invalid JSON to prevent webhook deactivation
      return NextResponse.json({ success: false, message: "Invalid JSON" })
    }

    // Verify the webhook signature
    // The signature could be in the header or in the payload itself
    const headerSignature = request.headers.get("x-signature")
    const payloadSignature = payload["x-signature"]
    const signature = headerSignature || payloadSignature

    if (REMONLINE_ORDER_WEBHOOK_SECRET && signature && payload.id) {
      // Based on the example, it seems the signature is in the payload itself
      // and might be using a different method than we initially thought

      const webhookId = payload.id

      // Try different signature verification methods
      let signatureValid = false

      // Method 1: Using webhook ID + secret (as per documentation)
      const computedSignature1 = crypto
        .createHash("sha256")
        .update(`${webhookId}${REMONLINE_ORDER_WEBHOOK_SECRET}`)
        .digest("hex")

      // Method 2: Using request body + secret (common webhook pattern)
      // For this method, we need to remove the x-signature field from the payload
      const payloadWithoutSignature = { ...payload }
      delete payloadWithoutSignature["x-signature"]
      const payloadString = JSON.stringify(payloadWithoutSignature)

      const computedSignature2 = crypto
        .createHmac("sha256", REMONLINE_ORDER_WEBHOOK_SECRET)
        .update(payloadString)
        .digest("hex")

      // Method 3: Using webhook ID + secret with HMAC
      const computedSignature3 = crypto
        .createHmac("sha256", REMONLINE_ORDER_WEBHOOK_SECRET)
        .update(webhookId)
        .digest("hex")

      console.log(`Webhook ID: ${webhookId}`)
      console.log(`Received signature: ${signature}`)
      console.log(`Computed signature 1 (ID+Secret): ${computedSignature1}`)
      console.log(`Computed signature 2 (HMAC body): ${computedSignature2}`)
      console.log(`Computed signature 3 (HMAC ID): ${computedSignature3}`)

      if (signature === computedSignature1) {
        console.log("Webhook signature verified successfully using method 1")
        signatureValid = true
      } else if (signature === computedSignature2) {
        console.log("Webhook signature verified successfully using method 2")
        signatureValid = true
      } else if (signature === computedSignature3) {
        console.log("Webhook signature verified successfully using method 3")
        signatureValid = true
      }

      if (!signatureValid) {
        console.error("Invalid webhook signature - rejecting request")
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 })
      }
    } else {
      if (!signature) {
        console.warn("No X-Signature header or payload signature found in the request")
      }
      if (!payload.id) {
        console.warn("No webhook ID found in the payload")
      }
      if (!REMONLINE_ORDER_WEBHOOK_SECRET) {
        console.warn("REMONLINE_ORDER_WEBHOOK_SECRET is not set")
      }
      console.warn("Webhook signature verification skipped")
    }

    // Validate the webhook payload against the schema
    const parsedPayload = remonlineOrderWebhookSchema.safeParse(payload)
    if (!parsedPayload.success) {
      console.error("Invalid webhook payload structure:", parsedPayload.error)
      // Return 200 OK even for invalid payload to prevent webhook deactivation
      return NextResponse.json({ success: false, message: "Invalid payload structure" })
    }

    // Get the order data
    const orderData = parsedPayload.data
    const eventType = orderData.event_name
    const orderId = orderData.context.object_id
    const clientId = orderData.metadata.client.id

    // Extract metadata from the webhook payload
    const orderNumber = orderData.metadata.order.name
    const statusId = orderData.metadata.status.id
    const deviceName = orderData.metadata.asset?.name || "Unknown Device"
    const createdAt = orderData.created_at

    console.log(`Processing ${eventType} for order ID: ${orderId}`)
    console.log(`Client ID: ${clientId}, Order Number: ${orderNumber}, Status ID: ${statusId}, Device: ${deviceName}`)

    // Start background processing and immediately return success
    // This prevents webhook timeout and deactivation
    processOrderFromWebhook(orderData).catch((error) => {
      console.error(`Background processing error for order ${orderId}:`, error)
    })

    // Immediately return success response
    return NextResponse.json({ success: true, message: "Webhook received and processing started" })
  } catch (error) {
    console.error("Error in webhook handler:", error)
    // Return 200 OK even for errors to prevent webhook deactivation
    return NextResponse.json({
      success: false,
      message: "Error processing webhook, but received",
    })
  }
}

// Process order data directly from webhook payload
async function processOrderFromWebhook(webhookData: any) {
  const supabase = createClient()

  try {
    const orderId = webhookData.context.object_id
    const clientId = webhookData.metadata.client.id
    const orderNumber = webhookData.metadata.order.name
    const statusId = webhookData.metadata.status.id
    const deviceName = webhookData.metadata.asset?.name || "Unknown Device"
    const createdAt = webhookData.created_at

    console.log(`Processing order from webhook: ${orderId}`)
    console.log(`Webhook Data: ${JSON.stringify(webhookData, null, 2)}`)

    // Find the user by RemOnline client ID
    console.log(`Looking for user with remonline_id: ${clientId}`)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("remonline_id", clientId)
      .single()

    if (userError) {
      console.log("Error finding user by RemOnline ID:", userError)
      console.error("Error finding user by RemOnline ID:", userError)
      return { success: false, message: "User not found" }
    }

    if (!user) {
      console.log(`No user found with remonline_id: ${clientId}. Skipping order creation.`)
      return { success: false, message: "User not found" }
    }

    console.log(`Found user with ID: ${user.id}`)

    // Extract device brand and model from the device name
    let deviceBrand = "Unknown"
    let deviceModel = deviceName
    console.log(`Device Name: ${deviceName}`)

    // Try to extract brand from device name (e.g., "iphone 11 pro" -> "iPhone" as brand, "11 Pro" as model)
    const knownBrands = ["iphone", "samsung", "xiaomi", "huawei", "oppo", "vivo", "realme", "oneplus", "google"]
    for (const brand of knownBrands) {
      if (deviceName.toLowerCase().includes(brand)) {
        deviceBrand = brand.charAt(0).toUpperCase() + brand.slice(1) // Capitalize brand name
        deviceModel = deviceName.replace(new RegExp(brand, "i"), "").trim()
        break
      }
    }

    // Map status ID to status name
    const status = statusIdMap[statusId] || "Новий" // Default to "New" if status ID is not found

    // Prepare order details for database
    const orderDetails = {
      user_id: user.id,
      remonline_id: orderId,
      remonline_client_id: clientId,
      reference_number: orderNumber,
      device_brand: deviceBrand,
      device_model: deviceModel,
      service_type: "Діагностика", // Default service type, will be updated with actual data if needed
      status: status,
      price: null, // Price is not available in the webhook payload
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    }

    console.log(`Order Details: ${JSON.stringify(orderDetails, null, 2)}`)

    // Check if order already exists
    const { data: existingOrder, error: checkError } = await supabase
      .from("repair_orders")
      .select("id")
      .eq("remonline_id", orderId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.log("Error checking existing order:", checkError)
      console.error("Error checking existing order:", checkError)
    }

    if (existingOrder) {
      console.log(`Order already exists, updating: ${orderId}`)
      // Update existing order
      const { error: updateError } = await supabase
        .from("repair_orders")
        .update(orderDetails)
        .eq("remonline_id", orderId)

      if (updateError) {
        console.error("Error updating order:", updateError)
        return { success: false, message: "Failed to update order" }
      }

      console.log(`Order updated: ${orderId}`)
    } else {
      console.log(`Order does not exist, creating new order: ${orderId}`)
      // Create new order
      const { data: insertedData, error: insertError } = await supabase
        .from("repair_orders")
        .insert([orderDetails])
        .select()

      if (insertError) {
        console.error("Error creating order:", insertError)
        return { success: false, message: "Failed to create order" }
      }

      console.log(`Order created: ${orderId}, Inserted Data: ${JSON.stringify(insertedData)}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error processing order from webhook:", error)
    return {
      success: false,
      message: "Failed to process order from webhook",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
