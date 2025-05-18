// This is a mock implementation for demonstration purposes
// In a real application, you would connect to Google Analytics and Facebook Pixel APIs

interface AnalyticsRequestParams {
  source: "google" | "facebook"
  startDate: Date
  endDate: Date
  locale: string
}

export async function fetchAnalyticsData(params: AnalyticsRequestParams) {
  try {
    // Формуємо URL з параметрами
    const url = new URL("/api/analytics", window.location.origin)
    url.searchParams.append("startDate", params.startDate.toISOString())
    url.searchParams.append("endDate", params.endDate.toISOString())
    url.searchParams.append("source", params.source)
    url.searchParams.append("locale", params.locale)

    // Виконуємо запит до нашого API
    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching analytics data:", error)

    // Повертаємо тестові дані у випадку помилки
    return generateMockData(params.startDate, params.endDate)
  }
}

// Функція для генерації тестових даних (використовується як запасний варіант)
function generateMockData(startDate: Date, endDate: Date) {
  // Код для генерації тестових даних залишається без змін
  // ...

  return {
    // Тестові дані
    overview: {
      totalVisits: Math.floor(Math.random() * 10000) + 5000,
      visitsChange: Math.floor(Math.random() * 30) - 10,
      deviceInteractions: Math.floor(Math.random() * 5000) + 2000,
      deviceInteractionsChange: Math.floor(Math.random() * 40) - 10,
      serviceRequests: Math.floor(Math.random() * 1000) + 500,
      serviceRequestsChange: Math.floor(Math.random() * 50) - 10,
    },

    // Chart data
    overviewChart: generateTimeSeriesData(startDate, endDate),
    deviceInteractions: generateDeviceData(),
    servicePopularity: generateServiceData(),
    topDevices: generateTopDevicesData(),
    topServices: generateTopServicesData(),

    // Conversion data
    conversions: {
      brandToSeries: Math.floor(Math.random() * 30) + 60, // 60-90%
      brandToSeriesChange: Math.floor(Math.random() * 10) - 5,
      seriesToModel: Math.floor(Math.random() * 20) + 50, // 50-70%
      seriesToModelChange: Math.floor(Math.random() * 10) - 5,
      modelToService: Math.floor(Math.random() * 30) + 30, // 30-60%
      modelToServiceChange: Math.floor(Math.random() * 15) - 5,
    },

    // Funnel data
    conversionFunnel: [
      { name: "Brand Page Views", value: Math.floor(Math.random() * 3000) + 5000 },
      { name: "Series Page Views", value: Math.floor(Math.random() * 2000) + 3000 },
      { name: "Model Page Views", value: Math.floor(Math.random() * 1000) + 2000 },
      { name: "Service Views", value: Math.floor(Math.random() * 800) + 1000 },
      { name: "Service Requests", value: Math.floor(Math.random() * 500) + 500 },
    ],
  }
}

// Helper functions to generate sample data
function generateTimeSeriesData(startDate: Date, endDate: Date) {
  const data = []
  const dayDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const step = Math.max(1, Math.floor(dayDiff / 30)) // Limit to ~30 data points

  for (let i = 0; i <= dayDiff; i += step) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visits: Math.floor(Math.random() * 1000) + 500,
      deviceInteractions: Math.floor(Math.random() * 500) + 200,
      serviceRequests: Math.floor(Math.random() * 200) + 50,
    })
  }

  return data
}

function generateDeviceData() {
  return [
    {
      brand: "Apple",
      views: Math.floor(Math.random() * 2000) + 3000,
      interactions: Math.floor(Math.random() * 1000) + 1500,
    },
    {
      brand: "Samsung",
      views: Math.floor(Math.random() * 1500) + 2000,
      interactions: Math.floor(Math.random() * 800) + 1000,
    },
    {
      brand: "Xiaomi",
      views: Math.floor(Math.random() * 1000) + 1500,
      interactions: Math.floor(Math.random() * 500) + 700,
    },
    {
      brand: "Huawei",
      views: Math.floor(Math.random() * 800) + 1200,
      interactions: Math.floor(Math.random() * 400) + 600,
    },
    {
      brand: "Other",
      views: Math.floor(Math.random() * 500) + 800,
      interactions: Math.floor(Math.random() * 300) + 400,
    },
  ]
}

function generateServiceData() {
  return [
    { name: "Screen Repair", value: Math.floor(Math.random() * 200) + 300 },
    { name: "Battery Replacement", value: Math.floor(Math.random() * 150) + 250 },
    { name: "Water Damage", value: Math.floor(Math.random() * 100) + 150 },
    { name: "Software Issues", value: Math.floor(Math.random() * 80) + 120 },
    { name: "Other", value: Math.floor(Math.random() * 50) + 80 },
  ]
}

function generateTopDevicesData() {
  return [
    {
      model: "iPhone 13",
      brand: "Apple",
      views: Math.floor(Math.random() * 500) + 1000,
      interactions: Math.floor(Math.random() * 300) + 400,
    },
    {
      model: "Galaxy S21",
      brand: "Samsung",
      views: Math.floor(Math.random() * 400) + 800,
      interactions: Math.floor(Math.random() * 200) + 300,
    },
    {
      model: "Redmi Note 10",
      brand: "Xiaomi",
      views: Math.floor(Math.random() * 300) + 600,
      interactions: Math.floor(Math.random() * 150) + 250,
    },
    {
      model: "iPhone 12",
      brand: "Apple",
      views: Math.floor(Math.random() * 250) + 500,
      interactions: Math.floor(Math.random() * 120) + 200,
    },
    {
      model: "P40 Pro",
      brand: "Huawei",
      views: Math.floor(Math.random() * 200) + 400,
      interactions: Math.floor(Math.random() * 100) + 150,
    },
  ]
}

function generateTopServicesData() {
  return [
    {
      name: "Screen Replacement",
      views: Math.floor(Math.random() * 500) + 1000,
      requests: Math.floor(Math.random() * 200) + 400,
      conversion: Math.floor(Math.random() * 10) + 35,
    },
    {
      name: "Battery Replacement",
      views: Math.floor(Math.random() * 400) + 800,
      requests: Math.floor(Math.random() * 150) + 300,
      conversion: Math.floor(Math.random() * 10) + 35,
    },
    {
      name: "Water Damage Repair",
      views: Math.floor(Math.random() * 300) + 600,
      requests: Math.floor(Math.random() * 120) + 200,
      conversion: Math.floor(Math.random() * 10) + 30,
    },
    {
      name: "Charging Port Fix",
      views: Math.floor(Math.random() * 250) + 500,
      requests: Math.floor(Math.random() * 100) + 150,
      conversion: Math.floor(Math.random() * 10) + 30,
    },
    {
      name: "Software Update",
      views: Math.floor(Math.random() * 200) + 400,
      requests: Math.floor(Math.random() * 80) + 120,
      conversion: Math.floor(Math.random() * 10) + 30,
    },
  ]
}
