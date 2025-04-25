// Додаємо цей файл, щоб перевірити, як саме отримуються дані замовлень
import { createClient } from "@/lib/supabase"
import { getStatusByRemOnlineId } from "@/lib/order-status-utils"

export async function getUserRepairOrders() {
  try {
    const supabase = createClient()

    // Отримуємо поточного користувача
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, message: "Не авторизовано" }
    }

    // Отримуємо замовлення користувача
    const { data: orders, error } = await supabase
      .from("repair_orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching repair orders:", error)
      return { success: false, message: "Помилка завантаження замовлень" }
    }

    return { success: true, orders }
  } catch (error) {
    console.error("Error in getUserRepairOrders:", error)
    return { success: false, message: "Помилка завантаження замовлень" }
  }
}

// Додаємо нову функцію для отримання замовлень з перетвореними статусами
export async function getUserRepairOrdersWithStatusNames(locale = "uk") {
  try {
    const result = await getUserRepairOrders()

    if (!result.success || !result.orders) {
      return result
    }

    // Перетворюємо статуси на їх текстові значення
    const ordersWithStatusNames = await Promise.all(
      result.orders.map(async (order) => {
        const statusId = Number.parseInt(order.status, 10)
        if (!isNaN(statusId)) {
          const statusInfo = await getStatusByRemOnlineId(statusId, locale)
          return {
            ...order,
            statusName: statusInfo.name,
            statusColor: statusInfo.color,
          }
        }
        return {
          ...order,
          statusName: order.status,
          statusColor: "text-gray-600",
        }
      }),
    )

    return { success: true, orders: ordersWithStatusNames }
  } catch (error) {
    console.error("Error in getUserRepairOrdersWithStatusNames:", error)
    return { success: false, message: "Помилка завантаження замовлень" }
  }
}
