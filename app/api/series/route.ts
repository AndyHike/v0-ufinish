import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get("brandId")

    const supabase = createClient()

    let query = supabase.from("series").select("*").order("position", { ascending: true })

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching series:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in series API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
