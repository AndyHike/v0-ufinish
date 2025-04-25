"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserRepairOrders } from "@/app/actions/repair-orders"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        setError(null)
        const result = await getUserRepairOrders()

        if (result.success && result.orders) {
          setOrders(result.orders)
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

  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "Новий":
        return "bg-blue-100 text-blue-800"
      case "В процесі":
        return "bg-yellow-100 text-yellow-800"
      case "Завершено":
        return "bg-green-100 text-green-800"
      case "Скасовано":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("repairHistory.title")}</CardTitle>
        <CardDescription>{t("repairHistory.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-6">
            <p className="text-red-500 mb-2">{error}</p>
            <button onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:underline">
              {t("repairHistory.tryAgain")}
            </button>
          </div>
        ) : orders.length === 0 ? (
          // Empty state
          <div className="text-center py-10">
            <p className="text-muted-foreground">{t("repairHistory.noOrders")}</p>
          </div>
        ) : (
          // Orders list
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {order.device_brand} {order.device_model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("repairHistory.orderNumber")}: {order.reference_number}
                    </p>
                  </div>
                  <span
                    className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusBadgeClass(order.status))}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm">{order.service_type}</p>
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{formatDate(order.created_at)}</span>
                    {order.price && <span className="font-medium text-foreground">{formatCurrency(order.price)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
