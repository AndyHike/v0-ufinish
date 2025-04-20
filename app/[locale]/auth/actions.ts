"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { hash, verifyPassword } from "@/utils/auth"
import { cookies } from "next/headers"

export async function register(locale: string, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const phone = (formData.get("phone") as string) || null

  if (!email || !password || !name) {
    return { error: "Missing required fields" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  const supabase = createClient(cookies())

  // Check if user already exists
  const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

  if (existingUser) {
    return { error: "User with this email already exists" }
  }

  // Hash the password
  const passwordHash = await hash(password)

  // Insert the new user
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([{ email, password_hash: passwordHash, role: "user" }])
    .select("id")
    .single()

  if (userError) {
    console.error("Error creating user:", userError)
    return { error: "Failed to create user account" }
  }

  // Insert the profile
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: newUser.id,
      name,
      phone,
      avatar_url: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
    },
  ])

  if (profileError) {
    console.error("Error creating profile:", profileError)
    // We created the user but failed to create profile
    // In a production app, you might want to delete the user or handle this differently
    return { error: "Failed to create user profile" }
  }

  // Create a session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert([
      {
        user_id: newUser.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    ])
    .select("id")
    .single()

  if (sessionError) {
    console.error("Error creating session:", sessionError)
    return { error: "Failed to create session" }
  }

  // Set a cookie with the session ID
  cookies().set("session_id", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  })

  // Redirect to the home page
  redirect(`/${locale}`)
}

export async function signin(locale: string, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Missing required fields" }
  }

  const supabase = createClient(cookies())

  // Get the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("email", email)
    .single()

  if (userError || !user) {
    return { error: "Invalid email or password" }
  }

  // Verify the password
  const isValidPassword = await verifyPassword(password, user.password_hash)

  if (!isValidPassword) {
    return { error: "Invalid email or password" }
  }

  // Create a session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert([
      {
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    ])
    .select("id")
    .single()

  if (sessionError) {
    console.error("Error creating session:", sessionError)
    return { error: "Failed to create session" }
  }

  // Set a cookie with the session ID
  cookies().set("session_id", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  })

  // Redirect to the home page
  redirect(`/${locale}`)
}
