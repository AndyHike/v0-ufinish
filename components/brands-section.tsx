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
        setBrands(data)
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
                  <CarouselItem key={brand.id} className="md:basis-1/3 lg:basis-1/6">
                    <Link href={`/brands/${brand.id}`} className="block">
                      <div className="flex flex-col items-center justify-center p-4">
                        <div className="relative h-20 w-20">
                          <Image
                            src={brand.logo_url || "/placeholder.svg?height=80&width=80&query=phone+brand+logo"}
                            alt={brand.name}
                            fill
                            className="object-contain"
                          />
                        </div>
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
