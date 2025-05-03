import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import { ChevronLeft } from "lucide-react"

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
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${locale}/brands/${series.brand_id}`}
          className="mb-8 flex items-center text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("backToBrand", { brand: series.brands?.name })}
        </Link>

        <div className="mb-12">
          <div className="mb-2 flex items-center gap-2">
            {series.brands?.logo_url && (
              <div className="relative h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={series.brands.logo_url || "/placeholder.svg"}
                  alt={series.brands.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <span className="text-sm text-muted-foreground">{series.brands?.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{series.name}</h1>
          <p className="mt-2 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("seriesPageDescription", { series: series.name, brand: series.brands?.name })}
          </p>
        </div>

        <h2 className="mb-6 text-2xl font-bold">{t("availableModels")}</h2>

        {models && models.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/${locale}/models/${model.id}`}
                className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                  <Image
                    src={model.image_url || "/placeholder.svg?height=200&width=200&query=phone+model"}
                    alt={model.name}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <h3 className="text-lg font-medium group-hover:underline">{model.name}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <p>{t("noModelsAvailable")}</p>
        )}
      </div>
    </div>
  )
}
