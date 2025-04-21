import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("brands").select("*").order("name")

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

    const { data, error } = await supabase
      .from("brands")
      .insert([{ name: body.name, logo_url: body.logo_url }])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from("activities").insert([
      {
        user_id: body.userId,
        action_type: "create",
        entity_type: "brand",
        entity_id: data.id,
        details: { name: data.name },
      },
    ])

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating brand:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}
