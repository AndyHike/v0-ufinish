"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface Brand {
  id: string
  name: string
  logo_url: string
  position: number
}

export function BrandsSection() {
  const t = useTranslations("BrandsSection")
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
            return a.position - b.position
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

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">{t("title")}</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">{t("description")}</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center justify-center">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : brands.length > 0 ? (
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {brands.map((brand) => (
                <CarouselItem key={brand.id} className="md:basis-1/3 lg:basis-1/4">
                  <Link href={`/brands/${brand.id}`}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-6 flex items-center justify-center h-32">
                        {brand.logo_url ? (
                          <Image
                            src={brand.logo_url || "/placeholder.svg"}
                            alt={brand.name}
                            width={120}
                            height={80}
                            className="max-h-16 w-auto object-contain"
                          />
                        ) : (
                          <div className="text-lg font-medium">{brand.name}</div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        ) : (
          <p className="text-center text-gray-500">{t("noBrands")}</p>
        )}
      </div>
    </section>
  )
}
