import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id, 
        email, 
        created_at, 
        role,
        phone,
        profiles (
          full_name,
          address
        )
      `,
      )
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { email, role, phone, full_name, address } = body

    // Update user table
    const { error: userError } = await supabase
      .from("users")
      .update({
        email,
        role,
        phone,
      })
      .eq("id", params.id)

    if (userError) {
      console.error("Error updating user:", userError)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Update profile table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name,
        address,
        phone,
      })
      .eq("user_id", params.id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Log the activity
    await logActivity({
      userId: params.id,
      actionType: "update",
      entityType: "user",
      entityId: params.id,
      details: { email, role },
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

    // First delete from profiles (due to foreign key constraint)
    const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", params.id)

    if (profileError) {
      console.error("Error deleting profile:", profileError)
      return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 })
    }

    // Then delete from users
    const { error: userError } = await supabase.from("users").delete().eq("id", params.id)

    if (userError) {
      console.error("Error deleting user:", userError)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    // Log the activity
    const adminId = request.headers.get("x-admin-id") || "system"
    await logActivity({
      userId: adminId,
      actionType: "delete",
      entityType: "user",
      entityId: params.id,
      details: { deletedUserId: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in user delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
