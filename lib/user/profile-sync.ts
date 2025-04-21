import { createClient } from "@/lib/supabase"

export async function syncUserProfile(userId: string) {
  const supabase = createClient()

  // Get user data from users table
  const { data: userData } = await supabase.from("users").select("email, phone").eq("id", userId).single()

  if (!userData) return null

  // Check if profile exists
  const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).single()

  if (existingProfile) {
    // Update existing profile
    await supabase
      .from("profiles")
      .update({
        phone: userData.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  } else {
    // Create new profile
    await supabase.from("profiles").insert({
      id: userId,
      phone: userData.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  return userData
}
