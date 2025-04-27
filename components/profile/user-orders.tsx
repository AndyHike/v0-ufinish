"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import {
  Search,
  RefreshCw,
  Calendar,
  Smartphone,
  PenToolIcon as Tool,
  Tag,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
  function toggleOrderDetails(orderId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

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

  function formatDateTime(dateString: string) {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  // Отримання іконки для статусу
  function getStatusIcon(statusName: string) {
    if (
      statusName.toLowerCase().includes("завершено") ||
      statusName.toLowerCase().includes("готов") ||
      statusName.toLowerCase().includes("видан")
    ) {
      return <CheckCircle2 className="h-4 w-4" />
    } else if (statusName.toLowerCase().includes("процес") || statusName.toLowerCase().includes("робот")) {
      return <Loader2 className="h-4 w-4" />
    } else {
      return <AlertCircle className="h-4 w-4" />
    }
  }

  // Якщо ми на сервері або ще не на клієнті, показуємо скелетон
  if (!isClient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Історія ремонтів</CardTitle>
          <CardDescription>Переглядайте історію ваших ремонтів та їх статус.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Фільтри та пошук */}
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={activeTab === "all" ? "bg-primary/10 border-primary/50" : ""}
                onClick={() => setActiveTab("all")}
              >
                Всі
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={activeTab === "active" ? "bg-primary/10 border-primary/50" : ""}
                onClick={() => setActiveTab("active")}
              >
                Активні
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={activeTab === "completed" ? "bg-primary/10 border-primary/50" : ""}
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
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
              <p className="text-destructive font-medium mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchOrders(true)}>
                Спробувати знову
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">
                {searchQuery ? "Немає результатів пошуку" : "У вас ще немає історії ремонтів"}
              </p>
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
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground text-sm w-10">Деталі</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        className={cn(
                          "border-b hover:bg-muted/20 transition-colors",
                          expandedOrder === order.id && "bg-muted/10",
                        )}
                      >
                        <td className="py-3 px-4 text-sm font-medium">{order.reference_number}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            <Smartphone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {order.device_brand} {order.device_model}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            <Tool className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {order.service_type}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={cn("font-medium text-xs", order.statusColor)}>
                            <span className="flex items-center">
                              {getStatusIcon(order.statusName)}
                              <span className="ml-1">{order.statusName}</span>
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {order.price ? `${order.price} грн` : "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={(e) => toggleOrderDetails(order.id, e)}
                          >
                            {expandedOrder === order.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">Показати деталі</span>
                          </Button>
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr className="bg-muted/5">
                          <td colSpan={7} className="py-4 px-6">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Деталі замовлення</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">ID замовлення:</div>
                                    <div>{order.reference_number}</div>
                                    <div className="text-muted-foreground">Дата створення:</div>
                                    <div>{formatDateTime(order.created_at)}</div>
                                    <div className="text-muted-foreground">Пристрій:</div>
                                    <div>
                                      {order.device_brand} {order.device_model}
                                    </div>
                                    <div className="text-muted-foreground">Послуга:</div>
                                    <div>{order.service_type}</div>
                                    <div className="text-muted-foreground">Поточний статус:</div>
                                    <div>
                                      <Badge className={cn("font-medium text-xs", order.statusColor)}>
                                        {order.statusName}
                                      </Badge>
                                    </div>
                                    <div className="text-muted-foreground">Вартість:</div>
                                    <div>{order.price ? `${order.price} грн` : "Не вказано"}</div>
                                  </div>
                                </div>

                                {order.statusHistory && order.statusHistory.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Історія статусів</h4>
                                    <div className="space-y-3 relative before:absolute before:left-1.5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
                                      {order.statusHistory.map((history, index) => (
                                        <div key={history.id} className="flex items-start pl-6 relative">
                                          <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary"></div>
                                          <div className="flex-1">
                                            <div className="flex items-center">
                                              <Badge
                                                className={cn(
                                                  "font-medium text-xs",
                                                  history.new_status_color || "bg-gray-100",
                                                )}
                                              >
                                                {history.new_status_name || history.new_status}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground ml-2">
                                                {history.changed_by}
                                              </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {formatDateTime(history.changed_at)}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
