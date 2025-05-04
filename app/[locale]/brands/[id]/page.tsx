import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
import { ChevronRight } from "lucide-react"

type Props = {
  params: {
    locale: string
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Brands" })

  const supabase = createServerClient()
  const { data: brand } = await supabase.from("brands").select("*").eq("id", id).single()

  if (!brand) {
    return {
      title: t("brandNotFound"),
      description: t("brandNotFoundDesc"),
    }
  }

  return {
    title: `${brand.name} - ${t("repairServices")}`,
    description: t("brandPageDescription", { brand: brand.name }),
  }
}

export default async function BrandPage({ params }: Props) {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Brands" })

  const supabase = createServerClient()

  // Fetch the brand
  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("*, series(id, name, position)")
    .eq("id", id)
    .single()

  if (brandError || !brand) {
    notFound()
  }

  // Fetch models for this brand ordered by position
  const { data: models } = await supabase
    .from("models")
    .select("*")
    .eq("brand_id", id)
    .order("position", { ascending: true })

  // Оновимо запит до бази даних, щоб отримати моделі без серії
  const { data: modelsWithoutSeries, error: modelsError } = await supabase
    .from("models")
    .select("id, name, image_url")
    .eq("brand_id", id)
    .is("series_id", null)
    .order("position", { ascending: true })

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Заголовок бренду */}
        <div className="mb-12 flex flex-col items-center gap-6 md:flex-row">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg shadow-sm">
            <Image
              src={brand.logo_url || "/placeholder.svg?height=128&width=128&query=phone+brand+logo"}
              alt={brand.name}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{brand.name}</h1>
            <p className="mt-2 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("brandPageDescription", { brand: brand.name })}
            </p>
          </div>
        </div>

        {/* Розділ серій */}
        {brand.series && brand.series.length > 0 && (
          <>
            <h2 className="mb-6 text-2xl font-bold">{t("series") || "Series"}</h2>
            <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brand.series.map((series) => (
                <Link
                  key={series.id}
                  href={`/${locale}/series/${series.id}`}
                  className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium group-hover:text-primary">{series.name}</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{t("viewAllModels") || "View all models"}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Розділ моделей */}
        <h2 className="mb-6 text-2xl font-bold">
          {brand.series && brand.series.length > 0
            ? t("modelsWithoutSeries") || "Models without series"
            : t("availableModels") || "Available Models"}
        </h2>

        {modelsWithoutSeries && modelsWithoutSeries.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {modelsWithoutSeries.map((model) => (
              <Link
                href={`/${locale}/models/${model.id}`}
                key={model.id}
                className="flex flex-col items-center rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
              >
                <h3 className="text-lg font-medium">{model.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("startingFrom", { price: formatCurrency(model.base_price) })}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p>{t("noModelsAvailable", { brand: brand.name })}</p>
        )}
      </div>
    </div>
  )
}
