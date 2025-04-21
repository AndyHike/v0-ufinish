import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logAdminActivity } from "@/lib/admin/activity-logger"

// Create a consistent sorting function that can be reused
function sortBrandsByPosition(brands: any[]) {
  return [...brands].sort((a, b) => {
    // If both have position, sort by position
    if (a.position !== null && a.position !== undefined && b.position !== null && b.position !== undefined) {
      return a.position - b.position
    }
    // If only one has position, prioritize the one with position
    if (a.position !== null && a.position !== undefined) return -1
    if (b.position !== null && b.position !== undefined) return 1
    // If neither has position, sort by name
    return a.name.localeCompare(b.name)
  })
}

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

    // Apply consistent sorting
    const sortedBrands = sortBrandsByPosition(brands || [])

    return NextResponse.json(sortedBrands)
  } catch (error) {
    console.error("Unexpected error in brands API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const data = await request.json()

    // Get the maximum position value
    const { data: maxPositionResult, error: maxPositionError } = await supabase
      .from("brands")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)

    if (maxPositionError) {
      console.error("Error getting max position:", maxPositionError)
    }

    // Calculate the next position (max + 1 or 1 if no brands exist)
    const maxPosition = maxPositionResult && maxPositionResult.length > 0 ? maxPositionResult[0].position || 0 : 0
    const nextPosition = maxPosition + 1

    // Add the position to the brand data
    const brandData = {
      ...data,
      position: nextPosition,
    }

    const { data: brand, error } = await supabase.from("brands").insert(brandData).select().single()

    if (error) {
      console.error("Error creating brand:", error)
      return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
    }

    // Log the activity
    await logAdminActivity({
      action: "create",
      entity: "brand",
      entityId: brand.id,
      details: `Created brand: ${brand.name}`,
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error("Unexpected error in brands API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
