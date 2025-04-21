"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Brand {
  id: string
  name: string
  logo_url: string | null
  position?: number | null
}

interface BrandsSectionProps {
  brands: Brand[]
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  const t = useTranslations("Home")

  // Sort brands by position if available
  const sortedBrands = [...brands].sort((a, b) => {
    if (a.position !== null && a.position !== undefined && b.position !== null && b.position !== undefined) {
      return a.position - b.position
    }
    if (a.position !== null && a.position !== undefined) return -1
    if (b.position !== null && b.position !== undefined) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-8">{t("brandsWeService")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {sortedBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.id}`}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center h-32"
            >
              {brand.logo_url ? (
                <div className="relative h-16 w-full">
                  <Image src={brand.logo_url || "/placeholder.svg"} alt={brand.name} fill className="object-contain" />
                </div>
              ) : (
                <div className="h-16 w-full flex items-center justify-center">
                  <span className="text-lg font-medium">{brand.name}</span>
                </div>
              )}
              <span className="mt-2 text-sm text-center">{brand.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/brands">{t("viewAllBrands")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
