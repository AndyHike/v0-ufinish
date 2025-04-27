import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getStatusByRemOnlineId, clearStatusCache } from "@/lib/order-status-utils"
import { getSession } from "@/lib/auth/session"

export async function GET(request: Request) {
  try {
    // Очищуємо кеш статусів при кожному запиті замовлень
    clearStatusCache()

    // Отримуємо параметри запиту
    const url = new URL(request.url)
    const locale = url.searchParams.get("locale") || "uk"
    const forceRefresh = url.searchParams.get("forceRefresh") === "true"

    // Отримуємо сесію користувача
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const supabase = createServerSupabaseClient()

    // Отримуємо замовлення користувача
    const { data: orders, error } = await supabase
      .from("repair_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching repair orders:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch repair orders" }, { status: 500 })
    }

    // Змінюємо API для отримання замовлень, щоб повертати колір фону
    const ordersWithStatusNames = await Promise.all(
      orders.map(async (order) => {
        const statusId = Number.parseInt(order.status, 10)
        if (!isNaN(statusId)) {
          // Примусово оновлюємо статуси з бази даних
          const statusInfo = await getStatusByRemOnlineId(statusId, locale, forceRefresh)
          return {
            ...order,
            statusName: statusInfo.name,
            statusColor: statusInfo.color,
          }
        }
        return {
          ...order,
          statusName: order.status,
          statusColor: "bg-gray-100",
        }
      }),
    )

    // Додаємо заголовок Cache-Control
    return new NextResponse(JSON.stringify({ success: true, orders: ordersWithStatusNames }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("Error in getUserRepairOrders API:", error)
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
