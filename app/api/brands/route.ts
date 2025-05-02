import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Отримуємо всі бренди, відсортовані за позицією
    const { data: brands, error } = await supabase
      .from("brands")
      .select("id, name, logo_url, position")
      .order("position", { ascending: true })

    if (error) {
      console.error("Error fetching brands:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
