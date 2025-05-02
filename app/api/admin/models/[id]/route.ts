import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("models")
      .select("*, brands(name), series(name)")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching model:", error)
      return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/admin/models/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Інші методи (PUT, DELETE) залишаються без змін
