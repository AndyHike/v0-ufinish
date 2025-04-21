"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

type Brand = {
  id: string
  name: string
  logo_url: string | null
  position?: number | null
}

export function BrandsSection() {
  const t = useTranslations("Brands")
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBrands() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/brands")
        if (!response.ok) {
          throw new Error(`Failed to fetch brands: ${response.status}`)
        }
        const data = await response.json()

        // Sort brands by position first, then by name
        const sortedBrands = [...data].sort((a, b) => {
          if (a.position !== null && a.position !== undefined && b.position !== null && b.position !== undefined) {
            return a.position - b.position
          }
          if (a.position !== null && a.position !== undefined) return -1
          if (b.position !== null && b.position !== undefined) return 1
          return a.name.localeCompare(b.name)
        })

        setBrands(sortedBrands)
      } catch (error) {
        console.error("Error fetching brands:", error)
        setError("Failed to load brands. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  return (
    <section className="py-12 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl py-12">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <p>Loading brands...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-20 text-destructive">
              <p>{error}</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="flex justify-center items-center h-20">
              <p>No brands available.</p>
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {brands.map((brand) => (
                  <CarouselItem key={brand.id} className="md:basis-1/3 lg:basis-1/5">
                    <Link href={`/brands/${brand.id}`} className="block">
                      <div className="flex flex-col items-center justify-center p-4 h-32 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {brand.logo_url ? (
                          <div className="relative h-16 w-full">
                            <Image
                              src={brand.logo_url || "/placeholder.svg"}
                              alt={brand.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-full flex items-center justify-center">
                            <span className="text-lg font-medium">{brand.name}</span>
                          </div>
                        )}
                        <span className="mt-2 text-sm font-medium">{brand.name}</span>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          )}
        </div>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/brands">{t("allBrandsButton")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
