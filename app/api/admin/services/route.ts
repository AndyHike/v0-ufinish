import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const locale = url.searchParams.get("locale") || "uk"

    const supabase = createClient()

    // Fetch services with translations
    const { data, error } = await supabase
      .from("services")
      .select(`
        id, 
        position,
        services_translations(
          name,
          description,
          locale
        )
      `)
      .order("position", { ascending: true })

    if (error) throw error

    // Filter translations for the requested locale
    const transformedData = data.map((service) => {
      const translations = service.services_translations.filter((translation: any) => translation.locale === locale)

      return {
        id: service.id,
        position: service.position,
        name: translations[0]?.name || "",
        description: translations[0]?.description || "",
      }
    })

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services", details: error }, { status: 500 })
  }
}
