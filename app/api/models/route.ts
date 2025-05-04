import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { formatImageUrl } from "@/utils/image-url"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const brandId = url.searchParams.get("brand_id")
    const seriesId = url.searchParams.get("series_id")

    const supabase = createClient()
    let query = supabase.from("models").select("*, brands(name, logo_url), series(name)")

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    if (seriesId) {
      query = query.eq("series_id", seriesId)
    }

    const { data, error } = await query.order("position", { ascending: true, nullsLast: true })

    if (error) {
      console.error("Error fetching models:", error)
      throw error
    }

    // Format image URLs
    const formattedData = data.map((model) => ({
      ...model,
      image_url: model.image_url ? formatImageUrl(model.image_url) : null,
      brands: model.brands
        ? {
            ...model.brands,
            logo_url: model.brands.logo_url ? formatImageUrl(model.brands.logo_url) : null,
          }
        : null,
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error in models API:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}
