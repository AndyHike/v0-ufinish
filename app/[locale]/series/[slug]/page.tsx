import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createServerClient } from "@/utils/supabase/server"
import SeriesPageClient from "./SeriesPageClient"

type Props = {
  params: {
    locale: string
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = params
  const t = await getTranslations({ locale, namespace: "Series" })

  const supabase = createServerClient()

  // Спочатку спробуємо знайти за слагом
  let { data: series } = await supabase.from("series").select("*, brands(name)").eq("slug", slug).single()

  // Якщо не знайдено за слагом, спробуємо знайти за ID
  if (!series) {
    const { data } = await supabase.from("series").select("*, brands(name)").eq("id", slug).single()
    series = data
  }

  if (!series) {
    return {
      title: t("seriesNotFound") || "Series not found",
      description: t("seriesNotFoundDesc") || "The requested series could not be found",
    }
  }

  return {
    title: `${series.name} - ${series.brands?.name}`,
    description:
      t("seriesPageDescription", { series: series.name, brand: series.brands?.name }) ||
      `Browse all ${series.name} models from ${series.brands?.name}`,
  }
}

export default async function SeriesPage({ params }: Props) {
  return <SeriesPageClient params={params} />
}
