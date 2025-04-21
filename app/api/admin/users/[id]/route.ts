import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createClient()

    // Remove phone from the select
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role, created_at")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to fetch user",
          details: error.message,
        },
        { status: 500 },
      )
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, email, role } = body // Remove phone from destructuring

    const supabase = createClient()

    // Update user - remove phone from the update
    const { data: user, error } = await supabase
      .from("users")
      .update({
        name,
        email,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to update user",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Log activity
    await logActivity({
      action: "update",
      entity: "user",
      entityId: id,
      details: `Updated user: ${email}`,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createClient()

    // Get user email before deletion for activity log
    const { data: user, error: fetchError } = await supabase.from("users").select("email").eq("id", id).single()

    if (fetchError) {
      return NextResponse.json(
        {
          error: "Failed to fetch user",
          details: fetchError.message,
        },
        { status: 500 },
      )
    }

    // Delete user
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to delete user",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Log activity
    await logActivity({
      action: "delete",
      entity: "user",
      entityId: id,
      details: `Deleted user: ${user?.email || id}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
