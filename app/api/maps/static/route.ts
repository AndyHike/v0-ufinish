import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const zoom = searchParams.get("zoom") || "15"
  const width = searchParams.get("width") || "800"
  const height = searchParams.get("height") || "400"

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  // Створюємо URL для статичної карти з серверним API-ключем
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`

  // Перенаправляємо запит на Google Maps API
  return NextResponse.redirect(staticMapUrl)
}
