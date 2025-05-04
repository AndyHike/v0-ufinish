import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
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
  const { data: series } = await supabase.from("series").select("*, brands!inner(*)").eq("id", id).single()

  if (!series) {
    return {
      title: t("seriesNotFound"),
      description: t("seriesNotFoundDesc"),
    }
  }

  return {
    title: `${series.name} - ${series.brands.name} - ${t("repairServices")}`,
    description: t("seriesPageDescription", { series: series.name, brand: series.brands.name }),
  }
}

export default async function SeriesPage({ params }: Props) {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Series" })

  const supabase = createServerClient()

  // Fetch the series with its brand
  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("*, brands!inner(*)")
    .eq("id", id)
    .single()

  if (seriesError || !series) {
    notFound()
  }

  // Fetch models for this series ordered by position
  const { data: models, error: modelsError } = await supabase
    .from("models")
    .select("*")
    .eq("series_id", id)
    .order("position", { ascending: true })

  if (modelsError) {
    console.error("Error fetching models:", modelsError)
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Сучасний заголовок серії */}
        <div className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-md">
          <div className="relative">
            {/* Фонові елементи */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20"></div>
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/20"></div>
            </div>

            <div className="relative z-10 p-8 md:p-10">
              <Link
                href={`/${locale}/brands/${series.brands.id}`}
                className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("backToBrand", { brand: series.brands.name })}
              </Link>

              <div className="mt-4 flex flex-col items-center gap-6 md:flex-row">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white p-3 shadow-md md:h-28 md:w-28">
                  <Image
                    src={series.brands.logo_url || "/placeholder.svg?height=112&width=112&query=phone+brand+logo"}
                    alt={series.brands.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-center text-3xl font-bold tracking-tighter md:text-left sm:text-4xl md:text-5xl">
                    {series.name}
                  </h1>
                  <p className="mt-3 max-w-[900px] text-center text-muted-foreground md:text-left md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    {t("seriesPageDescription", { series: series.name, brand: series.brands.name })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Сучасний розділ моделей */}
        <h2 className="mb-6 text-2xl font-bold">{t("availableModels") || "Available Models"}</h2>

        {models && models.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {models.map((model) => (
              <Link
                href={`/${locale}/models/${model.id}`}
                key={model.id}
                className="group flex flex-col items-center rounded-xl bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative mb-4 h-16 w-16 overflow-hidden sm:h-20 sm:w-20">
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
                      <Smartphone className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-center text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
                  {model.name}
                </h3>
                {model.base_price && (
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                    {t("startingFrom", { price: formatCurrency(model.base_price) })}
                  </p>
                )}
                <div className="mt-3 h-0.5 w-0 bg-primary/30 transition-all duration-300 group-hover:w-12"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-muted-foreground">
              {t("noModelsAvailable", { series: series.name, brand: series.brands.name })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
