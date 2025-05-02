import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parse } from "papaparse"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const locale = (formData.get("locale") as string) || "uk" // Додаємо параметр локалі

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileContent = await file.text()
    const { data, errors } = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (errors.length > 0) {
      return NextResponse.json({ error: "Error parsing CSV file", details: errors }, { status: 400 })
    }

    const supabase = createClient()

    // Отримуємо всі моделі для перевірки
    const { data: models } = await supabase.from("models").select("id, name")
    const modelMap = new Map(models?.map((model) => [model.name.toLowerCase(), model.id]) || [])

    // Отримуємо всі послуги для перевірки дублікатів
    const { data: services } = await supabase.from("services").select("id, name")
    const serviceMap = new Map(services?.map((service) => [service.name.toLowerCase(), service.id]) || [])

    // Отримуємо всі зв'язки модель-послуга для перевірки дублікатів
    const { data: modelServices } = await supabase.from("model_services").select("*")
    const modelServiceMap = new Map()
    modelServices?.forEach((ms) => {
      const key = `${ms.model_id}-${ms.service_id}`
      modelServiceMap.set(key, ms.id)
    })

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Підготовка даних для вставки
    const servicesToInsert = []
    const modelServicesToInsert = []
    const translationsToInsert = []

    for (const row of data as any[]) {
      try {
        const modelName = row.model_name?.trim()
        const serviceName = row.service_name?.trim()
        const price = Number.parseFloat(row.price)
        const description = row.description?.trim() || null
        const isActive = row.is_active?.toLowerCase() === "true"

        if (!modelName || !serviceName || isNaN(price)) {
          results.errors.push(`Missing required fields in row: ${JSON.stringify(row)}`)
          results.failed++
          continue
        }

        // Перевіряємо, чи існує модель
        const modelId = modelMap.get(modelName.toLowerCase())
        if (!modelId) {
          results.errors.push(`Model not found: ${modelName}`)
          results.failed++
          continue
        }

        // Перевіряємо, чи існує послуга, або створюємо нову
        let serviceId = serviceMap.get(serviceName.toLowerCase())

        if (!serviceId) {
          // Створюємо нову послугу
          const { data: newService, error: serviceError } = await supabase
            .from("services")
            .insert({
              name: serviceName,
              created_by: userId,
            })
            .select("id")
            .single()

          if (serviceError) {
            results.errors.push(`Error creating service: ${serviceError.message}`)
            results.failed++
            continue
          }

          serviceId = newService.id
          serviceMap.set(serviceName.toLowerCase(), serviceId)

          // Додаємо переклад для нової послуги
          translationsToInsert.push({
            service_id: serviceId,
            locale,
            name: serviceName,
            description: description || null,
          })
        } else {
          // Перевіряємо, чи існує переклад для цієї послуги в поточній локалі
          const { data: existingTranslation } = await supabase
            .from("service_translations")
            .select("id")
            .eq("service_id", serviceId)
            .eq("locale", locale)
            .single()

          if (!existingTranslation) {
            // Додаємо переклад для існуючої послуги
            translationsToInsert.push({
              service_id: serviceId,
              locale,
              name: serviceName,
              description: description || null,
            })
          } else {
            // Оновлюємо існуючий переклад
            await supabase
              .from("service_translations")
              .update({
                name: serviceName,
                description: description || null,
              })
              .eq("id", existingTranslation.id)
          }
        }

        // Перевіряємо, чи існує зв'язок модель-послуга
        const modelServiceKey = `${modelId}-${serviceId}`
        const existingModelServiceId = modelServiceMap.get(modelServiceKey)

        if (existingModelServiceId) {
          // Оновлюємо існуючий зв'язок
          await supabase
            .from("model_services")
            .update({
              price,
              is_active: isActive,
              updated_by: userId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingModelServiceId)
        } else {
          // Створюємо новий зв'язок
          modelServicesToInsert.push({
            model_id: modelId,
            service_id: serviceId,
            price,
            is_active: isActive,
            created_by: userId,
          })
        }

        results.success++
      } catch (error) {
        console.error("Error processing row:", error)
        results.errors.push(`Error processing row: ${error instanceof Error ? error.message : String(error)}`)
        results.failed++
      }
    }

    // Вставляємо нові зв'язки модель-послуга
    if (modelServicesToInsert.length > 0) {
      const { error: modelServicesError } = await supabase.from("model_services").insert(modelServicesToInsert)

      if (modelServicesError) {
        results.errors.push(`Error inserting model services: ${modelServicesError.message}`)
      }
    }

    // Вставляємо нові переклади
    if (translationsToInsert.length > 0) {
      const { error: translationsError } = await supabase.from("service_translations").insert(translationsToInsert)

      if (translationsError) {
        results.errors.push(`Error inserting translations: ${translationsError.message}`)
      }
    }

    // Логуємо активність
    await supabase.from("admin_activity").insert({
      user_id: userId,
      action: "bulk_import_services",
      details: {
        success: results.success,
        failed: results.failed,
        skipped: results.skipped,
      },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in bulk import services:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
