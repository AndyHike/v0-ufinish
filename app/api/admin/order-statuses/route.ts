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

// Перевіримо та виправимо обробник POST-запиту

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    console.log("Received POST request with body:", body)

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

    // Check if remonline_id already exists
    const { data: existingStatus, error: checkError } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("remonline_status_id", remonline_status_id)
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

    // Insert new status
    console.log("Inserting new status:", { remonline_status_id, name_uk, name_en, name_cs, color })

    const { data, error } = await supabase
      .from("order_statuses")
      .insert([{ remonline_status_id, name_uk, name_en, name_cs, color }])
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }

    console.log("Status created successfully:", data)

    // Clear the status cache
    clearStatusCache()

    // Log activity
    try {
      await logActivity({
        userId,
        entityType: "order_status",
        entityId: data.id,
        actionType: "create",
        details: { remonline_status_id, name_uk },
      })
    } catch (logError) {
      console.error("Error logging activity:", logError)
      // Continue even if logging fails
    }

    return NextResponse.json({ success: true, status: data })
  } catch (error) {
    console.error("Error creating order status:", error)
    return NextResponse.json({ success: false, message: "Failed to create order status" }, { status: 500 })
  }
}
