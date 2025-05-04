import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const brandId = url.searchParams.get("brand_id")
    const seriesId = url.searchParams.get("series_id")

    const supabase = createServerClient()
    let query = supabase.from("models").select("*, brands(id, name, logo_url), series(id, name)")

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    if (seriesId) {
      if (seriesId === "_none") {
        query = query.is("series_id", null)
      } else {
        query = query.eq("series_id", seriesId)
      }
    }

    const { data, error } = await query.order("position", { ascending: true })

    if (error) {
      console.error("Error fetching models:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in models API:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const data = await request.json()

    // Handle the case where seriesId is "_none" or empty
    const modelData = { ...data }
    if (modelData.seriesId === "_none" || !modelData.seriesId) {
      modelData.seriesId = null
    }

    // Get the highest position for the brand
    const { data: existingModels, error: positionError } = await supabase
      .from("models")
      .select("position")
      .eq("brand_id", modelData.brandId)
      .order("position", { ascending: false })
      .limit(1)

    if (positionError) {
      console.error("Error getting highest position:", positionError)
      return NextResponse.json({ error: positionError.message }, { status: 500 })
    }

    const nextPosition = existingModels.length > 0 ? (existingModels[0].position || 0) + 1 : 0

    // Insert the new model
    const { data: newModel, error } = await supabase
      .from("models")
      .insert({
        name: modelData.name,
        brand_id: modelData.brandId,
        series_id: modelData.seriesId,
        image_url: modelData.imageUrl || null,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await logActivity({
      user_id: session.user.id,
      action: "create",
      resource_type: "model",
      resource_id: newModel.id,
      details: {
        name: newModel.name,
        brand_id: newModel.brand_id,
        series_id: newModel.series_id,
      },
    })

    return NextResponse.json(newModel)
  } catch (error) {
    console.error("Error in create model API:", error)
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}
