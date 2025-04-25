"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserRepairOrders } from "@/app/actions/repair-orders"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"

interface RepairOrder {
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
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("Profile")

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const result = await getUserRepairOrders()

        if (result.success && result.orders) {
          setOrders(result.orders)
        } else {
          setError(result.message || "Failed to load repair orders")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error("Error fetching repair orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Format date to local format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("repairHistory")}</CardTitle>
        <CardDescription>{t("repairHistoryDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          // Empty state
          <div className="text-center py-4 text-muted-foreground">{t("noRepairHistory")}</div>
        ) : (
          // Orders list
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {order.device_brand} {order.device_model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("orderNumber")}: {order.reference_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("serviceType")}: {order.service_type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("createdAt")}: {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                    {order.price && <p className="mt-2 font-medium">{order.price.toLocaleString()} ₴</p>}
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
