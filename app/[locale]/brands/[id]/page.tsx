import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
import { ArrowRight, Smartphone } from "lucide-react"

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
      <div className="mx-auto max-w-6xl">
        {/* Заголовок бренду */}
        <div className="mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg md:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="relative h-36 w-36 overflow-hidden rounded-2xl bg-white p-4 shadow-md md:h-40 md:w-40">
              <Image
                src={brand.logo_url || "/placeholder.svg?height=160&width=160&query=phone+brand+logo"}
                alt={brand.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-center text-4xl font-bold tracking-tight md:text-left md:text-5xl lg:text-6xl">
                {brand.name}
              </h1>
              <p className="mt-4 max-w-[900px] text-center text-lg text-slate-600 md:text-left md:text-xl">
                {t("brandPageDescription", { brand: brand.name })}
              </p>
            </div>
          </div>
        </div>

        {/* Розділ серій */}
        {brand.series && brand.series.length > 0 && (
          <div className="mb-20">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold">{t("series") || "Series"}</h2>
              <div className="h-1 flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6"></div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {brand.series.map((series) => (
                <Link
                  key={series.id}
                  href={`/${locale}/series/${series.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Декоративні елементи */}
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-100 opacity-50"></div>
                  <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-slate-100 opacity-30"></div>

                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-2xl font-semibold transition-colors group-hover:text-primary">
                        {series.name}
                      </h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-md transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-slate-600">{t("viewAllModels") || "View all models"}</p>

                    <div className="mt-6 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Розділ моделей */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              {brand.series && brand.series.length > 0
                ? t("modelsWithoutSeries") || "Models without series"
                : t("availableModels") || "Available Models"}
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6"></div>
          </div>

          {modelsWithoutSeries && modelsWithoutSeries.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {modelsWithoutSeries.map((model) => (
                <Link
                  href={`/${locale}/models/${model.id}`}
                  key={model.id}
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
                  {model.base_price && (
                    <p className="mt-2 text-sm text-slate-500">
                      {t("startingFrom", { price: formatCurrency(model.base_price) })}
                    </p>
                  )}
                  <div className="mt-4 h-0.5 w-0 bg-primary/30 transition-all duration-300 group-hover:w-16"></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-lg text-slate-500">{t("noModelsAvailable", { brand: brand.name })}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
