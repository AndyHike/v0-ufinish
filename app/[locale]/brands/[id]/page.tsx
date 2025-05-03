import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

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
  const { data: brand } = await supabase.from("brands").select("name").eq("id", id).single()

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
  const commonT = await getTranslations({ locale, namespace: "Common" })

  const supabase = createServerClient()

  // Fetch the brand
  const { data: brand, error: brandError } = await supabase.from("brands").select("*").eq("id", id).single()

  if (brandError || !brand) {
    console.error("Error fetching brand:", brandError)
    notFound()
  }

  // Fetch product lines for this brand
  const { data: productLines, error: productLinesError } = await supabase
    .from("product_lines")
    .select("*")
    .eq("brand_id", id)
    .order("position", { ascending: true })

  if (productLinesError) {
    console.error("Error fetching product lines:", productLinesError)
  }

  // For each product line, fetch models
  const productLinesWithModels = await Promise.all(
    (productLines || []).map(async (productLine) => {
      const { data: models } = await supabase
        .from("models")
        .select("*")
        .eq("product_line_id", productLine.id)
        .order("position", { ascending: true })

      return {
        ...productLine,
        models: models || [],
      }
    }),
  )

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Link href={`/${locale}/brands`} className="mb-8 flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("backToBrands")}
        </Link>

        <div className="mb-12 flex flex-col items-center gap-6 md:flex-row">
          {brand.logo_url && (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-white p-4">
              <Image
                src={brand.logo_url || "/placeholder.svg"}
                alt={brand.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{brand.name}</h1>
            <p className="mt-2 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("brandPageDescription", { brand: brand.name })}
            </p>
          </div>
        </div>

        {productLinesWithModels.length > 0 ? (
          <div className="grid gap-8">
            {productLinesWithModels.map((productLine) => (
              <Card key={productLine.id}>
                <CardHeader>
                  <CardTitle>{productLine.name}</CardTitle>
                  <CardDescription>
                    {t("selectModelFromProductLine", { productLine: productLine.name, brand: brand.name })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productLine.models && productLine.models.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {productLine.models.map((model) => (
                        <Link
                          key={model.id}
                          href={`/${locale}/models/${model.id}`}
                          className="group flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="relative mb-3 h-24 w-24 overflow-hidden">
                            <Image
                              src={model.image_url || "/placeholder.svg?height=96&width=96&query=phone"}
                              alt={model.name}
                              fill
                              className="object-contain transition-transform group-hover:scale-105"
                            />
                          </div>
                          <span className="text-center font-medium group-hover:text-primary">{model.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">{t("noModelsInProductLine")}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">{t("noProductLinesFound")}</h2>
            <p className="text-muted-foreground">{t("checkBackLater")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
