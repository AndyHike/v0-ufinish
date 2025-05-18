import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import PageHeader from "@/components/page-header"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Admin" })
  return {
    title: t("analyticsTitle"),
    description: t("analyticsDescription"),
  }
}

export default async function AnalyticsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Admin" })

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader heading={t("analyticsTitle")} text={t("analyticsDescription")} />

      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsDashboard locale={locale} />
      </Suspense>
    </div>
  )
}

function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
