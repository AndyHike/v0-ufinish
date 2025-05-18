import { type NextRequest, NextResponse } from "next/server"
import {
  fetchOverviewData,
  fetchDeviceInteractionsData,
  fetchServicePopularityData,
  fetchConversionFunnelData,
  initGoogleAnalyticsClient,
} from "@/lib/google-analytics-api"
import { getDateDaysAgo, calculatePercentageChange } from "@/utils/date-utils"

// Ініціалізуємо клієнт Google Analytics при першому запиті
let isInitialized = false

export async function GET(request: NextRequest) {
  try {
    // Ініціалізація клієнта, якщо ще не ініціалізовано
    if (!isInitialized) {
      isInitialized = initGoogleAnalyticsClient()
      if (!isInitialized) {
        return NextResponse.json({ error: "Failed to initialize Google Analytics client" }, { status: 500 })
      }
    }

    // Отримання параметрів запиту
    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Парсинг дат або використання значень за замовчуванням
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam ? new Date(startDateParam) : getDateDaysAgo(30)

    // Обчислення попереднього періоду для порівняння
    const previousPeriodLength = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const previousPeriodEndDate = new Date(startDate)
    previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 1)
    const previousPeriodStartDate = new Date(previousPeriodEndDate)
    previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - previousPeriodLength)

    // Отримання даних для поточного періоду
    const [overviewData, deviceData, serviceData, funnelData] = await Promise.all([
      fetchOverviewData(startDate, endDate),
      fetchDeviceInteractionsData(startDate, endDate),
      fetchServicePopularityData(startDate, endDate),
      fetchConversionFunnelData(startDate, endDate),
    ])

    // Отримання даних для попереднього періоду (для порівняння)
    const [previousOverviewData] = await Promise.all([
      fetchOverviewData(previousPeriodStartDate, previousPeriodEndDate),
    ])

    // Обчислення змін у відсотках
    const visitsChange = calculatePercentageChange(overviewData.totalVisits, previousOverviewData.totalVisits)

    const pageViewsChange = calculatePercentageChange(overviewData.pageViews, previousOverviewData.pageViews)

    const conversionsChange = calculatePercentageChange(overviewData.conversions, previousOverviewData.conversions)

    // Формування відповіді
    const response = {
      overview: {
        totalVisits: overviewData.totalVisits,
        visitsChange,
        deviceInteractions: overviewData.pageViews,
        deviceInteractionsChange: pageViewsChange,
        serviceRequests: overviewData.conversions,
        serviceRequestsChange: conversionsChange,
      },
      overviewChart: overviewData.timeSeriesData,
      deviceInteractions: deviceData,
      servicePopularity: serviceData,
      topDevices: deviceData.slice(0, 5).map((item) => ({
        model: item.brand, // У реальному випадку тут буде модель
        brand: item.brand,
        views: item.views,
        interactions: item.interactions,
      })),
      topServices: serviceData.slice(0, 5).map((item) => ({
        name: item.name,
        views: item.value,
        requests: item.conversions,
        conversion: item.value > 0 ? Math.round((item.conversions / item.value) * 100) : 0,
      })),
      conversions: {
        brandToSeries: calculateConversionRate(funnelData[0].value, funnelData[1].value),
        brandToSeriesChange: 0, // Потрібно реалізувати порівняння з попереднім періодом
        seriesToModel: calculateConversionRate(funnelData[1].value, funnelData[2].value),
        seriesToModelChange: 0,
        modelToService: calculateConversionRate(funnelData[2].value, funnelData[3].value),
        modelToServiceChange: 0,
      },
      conversionFunnel: funnelData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in analytics API route:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

// Функція для обчислення відсотка конверсії
function calculateConversionRate(from: number, to: number): number {
  if (from === 0) return 0
  return Math.round((to / from) * 100)
}
