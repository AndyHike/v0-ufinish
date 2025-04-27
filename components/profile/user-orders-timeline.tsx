"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  Calendar,
  Tag,
  ArrowRight,
  RefreshCw,
  Search,
  ChevronRight,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  status_name?: string
  status_color?: string
  price: number | null
  created_at: string
  updated_at: string
  statusHistory?: OrderStatusHistory[]
}

export function UserOrdersTimeline() {
  const t = useTranslations("Profile")
  const locale = useLocale() // Отримуємо поточну локаль
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Важливо: встановлюємо isClient в true тільки на клієнті
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Завантажуємо дані тільки на клієнті
  useEffect(() => {
    if (isClient) {
      fetchOrders()
    }
  }, [locale, isClient])

  // Функція для отримання замовлень
  async function fetchOrders(forceRefresh = false) {
    if (!isClient) return

    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // Використовуємо fetch для отримання даних з параметром forceRefresh
      const response = await fetch(`/api/user/order-history?locale=${locale}&forceRefresh=${forceRefresh}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      if (data.success && data.orders) {
        setOrders(data.orders)
      } else {
        setError(data.message || "Помилка завантаження замовлень")
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err instanceof Error ? err.message : "Помилка завантаження замовлень")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Додаємо функцію для примусового оновлення
  function handleRefresh() {
    fetchOrders(true)
  }

  function getStatusIcon(statusCode: string) {
    // Перетворюємо рядок статусу на число
    const statusId = Number.parseInt(statusCode, 10)

    if (isNaN(statusId)) {
      return <Clock className="h-5 w-5 text-gray-500" />
    }

    // Визначаємо іконку на основі ID статусу
    switch (statusId) {
      case 3153189: // Новий
        return <Clock className="h-5 w-5 text-blue-500" />
      case 3153184: // В роботі
        return <RefreshCw className="h-5 w-5 text-amber-500" />
      case 3153185: // Готовий
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 3153186: // Виданий
        return <CheckCircle2 className="h-5 w-5 text-green-700" />
      case 3153187: // Скасований
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  function formatDate(dateString: string) {
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: uk })
    } catch (e) {
      return dateString
    }
  }

  // Якщо ми на сервері або ще не на клієнті, показуємо скелетон
  if (!isClient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const filteredOrders = orders.filter((order) => {
    // Filter by tab
    if (activeTab === "active") {
      // Активні замовлення - статуси "Новий" та "В роботі"
      const statusId = Number.parseInt(order.status, 10)
      if (statusId !== 3153189 && statusId !== 3153184) {
        return false
      }
    }

    if (activeTab === "completed") {
      // Завершені замовлення - статуси "Готовий" та "Виданий"
      const statusId = Number.parseInt(order.status, 10)
      if (statusId !== 3153185 && statusId !== 3153186) {
        return false
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.reference_number.toLowerCase().includes(query) ||
        order.device_brand.toLowerCase().includes(query) ||
        order.device_model.toLowerCase().includes(query) ||
        (order.status_name && order.status_name.toLowerCase().includes(query))
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Помилка завантаження</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Спробувати знову
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Фільтри та пошук - мобільна версія */}
      <div className="flex flex-col space-y-3">
        {/* Фільтри замовлень */}
        <div className="flex border-b overflow-x-auto no-scrollbar">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("all")}
          >
            Всі замовлення
          </button>
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              activeTab === "active"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("active")}
          >
            Активні замовлення
          </button>
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              activeTab === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("completed")}
          >
            Завершені замовлення
          </button>
        </div>

        {/* Кнопки дій */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-9" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
            {refreshing ? "Оновлення..." : "Оновити"}
          </Button>

          <div className="flex items-center">
            {showSearch ? (
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Пошук замовлень..."
                  className="pl-9 pr-9 h-9 w-[200px] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 h-9 w-9 p-0"
                  onClick={() => {
                    setSearchQuery("")
                    setShowSearch(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
          <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "Немає результатів пошуку" : "У вас ще немає історії ремонтів"}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Спробуйте змінити параметри пошуку" : "Ваші замовлення на ремонт з'являться тут"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {order.device_brand} {order.device_model}
                    </CardTitle>
                    <CardDescription className="text-xs">№: {order.reference_number}</CardDescription>
                  </div>
                  <span
                    className={cn("font-medium px-2 py-1 rounded-full text-xs", order.status_color || "bg-gray-100")}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status_name || order.status}</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-xs">
                    <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1.5">Послуга:</span>
                    <span className="truncate">{order.service_type}</span>
                  </div>

                  <div className="flex items-center text-xs">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1.5">Створено:</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>

                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-xs font-medium mb-2">Історія статусів</h4>
                      <div className="space-y-2">
                        {order.statusHistory.slice(0, 2).map((history) => (
                          <div key={history.id} className="flex items-start">
                            <div className="mr-1.5 mt-0.5">{getStatusIcon(history.new_status)}</div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={cn(
                                    "font-medium px-1.5 py-0.5 rounded-full text-xs",
                                    history.old_status_color || "bg-gray-100",
                                  )}
                                >
                                  {history.old_status_name || history.old_status}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span
                                  className={cn(
                                    "font-medium px-1.5 py-0.5 rounded-full text-xs",
                                    history.new_status_color || "bg-gray-100",
                                  )}
                                >
                                  {history.new_status_name || history.new_status}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{formatDate(history.changed_at)}</div>
                            </div>
                          </div>
                        ))}
                        {order.statusHistory.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center mt-1">
                            + ще {order.statusHistory.length - 2}{" "}
                            {order.statusHistory.length - 2 === 1 ? "запис" : "записів"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      Деталі
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
