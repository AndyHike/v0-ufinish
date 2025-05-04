import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import Link from "next/link"
import { formatCurrency } from "@/lib/format-currency"
import { ChevronRight, Smartphone } from "lucide-react"

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
    .select("id, name, image_url, base_price")
    .eq("brand_id", id)
    .is("series_id", null)
    .order("position", { ascending: true })

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Сучасний заголовок бренду */}
        <div className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-md">
          <div className="relative">
            {/* Фонові елементи */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20"></div>
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 p-8 md:flex-row md:p-10">
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-white p-4 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-80"></div>
                <Image
                  src={brand.logo_url || "/placeholder.svg?height=128&width=128&query=phone+brand+logo"}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-center text-3xl font-bold tracking-tighter md:text-left sm:text-4xl md:text-5xl">
                  {brand.name}
                </h1>
                <p className="mt-3 max-w-[900px] text-center text-muted-foreground md:text-left md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("brandPageDescription", { brand: brand.name })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Сучасний розділ серій */}
        {brand.series && brand.series.length > 0 && (
          <>
            <h2 className="mb-6 text-2xl font-bold">{t("series") || "Series"}</h2>
            <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brand.series.map((series) => (
                <Link
                  key={series.id}
                  href={`/${locale}/series/${series.id}`}
                  className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Фонові елементи */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50"></div>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/30 to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                  {/* Вміст */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-medium transition-colors group-hover:text-primary">{series.name}</h3>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{t("viewAllModels") || "View all models"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Сучасний розділ моделей */}
        <h2 className="mb-6 text-2xl font-bold">
          {brand.series && brand.series.length > 0
            ? t("modelsWithoutSeries") || "Models without series"
            : t("availableModels") || "Available Models"}
        </h2>

        {modelsWithoutSeries && modelsWithoutSeries.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {modelsWithoutSeries.map((model) => (
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
            <p className="text-muted-foreground">{t("noModelsAvailable", { brand: brand.name })}</p>
          </div>
        )}
      </div>
    </div>
  )
}
