import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

type ServiceImportRow = {
  brand: string
  model: string
  service: string
  price: string | number
}

export async function POST(request: Request) {
  try {
    const { data } = await request.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const supabase = createClient()

    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each row
    for (const row of data) {
      try {
        // Validate row data
        if (!row.brand || !row.model || !row.service) {
          result.failed++
          result.errors.push(`Missing required fields for row: ${JSON.stringify(row)}`)
          continue
        }

        // 1. Find or create brand
        let brandId: string
        const { data: existingBrand } = await supabase.from("brands").select("id").eq("name", row.brand).maybeSingle()

        if (existingBrand) {
          brandId = existingBrand.id
        } else {
          // Create new brand
          const { data: newBrand, error: brandError } = await supabase
            .from("brands")
            .insert({ name: row.brand })
            .select("id")
            .single()

          if (brandError) {
            result.failed++
            result.errors.push(`Failed to create brand "${row.brand}": ${brandError.message}`)
            continue
          }

          brandId = newBrand.id
        }

        // 2. Find or create model
        let modelId: string
        const { data: existingModel } = await supabase
          .from("models")
          .select("id")
          .eq("name", row.model)
          .eq("brand_id", brandId)
          .maybeSingle()

        if (existingModel) {
          modelId = existingModel.id
        } else {
          // Create new model
          const { data: newModel, error: modelError } = await supabase
            .from("models")
            .insert({ name: row.model, brand_id: brandId })
            .select("id")
            .single()

          if (modelError) {
            result.failed++
            result.errors.push(`Failed to create model "${row.model}": ${modelError.message}`)
            continue
          }

          modelId = newModel.id
        }

        // 3. Find or create service
        let serviceId: string
        const { data: existingService } = await supabase
          .from("services")
          .select(`
            id, 
            services_translations(
              name,
              locale
            )
          `)
          .eq("services_translations.name", row.service)
          .maybeSingle()

        if (existingService) {
          serviceId = existingService.id
        } else {
          // Create new service
          const { data: newService, error: serviceError } = await supabase
            .from("services")
            .insert({})
            .select("id")
            .single()

          if (serviceError) {
            result.failed++
            result.errors.push(`Failed to create service "${row.service}": ${serviceError.message}`)
            continue
          }

          serviceId = newService.id

          // Add service translation
          const { error: translationError } = await supabase.from("services_translations").insert({
            service_id: serviceId,
            name: row.service,
            description: "",
            locale: "uk", // Default locale
          })

          if (translationError) {
            result.failed++
            result.errors.push(`Failed to create service translation "${row.service}": ${translationError.message}`)
            continue
          }
        }

        // 4. Create or update model service
        const price = row.price === "" ? null : typeof row.price === "string" ? Number.parseFloat(row.price) : row.price

        // Check if model service already exists
        const { data: existingModelService } = await supabase
          .from("model_services")
          .select("id")
          .eq("model_id", modelId)
          .eq("service_id", serviceId)
          .maybeSingle()

        if (existingModelService) {
          // Update existing model service
          const { error: updateError } = await supabase
            .from("model_services")
            .update({ price })
            .eq("id", existingModelService.id)

          if (updateError) {
            result.failed++
            result.errors.push(`Failed to update price for ${row.model} - ${row.service}: ${updateError.message}`)
            continue
          }
        } else {
          // Create new model service
          const { error: createError } = await supabase.from("model_services").insert({
            model_id: modelId,
            service_id: serviceId,
            price,
          })

          if (createError) {
            result.failed++
            result.errors.push(`Failed to create price for ${row.model} - ${row.service}: ${createError.message}`)
            continue
          }
        }

        result.success++
      } catch (err) {
        result.failed++
        result.errors.push(
          `Error processing row: ${JSON.stringify(row)} - ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing bulk import:", error)
    return NextResponse.json(
      { error: "Failed to process import", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
