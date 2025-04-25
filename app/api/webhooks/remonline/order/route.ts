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

// Define a schema for the RemOnline webhook payload for orders
const remonlineOrderWebhookSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  event_name: z.string(),
  context: z.object({
    object_id: z.number(),
    object_type: z.string(),
  }),
  employee: z.object({
    id: z.number(),
    full_name: z.string(),
    email: z.string().email(),
  }),
})

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

    // Verify the webhook signature according to RemOnline documentation
    // The signature is a SHA-256 hash generated using the webhook id and the secret key
    const signature = request.headers.get("x-signature")

    if (REMONLINE_ORDER_WEBHOOK_SECRET && signature && payload.id) {
      // Try multiple signature verification methods to find the correct one
      let signatureValid = false

      // Method 1: Using webhook ID + secret (as per documentation)
      const webhookId = payload.id
      const computedSignature1 = crypto
        .createHash("sha256")
        .update(`${webhookId}${REMONLINE_ORDER_WEBHOOK_SECRET}`)
        .digest("hex")

      // Method 2: Using request body + secret (common webhook pattern)
      const computedSignature2 = crypto
        .createHmac("sha256", REMONLINE_ORDER_WEBHOOK_SECRET)
        .update(requestText)
        .digest("hex")

      // Method 3: Using webhook ID + secret with HMAC
      const computedSignature3 = crypto
        .createHmac("sha256", REMONLINE_ORDER_WEBHOOK_SECRET)
        .update(webhookId)
        .digest("hex")

      // Method 4: Using webhook ID + secret with different encoding
      const computedSignature4 = crypto
        .createHash("sha256")
        .update(`${webhookId}${REMONLINE_ORDER_WEBHOOK_SECRET}`, "utf8")
        .digest("hex")

      console.log(`Webhook ID: ${webhookId}`)
      console.log(`Received signature: ${signature}`)
      console.log(`Computed signature 1 (ID+Secret): ${computedSignature1}`)
      console.log(`Computed signature 2 (HMAC body): ${computedSignature2}`)
      console.log(`Computed signature 3 (HMAC ID): ${computedSignature3}`)
      console.log(`Computed signature 4 (ID+Secret UTF8): ${computedSignature4}`)

      // Check if any of the computed signatures match
      if (signature === computedSignature1) {
        console.log("Webhook signature verified successfully using method 1")
        signatureValid = true
      } else if (signature === computedSignature2) {
        console.log("Webhook signature verified successfully using method 2")
        signatureValid = true
      } else if (signature === computedSignature3) {
        console.log("Webhook signature verified successfully using method 3")
        signatureValid = true
      } else if (signature === computedSignature4) {
        console.log("Webhook signature verified successfully using method 4")
        signatureValid = true
      }

      if (!signatureValid) {
        console.error("Invalid webhook signature - rejecting request")
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 })
      }
    } else {
      if (!signature) {
        console.warn("No X-Signature header found in the request")
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

    console.log(`Processing ${eventType} for order ID: ${orderId}`)

    // Start background processing and immediately return success
    // This prevents webhook timeout and deactivation
    processOrderAsync(orderId, eventType).catch((error) => {
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

// Asynchronous function for background order processing
async function processOrderAsync(orderId: number, eventType: string) {
  try {
    console.log(`Background processing started for order ${orderId}`)

    // Only process relevant event types
    if (eventType === "Order.Created" || eventType === "Order.Updated" || eventType === "Order.StatusChanged") {
      // Fetch complete order details from RemOnline API
      const orderDetails = await fetchOrderDetailsFromRemonline(orderId)

      if (!orderDetails.success) {
        console.error("Failed to fetch order details from RemOnline:", orderDetails.message)
        return
      }

      // Process the order details
      await processOrderDetails(orderDetails.order)
      console.log(`Successfully processed order ${orderId}`)
    } else {
      console.log(`Skipping processing for event type: ${eventType}`)
    }

    console.log(`Background processing completed for order ${orderId}`)
  } catch (error) {
    console.error(`Background processing failed for order ${orderId}:`, error)
    // Log the error but don't throw - this is a background process
  }
}

async function fetchOrderDetailsFromRemonline(orderId: number) {
  try {
    // Authenticate with RemOnline API
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

async function processOrderDetails(orderData: any) {
  const supabase = createClient()

  try {
    // Extract client ID from order data
    const clientId = orderData.client?.id
    if (!clientId) {
      console.error("Order has no client ID, cannot process order")
      return { success: false, message: "Order has no client ID" }
    }

    // Find the user by RemOnline client ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("remonline_id", clientId)
      .single()

    if (userError) {
      console.error("Error finding user by RemOnline ID:", userError)
      return { success: false, message: "User not found" }
    }

    // Extract order details
    const orderDetails = {
      user_id: user.id,
      remonline_id: orderData.id,
      reference_number: orderData.number || `ORD-${orderData.id}`,
      device_brand: orderData.brand?.name || "Unknown Brand",
      device_model: orderData.model?.name || orderData.custom_model || "Unknown Model",
      service_type: extractServiceType(orderData),
      status: mapOrderStatus(orderData.status?.name || "New"),
      price: orderData.price || null,
      created_at: orderData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Check if order already exists
    const { data: existingOrder, error: checkError } = await supabase
      .from("repair_orders")
      .select("id")
      .eq("remonline_id", orderData.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing order:", checkError)
    }

    if (existingOrder) {
      // Update existing order
      const { error: updateError } = await supabase
        .from("repair_orders")
        .update(orderDetails)
        .eq("remonline_id", orderData.id)

      if (updateError) {
        console.error("Error updating order:", updateError)
        return { success: false, message: "Failed to update order" }
      }

      console.log(`Order updated: ${orderData.id}`)
    } else {
      // Create new order
      const { error: insertError } = await supabase.from("repair_orders").insert([orderDetails])

      if (insertError) {
        console.error("Error creating order:", insertError)
        return { success: false, message: "Failed to create order" }
      }

      console.log(`Order created: ${orderData.id}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error processing order details:", error)
    return {
      success: false,
      message: "Failed to process order details",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

function extractServiceType(orderData: any): string {
  // Try to extract service type from different possible fields
  if (orderData.works && Array.isArray(orderData.works) && orderData.works.length > 0) {
    return orderData.works.map((work: any) => work.name || work.title).join(", ")
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
