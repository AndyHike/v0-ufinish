import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { createServerClient } from "@/utils/supabase/server"
import { Skeleton } from "@/components/ui/skeleton"

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "Brands" })

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  }
}

export default async function BrandsPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Brands" })
  const supabase = createServerClient()
  const locale = params.locale

  // Fetch brands ordered by position
  const { data: brands, error } = await supabase.from("brands").select("*").order("position", { ascending: true })
  const loading = !brands && !error

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("description")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton className="h-32 w-32 rounded-xl" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/${locale}/brands/${brand.id}`} className="group flex flex-col items-center">
                <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-xl bg-white p-4 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50"></div>
                  {brand.logo_url ? (
                    <div className="relative z-10 h-full w-full">
                      <Image
                        src={brand.logo_url || "/placeholder.svg"}
                        alt={brand.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                      <span className="text-2xl font-medium text-gray-400">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/30 to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>
                <h2 className="text-lg font-medium group-hover:text-primary transition-colors">{brand.name}</h2>
                <div className="mt-2 h-0.5 w-0 bg-primary/30 transition-all duration-300 group-hover:w-12"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-muted-foreground">{t("noBrands")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
