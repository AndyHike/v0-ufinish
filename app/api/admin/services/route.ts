import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("services").select("*").order("position", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
