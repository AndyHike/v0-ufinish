import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const brandId = params.id

    const supabase = createClient()
    const { data, error } = await supabase
      .from("series")
      .select(`
        id,
        name,
        brand_id,
        position,
        created_at,
        brands:brand_id (
          name
        )
      `)
      .eq("brand_id", brandId)
      .order("position", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching series:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in series API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
