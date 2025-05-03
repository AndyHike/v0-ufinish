import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { createServerClient } from "@/utils/supabase/server"

export const metadata: Metadata = {
  title: "Brands - Mobile Phone Repair Service",
  description: "Browse all brands we service for mobile phone repairs",
}

export default async function BrandsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "Brands" })
  const commonT = await getTranslations({ locale, namespace: "Common" })

  const supabase = createServerClient()
  const { data: brands } = await supabase.from("brands").select("*").order("position", { ascending: true })

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("allBrands")}</h1>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("brandsPageDescription")}
          </p>
        </div>

        {brands && brands.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/${locale}/brands/${brand.id}`}
                className="group flex flex-col items-center rounded-lg border p-6 transition-colors hover:bg-muted/50"
              >
                <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-lg bg-white p-2">
                  <Image
                    src={brand.logo_url || "/placeholder.svg?height=80&width=80&query=brand+logo"}
                    alt={brand.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <h2 className="text-xl font-medium group-hover:text-primary">{brand.name}</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {t("viewModels", { brand: brand.name })}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">{t("noBrandsFound")}</h2>
            <p className="text-muted-foreground">{t("checkBackLater")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
