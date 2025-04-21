import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const supabase = createServerClient()

    // Get the model service before deleting for logging
    const { data: modelService, error: fetchError } = await supabase
      .from("model_services")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching model service:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Delete the model service
    const { error } = await supabase.from("model_services").delete().eq("id", id)

    if (error) {
      console.error("Error deleting model service:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await logActivity({
      userId: request.headers.get("x-user-id") || undefined,
      entityId: id,
      entityType: "model_service",
      actionType: "delete",
      details: { modelId: modelService.model_id, serviceId: modelService.service_id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
