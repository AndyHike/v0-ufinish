import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json()

    // Validate input
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "Name, email, password, and phone are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate user ID
    const userId = uuidv4()

    // Create user
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email,
      password: hashedPassword,
      name,
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json({ error: "Error creating user: " + userError.message }, { status: 500 })
    }

    // Create profile with phone number
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      name,
      email,
      phone,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Don't return error here, as the user was created successfully
    }

    // Create session
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { error: sessionError } = await supabase.from("sessions").insert({
      id: sessionId,
      user_id: userId,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      // Don't return error here, as the user was created successfully
    }

    // Debug log to check what data we're storing
    console.log("User registered with phone:", phone)

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: userId,
        name,
        email,
        phone,
      },
    })
  } catch (error) {
    console.error("Error in registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
