import { NextResponse } from "next/server"

export async function GET() {
  // Створюємо URL для скрипту Google Maps з серверним API-ключем
  const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&callback=initMap&language=cs&v=weekly`

  // Перенаправляємо запит на Google Maps API
  return NextResponse.redirect(scriptUrl)
}
