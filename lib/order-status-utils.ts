export type OrderStatus = {
  id: string
  remonline_status_id: number
  name_uk: string
  name_en: string
  name_cs: string
  color: string
}

const statusCache = new Map<string, { name: string; color: string }>()

export function getStatusColor(statusId: number): string {
  // Improved status colors with better contrast and design
  switch (statusId) {
    case 1: // New
      return "bg-blue-100 text-blue-800 border border-blue-200"
    case 2: // In Progress
      return "bg-amber-100 text-amber-800 border border-amber-200"
    case 3: // Waiting for Parts
      return "bg-purple-100 text-purple-800 border border-purple-200"
    case 4: // Waiting for Client
      return "bg-indigo-100 text-indigo-800 border border-indigo-200"
    case 5: // Completed
      return "bg-green-100 text-green-800 border border-green-200"
    case 6: // Cancelled
      return "bg-red-100 text-red-800 border border-red-200"
    case 7: // On Hold
      return "bg-gray-100 text-gray-800 border border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200"
  }
}

export function getStatusIcon(statusId: number): string {
  switch (statusId) {
    case 1: // New
      return "circle-dot"
    case 2: // In Progress
      return "tool"
    case 3: // Waiting for Parts
      return "package"
    case 4: // Waiting for Client
      return "user-clock"
    case 5: // Completed
      return "check-circle"
    case 6: // Cancelled
      return "x-circle"
    case 7: // On Hold
      return "pause-circle"
    default:
      return "circle"
  }
}

export async function getStatusByRemOnlineId(
  remOnlineId: number,
  locale = "uk",
  forceRefresh = false,
): Promise<{ name: string; color: string }> {
  const cacheKey = `${remOnlineId}-${locale}`

  if (!forceRefresh && statusCache.has(cacheKey)) {
    return statusCache.get(cacheKey)!
  }

  try {
    const { createClient } = await import("@/lib/supabase")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("order_statuses")
      .select("name_uk, name_en, name_cs, color")
      .eq("remonline_status_id", remOnlineId)
      .single()

    if (error) {
      console.error(`Error fetching status ${remOnlineId}:`, error)
      return { name: "Unknown", color: "bg-gray-100 text-gray-800" }
    }

    let name = "Unknown"
    switch (locale) {
      case "uk":
        name = data.name_uk
        break
      case "en":
        name = data.name_en
        break
      case "cs":
        name = data.name_cs
        break
      default:
        name = data.name_uk
    }

    const statusInfo = { name, color: data.color }
    statusCache.set(cacheKey, statusInfo)
    return statusInfo
  } catch (error) {
    console.error("Error in getStatusByRemOnlineId:", error)
    return { name: "Unknown", color: "bg-gray-100 text-gray-800" }
  }
}

export function clearStatusCache(): void {
  statusCache.clear()
}
