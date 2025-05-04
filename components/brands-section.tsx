"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Оновимо тип Brand, щоб включити серії
type Brand = {
  id: string
  name: string
  logo_url: string | null
  position: number | null
  series:
    | {
        id: string
        name: string
        position: number
      }[]
    | null
}

export function BrandsSection() {
  const t = useTranslations("BrandsSection")
  const locale = useLocale()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/brands")

        if (!response.ok) {
          throw new Error(`Failed to fetch brands: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched brands:", data)

        // Sort brands by position first, then by name
        const sortedBrands = [...data].sort((a, b) => {
          // If both have position, sort by position
          if (a.position !== null && b.position !== null) {
            return (a.position || 0) - (b.position || 0)
          }
          // If only one has position, prioritize the one with position
          if (a.position !== null) return -1
          if (b.position !== null) return 1
          // If neither has position, sort by name
          return a.name.localeCompare(b.name)
        })

        setBrands(sortedBrands)
      } catch (err) {
        console.error("Error fetching brands:", err)
        setError("Failed to load brands")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (error) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Determine if we should center the brands (when there are few)
  const shouldCenterBrands = brands.length <= 3

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4 mx-auto">
        <div className="relative mb-16 text-center">
          <div className="absolute left-1/2 top-0 -z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5"></div>
          <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("description")}</p>
          <div className="mt-4 mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-primary/30 to-primary/10"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : brands.length > 0 ? (
          <div className="relative max-w-4xl mx-auto">
            {/* Custom navigation arrows positioned outside the content */}
            {brands.length > 3 && (
              <button
                onClick={() => document.getElementById("brands-scroll")?.scrollBy(-200, 0)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md z-10 hidden md:flex hover:bg-gray-50 transition-colors"
                aria-label="Previous brands"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div id="brands-scroll" className="scrollbar-hide">
              <div
                className={`flex overflow-x-auto gap-6 pb-4 snap-x scrollbar-hide ${
                  shouldCenterBrands ? "justify-center" : ""
                }`}
                style={{ scrollBehavior: "smooth" }}
              >
                {brands.map((brand) => (
                  <div key={brand.id} className="flex-none w-[200px] snap-start">
                    <Link href={`/${locale}/brands/${brand.id}`}>
                      <div className="group h-36 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                          {brand.logo_url ? (
                            <div className="relative h-16 w-full transition-transform duration-300 group-hover:scale-110">
                              <Image
                                src={brand.logo_url || "/placeholder.svg"}
                                alt={brand.name}
                                width={120}
                                height={80}
                                className="object-contain mx-auto"
                                style={{ maxHeight: "100%", width: "auto" }}
                              />
                            </div>
                          ) : (
                            <div className="text-lg font-medium group-hover:text-primary transition-colors">
                              {brand.name}
                            </div>
                          )}
                          <span className="mt-2 text-sm text-center text-muted-foreground group-hover:text-primary transition-colors">
                            {brand.name}
                          </span>
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {brands.length > 3 && (
              <button
                onClick={() => document.getElementById("brands-scroll")?.scrollBy(200, 0)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md z-10 hidden md:flex hover:bg-gray-50 transition-colors"
                aria-label="Next brands"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">{t("noBrands")}</p>
        )}

        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            className="rounded-full px-8 py-6 shadow-md hover:shadow-lg transition-all bg-white hover:bg-slate-50"
          >
            <Link href={`/${locale}/brands`}>
              <span className="text-base">{t("allBrandsButton")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
