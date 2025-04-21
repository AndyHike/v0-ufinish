"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function BrandsSection() {
  const t = useTranslations("Brands")

  // Mock brands data - replace with actual data fetching in a real app
  const brands = [
    {
      id: "apple",
      name: "Apple",
      logo: "/bitten-fruit-silhouette.png",
    },
    {
      id: "samsung",
      name: "Samsung",
      logo: "/samsung-wordmark.png",
    },
    {
      id: "xiaomi",
      name: "Xiaomi",
      logo: "/xiaomi-logo-abstract.png",
    },
    {
      id: "huawei",
      name: "Huawei",
      logo: "/abstract-petal-design.png",
    },
  ]

  return (
    <section className="py-12 md:py-24" id="brands">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 py-12 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.id}`}>
              <Card className="h-full transition-all hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="relative h-24 w-24 mb-4">
                    <Image
                      src={brand.logo || "/placeholder.svg?height=96&width=96&query=phone+brand+logo"}
                      alt={brand.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center">{brand.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="/brands">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 py-2 px-4">
              {t("allBrandsButton")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
