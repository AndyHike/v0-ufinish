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
        <div className="mb-12 rounded-xl bg-white p-8 shadow-sm">
          <Link
            href={`/${locale}/brands/${series.brand_id}`}
            className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToBrand", { brand: series.brands?.name })}
          </Link>

          <div className="mt-6 flex flex-col items-center gap-6 md:flex-row">
            {series.brands?.logo_url && (
              <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-slate-50 p-3">
                <Image
                  src={series.brands.logo_url || "/placeholder.svg"}
                  alt={series.brands.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-center text-3xl font-bold tracking-tight md:text-left md:text-4xl">{series.name}</h1>
              <p className="mt-3 max-w-[900px] text-center text-muted-foreground md:text-left">
                {t("seriesPageDescription", { series: series.name, brand: series.brands?.name })}
              </p>
            </div>
          </div>
        </div>

        {/* Розділ моделей */}
        <div>
          <h2 className="mb-6 border-b pb-2 text-2xl font-bold">{t("availableModels")}</h2>

          {models && models.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/${locale}/models/${model.id}`}
                  className="group flex flex-col items-center rounded-lg bg-white p-4 shadow-sm hover:shadow"
                >
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-slate-50 p-2 sm:h-24 sm:w-24">
                    {model.image_url ? (
                      <Image
                        src={model.image_url || "/placeholder.svg"}
                        alt={model.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Smartphone className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-center text-base font-medium group-hover:text-primary sm:text-lg">
                    {model.name}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-muted-foreground">{t("noModelsAvailable")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
