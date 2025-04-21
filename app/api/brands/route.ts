import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // First try to get brands ordered by position
    let { data: brands, error } = await supabase
      .from("brands")
      .select("*")
      .order("position", { ascending: true, nullsLast: true })

    // If there's an error (like position column doesn't exist), fall back to ordering by name
    if (error) {
      console.error("Error fetching brands by position:", error)
      const { data: fallbackBrands, error: fallbackError } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true })

      if (fallbackError) {
        console.error("Error fetching brands by name:", fallbackError)
        return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
      }

      brands = fallbackBrands
    }

    return NextResponse.json(brands || [])
  } catch (error) {
    console.error("Unexpected error in brands API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
