import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { formatDateToString } from "@/utils/date-utils"

// Ініціалізація клієнта Google Analytics Data API
let analyticsDataClient: BetaAnalyticsDataClient | null = null

// Функція для ініціалізації клієнта
export function initGoogleAnalyticsClient() {
  try {
    // Використовуємо змінні середовища для безпечного зберігання облікових даних
    // Ці змінні повинні бути налаштовані в Vercel або в .env.local
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    })

    console.log("Google Analytics Data API client initialized successfully")
    return true
  } catch (error) {
    console.error("Failed to initialize Google Analytics Data API client:", error)
    return false
  }
}

// Функція для отримання ID властивості Google Analytics
export function getPropertyId(): string {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  if (!propertyId) {
    throw new Error("GOOGLE_ANALYTICS_PROPERTY_ID is not defined in environment variables")
  }
  return propertyId
}

// Основна функція для отримання даних з Google Analytics
export async function fetchGoogleAnalyticsData({
  startDate,
  endDate,
  metrics = ["totalUsers", "screenPageViews", "engagementRate"],
  dimensions = ["date"],
  filters = [],
}: {
  startDate: Date
  endDate: Date
  metrics?: string[]
  dimensions?: string[]
  filters?: Array<{
    dimension?: string
    metric?: string
    filter: string
    value: string
  }>
}) {
  try {
    if (!analyticsDataClient) {
      initGoogleAnalyticsClient()
    }

    if (!analyticsDataClient) {
      throw new Error("Google Analytics Data API client is not initialized")
    }

    const propertyId = getPropertyId()

    // Форматування дат у формат YYYY-MM-DD
    const formattedStartDate = formatDateToString(startDate)
    const formattedEndDate = formatDateToString(endDate)

    // Підготовка фільтрів
    const dimensionFilterExpressions = filters
      .filter((f) => f.dimension)
      .map((f) => ({
        filter: {
          fieldName: f.dimension,
          stringFilter: {
            matchType: "EXACT",
            value: f.value,
          },
        },
      }))

    const metricFilterExpressions = filters
      .filter((f) => f.metric)
      .map((f) => ({
        filter: {
          fieldName: f.metric,
          numericFilter: {
            operation: "GREATER_THAN",
            value: { int64Value: f.value },
          },
        },
      }))

    // Формування запиту до API
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      ],
      dimensions: dimensions.map((d) => ({ name: d })),
      metrics: metrics.map((m) => ({ name: m })),
      dimensionFilter:
        dimensionFilterExpressions.length > 0
          ? {
              andGroup: {
                expressions: dimensionFilterExpressions,
              },
            }
          : undefined,
      metricFilter:
        metricFilterExpressions.length > 0
          ? {
              andGroup: {
                expressions: metricFilterExpressions,
              },
            }
          : undefined,
    })

    // Обробка відповіді
    const result = {
      dimensionHeaders: response.dimensionHeaders?.map((header) => header.name) || [],
      metricHeaders: response.metricHeaders?.map((header) => header.name) || [],
      rows:
        response.rows?.map((row) => {
          const dimensionValues = row.dimensionValues?.map((value) => value.value) || []
          const metricValues = row.metricValues?.map((value) => value.value) || []

          // Створення об'єкта з даними
          const rowData: Record<string, string> = {}

          dimensions.forEach((dim, index) => {
            rowData[dim] = dimensionValues[index] || ""
          })

          metrics.forEach((metric, index) => {
            rowData[metric] = metricValues[index] || ""
          })

          return rowData
        }) || [],
    }

    return result
  } catch (error) {
    console.error("Error fetching Google Analytics data:", error)
    throw error
  }
}

// Спеціалізовані функції для отримання конкретних даних

// Отримання загального огляду
export async function fetchOverviewData(startDate: Date, endDate: Date) {
  const result = await fetchGoogleAnalyticsData({
    startDate,
    endDate,
    metrics: ["totalUsers", "screenPageViews", "engagementRate", "conversions"],
    dimensions: ["date"],
  })

  // Обробка даних для відображення на дашборді
  return {
    totalVisits: sumMetric(result.rows, "totalUsers"),
    pageViews: sumMetric(result.rows, "screenPageViews"),
    engagementRate: averageMetric(result.rows, "engagementRate"),
    conversions: sumMetric(result.rows, "conversions"),
    timeSeriesData: result.rows.map((row) => ({
      date: row.date,
      visits: Number.parseInt(row.totalUsers || "0"),
      pageViews: Number.parseInt(row.screenPageViews || "0"),
      conversions: Number.parseInt(row.conversions || "0"),
    })),
  }
}

// Отримання даних про взаємодію з пристроями
export async function fetchDeviceInteractionsData(startDate: Date, endDate: Date) {
  const result = await fetchGoogleAnalyticsData({
    startDate,
    endDate,
    metrics: ["totalUsers", "screenPageViews", "engagementRate"],
    dimensions: ["pagePathPlusQueryString"],
    filters: [{ dimension: "pagePathPlusQueryString", filter: "CONTAINS", value: "/brands/" }],
  })

  // Обробка даних для відображення на дашборді
  const brandData: Record<string, { views: number; interactions: number }> = {}

  result.rows.forEach((row) => {
    // Витягуємо назву бренду з URL
    const pathParts = row.pagePathPlusQueryString?.split("/") || []
    const brandSlug = pathParts[pathParts.indexOf("brands") + 1]

    if (brandSlug) {
      if (!brandData[brandSlug]) {
        brandData[brandSlug] = { views: 0, interactions: 0 }
      }

      brandData[brandSlug].views += Number.parseInt(row.totalUsers || "0")
      brandData[brandSlug].interactions += Number.parseInt(row.screenPageViews || "0")
    }
  })

  return Object.entries(brandData).map(([brand, data]) => ({
    brand,
    views: data.views,
    interactions: data.interactions,
  }))
}

// Отримання даних про популярність послуг
export async function fetchServicePopularityData(startDate: Date, endDate: Date) {
  const result = await fetchGoogleAnalyticsData({
    startDate,
    endDate,
    metrics: ["totalUsers", "conversions"],
    dimensions: ["pagePathPlusQueryString", "pageTitle"],
    filters: [{ dimension: "pagePathPlusQueryString", filter: "CONTAINS", value: "/models/" }],
  })

  // Обробка даних для відображення на дашборді
  const serviceData: Record<string, { views: number; conversions: number }> = {}

  result.rows.forEach((row) => {
    // Витягуємо назву послуги з заголовка сторінки
    const pageTitle = row.pageTitle || ""
    const serviceMatch = pageTitle.match(/Ремонт: (.*?) -/)
    const serviceName = serviceMatch ? serviceMatch[1] : "Інша послуга"

    if (!serviceData[serviceName]) {
      serviceData[serviceName] = { views: 0, conversions: 0 }
    }

    serviceData[serviceName].views += Number.parseInt(row.totalUsers || "0")
    serviceData[serviceName].conversions += Number.parseInt(row.conversions || "0")
  })

  return Object.entries(serviceData).map(([name, data]) => ({
    name,
    value: data.views,
    conversions: data.conversions,
  }))
}

// Отримання даних про конверсійну воронку
export async function fetchConversionFunnelData(startDate: Date, endDate: Date) {
  // Отримуємо дані для кожного етапу воронки
  const brandViews = await fetchGoogleAnalyticsData({
    startDate,
    endDate,
    metrics: ["totalUsers"],
    dimensions: ["date"],
    filters: [{ dimension: "pagePathPlusQueryString", filter: "CONTAINS", value: "/brands/" }],
  })

  const seriesViews = await fetchGoogleAnalyticsData({
    startDate,
    endDate,
    metrics: ["totalUsers"],
    dimensions: ["date"],
    filters: [{ dimension: "pagePathPlusQueryString", filter: "CONTAINS", value: "/series/" }],
  })

  const modelViews = await fetchGoogleAnalyticsData({
    startDate,
    endDate,
    metrics: ["totalUsers"],
    dimensions: ["date"],
    filters: [{ dimension: "pagePathPlusQueryString", filter: "CONTAINS", value: "/models/" }],
  })

  const serviceRequests = await fetchGoogleAnalyticsData({
    startDate,
    endDate,
    metrics: ["conversions"],
    dimensions: ["date"],
    filters: [{ dimension: "eventName", filter: "EXACT", value: "begin_checkout" }],
  })

  // Обробка даних для відображення на дашборді
  return [
    { name: "Brand Page Views", value: sumMetric(brandViews.rows, "totalUsers") },
    { name: "Series Page Views", value: sumMetric(seriesViews.rows, "totalUsers") },
    { name: "Model Page Views", value: sumMetric(modelViews.rows, "totalUsers") },
    { name: "Service Requests", value: sumMetric(serviceRequests.rows, "conversions") },
  ]
}

// Допоміжні функції для обробки даних
function sumMetric(rows: Record<string, string>[], metricName: string): number {
  return rows.reduce((sum, row) => sum + Number.parseInt(row[metricName] || "0"), 0)
}

function averageMetric(rows: Record<string, string>[], metricName: string): number {
  if (rows.length === 0) return 0
  const sum = rows.reduce((sum, row) => sum + Number.parseFloat(row[metricName] || "0"), 0)
  return sum / rows.length
}
