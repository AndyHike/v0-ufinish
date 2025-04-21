import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server"
import { logActivity } from "@/lib/admin/activity-logger"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const modelId = searchParams.get("model_id")

  try {
    const supabase = createServerClient()

    let query = supabase
      .from("model_services")
      .select("*, services(id, name, description, position)")
      .order("id", { ascending: true })

    if (modelId) {
      query = query.eq("model_id", modelId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching model services:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { modelId, serviceId, price, userId } = body

    if (!modelId || !serviceId || price === undefined || price === null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if the model service already exists
    const { data: existingService, error: checkError } = await supabase
      .from("model_services")
      .select("id")
      .eq("model_id", modelId)
      .eq("service_id", serviceId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing model service:", checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    let result

    if (existingService) {
      // Update existing model service
      const { data, error } = await supabase
        .from("model_services")
        .update({ price })
        .eq("id", existingService.id)
        .select("*, services(id, name, description, position)")
        .single()

      if (error) {
        console.error("Error updating model service:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data

      // Log activity
      if (userId) {
        await logActivity({
          userId,
          entityId: existingService.id,
          entityType: "model_service",
          actionType: "update",
          details: { price },
        })
      }
    } else {
      // Create new model service
      const { data, error } = await supabase
        .from("model_services")
        .insert({ model_id: modelId, service_id: serviceId, price })
        .select("*, services(id, name, description, position)")
        .single()

      if (error) {
        console.error("Error creating model service:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data

      // Log activity
      if (userId) {
        await logActivity({
          userId,
          entityId: data.id,
          entityType: "model_service",
          actionType: "create",
          details: { modelId, serviceId, price },
        })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
