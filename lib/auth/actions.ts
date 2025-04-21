"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { hash, verifyPassword } from "@/lib/auth/utils"
import { checkLoginRateLimit, recordFailedLoginAttempt, resetLoginAttempts } from "@/lib/auth/rate-limit"
import { createVerificationToken } from "@/lib/auth/token"
import { sendEmail } from "@/lib/email/send-email"
import {
  getEmailVerificationSubject,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getPasswordResetSubject,
} from "@/lib/email/templates"
import { createPasswordResetToken, resetPassword } from "@/lib/auth/password-reset"

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
  const locale = (formData.get("locale") as string) || "en"

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

    // Insert user with email_verified set to false
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role: "user",
          email_verified: false,
        },
      ])
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

    // Create verification token
    const token = await createVerificationToken(userData.id)

    if (!token) {
      console.error("Failed to create verification token")
      return { success: true, message: "Registration successful, but failed to send verification email" }
    }

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/${locale}/auth/verify?token=${token}`

    const emailHtml = getVerificationEmailTemplate({
      name,
      verificationUrl,
      locale,
    })

    const emailSubject = getEmailVerificationSubject(locale)

    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
    })

    return {
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      requiresVerification: true,
    }
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
    // Check rate limiting
    const rateLimitCheck = await checkLoginRateLimit(email)

    if (rateLimitCheck.blocked) {
      return {
        success: false,
        message: `Too many failed login attempts. Please try again in ${rateLimitCheck.minutesRemaining} minutes.`,
        blocked: true,
        minutesRemaining: rateLimitCheck.minutesRemaining,
      }
    }

    const supabase = createServerClient()

    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, password_hash, role, email_verified")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (userError || !userData) {
      // Record failed attempt
      await recordFailedLoginAttempt(email)
      return {
        success: false,
        message: "Invalid email or password",
        remainingAttempts: rateLimitCheck.remainingAttempts,
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userData.password_hash)

    if (!isPasswordValid) {
      // Record failed attempt
      await recordFailedLoginAttempt(email)
      return {
        success: false,
        message: `Invalid email or password. ${rateLimitCheck.remainingAttempts} attempts remaining.`,
        remainingAttempts: rateLimitCheck.remainingAttempts,
      }
    }

    // Check if email is verified
    if (!userData.email_verified) {
      return {
        success: false,
        message: "Please verify your email before logging in.",
        emailNotVerified: true,
        userId: userData.id,
      }
    }

    // Reset login attempts on successful login
    await resetLoginAttempts(email)

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

// Resend verification email
export async function resendVerificationEmail(userId: string, locale = "en") {
  try {
    const supabase = createServerClient()

    // Get user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, email_verified")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return { success: false, message: "User not found" }
    }

    // Check if already verified
    if (userData.email_verified) {
      return { success: false, message: "Email is already verified" }
    }

    // Get profile for name
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single()

    if (profileError) {
      return { success: false, message: "Failed to get user profile" }
    }

    // Create new verification token
    const token = await createVerificationToken(userId)

    if (!token) {
      return { success: false, message: "Failed to create verification token" }
    }

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/${locale}/auth/verify?token=${token}`

    const emailHtml = getVerificationEmailTemplate({
      name: profileData.name || "User",
      verificationUrl,
      locale,
    })

    const emailSubject = getEmailVerificationSubject(locale)

    await sendEmail({
      to: userData.email,
      subject: emailSubject,
      html: emailHtml,
    })

    return { success: true, message: "Verification email sent" }
  } catch (error) {
    console.error("Error resending verification email:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, locale = "en") {
  try {
    const supabase = createServerClient()

    // Find the user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email_verified")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    // Even if the user doesn't exist, we don't want to reveal that
    // So we'll just return success
    if (userError || !userData) {
      return { success: true, message: "If your email is registered, you will receive a password reset link" }
    }

    // Check if email is verified
    if (!userData.email_verified) {
      return { success: true, message: "If your email is registered, you will receive a password reset link" }
    }

    // Get profile for name
    const { data: profileData } = await supabase.from("profiles").select("name").eq("id", userData.id).single()

    // Create password reset token
    const token = await createPasswordResetToken(email)

    if (!token) {
      return { success: false, message: "Failed to create password reset token" }
    }

    // Send password reset email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/${locale}/auth/reset-password?token=${token}`

    const emailHtml = getPasswordResetEmailTemplate({
      name: profileData?.name || "User",
      resetUrl,
      locale,
    })

    const emailSubject = getPasswordResetSubject(locale)

    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
    })

    return { success: true, message: "Password reset email sent" }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<boolean> {
  try {
    const userId = await import("@/lib/auth/password-reset").then((module) => module.verifyPasswordResetToken(token))
    return !!userId
  } catch (error) {
    console.error("Error verifying password reset token:", error)
    return false
  }
}

// Reset password with token
export async function resetPasswordWithToken(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validate inputs
  if (!token || !password || !confirmPassword) {
    return { success: false, message: "All fields are required" }
  }

  // Validate password
  if (password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters" }
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match" }
  }

  try {
    // Reset the password
    const success = await resetPassword(token, password)

    if (!success) {
      return { success: false, message: "Failed to reset password" }
    }

    return { success: true, message: "Password reset successful" }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Logout user
export async function logout() {
  cookies().delete("session_id")
  return { success: true }
}
