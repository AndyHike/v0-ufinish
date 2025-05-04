import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"

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

  const brand = series.brands

  // Fetch models for this series
  const { data: models, error: modelsError } = await supabase
    .from("models")
    .select("id, name, image_url, created_at, base_price")
    .eq("series_id", id)
    .order("position", { ascending: true })

  if (modelsError) {
    console.error("[SeriesPage] Error fetching models:", modelsError)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD", // Replace with your desired currency
    }).format(amount)
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Series Header with Gradient Background */}
        <div className="mb-12 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-white p-4 shadow-sm">
              <Image
                src={brand?.logo_url || "/placeholder.svg?height=128&width=128&query=phone+brand+logo"}
                alt={brand?.name || series.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {brand && (
                  <Link href={`/${locale}/brands/${brand.id}`} className="text-muted-foreground hover:text-primary">
                    {brand.name}
                  </Link>
                )}
                {brand && <span className="text-muted-foreground">/</span>}
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{series.name}</h1>
              </div>
              <p className="mt-2 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t("seriesPageDescription", { series: series.name, brand: brand?.name || "" })}
              </p>
            </div>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold">{t("availableModels")}</h2>

        {models && models.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {models.map((model) => (
              <Link
                href={`/${locale}/models/${model.id}`}
                key={model.id}
                className="group flex flex-col items-center rounded-xl border-0 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative mb-4 h-16 w-16 overflow-hidden">
                  {model.image_url ? (
                    <Image
                      src={model.image_url || "/placeholder.svg"}
                      alt={model.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100">
                      <span className="text-xl font-medium text-slate-400">{model.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-center text-lg font-medium group-hover:text-primary">{model.name}</h3>
                {model.base_price && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("startingFrom", { price: formatCurrency(model.base_price) })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-muted-foreground">{t("noModelsAvailable", { brand: series.name })}</p>
          </div>
        )}
      </div>
    </div>
  )
}
