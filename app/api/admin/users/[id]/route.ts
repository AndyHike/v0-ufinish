import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const supabase = createRouteHandlerClient({ cookies })

    // Fetch the user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, phone, role, created_at")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch user",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Unexpected error fetching user:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Get the current user for activity logging
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    // Update the user
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, email, name")
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json(
        {
          error: "Failed to update user",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Log the activity
    await logActivity({
      user_id: currentUser?.id,
      action_type: "update",
      entity_type: "user",
      entity_id: userId,
      details: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Unexpected error updating user:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user for activity logging
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    // Get user details before deletion for activity logging
    const { data: userToDelete } = await supabase.from("users").select("id, email, name").eq("id", userId).single()

    // Delete the user
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json(
        {
          error: "Failed to delete user",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Log the activity
    if (userToDelete) {
      await logActivity({
        user_id: currentUser?.id,
        action_type: "delete",
        entity_type: "user",
        entity_id: userId,
        details: {
          name: userToDelete.name,
          email: userToDelete.email,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error deleting user:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
