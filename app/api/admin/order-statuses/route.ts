import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: statuses, error } = await supabase
      .from("order_statuses")
      .select("*")
      .order("remonline_status_id", { ascending: true })

    if (error) {
      console.error("Error fetching order statuses:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch order statuses" }, { status: 500 })
    }

    return NextResponse.json({ success: true, statuses })
  } catch (error) {
    console.error("Unexpected error in GET /api/admin/order-statuses:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { remonline_status_id, name_uk, name_en, name_cs, color } = body

    // Базова валідація
    if (!remonline_status_id || !name_uk || !name_en || !name_cs || !color) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Перевіряємо, чи існує вже статус з таким remonline_status_id
    const { data: existingStatus, error: checkError } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("remonline_status_id", remonline_status_id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing status:", checkError)
      return NextResponse.json({ success: false, message: "Failed to check existing status" }, { status: 500 })
    }

    if (existingStatus) {
      return NextResponse.json(
        { success: false, message: "Status with this Remonline ID already exists" },
        { status: 400 },
      )
    }

    // Додаємо новий статус
    const { data, error } = await supabase
      .from("order_statuses")
      .insert({
        remonline_status_id,
        name_uk,
        name_en,
        name_cs,
        color,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating order status:", error)
      return NextResponse.json({ success: false, message: "Failed to create order status" }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: data })
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/order-statuses:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
