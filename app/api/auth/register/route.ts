import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { hash } from "@/utils/auth"

// Create a Supabase client for server-side operations
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}

// Validate password strength
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Get form data instead of JSON
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string

    // Debug log
    console.log("Registration data:", { email, name, phone: phone || "not provided" })

    // Validate inputs
    if (!email || !password || !name || !phone) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ success: false, message: passwordValidation.message }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email is already registered" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hash(password)

    // Insert user - DO NOT include phone in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role: "user",
          name: name, // Store name in users table
        },
      ])
      .select("id")
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json({ success: false, message: "Failed to create user account" }, { status: 500 })
    }

    // Insert profile with phone
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userData.id,
        name,
        phone, // Store phone in profiles table
        avatar_url: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      },
    ])

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Delete user if profile creation fails
      await supabase.from("users").delete().eq("id", userData.id)
      return NextResponse.json({ success: false, message: "Failed to create user profile" }, { status: 500 })
    }

    // Create a session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: userData.id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      ])
      .select("id")
      .single()

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return NextResponse.json({ success: false, message: "Failed to create session" }, { status: 500 })
    }

    // Set a cookie with the session ID
    cookies().set("session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Debug log
    console.log("User registered successfully with ID:", userData.id, "and phone:", phone)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
