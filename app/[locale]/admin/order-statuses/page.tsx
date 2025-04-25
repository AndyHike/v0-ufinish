"use client"

import { OrderStatusesList } from "@/components/admin/order-statuses-list"
import { PageHeader } from "@/components/page-header"
import { useTranslations } from "next-intl"

export default function OrderStatusesPage() {
  const t = useTranslations("Admin")

  return (
    <div className="space-y-6">
      <PageHeader heading={t("orderStatuses")} text={t("orderStatusesDescription")} />
      <OrderStatusesList />
    </div>
  )
}
