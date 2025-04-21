import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for server-side operations
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}

export async function getSession() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return null
  }

  try {
    const supabase = createServerClient()

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      return null
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase.from("sessions").delete().eq("id", sessionId)
      cookies().delete("session_id")
      return null
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", session.user_id)
      .single()

    if (userError || !user) {
      return null
    }

    // Get profile with phone number
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, phone, avatar_url, address")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      }
    }

    // Debug log to check what data we're getting from profiles
    console.log("Profile data in session:", profile)

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profile.name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        address: profile.address,
      },
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// For backward compatibility - maintain the original function name
export const getCurrentUser = async () => {
  const session = await getSession()
  return session?.user || null
}
