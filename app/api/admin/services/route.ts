import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("services").select("*").order("position", { ascending: true })

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
