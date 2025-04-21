"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { hashPassword, verifyPassword } from "@/lib/auth/utils"
import { generateEmailVerificationToken } from "@/lib/auth/token"
import { generatePasswordResetToken, verifyPasswordResetToken } from "@/lib/auth/password-reset"
import { sendVerificationEmail, sendPasswordResetEmail as sendResetEmail } from "@/lib/email/send-email"
import { checkLoginRateLimit, recordFailedLoginAttempt, resetLoginAttempts } from "@/lib/auth/rate-limit"

// Register a new user
export async function register(email: string, password: string, name: string, locale: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).single()

    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        role: "user",
        email_verified: false,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error registering user:", error)
      return { success: false, error: "Failed to register user" }
    }

    // Insert profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      name,
      avatar_url: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Clean up the user if profile creation fails
      await supabase.from("users").delete().eq("id", user.id)
      return { success: false, error: "Failed to create user profile" }
    }

    // Generate verification token
    const token = await generateEmailVerificationToken(user.id)

    if (token) {
      // Send verification email
      try {
        await sendVerificationEmail(email, token, locale)
      } catch (emailError) {
        console.error("Error sending verification email:", emailError)
        // Continue with registration even if email fails
      }
    }

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Error in register function:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Login user
export async function login(email: string, password: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check rate limit
    const rateLimitCheck = await checkLoginRateLimit(email)
    if (rateLimitCheck.blocked) {
      return {
        success: false,
        blocked: true,
        remainingAttempts: 0,
        minutesRemaining: rateLimitCheck.minutesRemaining,
      }
    }

    // Get user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password_hash, role, email_verified")
      .eq("email", email.toLowerCase())
      .single()

    if (error || !user) {
      await recordFailedLoginAttempt(email)
      return {
        success: false,
        remainingAttempts: rateLimitCheck.remainingAttempts - 1,
      }
    }

    // Check if email is verified
    if (!user.email_verified) {
      return { success: false, emailNotVerified: true, userId: user.id }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      await recordFailedLoginAttempt(email)
      return {
        success: false,
        remainingAttempts: rateLimitCheck.remainingAttempts - 1,
      }
    }

    // Reset login attempts
    await resetLoginAttempts(email)

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select("id")
      .single()

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return { success: false, error: "Failed to create session" }
    }

    // Set session cookie
    cookies().set("session_id", session.id, {
      httpOnly: true,
      secure: true, // Always use secure cookies in production
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
    })

    return { success: true, role: user.role }
  } catch (error) {
    console.error("Error in login function:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Logout user
export async function logout() {
  try {
    cookies().delete("session_id")
    return { success: true }
  } catch (error) {
    console.error("Error in logout function:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, locale: string) {
  try {
    if (!email) {
      return { success: false, error: "Email is required" }
    }

    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user, error } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).single()

    if (error) {
      console.error("Error finding user for password reset:", error)
      // Don't reveal if user exists or not for security
      return { success: true }
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      console.log(`Reset email requested for non-existent user: ${email}`)
      return { success: true }
    }

    try {
      // Generate reset token
      const token = await generatePasswordResetToken(user.id)

      // Send reset email
      await sendResetEmail(email, token, locale)

      return { success: true }
    } catch (emailError) {
      console.error("Error generating or sending reset token:", emailError)

      // Check for DNS errors
      if (emailError.code === "EDNS" || emailError.syscall === "queryA") {
        return {
          success: false,
          error: "Email server configuration error. Please contact support.",
        }
      }

      return { success: false, error: "Failed to send reset email" }
    }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string) {
  try {
    const result = await verifyPasswordResetToken(token)

    if (!result.valid) {
      return { success: false, error: result.error }
    }

    const supabase = createServerSupabaseClient()

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user
    const { error } = await supabase.from("users").update({ password_hash: hashedPassword }).eq("id", result.userId)

    if (error) {
      console.error("Error updating password:", error)
      return { success: false, error: "Failed to reset password" }
    }

    // Delete all reset tokens for this user
    await supabase.from("password_reset_tokens").delete().eq("user_id", result.userId)

    return { success: true }
  } catch (error) {
    console.error("Error in resetPassword function:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Resend verification email
export async function resendVerificationEmail(userId: string, locale: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user, error } = await supabase.from("users").select("email").eq("id", userId).single()

    if (error || !user) {
      console.error("User not found:", userId)
      return { success: false, error: "User not found" }
    }

    // Generate verification token
    const token = await generateEmailVerificationToken(userId)

    if (!token) {
      return { success: false, error: "Failed to generate verification token" }
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.email, token, locale)
      return { success: true }
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)

      // Check for DNS errors
      if (emailError.code === "EDNS" || emailError.syscall === "queryA") {
        return {
          success: false,
          error: "Email server configuration error. Please contact support.",
        }
      }

      return { success: false, error: "Failed to send verification email" }
    }
  } catch (error) {
    console.error("Error resending verification email:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Verify email
export async function verifyEmail(token: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get token
    const { data: tokenData, error: tokenError } = await supabase
      .from("email_verification_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      return { success: false, error: "Invalid token" }
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return { success: false, error: "Token expired" }
    }

    // Update user
    const { error } = await supabase.from("users").update({ email_verified: true }).eq("id", tokenData.user_id)

    if (error) {
      console.error("Error updating user:", error)
      return { success: false, error: "Failed to verify email" }
    }

    // Delete token
    await supabase.from("email_verification_tokens").delete().eq("user_id", tokenData.user_id)

    return { success: true }
  } catch (error) {
    console.error("Error in verifyEmail function:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
