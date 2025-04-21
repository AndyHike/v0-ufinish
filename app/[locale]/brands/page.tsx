import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Brands" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function BrandsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "Brands" })
  const supabase = createClient()

  // Fetch brands with error handling
  let { data: brands, error } = await supabase
    .from("brands")
    .select("*")
    .order("position", { ascending: true, nullsLast: true })

  // If there's an error or no brands with position, try fetching without ordering
  if (error || !brands || brands.length === 0) {
    const { data: fallbackBrands, error: fallbackError } = await supabase.from("brands").select("*").order("name")

    if (!fallbackError && fallbackBrands) {
      brands = fallbackBrands
    }
  }

  // Sort brands by position if available, otherwise by name
  const sortedBrands =
    brands?.sort((a, b) => {
      // If both have position, sort by position
      if (a.position !== null && a.position !== undefined && b.position !== null && b.position !== undefined) {
        return a.position - b.position
      }
      // If only one has position, prioritize the one with position
      if (a.position !== null && a.position !== undefined) return -1
      if (b.position !== null && b.position !== undefined) return 1
      // If neither has position, sort by name
      return a.name.localeCompare(b.name)
    }) || []

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 md:grid-cols-3 lg:grid-cols-5">
        {sortedBrands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.id}`} className="group flex flex-col items-center justify-center">
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-lg">
              <Image
                src={brand.logo_url || "/placeholder.svg?height=96&width=96&query=phone+brand+logo"}
                alt={brand.name}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h2 className="text-center text-lg font-medium">{brand.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}
