import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase"

export async function getCurrentUser() {
  const sessionId = cookies().get("session_id")?.value

  console.log("Session ID from cookie:", sessionId)

  if (!sessionId) {
    console.log("No session ID found in cookies")
    return null
  }

  const supabase = createClient()

  // Get session
  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("user_id, expires_at")
    .eq("id", sessionId)
    .single()

  console.log("Session data:", sessionData)
  console.log("Session error:", sessionError)

  if (sessionError || !sessionData || new Date(sessionData.expires_at) < new Date()) {
    // Session expired or not found
    console.log("Session expired or not found")
    cookies().delete("session_id")
    return null
  }

  // Get user
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, email, role, name")
    .eq("id", sessionData.user_id)
    .single()

  console.log("User data:", userData)
  console.log("User error:", userError)

  if (userError || !userData) {
    console.log("User not found")
    cookies().delete("session_id")
    return null
  }

  // Get profile with phone number
  const { data: profileData } = await supabase
    .from("profiles")
    .select("phone, avatar_url")
    .eq("id", userData.id)
    .single()

  console.log("Profile data in session:", profileData)

  return {
    id: userData.id,
    email: userData.email,
    role: userData.role,
    name: userData.name || null,
    phone: profileData?.phone || null,
    avatar_url: profileData?.avatar_url || null,
  }
}

export async function getSession() {
  const user = await getCurrentUser()
  console.log("Session user:", user)
  if (user) {
    return { user }
  }
  return null
}
