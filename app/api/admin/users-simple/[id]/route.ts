import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, phone, role, created_at")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
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

    const { data: user, error } = await supabase
      .from("users")
      .update({
        email: body.email,
        name: body.name,
        phone: body.phone,
        role: body.role,
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Log activity
    await logActivity({
      userId: params.id,
      actionType: "update",
      entityType: "user",
      entityId: params.id,
      details: { updatedFields: Object.keys(body) },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in user update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("users").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    // Log activity
    await logActivity({
      userId: "system",
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
