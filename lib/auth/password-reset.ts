import { createServerClient } from "@/lib/supabase"
import { generateToken } from "@/lib/auth/token"
import { hash } from "@/lib/auth/utils"

// Create a password reset token
export async function createPasswordResetToken(email: string): Promise<string | null> {
  try {
    const supabase = createServerClient()

    // Find the user by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (userError || !userData) {
      console.error("User not found:", userError)
      return null
    }

    // Generate a token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Delete any existing tokens for this user
    await supabase.from("password_reset_tokens").delete().eq("user_id", userData.id)

    // Create a new token
    const { error } = await supabase.from("password_reset_tokens").insert([
      {
        user_id: userData.id,
        token,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (error) {
      console.error("Error creating password reset token:", error)
      return null
    }

    return token
  } catch (error) {
    console.error("Error in createPasswordResetToken:", error)
    return null
  }
}

// Verify a password reset token
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    const supabase = createServerClient()

    // Get the token
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      console.error("Token not found or error:", tokenError)
      return null
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.error("Token expired")
      return null
    }

    return tokenData.user_id
  } catch (error) {
    console.error("Error in verifyPasswordResetToken:", error)
    return null
  }
}

// Reset password using a token
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    // Verify the token and get the user ID
    const userId = await verifyPasswordResetToken(token)

    if (!userId) {
      return false
    }

    // Hash the new password
    const passwordHash = await hash(newPassword)

    // Update the user's password
    const { error: updateError } = await supabase.from("users").update({ password_hash: passwordHash }).eq("id", userId)

    if (updateError) {
      console.error("Error updating password:", updateError)
      return false
    }

    // Delete the token
    await supabase.from("password_reset_tokens").delete().eq("user_id", userId)

    return true
  } catch (error) {
    console.error("Error in resetPassword:", error)
    return false
  }
}
