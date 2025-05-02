"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type Brand = {
  id: string
  name: string
  logo_url: string | null
}

export default function BrandsPage() {
  const t = useTranslations("Brands")
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/brands")
        if (!response.ok) {
          throw new Error("Failed to fetch brands")
        }
        const data = await response.json()
        setBrands(data)
        setFilteredBrands(data)
      } catch (error) {
        console.error("Error fetching brands:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // Фільтрація брендів при зміні пошукового запиту
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBrands(brands)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = brands.filter((brand) => brand.name.toLowerCase().includes(query))
      setFilteredBrands(filtered)
    }
  }, [searchQuery, brands])

  if (loading) {
    return (
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <Skeleton className="mb-2 h-10 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mb-2 h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("chooseModelTitle")}</h1>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("chooseModelDescription")}
          </p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchBrands")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredBrands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full">
                        <Image
                          src={brand.logo_url || "/placeholder.svg?height=64&width=64&query=brand"}
                          alt={brand.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <h3 className="text-center font-medium">{brand.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h2 className="mb-2 text-xl font-medium">{t("noBrands")}</h2>
            <p className="text-muted-foreground">{t("checkBackLater")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
