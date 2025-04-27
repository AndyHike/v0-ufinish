import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase"
import { getStatusColor } from "@/lib/order-status-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const locale = request.nextUrl.searchParams.get("locale") || "en"
    const forceRefresh = request.nextUrl.searchParams.get("forceRefresh") === "true"

    // Get user's repair orders from database
    const supabase = createClient()

    // Get order statuses for translation
    const { data: orderStatuses, error: statusesError } = await supabase
      .from("order_statuses")
      .select("id, name_uk, name_en, name_cs, color")

    if (statusesError) {
      console.error("Error fetching order statuses:", statusesError)
      return NextResponse.json({ success: false, message: "Error fetching order statuses" }, { status: 500 })
    }

    // Get user's repair orders
    const { data: orders, error: ordersError } = await supabase
      .from("repair_orders")
      .select(`
        id, 
        reference_number, 
        device_brand, 
        device_model, 
        service_type, 
        status, 
        price, 
        created_at,
        status_history (
          id,
          order_id,
          old_status,
          new_status,
          changed_by,
          changed_at,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching repair orders:", ordersError)
      return NextResponse.json({ success: false, message: "Error fetching repair orders" }, { status: 500 })
    }

    // Map status IDs to names and colors based on locale
    const formattedOrders = orders.map((order) => {
      const statusObj = orderStatuses.find((s) => s.id === order.status)
      let statusName = "Unknown"

      if (statusObj) {
        if (locale === "uk") statusName = statusObj.name_uk
        else if (locale === "cs") statusName = statusObj.name_cs
        else statusName = statusObj.name_en
      }

      const statusColor = statusObj ? getStatusColor(statusObj.color) : "bg-gray-100 text-gray-800"

      // Format status history
      const statusHistory = order.status_history
        ? order.status_history.map((history) => {
            const oldStatusObj = orderStatuses.find((s) => s.id === history.old_status)
            const newStatusObj = orderStatuses.find((s) => s.id === history.new_status)

            let oldStatusName = "Unknown"
            let newStatusName = "Unknown"

            if (oldStatusObj) {
              if (locale === "uk") oldStatusName = oldStatusObj.name_uk
              else if (locale === "cs") oldStatusName = oldStatusObj.name_cs
              else oldStatusName = oldStatusObj.name_en
            }

            if (newStatusObj) {
              if (locale === "uk") newStatusName = newStatusObj.name_uk
              else if (locale === "cs") newStatusName = newStatusObj.name_cs
              else newStatusName = newStatusObj.name_en
            }

            return {
              ...history,
              old_status_name: oldStatusName,
              new_status_name: newStatusName,
              old_status_color: oldStatusObj ? getStatusColor(oldStatusObj.color) : "bg-gray-100 text-gray-800",
              new_status_color: newStatusObj ? getStatusColor(newStatusObj.color) : "bg-gray-100 text-gray-800",
            }
          })
        : []

      return {
        ...order,
        statusName,
        statusColor,
        statusHistory: statusHistory.sort(
          (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
        ),
      }
    })

    return NextResponse.json({ success: true, orders: formattedOrders })
  } catch (error) {
    console.error("Error in repair orders API:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
