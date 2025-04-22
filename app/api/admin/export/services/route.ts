import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import Papa from "papaparse"

export async function GET() {
  try {
    const supabase = createClient()

    // Get all model services with related data
    const { data: modelServices, error } = await supabase
      .from("model_services")
      .select(`
        id,
        price,
        models!inner(
          id,
          name,
          brands!inner(
            id,
            name
          )
        ),
        services!inner(
          id,
          services_translations!inner(
            name,
            locale
          )
        )
      `)
      .eq("services_translations.locale", "uk") // Default locale

    if (error) {
      throw error
    }

    // Transform data for CSV export
    const csvData = modelServices.map((ms) => ({
      brand: ms.models.brands.name,
      model: ms.models.name,
      service: ms.services.services_translations[0]?.name || "",
      price: ms.price === null ? "" : ms.price,
    }))

    // Convert to CSV
    const csv = Papa.unparse(csvData)

    // Return as downloadable file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="services_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting services:", error)
    return NextResponse.json(
      { error: "Failed to export services", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
