import { NextResponse } from "next/server"

export const revalidate = 86400 // Cache for 24 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat") || "50.0755381"
  const lng = searchParams.get("lng") || "14.4194684"
  const zoom = searchParams.get("zoom") || "15"
  const width = searchParams.get("width") || "800"
  const height = searchParams.get("height") || "400"

  // Use a placeholder if no API key is available
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({
      url: `/placeholder.svg?height=${height}&width=${width}&query=map of Prague`,
    })
  }

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`

  return NextResponse.json({ url: mapUrl })
}
