import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { hash } from "@/lib/auth/utils"

// This is the secret key that RemOnline will use to authenticate the webhook
// You should set this in your environment variables and configure it in RemOnline
const WEBHOOK_SECRET = process.env.REMONLINE_WEBHOOK_SECRET || "your-webhook-secret"

// Додайте логування для кращого відстеження
export async function POST(request: Request) {
  try {
    // Зберегти оригінальний запит для логування
    const clonedRequest = request.clone()
    const payload = await clonedRequest.json()
    console.log("RemOnline webhook received:", payload)

    // Verify the webhook signature if RemOnline provides one
    const signature = request.headers.get("x-remonline-signature")

    // If you have a signature verification mechanism, implement it here
    // if (!verifySignature(signature, await request.text(), WEBHOOK_SECRET)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    // Отримуємо оригінальні дані
    const originalRequest = await request.json()
    console.log("RemOnline webhook data:", originalRequest)

    // Check the event type
    const eventType = originalRequest.event || ""

    if (eventType === "client.created" || eventType === "client.updated") {
      await handleClientEvent(originalRequest.data)
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
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        email,
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
      id: userData.id,
      name: `${firstName} ${lastName}`.trim(),
      phone,
      email,
      address,
    })

    console.log(`User created from RemOnline webhook: ${userData.id}`)
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
