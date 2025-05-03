import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    if (!body.productLines || !Array.isArray(body.productLines)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Update each product line's position
    const updates = body.productLines.map((item: { id: string; position: number }) => {
      return supabase.from("product_lines").update({ position: item.position }).eq("id", item.id)
    })

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering product lines:", error)
    return NextResponse.json({ error: "Failed to reorder product lines" }, { status: 500 })
  }
}
