"use client"

import { useEffect, useState } from "react"
import { getUserRepairOrders } from "@/app/actions/repair-orders"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { ArrowRight, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type RepairOrder = {
  id: string
  reference_number: string
  device_brand: string
  device_model: string
  service_type: string
  status: string
  price: number | null
  created_at: string
}

export function UserOrders() {
  const t = useTranslations("Profile")
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        setError(null)
        const result = await getUserRepairOrders()

        if (result.success && result.orders) {
          setOrders(result.orders)
          setFilteredOrders(result.orders)
        } else {
          setError(result.message || t("repairHistory.errorFetching"))
        }
      } catch (err) {
        console.error("Error fetching repair orders:", err)
        setError(t("repairHistory.errorFetching"))
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [t])

  useEffect(() => {
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
          order.service_type.toLowerCase().includes(query),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => {
        if (activeTab === "active") {
          return order.status === "Новий" || order.status === "В процесі"
        } else if (activeTab === "completed") {
          return order.status === "Завершено"
        }
        return true
      })
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, activeTab])

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

  function getStatusColor(status: string): string {
    switch (status) {
      case "Новий":
        return "text-blue-600"
      case "В процесі":
        return "text-amber-600"
      case "Завершено":
        return "text-green-600"
      case "Скасовано":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
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
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
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
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("completed")}
          >
            Завершені замовлення
          </button>
          <div className="ml-auto relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Пошук замовлень..."
              className="pl-9 h-9 w-[200px] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
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
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Спробувати знову
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "Немає результатів пошуку" : "У вас ще немає історії ремонтів"}
          </div>
        ) : (
          <div className="border rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 text-xs uppercase">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Пристрій</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Замовлення №</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Послуга</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Дата</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => console.log(`View order details for ${order.id}`)}
                  >
                    <td className="py-4 px-4 font-medium">
                      {order.device_brand} {order.device_model}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{order.reference_number}</td>
                    <td className="py-4 px-4 text-muted-foreground">{order.service_type}</td>
                    <td className="py-4 px-4">
                      <span className={cn("font-medium", getStatusColor(order.status))}>{order.status}</span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
