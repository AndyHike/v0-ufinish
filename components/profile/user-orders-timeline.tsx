"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineHeader,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import { formatDate } from "@/lib/utils"

interface OrderStatus {
  id: string
  status: string
  statusName: string
  statusColor: string
  timestamp: string
  order_id: string
  reference_number?: string
}

export function UserOrdersTimeline({ statuses }: { statuses: OrderStatus[] }) {
  const t = useTranslations("Profile.repairHistory")

  if (!statuses || statuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">{t("noOrders")}</p>
        </CardContent>
      </Card>
    )
  }

  // Group statuses by order
  const orderGroups = statuses.reduce((groups: Record<string, OrderStatus[]>, status) => {
    const orderId = status.order_id
    if (!groups[orderId]) {
      groups[orderId] = []
    }
    groups[orderId].push(status)
    return groups
  }, {})

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(orderGroups).map(([orderId, orderStatuses]) => {
            // Sort statuses by timestamp (newest first)
            const sortedStatuses = [...orderStatuses].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            )
            const latestStatus = sortedStatuses[0]
            const referenceNumber = latestStatus.reference_number || orderId

            return (
              <div key={orderId} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">
                  {t("orderNumber")} {referenceNumber}
                </h3>
                <Timeline>
                  {sortedStatuses.map((status, index) => (
                    <TimelineItem key={status.id}>
                      <TimelineSeparator>
                        <TimelineDot className={getStatusDotColor(status.statusColor)} />
                        {index < sortedStatuses.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <TimelineHeader>
                          <TimelineTitle>
                            <Badge className={getStatusBadgeColor(status.statusColor)}>{status.statusName}</Badge>
                          </TimelineTitle>
                        </TimelineHeader>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(status.timestamp)}</p>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusDotColor(statusColor: string): string {
  if (statusColor.includes("green")) return "bg-green-500"
  if (statusColor.includes("blue")) return "bg-blue-500"
  if (statusColor.includes("amber")) return "bg-amber-500"
  if (statusColor.includes("red")) return "bg-red-500"
  if (statusColor.includes("purple")) return "bg-purple-500"
  return "bg-gray-500"
}

function getStatusBadgeColor(statusColor: string): string {
  if (statusColor.includes("green")) return "bg-green-100 text-green-800 border-green-200"
  if (statusColor.includes("blue")) return "bg-blue-100 text-blue-800 border-blue-200"
  if (statusColor.includes("amber")) return "bg-amber-100 text-amber-800 border-amber-200"
  if (statusColor.includes("red")) return "bg-red-100 text-red-800 border-red-200"
  if (statusColor.includes("purple")) return "bg-purple-100 text-purple-800 border-purple-200"
  return "bg-gray-100 text-gray-800 border-gray-200"
}

export default UserOrdersTimeline
