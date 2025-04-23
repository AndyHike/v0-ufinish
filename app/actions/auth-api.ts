"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase"
import {
  generateVerificationCode,
  saveVerificationCode,
  verifyCode as verifyCodeLib,
} from "@/lib/auth/verification-code"
import { sendVerificationEmail } from "@/lib/email/send-email"
import remonline from "@/lib/api/remonline"

// Check if user exists in Remonline API
export async function checkUserExists(identifier: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Determine if identifier is email or phone
    const isEmail = identifier.includes("@")

    let response
    if (isEmail) {
      response = await remonline.getClientByEmail(identifier)
    } else {
      response = await remonline.getClientByPhone(identifier)
    }

    return {
      success: response.exists,
      message: response.exists ? undefined : "User not found",
    }
  } catch (error) {
    console.error("Check user error:", error)
    return { success: false, message: "Failed to check if user exists" }
  }
}

// Send verification code
export async function sendVerificationCode(
  email: string,
  type: "login" | "registration",
): Promise<{ success: boolean; message?: string }> {
  try {
    // Generate verification code
    const code = generateVerificationCode()

    // Save code to database
    const saved = await saveVerificationCode(email, code, type)
    if (!saved) {
      return { success: false, message: "Failed to save verification code" }
    }

    // Send email with code
    const sent = await sendVerificationEmail(email, code)
    if (!sent) {
      return { success: false, message: "Failed to send verification email" }
    }

    return { success: true }
  } catch (error) {
    console.error("Send verification code error:", error)
    return { success: false, message: "Failed to send verification code" }
  }
}

// Verify code and create session
export async function verifyCode(
  email: string,
  code: string,
  type: "login" | "registration",
): Promise<{ success: boolean; message?: string }> {
  try {
    // Verify code
    const verification = await verifyCodeLib(email, code, type)
    if (!verification.valid) {
      return { success: false, message: verification.message }
    }

    if (type === "login") {
      // For login, create session
      // Get user from Remonline
      const userResponse = await remonline.getClientByEmail(email)
      if (!userResponse.exists || !userResponse.client) {
        return { success: false, message: "User not found" }
      }

      // Create session
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: "password", // This is a placeholder, as we're not using passwords
      })

      if (error) {
        // If user doesn't exist in Supabase, create them
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: "password", // This is a placeholder, as we're not using passwords
          options: {
            data: {
              remonline_id: userResponse.client.id,
              first_name: userResponse.client.first_name,
              last_name: userResponse.client.last_name,
              phone: userResponse.client.phone?.[0] || "",
            },
          },
        })

        if (signUpError) {
          return { success: false, message: "Failed to create user session" }
        }
      }

      // Set session cookie
      cookies().set("session_id", data?.session?.access_token || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Verify code error:", error)
    return { success: false, message: "Failed to verify code" }
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
    // Create user in Remonline
    const response = await remonline.createClient(userData)
    if (!response.success) {
      return { success: false, message: response.message }
    }

    // Create user in Supabase
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: "password", // This is a placeholder, as we're not using passwords
      options: {
        data: {
          remonline_id: response.client.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone[0] || "",
        },
      },
    })

    if (error) {
      return { success: false, message: "Failed to create user account" }
    }

    // Set session cookie
    cookies().set("session_id", data?.session?.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, message: "Failed to create user" }
  }
}
