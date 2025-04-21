import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get brands ordered by position
    const { data: brands, error } = await supabase
      .from("brands")
      .select("*")
      .order("position", { ascending: true, nullsLast: true })

    if (error) {
      console.error("Error fetching brands:", error)
      return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
    }

    // Sort brands by position
    if (brands) {
      brands.sort((a, b) => {
        // Handle null positions by placing them at the end
        if (a.position === null) return 1
        if (b.position === null) return -1
        return a.position - b.position
      })
    }

    return NextResponse.json(brands || [])
  } catch (error) {
    console.error("Unexpected error in brands API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
