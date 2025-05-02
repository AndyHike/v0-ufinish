import { OrderStatusesList } from "@/components/admin/order-statuses-list-fixed"
import { PageHeader } from "@/components/page-header"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Admin" })
  return {
    title: t("orderStatusesPageTitle"),
    description: t("orderStatusesPageDescription"),
  }
}

export default async function OrderStatusesPage() {
  return (
    <div className="container py-6 space-y-6">
      <PageHeader heading="Статуси замовлень" text="Керуйте статусами замовлень для синхронізації з Remonline" />
      <OrderStatusesList />
    </div>
  )
}
