import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { logActivity } from "@/lib/admin/activity-logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    // Update positions for each series
    for (const item of body.series) {
      const { error } = await supabase.from("series").update({ position: item.position }).eq("id", item.id)

      if (error) throw error
    }

    // Log activity
    await logActivity({
      entityId: null,
      entityType: "series",
      actionType: "reorder",
      userId: body.userId || null,
      details: { count: body.series.length },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering series:", error)
    return NextResponse.json({ error: "Failed to reorder series" }, { status: 500 })
  }
}
