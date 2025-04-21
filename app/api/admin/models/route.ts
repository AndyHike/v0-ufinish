import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const brandId = searchParams.get("brand")

  try {
    const supabase = createServerClient()

    let query = supabase
      .from("models")
      .select(`
        id, 
        name, 
        year, 
        image_url, 
        created_at, 
        position,
        brand_id,
        brands (
          id,
          name,
          logo_url
        )
      `)
      .order("position", { ascending: true })

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching models:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to include brand_name and brand_logo_url
    const transformedData = data.map((model) => ({
      id: model.id,
      name: model.name,
      year: model.year,
      image_url: model.image_url,
      created_at: model.created_at,
      position: model.position,
      brand_id: model.brand_id,
      brand_name: model.brands?.name || "Unknown",
      brand_logo_url: model.brands?.logo_url,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, brandId, year, imageUrl, userId } = body

    if (!name || !brandId) {
      return NextResponse.json({ error: "Name and brand are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get the highest position for the current models
    const { data: positionData, error: positionError } = await supabase
      .from("models")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)

    if (positionError) {
      console.error("Error getting max position:", positionError)
      return NextResponse.json({ error: positionError.message }, { status: 500 })
    }

    const nextPosition = positionData.length > 0 ? positionData[0].position + 1 : 1

    // Insert the new model
    const { data, error } = await supabase
      .from("models")
      .insert({
        name,
        brand_id: brandId,
        year: year || null,
        image_url: imageUrl || null,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    if (userId) {
      await logActivity({
        userId,
        entityId: data.id,
        entityType: "model",
        actionType: "create",
        details: { name, brandId },
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
