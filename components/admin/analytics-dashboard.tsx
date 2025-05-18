"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/admin/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { fetchAnalyticsData } from "@/lib/analytics-api"
import {
  AnalyticsOverviewChart,
  DeviceInteractionsChart,
  ServicePopularityChart,
  TopDevicesTable,
  TopServicesTable,
  ConversionFunnelChart,
} from "@/components/admin/analytics-charts"

export default function AnalyticsDashboard({ locale }: { locale: string }) {
  const t = useTranslations("Admin")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [dataSource, setDataSource] = useState<"google" | "facebook">("google")
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange, dataSource])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch data from your backend
      const data = await fetchAnalyticsData({
        source: dataSource,
        startDate: dateRange.from,
        endDate: dateRange.to,
        locale,
      })
      setAnalyticsData(data)
    } catch (error) {
      console.error("Error loading analytics data:", error)
      // In a real implementation, you would show an error message
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadAnalyticsData()
  }

  const handleExport = () => {
    // In a real implementation, this would export the data to CSV
    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `analytics-export-${dateRange.from.toISOString().split("T")[0]}-to-${dateRange.to.toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />

          <Select value={dataSource} onValueChange={(value: "google" | "facebook") => setDataSource(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dataSource")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Analytics</SelectItem>
              <SelectItem value="facebook">Facebook Pixel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!analyticsData}>
            <Download className="h-4 w-4 mr-2" />
            {t("exportData")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="devices">{t("devices")}</TabsTrigger>
          <TabsTrigger value="services">{t("services")}</TabsTrigger>
          <TabsTrigger value="conversions">{t("conversions")}</TabsTrigger>
          <TabsTrigger value="funnels">{t("funnels")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title={t("totalVisits")}
              value={analyticsData?.overview?.totalVisits || 0}
              change={analyticsData?.overview?.visitsChange || 0}
              isLoading={isLoading}
            />
            <StatCard
              title={t("deviceInteractions")}
              value={analyticsData?.overview?.deviceInteractions || 0}
              change={analyticsData?.overview?.deviceInteractionsChange || 0}
              isLoading={isLoading}
            />
            <StatCard
              title={t("serviceRequests")}
              value={analyticsData?.overview?.serviceRequests || 0}
              change={analyticsData?.overview?.serviceRequestsChange || 0}
              isLoading={isLoading}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("visitsOverTime")}</CardTitle>
              <CardDescription>{t("visitsOverTimeDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsOverviewChart data={analyticsData?.overviewChart || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("deviceInteractionsChart")}</CardTitle>
                <CardDescription>{t("deviceInteractionsChartDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <DeviceInteractionsChart data={analyticsData?.deviceInteractions || []} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("topDevices")}</CardTitle>
                <CardDescription>{t("topDevicesDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <TopDevicesTable data={analyticsData?.topDevices || []} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("servicePopularityChart")}</CardTitle>
                <CardDescription>{t("servicePopularityChartDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ServicePopularityChart data={analyticsData?.servicePopularity || []} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("topServices")}</CardTitle>
                <CardDescription>{t("topServicesDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <TopServicesTable data={analyticsData?.topServices || []} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("conversionRates")}</CardTitle>
              <CardDescription>{t("conversionRatesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title={t("brandToSeries")}
                  value={`${analyticsData?.conversions?.brandToSeries || 0}%`}
                  change={analyticsData?.conversions?.brandToSeriesChange || 0}
                  isLoading={isLoading}
                />
                <StatCard
                  title={t("seriesToModel")}
                  value={`${analyticsData?.conversions?.seriesToModel || 0}%`}
                  change={analyticsData?.conversions?.seriesToModelChange || 0}
                  isLoading={isLoading}
                />
                <StatCard
                  title={t("modelToService")}
                  value={`${analyticsData?.conversions?.modelToService || 0}%`}
                  change={analyticsData?.conversions?.modelToServiceChange || 0}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("conversionFunnel")}</CardTitle>
              <CardDescription>{t("conversionFunnelDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionFunnelChart data={analyticsData?.conversionFunnel || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  isLoading,
}: {
  title: string
  value: number | string
  change: number
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className={`text-xs ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {change >= 0 ? "+" : ""}
              {change}% from previous period
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
