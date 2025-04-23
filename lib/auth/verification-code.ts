import { createServerSupabaseClient } from "@/lib/supabase"

// Generate a random verification code
export function generateVerificationCode(length = 6): string {
  // Generate a random numeric code
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("")
}

// Store verification code in the database
export async function storeVerificationCode(
  userId: string | null,
  email: string,
  code: string,
  type: "login" | "registration" = "login",
): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Delete any existing codes for this email
    await supabase.from("verification_codes").delete().eq("email", email)

    // Create a new code
    const { error } = await supabase.from("verification_codes").insert([
      {
        user_id: userId,
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (error) {
      console.error("Error creating verification code:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in storeVerificationCode:", error)
    return false
  }
}

// Verify a code
export async function verifyCode(
  email: string,
  code: string,
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the code
    const { data: codeData, error: codeError } = await supabase
      .from("verification_codes")
      .select("id, user_id, expires_at, type")
      .eq("email", email)
      .eq("code", code)
      .single()

    if (codeError || !codeData) {
      console.error("Code not found or error:", codeError)
      return { valid: false, error: "Invalid code" }
    }

    // Check if code is expired
    if (new Date(codeData.expires_at) < new Date()) {
      console.error("Code expired")
      return { valid: false, error: "Code expired" }
    }

    // Delete the code
    await supabase.from("verification_codes").delete().eq("id", codeData.id)

    return { valid: true, userId: codeData.user_id }
  } catch (error) {
    console.error("Error in verifyCode:", error)
    return { valid: false, error: "An unexpected error occurred" }
  }
}
