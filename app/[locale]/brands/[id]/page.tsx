import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
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
  const { data: brand, error: brandError } = await supabase.from("brands").select("*").eq("id", id).single()

  if (brandError || !brand) {
    notFound()
  }

  // Fetch models for this brand
  const { data: models } = await supabase.from("models").select("*").eq("brand_id", id).order("name")

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex flex-col items-center gap-6 md:flex-row">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg">
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

        <h2 className="mb-6 text-2xl font-bold">{t("availableModels")}</h2>

        {models && models.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {models.map((model) => (
              <div key={model.id} className="flex flex-col items-center rounded-lg border p-4 shadow-sm">
                <h3 className="text-lg font-medium">{model.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("startingFrom", { price: model.base_price })}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>{t("noModelsAvailable", { brand: brand.name })}</p>
        )}
      </div>
    </div>
  )
}
