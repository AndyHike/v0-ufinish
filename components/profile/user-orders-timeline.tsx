"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  Calendar,
  Tag,
  ArrowRight,
  RefreshCcw,
  Search,
  ChevronRight,
} from "lucide-react"

// Оновіть імпорт утиліт для статусів замовлень
import { getStatusByRemOnlineId } from "@/lib/order-status-utils"

type OrderStatusHistory = {
  id: string
  order_id: string
  old_status: string
  new_status: string
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
  price: number | null
  created_at: string
  updated_at: string
  statusHistory?: OrderStatusHistory[]
}

export function UserOrdersTimeline() {
  const t = useTranslations("Profile")
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Додайте новий стан для зберігання статусів
  const [statusColors, setStatusColors] = useState<Record<string, { name: string; color: string }>>({})

  useEffect(() => {
    fetchOrders()
  }, [])

  // Оновіть функцію loadStatusColors для використання цифрових кодів
  async function loadStatusColors(orders: RepairOrder[]) {
    const uniqueStatuses = [...new Set(orders.map((order) => order.status))]
    const statusMap: Record<string, { name: string; color: string }> = {}

    for (const statusCode of uniqueStatuses) {
      // Перетворюємо рядок статусу на число, оскільки тепер ми працюємо з цифровими кодами
      const remonlineId = Number.parseInt(statusCode, 10)
      if (!isNaN(remonlineId)) {
        statusMap[statusCode] = await getStatusByRemOnlineId(remonlineId)
      } else {
        statusMap[statusCode] = { name: statusCode, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" }
      }
    }

    setStatusColors(statusMap)
  }

  // Оновіть функцію fetchOrders, щоб також завантажувати статуси
  async function fetchOrders() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("repair_orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (ordersError) throw ordersError

      // For each order, fetch its status history
      const ordersWithHistory = await Promise.all(
        ordersData.map(async (order) => {
          const { data: historyData, error: historyError } = await supabase
            .from("order_status_history")
            .select("*")
            .eq("order_id", order.id)
            .order("changed_at", { ascending: true })

          if (historyError) {
            console.error(`Error fetching history for order ${order.id}:`, historyError)
            return { ...order, statusHistory: [] }
          }

          return { ...order, statusHistory: historyData || [] }
        }),
      )

      setOrders(ordersWithHistory)

      // Завантажуємо статуси
      await loadStatusColors(ordersWithHistory)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err instanceof Error ? err.message : "Помилка завантаження замовлень")
    } finally {
      setLoading(false)
    }
  }

  function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
      case "новий":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "в роботі":
        return <RefreshCcw className="h-5 w-5 text-amber-500" />
      case "готовий":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "виданий":
        return <CheckCircle2 className="h-5 w-5 text-green-700" />
      case "скасований":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  // Оновіть функцію getStatusColor, щоб використовувати дані з бази даних
  function getStatusColor(status: string) {
    return statusColors[status]?.color || "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }

  function formatDate(dateString: string) {
    try {
      return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: uk })
    } catch (e) {
      return dateString
    }
  }

  const filteredOrders = orders.filter((order) => {
    // Filter by tab
    if (activeTab === "active" && ["виданий", "скасований"].includes(order.status.toLowerCase())) {
      return false
    }
    if (activeTab === "completed" && !["виданий", "скасований"].includes(order.status.toLowerCase())) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.reference_number.toLowerCase().includes(query) ||
        order.device_brand.toLowerCase().includes(query) ||
        order.device_model.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
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
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Спробувати знову
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Всі замовлення</TabsTrigger>
            <TabsTrigger value="active">Активні замовлення</TabsTrigger>
            <TabsTrigger value="completed">Завершені замовлення</TabsTrigger>
          </TabsList>
        </Tabs>

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
                  {/* Оновіть відображення статусу в Badge */}
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{statusColors[order.status]?.name || order.status}</span>
                  </Badge>
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
                        {order.statusHistory.map((history, index) => (
                          <div key={history.id} className="flex items-start">
                            <div className="mr-2 mt-0.5">{getStatusIcon(history.new_status)}</div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="text-sm font-medium">{history.old_status}</span>
                                <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                                <span className="text-sm font-medium">{history.new_status}</span>
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
