import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import { ChevronLeft } from "lucide-react"
import { formatCurrency } from "@/lib/format-currency"

type Props = {
  params: {
    locale: string
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Series" })

  const supabase = createServerClient()
  const { data: series } = await supabase.from("series").select("*, brands(name)").eq("id", id).single()

  if (!series) {
    return {
      title: t("seriesNotFound") || "Series not found",
      description: t("seriesNotFoundDesc") || "The requested series could not be found",
    }
  }

  return {
    title: `${series.name} - ${t("repairServices") || "Repair Services"}`,
    description:
      t("seriesPageDescription", { series: series.name, brand: series.brands?.name }) ||
      `Repair services for ${series.brands?.name} ${series.name} series`,
  }
}

export default async function SeriesPage({ params }: Props) {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Series" })

  const supabase = createServerClient()

  console.log(`[SeriesPage] Fetching series with ID: ${id}`)

  // Fetch the series with its brand
  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("*, brands(id, name, logo_url)")
    .eq("id", id)
    .single()

  if (seriesError || !series) {
    console.error("[SeriesPage] Error fetching series:", seriesError)
    notFound()
  }

  console.log("[SeriesPage] Fetched series:", series)

  // Fetch models for this series
  const { data: models, error: modelsError } = await supabase
    .from("models")
    .select("id, name, image_url, base_price")
    .eq("series_id", id)
    .order("position", { ascending: true })

  if (modelsError) {
    console.error("[SeriesPage] Error fetching models:", modelsError)
  }

  console.log(`[SeriesPage] Fetched ${models?.length || 0} models`)

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${locale}/brands/${series.brand_id}`}
          className="mb-8 inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("backToBrand", { brand: series.brands?.name }) || `Back to ${series.brands?.name}`}
        </Link>

        <div className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20"></div>
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 p-8 md:flex-row md:p-10">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-white p-3 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-80"></div>
                <Image
                  src={series.brands?.logo_url || "/placeholder.svg?height=96&width=96&query=brand+logo"}
                  alt={series.brands?.name || "Brand"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{series.brands?.name}</span>
                </div>
                <h1 className="text-center text-3xl font-bold tracking-tighter md:text-left sm:text-4xl md:text-5xl">
                  {series.name} {t("series") || "Series"}
                </h1>
                <p className="mt-3 max-w-[900px] text-center text-muted-foreground md:text-left md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("seriesPageDescription", { series: series.name, brand: series.brands?.name }) ||
                    `Repair services for ${series.brands?.name} ${series.name} series`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold">{t("availableModels") || "Available Models"}</h2>

        {models && models.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {models.map((model) => (
              <Link
                href={`/${locale}/models/${model.id}`}
                key={model.id}
                className="group flex flex-col items-center rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative mb-4 h-20 w-20 overflow-hidden">
                  {model.image_url ? (
                    <Image
                      src={model.image_url || "/placeholder.svg"}
                      alt={model.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                      <span className="text-2xl font-medium text-slate-400">{model.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-center text-lg font-medium group-hover:text-primary transition-colors">
                  {model.name}
                </h3>
                {model.base_price && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("startingFrom", { price: formatCurrency(model.base_price) }) ||
                      `Starting from ${formatCurrency(model.base_price)}`}
                  </p>
                )}
                <div className="mt-3 h-0.5 w-0 bg-primary/30 transition-all duration-300 group-hover:w-12"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-muted-foreground">
              {t("noModelsAvailable", { series: series.name }) || `No models available for ${series.name} series`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
