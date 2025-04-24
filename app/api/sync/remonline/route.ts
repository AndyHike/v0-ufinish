import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { formatPhone } from "@/utils/format-phone"

// Schema for client search
const SearchSchema = z.object({
  term: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  page: z.number().default(1),
  limit: z.number().default(50),
})

const REMONLINE_API_URL = "https://api.remonline.app"

// Function to get authentication token
async function getRemonlineToken() {
  const response = await fetch(`${REMONLINE_API_URL}/token/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.REMONLINE_API_TOKEN,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.token
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const searchParams = SearchSchema.parse(body)

    // Get token
    const token = await getRemonlineToken()

    // Build search query
    const searchQuery = new URLSearchParams()
    searchQuery.append("token", token)

    if (searchParams.term) {
      searchQuery.append("query", searchParams.term)
    }

    if (searchParams.email) {
      searchQuery.append("email", searchParams.email)
    }

    if (searchParams.phone) {
      searchQuery.append("phone", searchParams.phone)
    }

    searchQuery.append("page", searchParams.page.toString())
    searchQuery.append("limit", searchParams.limit.toString())

    // Fetch clients from Remonline
    const response = await fetch(`${REMONLINE_API_URL}/clients?${searchQuery.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`)
    }

    const clientsData = await response.json()

    // Process clients and sync to database
    for (const client of clientsData.data) {
      if (!client.email && !client.phone) continue

      const formattedPhone = client.phone ? formatPhone(client.phone) : null

      // Check if user exists
      let existingUser = null

      if (client.email) {
        const { data: userByEmail } = await supabase
          .from("users")
          .select("id")
          .eq("email", client.email.toLowerCase())
          .single()

        if (userByEmail) existingUser = userByEmail
      }

      if (!existingUser && formattedPhone) {
        const { data: profileByPhone } = await supabase
          .from("profiles")
          .select("id")
          .eq("phone", formattedPhone)
          .single()

        if (profileByPhone) {
          const { data: userById } = await supabase.from("users").select("id").eq("id", profileByPhone.id).single()

          if (userById) existingUser = userById
        }
      }

      if (existingUser) {
        // Update existing user
        const userId = existingUser.id

        // Update users table if email is provided
        if (client.email) {
          await supabase
            .from("users")
            .update({
              email: client.email.toLowerCase(),
              remonline_id: client.id,
            })
            .eq("id", userId)
        }

        // Update profiles table
        const profileUpdate: Record<string, any> = {
          updated_at: new Date().toISOString(),
        }

        if (client.name) profileUpdate.name = client.name
        if (formattedPhone) profileUpdate.phone = formattedPhone
        if (client.address) profileUpdate.address = client.address

        await supabase.from("profiles").update(profileUpdate).eq("id", userId)
      } else {
        // Create new user with transaction to ensure both tables are updated
        const userId = uuidv4()

        // Start with users table
        if (client.email) {
          const { error: userError } = await supabase.from("users").insert({
            id: userId,
            email: client.email.toLowerCase(),
            role: "customer",
            remonline_id: client.id,
          })

          if (userError) {
            console.error("Error creating user:", userError)
            continue // Skip to next client
          }
        } else {
          // If no email, create a dummy email based on phone
          const dummyEmail = `${formattedPhone?.replace(/\D/g, "")}@placeholder.com`

          const { error: userError } = await supabase.from("users").insert({
            id: userId,
            email: dummyEmail,
            role: "customer",
            remonline_id: client.id,
          })

          if (userError) {
            console.error("Error creating user with dummy email:", userError)
            continue // Skip to next client
          }
        }

        // Then create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          name: client.name || "Customer",
          phone: formattedPhone,
          address: client.address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)

          // Rollback user creation if profile creation fails
          await supabase.from("users").delete().eq("id", userId)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sync completed successfully",
      total: clientsData.count,
      processed: clientsData.data.length,
    })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      {
        error: "Failed to sync with Remonline",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
