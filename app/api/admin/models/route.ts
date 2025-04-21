import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get("brand_id")

    const supabase = createClient()
    let query = supabase.from("models").select("*")

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    const { data, error } = await query.order("name")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    const { data, error } = await supabase
      .from("models")
      .insert({
        name: body.name,
        brand_id: body.brand_id,
        image_url: body.image_url || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating model:", error)
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}
