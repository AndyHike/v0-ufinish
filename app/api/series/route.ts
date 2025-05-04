import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const brandId = url.searchParams.get("brand_id")

    console.log(`[API] Fetching series with brandId: ${brandId}`)

    const supabase = createClient()
    let query = supabase.from("series").select("*")

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    const { data, error } = await query.order("position", { ascending: true })

    if (error) {
      console.error("[API] Error fetching series:", error)
      throw error
    }

    console.log(`[API] Successfully fetched ${data.length} series`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error in series API:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}
