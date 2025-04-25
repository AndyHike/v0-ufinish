"use client"

import { useEffect, useState } from "react"
import { getUserRepairOrders } from "@/app/actions/repair-orders"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import { ChevronRight, Clock, Package, Settings, Smartphone, PenToolIcon as Tool } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

  function getStatusDetails(status: string): { icon: JSX.Element; color: string; bgColor: string } {
    switch (status) {
      case "Новий":
        return {
          icon: <Package className="h-4 w-4" />,
          color: "text-blue-700",
          bgColor: "bg-blue-50",
        }
      case "В процесі":
        return {
          icon: <Tool className="h-4 w-4" />,
          color: "text-amber-700",
          bgColor: "bg-amber-50",
        }
      case "Завершено":
        return {
          icon: <Settings className="h-4 w-4" />,
          color: "text-green-700",
          bgColor: "bg-green-50",
        }
      case "Скасовано":
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "text-red-700",
          bgColor: "bg-red-50",
        }
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "text-gray-700",
          bgColor: "bg-gray-50",
        }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("repairHistory.title")}</h2>
        <p className="text-muted-foreground">{t("repairHistory.description")}</p>
      </div>

      {loading ? (
        // Loading state with modern skeleton
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-white p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-[180px] rounded-md" />
                    <Skeleton className="h-4 w-[140px] rounded-md" />
                  </div>
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-[200px] rounded-md" />
                    <Skeleton className="h-4 w-[100px] rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        // Modern error state
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg bg-red-50 border border-red-100">
          <div className="text-red-500 bg-red-100 p-3 rounded-full mb-4">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-800 font-medium mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2 text-sm border-red-200 hover:bg-red-100 text-red-700"
          >
            {t("repairHistory.tryAgain")}
          </Button>
        </div>
      ) : orders.length === 0 ? (
        // Modern empty state
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-500">
            <Smartphone className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t("repairHistory.noOrdersTitle")}</h3>
          <p className="text-muted-foreground text-center max-w-sm">{t("repairHistory.noOrders")}</p>
        </div>
      ) : (
        // Modern orders list
        <div className="space-y-4">
          {orders.map((order) => {
            const statusDetails = getStatusDetails(order.status)
            return (
              <div
                key={order.id}
                className="group rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="bg-gradient-to-r from-gray-50 to-white p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        <h3 className="font-medium text-lg">
                          {order.device_brand} {order.device_model}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("repairHistory.orderNumber")}: {order.reference_number}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 font-medium",
                        statusDetails.bgColor,
                        statusDetails.color,
                      )}
                      variant="outline"
                    >
                      {statusDetails.icon}
                      {order.status}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(order.created_at)}
                      </div>
                      <div className="flex items-center">
                        <p className="font-medium mr-1">{order.service_type}</p>
                        {order.price && (
                          <Badge variant="secondary" className="font-medium">
                            {formatCurrency(order.price)}
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
