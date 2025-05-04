import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { formatImageUrl } from "@/utils/image-url"

export async function GET() {
  try {
    const supabase = createClient()

    // Fetch brands with their series
    const { data, error } = await supabase
      .from("brands")
      .select("*, series(*)")
      .order("position", { ascending: true, nullsLast: true })

    if (error) {
      console.error("Error fetching brands:", error)
      throw error
    }

    // Format image URLs
    const formattedData = data.map((brand) => ({
      ...brand,
      logo_url: brand.logo_url ? formatImageUrl(brand.logo_url) : null,
      // Also format series if they exist
      series: brand.series
        ? brand.series.map((series) => ({
            ...series,
          }))
        : null,
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error in brands API:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}
