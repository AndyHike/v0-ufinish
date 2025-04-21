import { createClient } from "@/lib/supabase"

export async function syncUserProfile(userId: string) {
  try {
    const supabase = createClient()

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error checking profile:", profileError)
      return
    }

    // If profile doesn't exist, create it
    if (!profile) {
      // Get user data
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", userId)
        .single()

      if (userError) {
        console.error("Error getting user:", userError)
        return
      }

      // Create profile
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        name: user.name,
        email: user.email,
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
      }
    }

    // Debug log to check what's happening in the sync function
    console.log("Profile synced for user:", userId)
  } catch (error) {
    console.error("Error syncing profile:", error)
  }
}
