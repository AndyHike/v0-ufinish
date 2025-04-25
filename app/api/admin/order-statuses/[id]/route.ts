import { createClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("PUT /api/admin/order-statuses/[id] - Received request")
    const supabase = createClient()
    const { id } = params
    const body = await request.json()
    console.log("PUT /api/admin/order-statuses/[id] - Request body:", body)
    const { remonline_status_id, name_uk, name_en, name_cs, color, userId } = body

    // Verify admin permissions
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Validate required fields
    if (!remonline_status_id || !name_uk || !name_en || !name_cs || !color) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if remonline_status_id already exists for another status
    const { data: existingStatus, error: checkError } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("remonline_status_id", remonline_status_id)
      .neq("id", id)
      .maybeSingle()

    if (existingStatus) {
      return NextResponse.json(
        { success: false, message: "Status with this RemOnline ID already exists" },
        { status: 400 },
      )
    }

    // Update status
    const { data, error } = await supabase
      .from("order_statuses")
      .update({ remonline_status_id, name_uk, name_en, name_cs, color, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity({
      userId,
      entityType: "order_status",
      entityId: id,
      actionType: "update",
      details: { remonline_status_id, name_uk },
    })

    console.log("PUT /api/admin/order-statuses/[id] - Status updated successfully")
    return NextResponse.json({ success: true, status: data })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params
    const { userId } = await request.json()

    // Verify admin permissions
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Get status details for logging
    const { data: statusData, error: statusError } = await supabase
      .from("order_statuses")
      .select("remonline_status_id, name_uk")
      .eq("id", id)
      .single()

    if (statusError) throw statusError

    // Delete status
    const { error } = await supabase.from("order_statuses").delete().eq("id", id)

    if (error) throw error

    // Log activity
    await logActivity({
      userId,
      entityType: "order_status",
      entityId: id,
      actionType: "delete",
      details: statusData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order status:", error)
    return NextResponse.json({ success: false, message: "Failed to delete order status" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params

    const { data, error } = await supabase.from("order_statuses").select("*").eq("id", id).single()

    if (error) throw error

    return NextResponse.json({ success: true, status: data })
  } catch (error) {
    console.error("Error fetching order status:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch order status" }, { status: 500 })
  }
}
