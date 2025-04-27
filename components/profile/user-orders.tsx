"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { Clock, Search, RefreshCw, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type RepairOrder = {
  id: string
  reference_number: string
  device_brand: string
  device_model: string
  service_type: string
  status: string
  statusName: string // Поле для назви статусу
  statusColor: string // Поле для кольору статусу
  price: number | null
  created_at: string
}

export function UserOrders() {
  const t = useTranslations("Profile")
  const locale = useLocale() // Отримуємо поточну локаль
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isClient, setIsClient] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Важливо: встановлюємо isClient в true тільки на клієнті
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

      // Додаємо параметр для примусового оновлення статусів
      const response = await fetch(`/api/user/repair-orders?locale=${locale}&forceRefresh=${forceRefresh}`, {
        // Додаємо заголовок для уникнення кешування
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        // Додаємо унікальний параметр для уникнення кешування
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

  // Додаємо функцію для примусового оновлення
  function handleRefresh() {
    fetchOrders(true)
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

    // Apply tab filter - використовуємо статуси з бази даних
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
        day: "numeric",
        month: "short",
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
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-5 w-[120px]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        {/* Tabs - мобільна версія */}
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
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Пошук замовлень..."
                    className="pl-9 h-9 w-[200px] text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setShowSearch(false)
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Список замовлень - мобільна версія */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-[120px]" />
                      <Skeleton className="h-5 w-[80px]" />
                    </div>
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </CardContent>
              </Card>
            ))}
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
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden cursor-pointer hover:bg-muted/10 transition-colors"
                onClick={() => console.log(`View order details for ${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    {/* Верхній рядок: пристрій та статус */}
                    <div className="flex justify-between items-start">
                      <div className="font-medium">
                        {order.device_brand} {order.device_model}
                      </div>
                      <Badge className={cn("font-medium text-xs", order.statusColor)}>{order.statusName}</Badge>
                    </div>

                    {/* Номер замовлення */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-1">Замовлення №:</span>
                      <span className="font-medium">{order.reference_number}</span>
                    </div>

                    {/* Дата */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {formatDate(order.created_at)}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
