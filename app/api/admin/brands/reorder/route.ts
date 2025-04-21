import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { brands } = body

    if (!brands || !Array.isArray(brands)) {
      return NextResponse.json({ error: "Invalid brands data" }, { status: 400 })
    }

    // Update each brand's position
    for (const brand of brands) {
      const { id, position } = brand

      const { error } = await supabase
        .from("brands")
        .update({ position, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering brands:", error)
    return NextResponse.json({ error: "Failed to reorder brands" }, { status: 500 })
  }
}
