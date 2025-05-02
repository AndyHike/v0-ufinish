"use client"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import UserOrders from "@/components/profile/user-orders"

export default function OrdersPage() {
  const t = useTranslations("Profile")
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("repairHistory.title")}</h1>
      <p className="mb-8 text-muted-foreground">{t("repairHistory.description")}</p>

      <UserOrders />
    </div>
  )
}
