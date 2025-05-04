import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get("brand_id")
    const seriesId = searchParams.get("series_id")

    console.log(`[API] Fetching models with filters - brandId: ${brandId}, seriesId: ${seriesId}`)

    const supabase = createClient()
    let query = supabase.from("models").select("*, brands(name), series(name)")

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    if (seriesId) {
      query = query.eq("series_id", seriesId)
    }

    const { data, error } = await query.order("position", { ascending: true, nullsLast: true })

    if (error) {
      console.error("[API] Error fetching models:", error)
      throw error
    }

    console.log(`[API] Successfully fetched ${data.length} models`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error in models API:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[API] Creating new model with data:", body)

    const supabase = createClient()

    // Get the highest position value
    const { data: positionData } = await supabase
      .from("models")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition =
      positionData && positionData.length > 0 && positionData[0].position !== null ? positionData[0].position + 1 : 0

    const { data, error } = await supabase
      .from("models")
      .insert({
        name: body.name,
        brand_id: body.brandId,
        series_id: body.seriesId === "_none" ? null : body.seriesId || null,
        image_url: body.imageUrl || null,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Error creating model:", error)
      throw error
    }

    console.log("[API] Successfully created model:", data)

    // Log activity
    await logActivity({
      entityId: data.id,
      entityType: "model",
      actionType: "create",
      userId: body.userId || null,
      details: { name: data.name },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error in create model API:", error)
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}
