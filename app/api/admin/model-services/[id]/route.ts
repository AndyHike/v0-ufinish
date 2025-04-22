import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Attempting to delete model service with ID: ${id}`)

    const supabase = createClient()

    // Get the model service before deletion for logging
    const { data: modelService, error: fetchError } = await supabase
      .from("model_services")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching model service before deletion:", fetchError)
      throw fetchError
    }

    console.log("Found model service to delete:", modelService)

    // Delete the model service
    const { error: deleteError } = await supabase.from("model_services").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting model service:", deleteError)
      throw deleteError
    }

    console.log(`Successfully deleted model service with ID: ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting model service:", error)
    return NextResponse.json({ error: "Failed to delete model service" }, { status: 500 })
  }
}
