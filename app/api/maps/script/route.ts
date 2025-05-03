import { NextResponse } from "next/server"

// Cache the response for 24 hours
export const revalidate = 86400

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || ""

  // If no API key is available, return a minimal script that will gracefully fail
  if (!apiKey) {
    return new NextResponse(`window.googleMapsInitialized = true; console.warn('Google Maps API key is missing');`, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=86400",
      },
    })
  }

  // Return the Google Maps API script URL
  return new NextResponse(
    `window.googleMapsInitialized = false;
    function initGoogleMaps() {
      if (window.googleMapsInitialized) return;
      window.googleMapsInitialized = true;
    }
    initGoogleMaps();`,
    {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=86400",
      },
    },
  )
}
