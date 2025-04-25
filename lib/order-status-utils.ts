import { createClient } from "@/lib/supabase"

type OrderStatus = {
  id: number
  remonline_status_id: number
  name_uk: string
  name_en: string
  name_cs: string
  color: string
}

// Кеш для статусів замовлень
let statusesCache: OrderStatus[] | null = null
let lastFetchTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 хвилин

export async function getOrderStatuses(): Promise<OrderStatus[]> {
  const now = Date.now()

  // Використовуємо кеш, якщо він є і не застарів
  if (statusesCache && now - lastFetchTime < CACHE_TTL) {
    return statusesCache
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("order_statuses")
      .select("*")
      .order("remonline_status_id", { ascending: true })

    if (error) throw error

    // Оновлюємо кеш
    statusesCache = data
    lastFetchTime = now

    return data
  } catch (error) {
    console.error("Error fetching order statuses:", error)
    // Повертаємо кеш, якщо він є, навіть якщо він застарів
    return statusesCache || []
  }
}

export async function getStatusByRemOnlineId(
  remonlineStatusId: number,
  locale = "uk",
): Promise<{ name: string; color: string }> {
  const statuses = await getOrderStatuses()
  const status = statuses.find((s) => s.remonline_status_id === remonlineStatusId)

  if (!status) {
    return { name: `Status ${remonlineStatusId}`, color: "bg-gray-100 text-gray-800" }
  }

  let name = status.name_uk
  if (locale === "en") name = status.name_en
  if (locale === "cs") name = status.name_cs

  return { name, color: status.color }
}

export function clearStatusCache() {
  statusesCache = null
  lastFetchTime = 0
}
