import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import { ArrowLeft, Smartphone } from "lucide-react"

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
    title: `${series.name} - ${series.brands?.name}`,
    description:
      t("seriesPageDescription", { series: series.name, brand: series.brands?.name }) ||
      `Browse all ${series.name} models from ${series.brands?.name}`,
  }
}

export default async function SeriesPage({ params }: Props) {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Series" })
  const commonT = await getTranslations({ locale, namespace: "Common" })

  const supabase = createServerClient()

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

  // Fetch models for this series
  const { data: models, error: modelsError } = await supabase
    .from("models")
    .select("id, name, image_url, created_at")
    .eq("series_id", id)
    .order("position", { ascending: true })

  if (modelsError) {
    console.error("[SeriesPage] Error fetching models:", modelsError)
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Заголовок серії */}
        <div className="mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg md:p-12">
          <Link
            href={`/${locale}/brands/${series.brand_id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-md transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToBrand", { brand: series.brands?.name })}
          </Link>

          <div className="mt-8 flex flex-col items-center gap-8 md:flex-row">
            {series.brands?.logo_url && (
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-white p-4 shadow-md md:h-32 md:w-32">
                <Image
                  src={series.brands.logo_url || "/placeholder.svg"}
                  alt={series.brands.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-center text-4xl font-bold tracking-tight md:text-left md:text-5xl lg:text-6xl">
                {series.name}
              </h1>
              <p className="mt-4 max-w-[900px] text-center text-lg text-slate-600 md:text-left md:text-xl">
                {t("seriesPageDescription", { series: series.name, brand: series.brands?.name })}
              </p>
            </div>
          </div>
        </div>

        {/* Розділ моделей */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">{t("availableModels")}</h2>
            <div className="mx-6 h-1 flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
          </div>

          {models && models.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/${locale}/models/${model.id}`}
                  className="group flex flex-col items-center rounded-2xl bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative mb-5 h-20 w-20 overflow-hidden rounded-xl bg-slate-50 p-2 shadow-sm transition-all duration-300 group-hover:shadow-md sm:h-24 sm:w-24">
                    {model.image_url ? (
                      <Image
                        src={model.image_url || "/placeholder.svg"}
                        alt={model.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100">
                        <Smartphone className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-center text-lg font-medium transition-colors group-hover:text-primary">
                    {model.name}
                  </h3>
                  <div className="mt-4 h-0.5 w-0 bg-primary/30 transition-all duration-300 group-hover:w-16"></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-lg text-slate-500">{t("noModelsAvailable")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
