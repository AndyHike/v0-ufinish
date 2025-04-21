import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const userId = params.id

    // Get user
    const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError)
      // Continue without profile
    }

    // Add profile to user
    user.profiles = profile || null

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const userId = params.id
    const data = await request.json()

    // Extract profile data
    const { full_name, address, ...userData } = data

    // Update user
    const { error: userError } = await supabase.from("users").update(userData).eq("id", userId)

    if (userError) {
      console.error("Error updating user:", userError)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("Error checking profile:", profileCheckError)
      return NextResponse.json({ error: "Failed to check profile" }, { status: 500 })
    }

    // Update or insert profile
    if (existingProfile) {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          full_name,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
    } else {
      const { error: profileInsertError } = await supabase.from("profiles").insert({
        id: crypto.randomUUID(),
        user_id: userId,
        full_name,
        address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileInsertError) {
        console.error("Error inserting profile:", profileInsertError)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }
    }

    // Log activity
    await logActivity({
      userId,
      entityId: userId,
      entityType: "user",
      actionType: "update",
      details: { updatedFields: Object.keys(data) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in user update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const userId = params.id

    // Delete user (profiles will be deleted via cascade)
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in user delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
