import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const brandId = url.searchParams.get("brand_id")
    const seriesId = url.searchParams.get("series_id")

    const supabase = createClient()
    let query = supabase.from("models").select("*, brands(name, logo_url), series(name)")

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    if (seriesId === "all") {
      // Do nothing, fetch all models for the brand
    } else if (seriesId) {
      query = query.eq("series_id", seriesId)
    }

    const { data, error } = await query.order("position", { ascending: true, nullsLast: true })

    if (error) {
      console.error("Error fetching models:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in models API:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, brandId, seriesId, imageUrl, userId } = await request.json()

    if (!name || !brandId) {
      return NextResponse.json({ error: "Name and brand are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Get the highest position for the brand
    const { data: positionData, error: positionError } = await supabase
      .from("models")
      .select("position")
      .eq("brand_id", brandId)
      .order("position", { ascending: false })
      .limit(1)

    if (positionError) {
      console.error("Error getting highest position:", positionError)
      throw positionError
    }

    const position = positionData && positionData.length > 0 ? (positionData[0].position || 0) + 1 : 0

    // Insert the new model
    const { data, error } = await supabase
      .from("models")
      .insert({
        name,
        brand_id: brandId,
        series_id: seriesId || null,
        image_url: imageUrl || null,
        position,
      })
      .select()

    if (error) {
      console.error("Error creating model:", error)
      throw error
    }

    // Log the activity
    if (userId) {
      await logActivity({
        userId,
        action: "create",
        resourceType: "model",
        resourceId: data[0].id,
        details: `Created model: ${name}`,
      })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in create model API:", error)
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}
