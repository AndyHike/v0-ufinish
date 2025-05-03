import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type ModelImportRow = {
  brand: string
  model: string
  series?: string
  image_url?: string
}

export async function POST(request: Request) {
  try {
    const { data, userId } = await request.json()

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
        if (!row.brand || !row.model) {
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

        // 2. Find or create series if provided
        let seriesId: string | null = null
        if (row.series) {
          const { data: existingSeries } = await supabase
            .from("series")
            .select("id")
            .eq("name", row.series)
            .eq("brand_id", brandId)
            .maybeSingle()

          if (existingSeries) {
            seriesId = existingSeries.id
          } else {
            // Create new series
            const { data: newSeries, error: seriesError } = await supabase
              .from("series")
              .insert({
                name: row.series,
                brand_id: brandId,
                created_by: userId || null,
              })
              .select("id")
              .single()

            if (seriesError) {
              result.failed++
              result.errors.push(`Failed to create series "${row.series}": ${seriesError.message}`)
              continue
            }

            seriesId = newSeries.id
          }
        }

        // 3. Check if model already exists
        const { data: existingModel } = await supabase
          .from("models")
          .select("id")
          .eq("name", row.model)
          .eq("brand_id", brandId)
          .maybeSingle()

        if (existingModel) {
          // Update existing model if image_url or series_id is provided
          if (row.image_url || seriesId) {
            const updateData: any = {}
            if (row.image_url) updateData.image_url = row.image_url
            if (seriesId) updateData.series_id = seriesId
            updateData.updated_by = userId || null
            updateData.updated_at = new Date().toISOString()

            const { error: updateError } = await supabase.from("models").update(updateData).eq("id", existingModel.id)

            if (updateError) {
              result.failed++
              result.errors.push(`Failed to update model "${row.model}": ${updateError.message}`)
              continue
            }
          }

          result.success++
          continue
        }

        // 4. Create new model
        const { error: modelError } = await supabase.from("models").insert({
          name: row.model,
          brand_id: brandId,
          series_id: seriesId,
          image_url: row.image_url || null,
          created_by: userId || null,
        })

        if (modelError) {
          result.failed++
          result.errors.push(`Failed to create model "${row.model}": ${modelError.message}`)
          continue
        }

        result.success++
      } catch (err) {
        result.failed++
        result.errors.push(
          `Error processing row: ${JSON.stringify(row)} - ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }

    // Log activity
    if (userId) {
      await supabase.from("admin_activity").insert({
        user_id: userId,
        action: "bulk_import_models",
        details: {
          success: result.success,
          failed: result.failed,
        },
      })
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
