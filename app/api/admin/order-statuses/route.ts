import { createClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("order_statuses").select("*").order("created_at", { ascending: true })

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
    const { userId } = await request.json()

    // Verify admin permissions
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const { code, name_uk, name_en, name_cs, color } = await request.json()

    // Validate required fields
    if (!code || !name_uk || !name_en || !name_cs || !color) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if code already exists
    const { data: existingStatus, error: checkError } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("code", code)
      .maybeSingle()

    if (existingStatus) {
      return NextResponse.json({ success: false, message: "Status code already exists" }, { status: 400 })
    }

    // Insert new status
    const { data, error } = await supabase
      .from("order_statuses")
      .insert([{ code, name_uk, name_en, name_cs, color }])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity({
      userId,
      entityType: "order_status",
      entityId: data.id,
      actionType: "create",
      details: { code, name_uk },
    })

    return NextResponse.json({ success: true, status: data })
  } catch (error) {
    console.error("Error creating order status:", error)
    return NextResponse.json({ success: false, message: "Failed to create order status" }, { status: 500 })
  }
}
