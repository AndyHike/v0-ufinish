import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getStatusByRemOnlineId } from "@/lib/order-status-utils"
import { getSession } from "@/lib/auth/session"

export async function GET(request: Request) {
  try {
    // Отримуємо параметри запиту
    const url = new URL(request.url)
    const locale = url.searchParams.get("locale") || "uk"

    // Отримуємо сесію користувача
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const supabase = createServerSupabaseClient()

    // Отримуємо замовлення користувача
    const { data: ordersData, error: ordersError } = await supabase
      .from("repair_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching repair orders:", ordersError)
      return NextResponse.json({ success: false, message: "Failed to fetch repair orders" }, { status: 500 })
    }

    // Для кожного замовлення отримуємо історію статусів та перетворюємо статуси
    const ordersWithHistory = await Promise.all(
      ordersData.map(async (order) => {
        // Отримуємо інформацію про статус замовлення
        const statusInfo = await getStatusByRemOnlineId(Number.parseInt(order.status, 10), locale)

        // Отримуємо історію статусів
        const { data: historyData, error: historyError } = await supabase
          .from("order_status_history")
          .select("*")
          .eq("order_id", order.id)
          .order("changed_at", { ascending: true })

        if (historyError) {
          console.error(`Error fetching history for order ${order.id}:`, historyError)
          return {
            ...order,
            status_name: statusInfo.name,
            status_color: statusInfo.color,
            statusHistory: [],
          }
        }

        // Перетворюємо статуси в історії
        const historyWithNames = await Promise.all(
          (historyData || []).map(async (history) => {
            const oldStatusId = Number.parseInt(history.old_status, 10)
            const newStatusId = Number.parseInt(history.new_status, 10)

            const [oldStatusInfo, newStatusInfo] = await Promise.all([
              !isNaN(oldStatusId)
                ? getStatusByRemOnlineId(oldStatusId, locale)
                : { name: history.old_status, color: "bg-gray-100" },
              !isNaN(newStatusId)
                ? getStatusByRemOnlineId(newStatusId, locale)
                : { name: history.new_status, color: "bg-gray-100" },
            ])

            return {
              ...history,
              old_status_name: oldStatusInfo.name,
              old_status_color: oldStatusInfo.color,
              new_status_name: newStatusInfo.name,
              new_status_color: newStatusInfo.color,
            }
          }),
        )

        return {
          ...order,
          status_name: statusInfo.name,
          status_color: statusInfo.color,
          statusHistory: historyWithNames,
        }
      }),
    )

    return NextResponse.json({ success: true, orders: ordersWithHistory })
  } catch (error) {
    console.error("Error in order history API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
