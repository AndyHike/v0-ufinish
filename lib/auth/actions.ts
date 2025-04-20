"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { hash, verifyPassword } from "@/lib/auth/utils"

// Create a Supabase client for server-side operations
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}

// Register a new user
export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const phone = (formData.get("phone") as string) || null

  // Validate inputs
  if (!email || !password || !name) {
    return { success: false, message: "All fields are required" }
  }

  // Validate password
  if (password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters" }
  }

  try {
    const supabase = createServerClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return { success: false, message: "Email is already registered" }
    }

    // Hash password
    const passwordHash = await hash(password)

    // Insert user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([{ email: email.toLowerCase(), password_hash: passwordHash, role: "user" }])
      .select("id")
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      return { success: false, message: "Failed to create user account" }
    }

    // Insert profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userData.id,
        name,
        phone,
        avatar_url: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      },
    ])

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Delete user if profile creation fails
      await supabase.from("users").delete().eq("id", userData.id)
      return { success: false, message: "Failed to create user profile" }
    }

    return { success: true, message: "Registration successful" }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Login user
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate inputs
  if (!email || !password) {
    return { success: false, message: "Email and password are required" }
  }

  try {
    const supabase = createServerClient()

    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, password_hash, role")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (userError || !userData) {
      return { success: false, message: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userData.password_hash)

    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" }
    }

    // Generate session
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
      return { success: false, message: "Failed to create session" }
    }

    // Set session cookie
    cookies().set("session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return { success: true, message: "Login successful" }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Logout user
export async function logout() {
  cookies().delete("session_id")
  return { success: true }
}
