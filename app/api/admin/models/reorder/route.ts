import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderedIds, userId } = body

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Ordered IDs are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update positions for each model
    const updates = orderedIds.map((id, index) => {
      return supabase
        .from("models")
        .update({ position: index + 1 })
        .eq("id", id)
    })

    await Promise.all(updates)

    // Log activity
    if (userId) {
      await logActivity({
        userId,
        entityType: "model",
        actionType: "reorder",
        details: { orderedIds },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
