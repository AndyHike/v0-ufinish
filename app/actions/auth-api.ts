"use server"
import { createClient } from "@/lib/supabase"

// Check if a user with the given email already exists
export async function checkUserExists(email: string) {
  try {
    console.log(`Checking if user exists with email: ${email}`)
    const supabase = createClient()

    const { data, error } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle()

    if (error) {
      console.error("Error checking if user exists:", error)
      return { success: false, exists: false, message: "Error checking user" }
    }

    return {
      success: true,
      exists: !!data,
      userId: data?.id,
    }
  } catch (error) {
    console.error("Error in checkUserExists:", error)
    return { success: false, exists: false, message: "Unexpected error" }
  }
}

// Send verification code for login or registration
export async function sendVerificationCode(email: string, type: "login" | "registration") {
  try {
    console.log(`Sending verification code to ${email} for ${type}`)

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // In a real implementation, you would:
    // 1. Save the code to the database with an expiration time
    // 2. Send the code via email

    // For now, we'll just log it and return success
    console.log(`EMAIL WOULD BE SENT to ${email} with code: ${code}`)

    return {
      success: true,
      message: "Verification code sent",
    }
  } catch (error) {
    console.error(`Error sending verification code for ${type}:`, error)
    return {
      success: false,
      message: "Failed to send verification code",
    }
  }
}

// Verify a code sent to the user
export async function verifyCode(email: string, code: string, type: "login" | "registration") {
  try {
    console.log(`Verifying code for ${email}: ${code} (${type})`)

    // In a real implementation, you would:
    // 1. Check if the code exists and is valid for this email
    // 2. Check if the code has expired

    // For demo purposes, we'll accept code "123456"
    if (code === "123456") {
      return {
        success: true,
        message: "Code verified successfully",
      }
    }

    return {
      success: false,
      message: "Invalid verification code",
    }
  } catch (error) {
    console.error(`Error verifying code for ${type}:`, error)
    return {
      success: false,
      message: "Failed to verify code",
    }
  }
}

// Create a new user
export async function createUser(userData: {
  first_name: string
  last_name: string
  email: string
  phone: string[]
  address?: string
}) {
  try {
    console.log("Creating user with data:", userData)

    // In a real implementation, you would:
    // 1. Create the user in your database
    // 2. Create a profile for the user
    // 3. Set up any initial settings

    // For now, we'll just log it and return success
    console.log("User would be created with:", userData)

    return {
      success: true,
      message: "User created successfully",
      userId: "user_" + Math.random().toString(36).substring(2, 15),
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      message: "Failed to create user",
    }
  }
}
