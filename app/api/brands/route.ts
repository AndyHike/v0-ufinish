import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    console.log("Fetching brands from Supabase...")

    // Get brands ordered by position
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("position", { ascending: true, nullsLast: true })

    if (error) {
      console.error("Error fetching brands:", error)
      return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
    }

    console.log(`Successfully fetched ${data?.length || 0} brands`)

    // Sort brands by position first, then by name
    const sortedData =
      data?.sort((a, b) => {
        // If both have position, sort by position
        if (a.position !== null && a.position !== undefined && b.position !== null && b.position !== undefined) {
          return a.position - b.position
        }
        // If only one has position, prioritize the one with position
        if (a.position !== null && a.position !== undefined) return -1
        if (b.position !== null && b.position !== undefined) return 1
        // If neither has position, sort by name
        return a.name.localeCompare(b.name)
      }) || []

    return NextResponse.json(sortedData)
  } catch (error) {
    console.error("Unexpected error fetching brands:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
