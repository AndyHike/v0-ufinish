import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("models").select("*, brands(name)").order("name")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("models")
      .insert([
        {
          name: body.name,
          brand_id: body.brandId,
          image_url: body.imageUrl,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from("activities").insert([
      {
        user_id: body.userId,
        action_type: "create",
        entity_type: "model",
        entity_id: data.id,
        details: { name: data.name, brand_id: data.brand_id },
      },
    ])

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating model:", error)
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}
