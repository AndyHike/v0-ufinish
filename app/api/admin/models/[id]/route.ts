import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createClient()

    const { data, error } = await supabase
      .from("models")
      .select("*, brands(name, logo_url), series(name)")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching model:", error)
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in get model API:", error)
    return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { name, brandId, seriesId, imageUrl, userId } = await request.json()

    if (!name || !brandId) {
      return NextResponse.json({ error: "Name and brand are required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("models")
      .update({
        name,
        brand_id: brandId,
        series_id: seriesId || null,
        image_url: imageUrl || null,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating model:", error)
      throw error
    }

    // Log the activity
    if (userId) {
      await logActivity({
        userId,
        action: "update",
        resourceType: "model",
        resourceId: id,
        details: `Updated model: ${name}`,
      })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in update model API:", error)
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createClient()

    // Get the model name for logging
    const { data: model, error: fetchError } = await supabase
      .from("models")
      .select("name, brand_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching model for deletion:", fetchError)
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Delete the model
    const { error } = await supabase.from("models").delete().eq("id", id)

    if (error) {
      console.error("Error deleting model:", error)
      throw error
    }

    // Update positions for remaining models
    const { data: remainingModels, error: fetchRemainingError } = await supabase
      .from("models")
      .select("id, position")
      .eq("brand_id", model.brand_id)
      .order("position", { ascending: true })

    if (!fetchRemainingError && remainingModels) {
      // Update positions to be sequential
      const updates = remainingModels.map((item, index) => ({
        id: item.id,
        position: index,
      }))

      for (const update of updates) {
        await supabase.from("models").update({ position: update.position }).eq("id", update.id)
      }
    }

    // Log the activity
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    if (userId) {
      await logActivity({
        userId,
        action: "delete",
        resourceType: "model",
        resourceId: id,
        details: `Deleted model: ${model.name}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete model API:", error)
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 })
  }
}
