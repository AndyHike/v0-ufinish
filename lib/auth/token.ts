import crypto from "crypto"
import { createServerClient } from "@/lib/supabase"

// Generate a random token
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Create a verification token for a user
export async function createVerificationToken(userId: string): Promise<string | null> {
  try {
    const supabase = createServerClient()
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete any existing tokens for this user
    await supabase.from("email_verification_tokens").delete().eq("user_id", userId)

    // Create a new token
    const { error } = await supabase.from("email_verification_tokens").insert([
      {
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (error) {
      console.error("Error creating verification token:", error)
      return null
    }

    return token
  } catch (error) {
    console.error("Error in createVerificationToken:", error)
    return null
  }
}

// Verify a token and mark the user as verified
export async function verifyEmailToken(token: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    // Get the token
    const { data: tokenData, error: tokenError } = await supabase
      .from("email_verification_tokens")
      .select("id, user_id, expires_at")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      console.error("Token not found or error:", tokenError)
      return false
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.error("Token expired")
      return false
    }

    // Mark user as verified
    const { error: updateError } = await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("id", tokenData.user_id)

    if (updateError) {
      console.error("Error updating user:", updateError)
      return false
    }

    // Delete the token
    await supabase.from("email_verification_tokens").delete().eq("id", tokenData.id)

    return true
  } catch (error) {
    console.error("Error in verifyEmailToken:", error)
    return false
  }
}
