"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase"
import {
  generateVerificationCode,
  saveVerificationCode,
  verifyCode as verifyCodeLib,
} from "@/lib/auth/verification-code"
import { sendVerificationCode as sendVerificationCodeEmail } from "@/lib/email/send-email"
import remonline from "@/lib/api/remonline"

// Check if user exists in Remonline API and return user data
export async function checkUserExists(identifier: string): Promise<{
  success: boolean
  message?: string
  userData?: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone?: string[]
  }
}> {
  try {
    console.log(`Checking if user exists with identifier: ${identifier}`)

    // Determine if identifier is email or phone
    const isEmail = identifier.includes("@")

    // First authenticate with Remonline API
    const authResult = await remonline.auth()
    if (!authResult.success) {
      console.error("Failed to authenticate with Remonline API:", authResult.message)
      return {
        success: false,
        message: "Failed to connect to the service. Please try again later.",
      }
    }

    // Search for the client
    let response
    if (isEmail) {
      response = await remonline.getClientByEmail(identifier)
    } else {
      response = await remonline.getClientByPhone(identifier)
    }

    console.log("Remonline API response:", response)

    if (response.success && response.exists && response.client) {
      // Check if the client has an email (required for verification)
      if (!response.client.email) {
        return {
          success: false,
          message: "User found but has no email address for verification",
        }
      }

      return {
        success: true,
        userData: {
          id: response.client.id,
          email: response.client.email,
          first_name: response.client.first_name || "",
          last_name: response.client.last_name || "",
          phone: response.client.phone,
        },
      }
    }

    return {
      success: false,
      message: "User not found",
    }
  } catch (error) {
    console.error("Check user error:", error)
    return {
      success: false,
      message: "Failed to check if user exists. Please try again later.",
    }
  }
}

// Send verification code
export async function sendVerificationCode(
  identifier: string,
  type: "login" | "registration",
): Promise<{ success: boolean; message?: string; email?: string }> {
  try {
    console.log(`Sending verification code for ${type} to identifier: ${identifier}`)

    // If identifier is an email, use it directly
    // If it's a phone number, we need to find the associated email
    let email = identifier

    if (!identifier.includes("@")) {
      // It's a phone number, find the associated email
      const userResult = await checkUserExists(identifier)
      if (!userResult.success || !userResult.userData) {
        return {
          success: false,
          message: "Could not find a user with this phone number",
        }
      }

      email = userResult.userData.email
    }

    console.log(`Will send verification code to email: ${email}`)

    // Generate verification code
    const code = generateVerificationCode()
    console.log(`Generated code: ${code}`)

    // Save code to database
    const saved = await saveVerificationCode(email, code, type)
    if (!saved) {
      console.error("Failed to save verification code to database")
      return {
        success: false,
        message: "Failed to generate verification code",
      }
    }

    // Send email with code
    try {
      await sendVerificationCodeEmail(email, code, "uk", type === "login")
      console.log(`Verification code sent to ${email}`)
      return { success: true, email }
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      return {
        success: false,
        message: "Failed to send verification email",
      }
    }
  } catch (error) {
    console.error("Send verification code error:", error)
    return {
      success: false,
      message: "Failed to send verification code. Please try again later.",
    }
  }
}

// Verify code and create session
export async function verifyCode(
  identifier: string,
  code: string,
  type: "login" | "registration",
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`Verifying code for ${identifier}: ${code}`)

    // If identifier is a phone number, we need to find the associated email
    let email = identifier

    if (!identifier.includes("@")) {
      // It's a phone number, find the associated email
      const userResult = await checkUserExists(identifier)
      if (!userResult.success || !userResult.userData) {
        return {
          success: false,
          message: "Could not find a user with this phone number",
        }
      }

      email = userResult.userData.email
    }

    // Verify code
    const verification = await verifyCodeLib(email, code, type)
    if (!verification.valid) {
      console.error("Invalid verification code:", verification.message)
      return {
        success: false,
        message: verification.message || "Invalid verification code",
      }
    }

    console.log("Code verified successfully")

    if (type === "login") {
      // For login, create session
      // Get user from Remonline
      const userResponse = await remonline.getClientByEmail(email)
      if (!userResponse.success || !userResponse.exists || !userResponse.client) {
        console.error("User not found in Remonline after verification")
        return {
          success: false,
          message: "User not found",
        }
      }

      console.log("User found in Remonline:", userResponse.client)

      // Create or get user in Supabase
      const supabase = createClient()

      // Check if user exists in Supabase
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, role")
        .eq("email", email.toLowerCase())
        .maybeSingle()

      let userId
      let userRole = "user"

      if (existingUser) {
        console.log("User exists in Supabase:", existingUser)
        userId = existingUser.id
        userRole = existingUser.role
      } else {
        console.log("Creating new user in Supabase")
        // Create user in Supabase
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            email: email.toLowerCase(),
            role: "user",
            name: `${userResponse.client.first_name || ""} ${userResponse.client.last_name || ""}`.trim(),
            remonline_id: userResponse.client.id,
          })
          .select("id")
          .single()

        if (createError) {
          console.error("Failed to create user in Supabase:", createError)
          return {
            success: false,
            message: "Failed to create user account",
          }
        }

        userId = newUser.id

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          name: `${userResponse.client.first_name || ""} ${userResponse.client.last_name || ""}`.trim(),
          phone: userResponse.client.phone?.[0] || null,
          email: email.toLowerCase(),
        })

        if (profileError) {
          console.error("Failed to create profile in Supabase:", profileError)
          // Continue anyway, not critical
        }
      }

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert([
          {
            user_id: userId,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          },
        ])
        .select("id")
        .single()

      if (sessionError) {
        console.error("Failed to create session:", sessionError)
        return {
          success: false,
          message: "Failed to create session",
        }
      }

      console.log("Session created:", session)

      // Set session cookie
      cookies().set("session_id", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Verify code error:", error)
    return {
      success: false,
      message: "Failed to verify code. Please try again later.",
    }
  }
}

// Create user in Remonline API
export async function createUser(userData: {
  first_name: string
  last_name: string
  email: string
  phone: string[]
  address?: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    console.log("Creating user in Remonline:", userData)

    // First authenticate with Remonline API
    const authResult = await remonline.auth()
    if (!authResult.success) {
      console.error("Failed to authenticate with Remonline API:", authResult.message)
      return {
        success: false,
        message: "Failed to connect to the service. Please try again later.",
      }
    }

    // Create user in Remonline
    const response = await remonline.createClient(userData)
    if (!response.success) {
      console.error("Failed to create client in Remonline:", response.message)
      return {
        success: false,
        message: response.message || "Failed to create user",
      }
    }

    console.log("User created in Remonline:", response.client)

    // Create user in Supabase
    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      console.log("User already exists in Supabase:", existingUser)

      // Update the user with Remonline ID
      await supabase.from("users").update({ remonline_id: response.client.id }).eq("id", existingUser.id)

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert([
          {
            user_id: existingUser.id,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          },
        ])
        .select("id")
        .single()

      if (sessionError) {
        console.error("Failed to create session:", sessionError)
        return {
          success: false,
          message: "Failed to create session",
        }
      }

      // Set session cookie
      cookies().set("session_id", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })

      return { success: true }
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email: userData.email.toLowerCase(),
        role: "user",
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        remonline_id: response.client.id,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Failed to create user in Supabase:", error)
      return {
        success: false,
        message: "Failed to create user account",
      }
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: newUser.id,
      name: `${userData.first_name} ${userData.last_name}`.trim(),
      phone: userData.phone[0] || null,
      email: userData.email.toLowerCase(),
    })

    if (profileError) {
      console.error("Failed to create profile in Supabase:", profileError)
      // Continue anyway, not critical
    }

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: newUser.id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      ])
      .select("id")
      .single()

    if (sessionError) {
      console.error("Failed to create session:", sessionError)
      return {
        success: false,
        message: "Failed to create session",
      }
    }

    // Set session cookie
    cookies().set("session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Create user error:", error)
    return {
      success: false,
      message: "Failed to create user. Please try again later.",
    }
  }
}
