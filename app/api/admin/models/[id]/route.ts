import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("models")
      .select("*, brands(id, name, logo_url), series(id, name)")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
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

    const { data: updatedModel, error } = await supabase
      .from("models")
      .update({
        name: modelData.name,
        brand_id: modelData.brandId,
        series_id: modelData.seriesId,
        image_url: modelData.imageUrl || null,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await logActivity({
      user_id: session.user.id,
      action: "update",
      resource_type: "model",
      resource_id: params.id,
      details: {
        name: updatedModel.name,
        brand_id: updatedModel.brand_id,
        series_id: updatedModel.series_id,
      },
    })

    return NextResponse.json(updatedModel)
  } catch (error) {
    console.error("Error in update model API:", error)
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // First, get the model to log its details
    const { data: model, error: fetchError } = await supabase
      .from("models")
      .select("name, brand_id, series_id")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("Error fetching model for deletion:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Delete the model
    const { error } = await supabase.from("models").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting model:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await logActivity({
      user_id: session.user.id,
      action: "delete",
      resource_type: "model",
      resource_id: params.id,
      details: {
        name: model.name,
        brand_id: model.brand_id,
        series_id: model.series_id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete model API:", error)
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 })
  }
}
