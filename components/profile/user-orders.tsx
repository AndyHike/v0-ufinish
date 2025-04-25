"use client"

import { useEffect, useState } from "react"
import { getUserRepairOrders } from "@/app/actions/repair-orders"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { AlertCircle, ArrowRight, Clock, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        } else if (activeTab === "cancelled") {
          return order.status === "Скасовано"
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
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="h-9 bg-muted/50">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              {t("repairHistory.allOrders")}
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              {t("repairHistory.activeOrders")}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              {t("repairHistory.completedOrders")}
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("repairHistory.searchPlaceholder")}
              className="pl-9 h-9 w-full sm:w-[200px] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          {renderOrdersList()}
        </TabsContent>
        <TabsContent value="active" className="m-0">
          {renderOrdersList()}
        </TabsContent>
        <TabsContent value="completed" className="m-0">
          {renderOrdersList()}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderOrdersList() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-lg font-medium text-red-500">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            {t("repairHistory.tryAgain")}
          </Button>
        </div>
      )
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-12 border-t">
          <p className="text-muted-foreground">
            {searchQuery ? t("repairHistory.noSearchResults") : t("repairHistory.noOrders")}
          </p>
        </div>
      )
    }

    return (
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("repairHistory.device")}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                {t("repairHistory.orderNumber")}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                {t("repairHistory.service")}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("repairHistory.status")}
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("repairHistory.date")}
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => console.log(`View order details for ${order.id}`)}
              >
                <td className="py-4 px-4">
                  <div className="font-medium">
                    {order.device_brand} {order.device_model}
                  </div>
                </td>
                <td className="py-4 px-4 hidden md:table-cell text-muted-foreground">{order.reference_number}</td>
                <td className="py-4 px-4 hidden sm:table-cell text-muted-foreground">{order.service_type}</td>
                <td className="py-4 px-4">
                  <span className={cn("font-medium", getStatusColor(order.status))}>{order.status}</span>
                </td>
                <td className="py-4 px-4 text-right text-muted-foreground text-sm whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Clock className="h-3 w-3" />
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
    )
  }
}
