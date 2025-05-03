import { type NextRequest, NextResponse } from "next/server"

// Cache the response for 1 day
export const revalidate = 86400

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Get API key from environment variables or use a placeholder
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    // If no API key, return a placeholder image URL
    if (!apiKey) {
      return NextResponse.json(
        { url: `/placeholder.svg?height=400&width=800&query=map of ${address}` },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        },
      )
    }

    // Create a static map URL
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=15&size=800x400&markers=color:red|${encodeURIComponent(address)}&key=${apiKey}`

    return NextResponse.json(
      { url: staticMapUrl },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      },
    )
  } catch (error) {
    console.error("Error in static map route:", error)
    return NextResponse.json({ error: "Failed to generate static map" }, { status: 500 })
  }
}
