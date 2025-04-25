import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const supabase = createClient()

    // Get session
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (sessionError || !sessionData || new Date(sessionData.expires_at) < new Date()) {
      // Session expired or not found
      return NextResponse.json({ success: false, message: "Session expired or invalid" }, { status: 401 })
    }

    // Get user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, role, first_name, last_name")
      .eq("id", sessionData.user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Get profile with phone number
    const { data: profileData } = await supabase
      .from("profiles")
      .select("phone, avatar_url, first_name, last_name")
      .eq("id", userData.id)
      .single()

    // Combine first_name and last_name for full name
    const fullName = [profileData?.first_name || userData.first_name, profileData?.last_name || userData.last_name]
      .filter(Boolean)
      .join(" ")

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: fullName,
        first_name: profileData?.first_name || userData.first_name || null,
        last_name: profileData?.last_name || userData.last_name || null,
        phone: profileData?.phone || null,
        avatar_url: profileData?.avatar_url || null,
      },
    })
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
