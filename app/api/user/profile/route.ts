import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Get profile data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // If no profile, get user data
    if (!profile) {
      const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

      return NextResponse.json({ user })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
