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
          const statusInfo = await getStatusByRemOnlineId(statusId, locale)
          return {
            ...order,
            statusName: statusInfo.name,
            statusColor: statusInfo.color, // Тепер це буде bg-* клас
          }
        }
        return {
          ...order,
          statusName: order.status,
          statusColor: "bg-gray-100", // Змінюємо на bg-* клас
        }
      }),
    )

    return NextResponse.json({ success: true, orders: ordersWithStatusNames })
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
