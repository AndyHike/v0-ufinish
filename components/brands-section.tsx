"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Brand {
  id: string
  name: string
  logo_url: string
  position?: number | null
}

export function BrandsSection() {
  const t = useTranslations("Brands")
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchBrands() {
      try {
        setLoading(true)
        const response = await fetch("/api/brands")
        if (!response.ok) {
          throw new Error(`Failed to fetch brands: ${response.status}`)
        }
        const data = await response.json()
        setBrands(data)
      } catch (err) {
        console.error("Error fetching brands:", err)
        setError(err instanceof Error ? err.message : "Failed to load brands")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const visibleBrands = brands.slice(currentIndex, currentIndex + 5)
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex + 5 < brands.length

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const scrollRight = () => {
    if (canScrollRight) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">{t("title")}</h2>
          <p className="text-center text-gray-500">{t("loading")}</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">{t("title")}</h2>
          <p className="text-center text-red-500">{t("error")}</p>
        </div>
      </section>
    )
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-8">{t("title")}</h2>
        <p className="text-center text-gray-600 mb-10">{t("subtitle")}</p>

        <div className="relative">
          <div className="flex items-center justify-center gap-8 mb-8">
            {visibleBrands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.id}`} className="flex flex-col items-center group">
                <div className="w-24 h-24 relative mb-2 transition-transform group-hover:scale-110">
                  <Image src={brand.logo_url || "/placeholder.svg"} alt={brand.name} fill className="object-contain" />
                </div>
                <span className="text-center font-medium">{brand.name}</span>
              </Link>
            ))}
          </div>

          {brands.length > 5 && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label={t("previous")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                disabled={!canScrollRight}
                aria-label={t("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/brands" passHref>
            <Button variant="outline">{t("viewAll")}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
