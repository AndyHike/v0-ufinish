import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const modelId = searchParams.get("model_id")
    const locale = searchParams.get("locale") || "uk"

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // First, fetch all services to get their positions
    const { data: servicesData, error: servicesError } = await supabase
      .from("services")
      .select(`
        id, 
        position,
        services_translations!inner(
          name,
          description,
          locale
        )
      `)
      .eq("services_translations.locale", locale)
      .order("position", { ascending: true })

    if (servicesError) throw servicesError

    // Then fetch model services without ordering
    const { data, error } = await supabase
      .from("model_services")
      .select(`
        id, 
        price, 
        model_id, 
        service_id
      `)
      .eq("model_id", modelId)

    if (error) throw error

    // Create a map of service data
    const servicesMap = new Map()
    servicesData.forEach((service) => {
      servicesMap.set(service.id, {
        id: service.id,
        position: service.position,
        name: service.services_translations[0]?.name || "",
        description: service.services_translations[0]?.description || "",
      })
    })

    // Transform and combine the data
    const transformedData = data
      .map((modelService) => {
        const serviceInfo = servicesMap.get(modelService.service_id)
        if (!serviceInfo) return null // Skip if service not found

        return {
          id: modelService.id,
          model_id: modelService.model_id,
          service_id: modelService.service_id,
          price: modelService.price,
          services: serviceInfo,
        }
      })
      .filter((item) => item !== null) // Remove null items

    // Sort by service position
    transformedData.sort((a, b) => {
      return (a.services.position || 0) - (b.services.position || 0)
    })

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching model services:", error)
    return NextResponse.json({ error: "Failed to fetch model services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    // Check if the model service already exists
    const { data: existingData, error: existingError } = await supabase
      .from("model_services")
      .select("id")
      .eq("model_id", body.modelId)
      .eq("service_id", body.serviceId)
      .maybeSingle()

    if (existingError) throw existingError

    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from("model_services")
        .update({ price: body.price })
        .eq("id", existingData.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("model_services")
        .insert({
          model_id: body.modelId,
          service_id: body.serviceId,
          price: body.price,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error creating/updating model service:", error)
    return NextResponse.json({ error: "Failed to create/update model service" }, { status: 500 })
  }
}
