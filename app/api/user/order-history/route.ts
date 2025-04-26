import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getStatusByRemOnlineId } from "@/lib/order-status-utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Отримуємо сесію користувача
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get("locale") || "uk"

    // Отримуємо замовлення користувача з Supabase
    const supabase = createClient()

    // Отримуємо замовлення
    const { data: orders, error: ordersError } = await supabase
      .from("repair_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching repair orders:", ordersError)
      return NextResponse.json({ success: false, message: "Failed to fetch repair orders" }, { status: 500 })
    }

    // Отримуємо історію статусів для кожного замовлення
    const ordersWithHistory = await Promise.all(
      orders.map(async (order) => {
        // Отримуємо поточний статус
        const statusId = Number(order.status)
        const { name, color } = await getStatusByRemOnlineId(statusId, locale)

        // Отримуємо історію статусів
        const { data: statusHistory, error: historyError } = await supabase
          .from("order_status_history")
          .select("*")
          .eq("order_id", order.id)
          .order("changed_at", { ascending: false })

        if (historyError) {
          console.error(`Error fetching status history for order ${order.id}:`, historyError)
        }

        // Додаємо назви та кольори до історії статусів
        const historyWithNames = await Promise.all(
          (statusHistory || []).map(async (history) => {
            const oldStatusId = Number(history.old_status)
            const newStatusId = Number(history.new_status)

            const oldStatus = await getStatusByRemOnlineId(oldStatusId, locale)
            const newStatus = await getStatusByRemOnlineId(newStatusId, locale)

            return {
              ...history,
              old_status_name: oldStatus.name,
              old_status_color: oldStatus.color,
              new_status_name: newStatus.name,
              new_status_color: newStatus.color,
            }
          }),
        )

        return {
          ...order,
          status_name: name,
          status_color: color,
          statusHistory: historyWithNames,
        }
      }),
    )

    return NextResponse.json({ success: true, orders: ordersWithHistory })
  } catch (error) {
    console.error("Error in order history API:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching order history" },
      { status: 500 },
    )
  }
}
