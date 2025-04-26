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
    const { data: orders, error } = await supabase
      .from("repair_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching repair orders:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch repair orders" }, { status: 500 })
    }

    // Додаємо назви та кольори статусів до замовлень
    const ordersWithStatuses = await Promise.all(
      orders.map(async (order) => {
        const statusId = Number(order.status)
        const { name, color } = await getStatusByRemOnlineId(statusId, locale)

        return {
          ...order,
          statusName: name,
          statusColor: color, // Використовуємо оригінальний колір з бази даних
        }
      }),
    )

    return NextResponse.json({ success: true, orders: ordersWithStatuses })
  } catch (error) {
    console.error("Error in repair orders API:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching repair orders" },
      { status: 500 },
    )
  }
}
