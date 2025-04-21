import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getSession } from "@/lib/auth/session"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("brands").select("*").eq("id", params.id).single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching brand:", error)
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Get the current user for activity logging
    const session = await getSession()
    const userId = session?.user?.id

    const { data, error } = await supabase
      .from("brands")
      .update({
        name: body.name,
        logo_url: body.logo_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    // Log activity if user is logged in
    if (userId) {
      await supabase.from("activities").insert([
        {
          user_id: userId,
          action_type: "update",
          entity_type: "brand",
          entity_id: data.id,
          details: { name: data.name },
        },
      ])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating brand:", error)
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get the current user for activity logging
    const session = await getSession()
    const userId = session?.user?.id

    // Get the brand name before deleting for activity log
    const { data: brand } = await supabase.from("brands").select("name").eq("id", params.id).single()

    const { error } = await supabase.from("brands").delete().eq("id", params.id)

    if (error) throw error

    // Log activity if user is logged in and brand was found
    if (userId && brand) {
      await supabase.from("activities").insert([
        {
          user_id: userId,
          action_type: "delete",
          entity_type: "brand",
          entity_id: params.id,
          details: { name: brand.name },
        },
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting brand:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
