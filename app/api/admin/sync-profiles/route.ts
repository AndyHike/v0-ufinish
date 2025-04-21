import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    // Get all users
    const { data: users, error: usersError } = await supabase.from("users").select("id, name, phone")

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Get existing profiles
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("user_id")

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    // Find users without profiles
    const existingProfileUserIds = new Set(profiles.map((p) => p.user_id))
    const usersWithoutProfiles = users.filter((user) => !existingProfileUserIds.has(user.id))

    if (usersWithoutProfiles.length === 0) {
      return NextResponse.json({ message: "All users have profiles", count: 0 })
    }

    // Create profiles for users without them
    const newProfiles = usersWithoutProfiles.map((user) => ({
      id: crypto.randomUUID(),
      user_id: user.id,
      full_name: user.name || null,
      phone: user.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { error: insertError } = await supabase.from("profiles").insert(newProfiles)

    if (insertError) {
      console.error("Error creating profiles:", insertError)
      return NextResponse.json({ error: "Failed to create profiles" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Profiles created successfully",
      count: newProfiles.length,
    })
  } catch (error) {
    console.error("Error syncing profiles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
