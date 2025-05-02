import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get("brand_id")

    const supabase = createClient()
    let query = supabase.from("series").select("*, brands(name)")

    // Перевіряємо, чи brandId не дорівнює "_empty" перед додаванням фільтра
    if (brandId && brandId !== "_empty") {
      query = query.eq("brand_id", brandId)
    }

    const { data, error } = await query.order("position", { ascending: true, nullsLast: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching series:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    // Get the highest position value
    const { data: positionData } = await supabase
      .from("series")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition =
      positionData && positionData.length > 0 && positionData[0].position !== null ? positionData[0].position + 1 : 0

    const { data, error } = await supabase
      .from("series")
      .insert({
        name: body.name,
        brand_id: body.brandId,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity({
      entityId: data.id,
      entityType: "series",
      actionType: "create",
      userId: body.userId || null,
      details: { name: data.name },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating series:", error)
    return NextResponse.json({ error: "Failed to create series" }, { status: 500 })
  }
}
