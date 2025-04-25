import { createClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"
import { logActivity } from "@/lib/admin/activity-logger"
import { clearStatusCache } from "@/lib/order-status-utils"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()
    console.log("Received PUT request for ID:", id, "with body:", body)

    const { remonline_status_id, name_uk, name_en, name_cs, color, userId } = body

    // Verify admin permissions
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    console.log("User data:", userData, "User error:", userError)

    if (userError) {
      console.error("User verification error:", userError)
      return NextResponse.json({ success: false, message: "User verification failed" }, { status: 403 })
    }

    if (!userData || userData.role !== "admin") {
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

    console.log("Existing status check:", existingStatus, "Check error:", checkError)

    if (checkError) {
      console.error("Error checking existing status:", checkError)
    }

    if (existingStatus) {
      return NextResponse.json(
        { success: false, message: "Status with this RemOnline ID already exists" },
        { status: 400 },
      )
    }

    // Update status
    console.log("Updating status:", { remonline_status_id, name_uk, name_en, name_cs, color })

    const { data, error } = await supabase
      .from("order_statuses")
      .update({
        remonline_status_id,
        name_uk,
        name_en,
        name_cs,
        color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      throw error
    }

    console.log("Status updated successfully:", data)

    // Clear the status cache
    clearStatusCache()

    // Log activity
    try {
      await logActivity({
        userId,
        entityType: "order_status",
        entityId: id,
        actionType: "update",
        details: { remonline_status_id, name_uk },
      })
    } catch (logError) {
      console.error("Error logging activity:", logError)
      // Continue even if logging fails
    }

    return NextResponse.json({ success: true, status: data })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 })
  }
}

// Перевіримо та виправимо обробник DELETE-запиту

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()
    console.log("Received DELETE request for ID:", id, "with body:", body)

    const { userId } = body

    // Verify admin permissions
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    console.log("User data:", userData, "User error:", userError)

    if (userError) {
      console.error("User verification error:", userError)
      return NextResponse.json({ success: false, message: "User verification failed" }, { status: 403 })
    }

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Get status details for logging
    const { data: statusData, error: statusError } = await supabase
      .from("order_statuses")
      .select("remonline_status_id, name_uk")
      .eq("id", id)
      .single()

    if (statusError) {
      console.error("Error fetching status details:", statusError)
      throw statusError
    }

    console.log("Status to delete:", statusData)

    // Delete status
    const { error } = await supabase.from("order_statuses").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      throw error
    }

    console.log("Status deleted successfully")

    // Clear the status cache
    clearStatusCache()

    // Log activity
    try {
      await logActivity({
        userId,
        entityType: "order_status",
        entityId: id,
        actionType: "delete",
        details: statusData,
      })
    } catch (logError) {
      console.error("Error logging activity:", logError)
      // Continue even if logging fails
    }

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
