import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("brands").select("*").order("position", { ascending: true })

    if (error) {
      console.error("Error fetching brands:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in brands API:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}
