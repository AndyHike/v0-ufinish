"use server"

import { headers } from "next/headers"

interface MapEmbedProps {
  lat: number
  lng: number
  zoom?: number
  width?: number
  height?: number
}

export async function getMapEmbedUrl({ lat, lng, zoom = 15, width = 800, height = 400 }: MapEmbedProps) {
  // Отримуємо хост для формування повного URL
  const headersList = headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

  // Формуємо URL для нашого API-ендпоінту
  return `${protocol}://${host}/api/maps/static?lat=${lat}&lng=${lng}&zoom=${zoom}&width=${width}&height=${height}`
}

export async function getMapScriptUrl() {
  // Створюємо URL для скрипту Google Maps з серверним API-ключем
  return `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&callback=initMap&language=cs&v=weekly`
}
