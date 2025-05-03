import { NextResponse } from "next/server"

// Cache the response for 1 day
export const revalidate = 86400

export async function GET() {
  try {
    // Get API key from environment variables or use a placeholder
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || ""

    // If no API key, return a mock script that will show an error message
    if (!apiKey) {
      return new NextResponse(`window.googleMapsInitError = true;`, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      })
    }

    // Redirect to the Google Maps API
    return NextResponse.redirect(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  } catch (error) {
    console.error("Error in maps script route:", error)
    return NextResponse.json({ error: "Failed to load Google Maps script" }, { status: 500 })
  }
}
