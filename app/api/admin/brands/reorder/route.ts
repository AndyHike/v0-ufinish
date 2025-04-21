import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logAdminActivity } from "@/lib/admin/activity-logger"

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { brandId, direction } = await request.json()

    if (!brandId || !["up", "down"].includes(direction)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Get the current brand
    const { data: currentBrand, error: currentBrandError } = await supabase
      .from("brands")
      .select("*")
      .eq("id", brandId)
      .single()

    if (currentBrandError || !currentBrand) {
      console.error("Error fetching current brand:", currentBrandError)
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Get all brands ordered by position
    const { data: allBrands, error: allBrandsError } = await supabase
      .from("brands")
      .select("*")
      .order("position", { ascending: true, nullsLast: true })

    if (allBrandsError) {
      console.error("Error fetching all brands:", allBrandsError)
      return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
    }

    // Find the current index
    const currentIndex = allBrands.findIndex((brand) => brand.id === brandId)
    if (currentIndex === -1) {
      return NextResponse.json({ error: "Brand not found in ordered list" }, { status: 404 })
    }

    // Determine the target index based on direction
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    // Check if the move is valid
    if (targetIndex < 0 || targetIndex >= allBrands.length) {
      return NextResponse.json({ error: "Cannot move brand further in that direction" }, { status: 400 })
    }

    // Get the target brand
    const targetBrand = allBrands[targetIndex]

    // Swap positions
    const { error: updateCurrentError } = await supabase
      .from("brands")
      .update({ position: targetBrand.position })
      .eq("id", currentBrand.id)

    if (updateCurrentError) {
      console.error("Error updating current brand position:", updateCurrentError)
      return NextResponse.json({ error: "Failed to update brand position" }, { status: 500 })
    }

    const { error: updateTargetError } = await supabase
      .from("brands")
      .update({ position: currentBrand.position })
      .eq("id", targetBrand.id)

    if (updateTargetError) {
      console.error("Error updating target brand position:", updateTargetError)
      return NextResponse.json({ error: "Failed to update target brand position" }, { status: 500 })
    }

    // Log the activity
    await logAdminActivity({
      action: "update",
      entity: "brand",
      entityId: currentBrand.id,
      details: `Reordered brand: ${currentBrand.name} (${direction})`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error in brand reorder API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
