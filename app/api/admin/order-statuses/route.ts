import { createClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"
import { logActivity } from "@/lib/admin/activity-logger"
import { clearStatusCache } from "@/lib/order-status-utils"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("order_statuses")
      .select("*")
      .order("remonline_status_id", { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, statuses: data })
  } catch (error) {
    console.error("Error fetching order statuses:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch order statuses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
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

    // Check if remonline_id already exists
    const { data: existingStatus, error: checkError } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("remonline_status_id", remonline_status_id)
      .maybeSingle()

    if (existingStatus) {
      return NextResponse.json(
        { success: false, message: "Status with this RemOnline ID already exists" },
        { status: 400 },
      )
    }

    // Insert new status
    const { data, error } = await supabase
      .from("order_statuses")
      .insert([{ remonline_status_id, name_uk, name_en, name_cs, color }])
      .select()
      .single()

    if (error) throw error

    // Clear the status cache
    clearStatusCache()

    // Log activity
    await logActivity({
      userId,
      entityType: "order_status",
      entityId: data.id,
      actionType: "create",
      details: { remonline_status_id, name_uk },
    })

    return NextResponse.json({ success: true, status: data })
  } catch (error) {
    console.error("Error creating order status:", error)
    return NextResponse.json({ success: false, message: "Failed to create order status" }, { status: 500 })
  }
}
