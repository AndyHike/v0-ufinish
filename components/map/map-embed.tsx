import { cache } from "react"

interface MapEmbedProps {
  lat: number
  lng: number
  zoom: number
  width: number
  height: number
}

// Cache the map URL generation to prevent repeated API calls
export const getMapEmbedUrl = cache(async ({ lat, lng, zoom, width, height }: MapEmbedProps): Promise<string> => {
  try {
    // Generate a static map URL that doesn't require client-side API calls
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/maps/static?lat=${lat}&lng=${lng}&zoom=${zoom}&width=${width}&height=${height}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to get map: ${response.status}`)
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error fetching map:", error)
    // Return a fallback image URL
    return `/placeholder.svg?height=${height}&width=${width}&query=map of Prague`
  }
})
