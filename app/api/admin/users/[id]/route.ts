import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logAdminActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const supabase = createClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in user API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const body = await request.json()
    const { name, email, phone, role } = body

    const supabase = createClient()

    // Update user in the database
    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        email,
        phone,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await logAdminActivity({
      entityId: userId,
      entityType: "user",
      actionType: "update",
      details: { updatedFields: Object.keys(body) },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in user update API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const supabase = createClient()

    // Get user data before deletion for logging
    const { data: userData } = await supabase.from("users").select("email").eq("id", userId).single()

    // Delete user from the database
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await logAdminActivity({
      entityId: userId,
      entityType: "user",
      actionType: "delete",
      details: { email: userData?.email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in user delete API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
