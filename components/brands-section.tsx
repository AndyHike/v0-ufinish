"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

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
        const response = await fetch("/api/brands")
        if (!response.ok) {
          throw new Error("Failed to fetch brands")
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
        setError("Failed to load brands")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p>{t("loading")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">{t("title")}</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">{t("subtitle")}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.id}`}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-32"
            >
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url || "/placeholder.svg"}
                  alt={brand.name}
                  width={100}
                  height={60}
                  className="max-h-20 w-auto object-contain"
                />
              ) : (
                <span className="text-lg font-medium text-center">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
