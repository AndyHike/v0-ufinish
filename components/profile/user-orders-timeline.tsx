"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
      return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: uk })
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Всі замовлення</TabsTrigger>
            <TabsTrigger value="active">Активні замовлення</TabsTrigger>
            <TabsTrigger value="completed">Завершені замовлення</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-10" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
            {refreshing ? "Оновлення..." : "Оновити"}
          </Button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Пошук замовлень..."
              className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {order.device_brand} {order.device_model}
                    </CardTitle>
                    <CardDescription>Замовлення №: {order.reference_number}</CardDescription>
                  </div>
                  <span
                    className={cn("font-medium px-2 py-1 rounded-full text-xs", order.status_color || "bg-gray-100")}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status_name || order.status}</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Послуга:</span>
                    <span>{order.service_type}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Створено:</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>

                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3">Історія статусів</h4>
                      <div className="space-y-3">
                        {order.statusHistory.map((history) => (
                          <div key={history.id} className="flex items-start">
                            <div className="mr-2 mt-0.5">{getStatusIcon(history.new_status)}</div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span
                                  className={cn(
                                    "font-medium px-2 py-0.5 rounded-full text-xs",
                                    history.old_status_color || "bg-gray-100",
                                  )}
                                >
                                  {history.old_status_name || history.old_status}
                                </span>
                                <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                                <span
                                  className={cn(
                                    "font-medium px-2 py-0.5 rounded-full text-xs",
                                    history.new_status_color || "bg-gray-100",
                                  )}
                                >
                                  {history.new_status_name || history.new_status}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(history.changed_at)} • {history.changed_by}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Деталі замовлення
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
