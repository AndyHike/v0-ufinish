import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("id", params.id).single()

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Get the current user data for logging
    const { data: currentUser } = await supabase.from("users").select("*").eq("id", params.id).single()

    const { data: user, error } = await supabase
      .from("users")
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await logActivity({
      action_type: "update",
      entity_type: "user",
      entity_id: params.id,
      user_id: params.id, // Using the same ID as the entity for simplicity
      details: {
        before: currentUser,
        after: user,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get the current user data for logging
    const { data: currentUser } = await supabase.from("users").select("*").eq("id", params.id).single()

    const { error } = await supabase.from("users").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await logActivity({
      action_type: "delete",
      entity_type: "user",
      entity_id: params.id,
      user_id: params.id, // Using the same ID as the entity for simplicity
      details: {
        user: currentUser,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
