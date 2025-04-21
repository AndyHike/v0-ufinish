import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
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
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Transform data to include brand_name and brand_logo_url
    const transformedData = {
      id: data.id,
      name: data.name,
      year: data.year,
      image_url: data.image_url,
      created_at: data.created_at,
      position: data.position,
      brand_id: data.brand_id,
      brand_name: data.brands?.name || "Unknown",
      brand_logo_url: data.brands?.logo_url,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const body = await request.json()
    const { name, brandId, year, imageUrl, userId } = body

    if (!name || !brandId) {
      return NextResponse.json({ error: "Name and brand are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("models")
      .update({
        name,
        brand_id: brandId,
        year: year || null,
        image_url: imageUrl || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    if (userId) {
      await logActivity({
        userId,
        entityId: id,
        entityType: "model",
        actionType: "update",
        details: { name, brandId, year },
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const supabase = createServerClient()

    // First, delete related model services
    const { error: servicesError } = await supabase.from("model_services").delete().eq("model_id", id)

    if (servicesError) {
      console.error("Error deleting model services:", servicesError)
      return NextResponse.json({ error: servicesError.message }, { status: 500 })
    }

    // Then delete the model
    const { error } = await supabase.from("models").delete().eq("id", id)

    if (error) {
      console.error("Error deleting model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    if (userId) {
      await logActivity({
        userId,
        entityId: id,
        entityType: "model",
        actionType: "delete",
        details: { id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
