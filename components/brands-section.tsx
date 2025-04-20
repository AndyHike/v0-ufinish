"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export function BrandsSection() {
  const t = useTranslations("Brands")

  const brands = [
    { name: "Apple", logo: "/bitten-fruit-silhouette.png" },
    { name: "Samsung", logo: "/samsung-wordmark.png" },
    { name: "Xiaomi", logo: "/xiaomi-logo-abstract.png" },
    { name: "Huawei", logo: "/abstract-petal-design.png" },
    { name: "Google", logo: "/placeholder.svg?height=80&width=80&query=google+logo" },
    { name: "OnePlus", logo: "/placeholder.svg?height=80&width=80&query=oneplus+logo" },
  ]

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
          <Carousel className="w-full">
            <CarouselContent>
              {brands.map((brand, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/6">
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="relative h-20 w-20">
                      <Image src={brand.logo || "/placeholder.svg"} alt={brand.name} fill className="object-contain" />
                    </div>
                    <span className="mt-2 text-sm font-medium">{brand.name}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
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
