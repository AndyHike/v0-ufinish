"use client"

import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

type Brand = {
  id: string
  name: string
  logo_url: string | null
}

export default function BrandsPage() {
  const t = useTranslations("Brands")
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/admin/brands")
        if (response.ok) {
          const data = await response.json()
          setBrands(data)
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading brands...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.id}`}>
              <Card className="h-full transition-all hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="relative h-32 w-32 mb-4">
                    <Image
                      src={brand.logo_url || "/placeholder.svg?height=128&width=128&query=phone+brand+logo"}
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
      )}
    </div>
  )
}
