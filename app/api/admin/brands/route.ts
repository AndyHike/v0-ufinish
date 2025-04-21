import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("position", { ascending: true })
      .order("name", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Get the current user for activity logging
    const session = await getSession()
    const userId = session?.user?.id

    // Get the highest position value
    const { data: existingBrands, error: fetchError } = await supabase
      .from("brands")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)

    if (fetchError) throw fetchError

    const nextPosition = existingBrands && existingBrands.length > 0 ? (existingBrands[0].position || 0) + 1 : 1

    const { data, error } = await supabase
      .from("brands")
      .insert([
        {
          name: body.name,
          logo_url: body.logo_url || null,
          position: body.position || nextPosition,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Log activity if user is logged in
    if (userId) {
      await supabase.from("activities").insert([
        {
          user_id: userId,
          action_type: "create",
          entity_type: "brand",
          entity_id: data.id,
          details: { name: data.name },
        },
      ])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating brand:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}
