// Функції для відстеження подій у Facebook Pixel та Google Analytics

// Типи для подій
export type AnalyticsEvent = {
  action: string
  category?: string
  label?: string
  value?: number
  // Додаткові параметри для Facebook Pixel
  content_ids?: string[]
  content_name?: string
  content_type?: string
  content_category?: string
  // Додаткові параметри для моделей та послуг
  brand?: string
  series?: string
  model?: string
  service?: string
  price?: number
}

// Функція для відстеження подій у Google Analytics
export function trackGAEvent(event: AnalyticsEvent) {
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        // Додаткові параметри
        brand: event.brand,
        series: event.series,
        model: event.model,
        service: event.service,
        price: event.price,
      })
      console.log("GA Event tracked:", event)
    }
  } catch (error) {
    console.error("Error tracking GA event:", error)
  }
}

// Функція для відстеження подій у Facebook Pixel
export function trackFBEvent(event: AnalyticsEvent) {
  try {
    if (typeof window !== "undefined" && (window as any).fbq) {
      ;(window as any).fbq("track", event.action, {
        content_ids: event.content_ids,
        content_name: event.content_name,
        content_type: event.content_type,
        content_category: event.content_category,
        // Додаткові параметри
        brand: event.brand,
        series: event.series,
        model: event.model,
        service: event.service,
        value: event.price,
        currency: "CZK",
      })
      console.log("FB Event tracked:", event)
    }
  } catch (error) {
    console.error("Error tracking FB event:", error)
  }
}

// Функція для відстеження подій в обох системах
export function trackEvent(event: AnalyticsEvent) {
  trackGAEvent(event)
  trackFBEvent(event)
}

// Спеціалізовані функції для відстеження конкретних подій

// Перегляд бренду
export function trackBrandView(brandId: string, brandName: string) {
  trackEvent({
    action: "view_brand",
    category: "Brands",
    label: brandName,
    content_name: brandName,
    content_type: "brand",
    brand: brandName,
  })
}

// Перегляд лінійки
export function trackSeriesView(seriesId: string, seriesName: string, brandName: string) {
  trackEvent({
    action: "view_series",
    category: "Series",
    label: `${brandName} - ${seriesName}`,
    content_name: seriesName,
    content_type: "series",
    content_category: brandName,
    brand: brandName,
    series: seriesName,
  })
}

// Перегляд моделі
export function trackModelView(modelId: string, modelName: string, brandName: string, seriesName?: string) {
  trackEvent({
    action: "view_model",
    category: "Models",
    label: `${brandName} - ${modelName}`,
    content_name: modelName,
    content_type: "model",
    content_category: brandName,
    brand: brandName,
    series: seriesName,
    model: modelName,
  })
}

// Перегляд послуги
export function trackServiceView(
  serviceId: string,
  serviceName: string,
  modelName: string,
  brandName: string,
  price?: number,
) {
  trackEvent({
    action: "view_service",
    category: "Services",
    label: `${brandName} - ${modelName} - ${serviceName}`,
    content_name: serviceName,
    content_type: "service",
    content_category: `${brandName} - ${modelName}`,
    brand: brandName,
    model: modelName,
    service: serviceName,
    price: price,
  })
}

// Клік на кнопку "Замовити послугу"
export function trackServiceRequest(
  serviceId: string,
  serviceName: string,
  modelName: string,
  brandName: string,
  price?: number,
) {
  trackEvent({
    action: "request_service",
    category: "Service Requests",
    label: `${brandName} - ${modelName} - ${serviceName}`,
    content_name: serviceName,
    content_type: "service_request",
    content_category: `${brandName} - ${modelName}`,
    brand: brandName,
    model: modelName,
    service: serviceName,
    price: price,
  })
}
