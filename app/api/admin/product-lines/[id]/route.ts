import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createClient()

    const { data, error } = await supabase.from("product_lines").select("*, brands(name)").eq("id", id).single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching product line:", error)
    return NextResponse.json({ error: "Failed to fetch product line" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const supabase = createClient()

    const { data, error } = await supabase
      .from("product_lines")
      .update({
        name: body.name,
        brand_id: body.brandId,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity({
      entityId: id,
      entityType: "product_line",
      actionType: "update",
      userId: body.userId || null,
      details: { name: data.name },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating product line:", error)
    return NextResponse.json({ error: "Failed to update product line" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createClient()

    // Get product line info before deletion for logging
    const { data: productLineData } = await supabase.from("product_lines").select("name").eq("id", id).single()

    // Check if there are any models associated with this product line
    const { data: modelsData, error: modelsError } = await supabase
      .from("models")
      .select("id")
      .eq("product_line_id", id)
      .limit(1)

    if (modelsError) throw modelsError

    if (modelsData && modelsData.length > 0) {
      return NextResponse.json({ error: "Cannot delete product line with associated models" }, { status: 400 })
    }

    const { error } = await supabase.from("product_lines").delete().eq("id", id)

    if (error) throw error

    // Log activity
    if (productLineData) {
      await logActivity({
        entityId: id,
        entityType: "product_line",
        actionType: "delete",
        userId: null,
        details: { name: productLineData.name },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product line:", error)
    return NextResponse.json({ error: "Failed to delete product line" }, { status: 500 })
  }
}
