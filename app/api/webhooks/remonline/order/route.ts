import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { z } from "zod"
import remonline from "@/lib/api/remonline"
import crypto from "crypto"

// This is the secret key that RemOnline will use to authenticate the webhook
const REMONLINE_ORDER_WEBHOOK_SECRET = process.env.REMONLINE_ORDER_WEBHOOK_SECRET
if (!REMONLINE_ORDER_WEBHOOK_SECRET) {
  console.warn("REMONLINE_ORDER_WEBHOOK_SECRET is not set. Webhook verification will be skipped.")
}

// Define a schema for the RemOnline webhook payload for orders based on the example
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

    // Extract metadata from the webhook payload
    const clientId = orderData.metadata.client.id
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
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("remonline_id", clientId)
      .single()

    if (userError) {
      console.log("Error finding user by RemOnline ID:", userError)
      console.error("Error finding user by RemOnline ID:", userError)

      // If the user is not found, we might need to fetch more details from RemOnline API
      // and create a new user record, or just log the error and skip this order
      console.log("User not found, fetching additional details from RemOnline API...")

      // Fetch complete order details to get more information
      console.log(`Fetching order details from RemOnline API for order ID: ${orderId}`)
      const orderDetails = await fetchOrderDetailsFromRemonline(orderId)

      if (!orderDetails.success) {
        console.error("Failed to fetch order details from RemOnline:", orderDetails.message)
        return { success: false, message: "User not found and failed to fetch order details" }
      }

      console.log("Order details fetched, but user still not found. Skipping order processing.")
      return { success: false, message: "User not found" }
    }

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
      // Create new order
      const { error: insertError } = await supabase.from("repair_orders").insert([orderDetails]).select()

      if (insertError) {
        console.error("Error creating order:", insertError)
        return { success: false, message: "Failed to create order" }
      }

      console.log(`Order created: ${orderId}`)
    }

    // If we need more detailed information, we can fetch it from the RemOnline API
    // This is optional and can be done asynchronously
    /*fetchAndUpdateOrderDetails(orderId, orderDetails).catch((error) => {
      console.error(`Error updating order details: ${error}`)
    })*/

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

// Fetch additional order details from RemOnline API and update the database
async function fetchAndUpdateOrderDetails(orderId: number, existingDetails: any) {
  try {
    console.log(`Fetching additional details for order ${orderId}`)
    console.log(`Existing Details: ${JSON.stringify(existingDetails, null, 2)}`)

    // Fetch complete order details from RemOnline API
    const orderDetails = await fetchOrderDetailsFromRemonline(orderId)

    if (!orderDetails.success) {
      console.error("Failed to fetch additional order details from RemOnline:", orderDetails.message)
      return
    }

    const orderData = orderDetails.order

    // Extract additional information from the API response
    const updatedDetails = {
      ...existingDetails,
      service_type: extractServiceType(orderData),
      price: orderData.price || null,
      // Update any other fields as needed
    }

    // Update the order in the database with the additional information
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("repair_orders")
      .update(updatedDetails)
      .eq("remonline_id", orderId)

    if (updateError) {
      console.error("Error updating order with additional details:", updateError)
      return
    }

    console.log(`Order ${orderId} updated with additional details`)
  } catch (error) {
    console.error("Error in fetchAndUpdateOrderDetails for order ${orderId}:", error)
    // Log the error but don't throw - this is a background process
  }
}

async function fetchOrderDetailsFromRemonline(orderId: number) {
  try {
    // Authenticate with RemOnline API
    console.log("Authenticating with RemOnline API...")
    const authResult = await remonline.auth()
    if (!authResult.success) {
      console.error("Failed to authenticate with RemOnline API:", authResult.message)
      return {
        success: false,
        message: "Failed to connect to RemOnline. Will retry later.",
      }
    }

    console.log(`Fetching order details for ID: ${orderId}`)

    // Use the token from our authenticated client
    const url = `https://api.remonline.app/orders/${orderId}?token=${authResult.token}`

    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch order details with status ${response.status}: ${errorText}`)
      return {
        success: false,
        message: `Failed to fetch order details with status ${response.status}`,
        details: errorText,
      }
    }

    const responseText = await response.text()
    console.log("Response received, parsing JSON")

    let data
    try {
      data = JSON.parse(responseText)
      console.log("Order details parsed successfully")
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      return {
        success: false,
        message: "Failed to parse order details response",
        details: e instanceof Error ? e.message : String(e),
      }
    }

    return { success: true, order: data }
  } catch (error) {
    console.error("Error fetching order details from RemOnline:", error)
    return {
      success: false,
      message: "Failed to fetch order details from RemOnline API",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

function extractServiceType(orderData: any): string {
  // Try to extract service type from different possible fields
  if (orderData.works && Array.isArray(orderData.works) && orderData.works.length > 0) {
    return orderData.works.map((work: any) => work.name || work.title).join(", ")
    console.log(`Service Type (from works): ${orderData.works.map((work: any) => work.name || work.title).join(", ")}`)
  }

  if (orderData.service_name) {
    return orderData.service_name
  }

  if (orderData.description) {
    return orderData.description.substring(0, 100) // Limit length
  }

  return "Діагностика"
}

function mapOrderStatus(status: string): string {
  // Map RemOnline status to our status
  const statusMap: Record<string, string> = {
    Новий: "Новий",
    New: "Новий",
    "В роботі": "В процесі",
    "In Progress": "В процесі",
    Готовий: "Завершено",
    Ready: "Завершено",
    Completed: "Завершено",
    Виданий: "Завершено",
    Delivered: "Завершено",
    Cancelled: "Скасовано",
    Скасовано: "Скасовано",
  }

  return statusMap[status] || "Новий"
}
