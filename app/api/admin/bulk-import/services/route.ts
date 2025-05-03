import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type ServiceImportRow = {
  brand: string
  model: string
  service_uk: string
  service_en?: string
  service_cs?: string
  description_uk?: string
  description_en?: string
  description_cs?: string
  price: string | number
}

export async function POST(request: Request) {
  try {
    const { data, userId, locale = "uk" } = await request.json()

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
        if (!row.brand || !row.model || !row.service_uk) {
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
            .insert({
              name: row.brand,
              created_by: userId || null,
            })
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
            .insert({
              name: row.model,
              brand_id: brandId,
              created_by: userId || null,
            })
            .select("id")
            .single()

          if (modelError) {
            result.failed++
            result.errors.push(`Failed to create model "${row.model}": ${modelError.message}`)
            continue
          }

          modelId = newModel.id
        }

        // 3. Find or create service with translations
        let serviceId: string

        // Try to find existing service by Ukrainian name (primary language)
        const { data: existingService } = await supabase
          .from("services_translations")
          .select("service_id")
          .eq("name", row.service_uk)
          .eq("locale", "uk")
          .maybeSingle()

        if (existingService) {
          serviceId = existingService.service_id

          // Update existing translations
          const translationPromises = []

          // Update Ukrainian translation (always required)
          translationPromises.push(
            supabase
              .from("services_translations")
              .update({
                name: row.service_uk,
                description: row.description_uk || "",
              })
              .eq("service_id", serviceId)
              .eq("locale", "uk"),
          )

          // Update English translation if provided
          if (row.service_en) {
            const { data: existingEnTranslation } = await supabase
              .from("services_translations")
              .select("id")
              .eq("service_id", serviceId)
              .eq("locale", "en")
              .maybeSingle()

            if (existingEnTranslation) {
              translationPromises.push(
                supabase
                  .from("services_translations")
                  .update({
                    name: row.service_en,
                    description: row.description_en || "",
                  })
                  .eq("service_id", serviceId)
                  .eq("locale", "en"),
              )
            } else {
              translationPromises.push(
                supabase.from("services_translations").insert({
                  service_id: serviceId,
                  name: row.service_en,
                  description: row.description_en || "",
                  locale: "en",
                }),
              )
            }
          }

          // Update Czech translation if provided
          if (row.service_cs) {
            const { data: existingCsTranslation } = await supabase
              .from("services_translations")
              .select("id")
              .eq("service_id", serviceId)
              .eq("locale", "cs")
              .maybeSingle()

            if (existingCsTranslation) {
              translationPromises.push(
                supabase
                  .from("services_translations")
                  .update({
                    name: row.service_cs,
                    description: row.description_cs || "",
                  })
                  .eq("service_id", serviceId)
                  .eq("locale", "cs"),
              )
            } else {
              translationPromises.push(
                supabase.from("services_translations").insert({
                  service_id: serviceId,
                  name: row.service_cs,
                  description: row.description_cs || "",
                  locale: "cs",
                }),
              )
            }
          }

          // Execute all translation updates
          await Promise.all(translationPromises)
        } else {
          // Create new service
          const { data: newService, error: serviceError } = await supabase
            .from("services")
            .insert({
              created_by: userId || null,
            })
            .select("id")
            .single()

          if (serviceError) {
            result.failed++
            result.errors.push(`Failed to create service "${row.service_uk}": ${serviceError.message}`)
            continue
          }

          serviceId = newService.id

          // Add service translations for all provided languages
          const translationInserts = [
            // Ukrainian translation (required)
            {
              service_id: serviceId,
              name: row.service_uk,
              description: row.description_uk || "",
              locale: "uk",
            },
          ]

          // Add English translation if provided
          if (row.service_en) {
            translationInserts.push({
              service_id: serviceId,
              name: row.service_en,
              description: row.description_en || "",
              locale: "en",
            })
          }

          // Add Czech translation if provided
          if (row.service_cs) {
            translationInserts.push({
              service_id: serviceId,
              name: row.service_cs,
              description: row.description_cs || "",
              locale: "cs",
            })
          }

          // Insert all translations
          const { error: insertError } = await supabase.from("services_translations").insert(translationInserts)

          if (insertError) {
            result.failed++
            result.errors.push(`Failed to create translations for service "${row.service_uk}": ${insertError.message}`)
            continue
          }
        }

        // 4. Create model_service relation
        const price = typeof row.price === "string" ? Number.parseFloat(row.price) : row.price

        if (isNaN(price)) {
          result.failed++
          result.errors.push(`Invalid price value for service "${row.service_uk}"`)
          continue
        }

        const { data: existingRelation } = await supabase
          .from("model_services")
          .select("id")
          .eq("model_id", modelId)
          .eq("service_id", serviceId)
          .maybeSingle()

        if (!existingRelation) {
          const { error: relationError } = await supabase.from("model_services").insert({
            model_id: modelId,
            service_id: serviceId,
            price: price,
            created_by: userId || null,
          })

          if (relationError) {
            result.failed++
            result.errors.push(
              `Failed to create relation between model and service "${row.service_uk}": ${relationError.message}`,
            )
            continue
          }
        } else {
          // Update existing relation (e.g., price)
          const { error: updateError } = await supabase
            .from("model_services")
            .update({
              price: price,
            })
            .eq("id", existingRelation.id)

          if (updateError) {
            result.failed++
            result.errors.push(
              `Failed to update relation between model and service "${row.service_uk}": ${updateError.message}`,
            )
            continue
          }
        }

        result.success++
      } catch (error: any) {
        result.failed++
        result.errors.push(`Error processing row: ${error.message || error}`)
      }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || error }, { status: 500 })
  }
}
