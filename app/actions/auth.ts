"use server"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth-utils"

// Validate password strength
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }

  // Add more password requirements if needed
  // For example: require uppercase, lowercase, numbers, special characters

  return { valid: true }
}

// Register a new user
export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  // Validate inputs
  if (!email || !password || !name) {
    return { success: false, message: "All fields are required" }
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return { success: false, message: passwordValidation.message }
  }

  try {
    const supabase = createServerSupabaseClient()

    // Check if email already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).single()

    if (existingUser) {
      return { success: false, message: "Email is already registered" }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

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
    const { error: profileError } = await supabase.from("profiles").insert([{ id: userData.id, name }])

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
    const supabase = createServerSupabaseClient()

    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, password_hash, role")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !userData) {
      return { success: false, message: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userData.password_hash)

    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" }
    }

    // Generate session
    const sessionId = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    // Store session
    const { error: sessionError } = await supabase
      .from("sessions")
      .insert([{ id: sessionId, user_id: userData.id, expires_at: expiresAt.toISOString() }])

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return { success: false, message: "Failed to create session" }
    }

    // Set session cookie
    setSessionCookie(sessionId)

    return { success: true, message: "Login successful", role: userData.role }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Logout user
export async function logout() {
  try {
    clearSessionCookie()
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, message: "Failed to logout" }
  }
}

// Login with redirect
export async function loginWithRedirect(formData: FormData, locale = "uk") {
  const result = await login(formData)

  if (result.success) {
    // Redirect based on role
    if (result.role === "admin") {
      redirect(`/${locale}/admin`)
    } else {
      redirect(`/${locale}/profile`)
    }
  }

  return result
}

// Register with redirect
export async function registerWithRedirect(formData: FormData, locale = "uk") {
  const result = await register(formData)

  if (result.success) {
    // Redirect to login page after successful registration
    redirect(`/${locale}/auth/signin?registered=true`)
  }

  return result
}
