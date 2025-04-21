"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

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
          console.error("Failed to fetch brands:", response.status, response.statusText)
          throw new Error(`Failed to fetch brands: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched brands:", data)

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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">{t("loading")}</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">{error}</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No brands available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center h-32"
              >
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
                <span className="mt-2 text-sm text-center">{brand.name}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/brands">{t("allBrandsButton")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
