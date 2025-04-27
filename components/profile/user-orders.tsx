"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type OrderStatusHistory = {
  id: string
  order_id: string
  old_status: string
  old_status_name?: string
  old_status_color?: string
  new_status: string
  new_status_name?: string
  new_status_color?: string
  changed_by: string
  changed_at: string
  created_at: string
}

type RepairOrder = {
  id: string
  reference_number: string
  device_brand: string
  device_model: string
  service_type: string
  status: string
  statusName: string
  statusColor: string
  price: number | null
  created_at: string
  statusHistory?: OrderStatusHistory[]
}

export function UserOrders() {
  const t = useTranslations("Profile")
  const locale = useLocale()
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isClient, setIsClient] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Встановлюємо isClient в true тільки на клієнті
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Завантаження замовлень через API тільки на клієнті
  useEffect(() => {
    if (isClient) {
      fetchOrders()
    }
  }, [t, locale, isClient])

  async function fetchOrders(forceRefresh = false) {
    if (!isClient) return

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const response = await fetch(`/api/user/repair-orders?locale=${locale}&forceRefresh=${forceRefresh}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      if (data.success && data.orders) {
        setOrders(data.orders)
        setFilteredOrders(data.orders)
      } else {
        setError(data.message || t("repairHistory.errorFetching"))
      }
    } catch (err) {
      console.error("Error fetching repair orders:", err)
      setError(t("repairHistory.errorFetching"))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Функція для примусового оновлення
  function handleRefresh() {
    fetchOrders(true)
  }

  // Функція для розгортання/згортання деталей замовлення
  function toggleOrderDetails(orderId: string) {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  // Фільтрація замовлень
  useEffect(() => {
    if (!isClient) return

    // Filter orders based on search query and active tab
    let filtered = orders

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.device_brand.toLowerCase().includes(query) ||
          order.device_model.toLowerCase().includes(query) ||
          order.reference_number.toLowerCase().includes(query) ||
          order.service_type.toLowerCase().includes(query) ||
          order.statusName.toLowerCase().includes(query),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => {
        const statusId = Number.parseInt(order.status, 10)
        if (activeTab === "active") {
          // Активні замовлення - статуси "Новий" та "В роботі"
          return statusId === 3153189 || statusId === 3153184
        } else if (activeTab === "completed") {
          // Завершені замовлення - статуси "Готовий" та "Виданий"
          return statusId === 3153185 || statusId === 3153186
        }
        return true
      })
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, activeTab, isClient])

  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  // Якщо ми на сервері або ще не на клієнті, показуємо скелетон
  if (!isClient) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-5 w-[80px]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 pb-2">
            <h2 className="text-xl font-semibold">Історія ремонтів</h2>
            <p className="text-sm text-muted-foreground">Переглядайте історію ваших ремонтів та їх статус.</p>
          </div>

          {/* Фільтри та пошук */}
          <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={activeTab === "all" ? "bg-muted" : ""}
                onClick={() => setActiveTab("all")}
              >
                Всі
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={activeTab === "active" ? "bg-muted" : ""}
                onClick={() => setActiveTab("active")}
              >
                Активні
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={activeTab === "completed" ? "bg-muted" : ""}
                onClick={() => setActiveTab("completed")}
              >
                Завершені
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
                {refreshing ? "Оновлення..." : "Оновити"}
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Пошук..."
                  className="pl-9 h-9 w-[150px] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Таблиця замовлень */}
          {loading ? (
            <div className="p-4">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchOrders(true)}>
                Спробувати знову
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Немає результатів пошуку" : "У вас ще немає історії ремонтів"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Дата</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Пристрій</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Послуга</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Статус</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Ціна</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <>
                      <tr
                        key={order.id}
                        className={cn(
                          "border-b hover:bg-muted/20 transition-colors cursor-pointer",
                          expandedOrder === order.id && "bg-muted/10",
                        )}
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        <td className="py-3 px-4 text-sm">{order.reference_number}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(order.created_at)}</td>
                        <td className="py-3 px-4 text-sm">
                          {order.device_brand} {order.device_model}
                        </td>
                        <td className="py-3 px-4 text-sm">{order.service_type}</td>
                        <td className="py-3 px-4">
                          <Badge className={cn("font-medium text-xs", order.statusColor)}>{order.statusName}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{order.price ? `${order.price} грн` : "-"}</td>
                      </tr>
                      {expandedOrder === order.id && order.statusHistory && order.statusHistory.length > 0 && (
                        <tr className="bg-muted/5">
                          <td colSpan={6} className="py-3 px-4">
                            <div className="text-sm font-medium mb-2">Історія змін статусів:</div>
                            <div className="space-y-2 pl-2">
                              {order.statusHistory.map((history) => (
                                <div key={history.id} className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">{formatDate(history.changed_at)}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <Badge
                                    className={cn("font-medium text-xs", history.new_status_color || "bg-gray-100")}
                                  >
                                    {history.new_status_name || history.new_status}
                                  </Badge>
                                  <span className="text-muted-foreground ml-1">({history.changed_by})</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
