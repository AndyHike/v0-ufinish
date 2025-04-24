import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { hash } from "@/lib/auth/utils"
import { z } from "zod"
import remonline from "@/lib/api/remonline"
import { syncClientToRemonline, updateRemonlineIdForUser } from "@/lib/api/remonline"

// This is the secret key that RemOnline will use to authenticate the webhook
// You should set this in your environment variables and configure it in RemOnline
const WEBHOOK_SECRET = process.env.REMONLINE_WEBHOOK_SECRET || "your-webhook-secret"

// Define a schema for the RemOnline client data
const remonlineClientSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.array(z.string()).optional(),
  address: z.string().optional(),
})

// Define a schema for the RemOnline webhook payload
const remonlineWebhookSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  event_name: z.string(),
  context: z.object({
    object_id: z.number(),
    object_type: z.string(),
  }),
  metadata: z.object({
    client: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }),
  employee: z.object({
    id: z.number(),
    full_name: z.string(),
    email: z.string().email(),
  }),
})

// Додайте логування для кращого відстеження
export async function POST(request: Request) {
  try {
    // Зберегти оригінальний запит для логування
    const clonedRequest = request.clone()
    const payload = await clonedRequest.json()
    console.log("RemOnline webhook received:", payload)

    // Validate the webhook payload against the schema
    const parsedPayload = remonlineWebhookSchema.safeParse(payload)

    if (!parsedPayload.success) {
      console.error("Invalid webhook payload:", parsedPayload.error)
      return NextResponse.json(
        { error: "Invalid webhook payload", details: parsedPayload.error.errors },
        { status: 400 },
      )
    }

    // Verify the webhook signature if RemOnline provides one
    const signature = request.headers.get("x-remonline-signature")

    // If you have a signature verification mechanism, implement it here
    // if (!verifySignature(signature, await request.text(), WEBHOOK_SECRET)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    // Отримуємо оригінальні дані
    const originalRequest = parsedPayload.data
    console.log("RemOnline webhook data:", originalRequest)

    // Check the event type
    const eventType = originalRequest.event_name || ""

    if (eventType === "Client.Created" || eventType === "Client.Updated") {
      const clientId = originalRequest.context.object_id

      // Fetch complete client details from RemOnline API
      const clientDetails = await fetchClientDetailsFromRemonline(clientId)

      if (!clientDetails.success) {
        console.error("Failed to fetch client details from RemOnline:", clientDetails.message)
        return NextResponse.json(
          { error: "Failed to fetch client details from RemOnline", details: clientDetails.message },
          { status: 500 },
        )
      }

      // Check if clientDetails.client exists before parsing
      if (!clientDetails.client) {
        console.error("Client details are undefined, skipping processing")
        return NextResponse.json({ success: true, message: "Client details are undefined, skipping processing" })
      }

      // Validate client data against the schema
      const clientData = remonlineClientSchema.safeParse(clientDetails.client)

      if (!clientData.success) {
        console.error("Invalid client data:", clientData.error)
        return NextResponse.json({ error: "Invalid client data", details: clientData.error.errors }, { status: 400 })
      }

      await handleClientEvent(clientData.data)
      return NextResponse.json({ success: true })
    }

    // Handle other event types as needed

    return NextResponse.json({ success: true, message: "Webhook received but no action taken" })
  } catch (error) {
    console.error("Error processing RemOnline webhook:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function fetchClientDetailsFromRemonline(clientId: number) {
  try {
    const authResult = await remonline.auth()
    if (!authResult.success) {
      console.error("Failed to authenticate with RemOnline API:", authResult.message)
      return {
        success: false,
        message: "Failed to connect to RemOnline. Will retry later.",
      }
    }

    const options = { method: "GET", headers: { accept: "application/json" } }

    const response = await fetch(`https://api.remonline.app/clients/${clientId}?token=${authResult.token}`, options)
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch client details with status ${response.status}: ${errorText}`)
      return {
        success: false,
        message: `Failed to fetch client details with status ${response.status}`,
        details: errorText,
      }
    }

    const data = await response.json()
    console.log("Client details response:", data)

    return { success: true, client: data }
  } catch (error) {
    console.error("Error fetching client details from RemOnline:", error)
    return {
      success: false,
      message: "Failed to fetch client details from RemOnline API",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function handleClientEvent(clientData: any) {
  if (!clientData || !clientData.id) {
    console.error("Invalid client data received from webhook")
    return
  }

  const supabase = createClient()

  // Check if the client already exists in our database
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("remonline_id", clientData.id)
    .maybeSingle()

  if (existingUser) {
    // Update existing user
    await updateExistingUser(supabase, existingUser.id, clientData)
  } else {
    // Create new user
    await createNewUser(supabase, clientData)
  }
}

async function createNewUser(supabase: any, clientData: any) {
  try {
    // Extract client data
    const email = clientData.email?.toLowerCase()
    const firstName = clientData.first_name || ""
    const lastName = clientData.last_name || ""
    const phone = clientData.phone && clientData.phone.length > 0 ? clientData.phone[0] : null
    const address = clientData.address || ""

    if (!email) {
      console.error("Client from RemOnline has no email, cannot create user")
      return
    }

    // Generate a random password (user will use passwordless login anyway)
    const randomPassword = Math.random().toString(36).slice(-10)
    const passwordHash = await hash(randomPassword)

    // Create user in our database
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        email: email,
        name: `${firstName} ${lastName}`.trim(),
        password_hash: passwordHash,
        role: "user",
        remonline_id: clientData.id,
        email_verified: true, // Since it's coming from RemOnline, we can trust it
      })
      .select("id")
      .single()

    if (userError) {
      console.error("Error creating user from RemOnline webhook:", userError)
      return
    }

    // Create profile
    await supabase.from("profiles").insert({
      id: newUser.id,
      name: `${firstName} ${lastName}`.trim(),
      phone,
      email,
      address,
    })

    console.log(`User created from RemOnline webhook: ${newUser.id}`)

    // Sync with RemOnline in the background and update remonline_id
    syncClientToRemonline({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: clientData.phone || [],
      address: address,
    })
      .then(async (result) => {
        if (result.success && result.remonlineId) {
          // Await the updateRemonlineIdForUser function
          await updateRemonlineIdForUser(newUser.id, result.remonlineId)
          console.log(`Successfully synced RemOnline ID for user ${newUser.id}: ${result.remonlineId}`)
        }
      })
      .catch((error) => {
        console.error("Error syncing with RemOnline:", error)
      })
  } catch (error) {
    console.error("Error in createNewUser:", error)
  }
}

async function updateExistingUser(supabase: any, userId: string, clientData: any) {
  try {
    // Extract client data
    const email = clientData.email?.toLowerCase()
    const firstName = clientData.first_name || ""
    const lastName = clientData.last_name || ""
    const phone = clientData.phone && clientData.phone.length > 0 ? clientData.phone[0] : null
    const address = clientData.address || ""

    if (!email) {
      console.error("Client from RemOnline has no email, cannot update user")
      return
    }

    // Update user
    await supabase
      .from("users")
      .update({
        email,
        name: `${firstName} ${lastName}`.trim(),
      })
      .eq("id", userId)

    // Update profile
    await supabase
      .from("profiles")
      .update({
        name: `${firstName} ${lastName}`.trim(),
        phone,
        email,
        address,
      })
      .eq("id", userId)

    console.log(`User updated from RemOnline webhook: ${userId}`)
  } catch (error) {
    console.error("Error in updateExistingUser:", error)
  }
}
