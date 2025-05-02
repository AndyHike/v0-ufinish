"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { SeriesList } from "@/components/admin/series-list"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Brand = {
  id: string
  name: string
}

export default function BrandSeriesPage() {
  const t = useTranslations("Admin")
  const params = useParams()
  const brandId = params.id as string
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrand() {
      try {
        const response = await fetch(`/api/admin/brands/${brandId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch brand")
        }
        const data = await response.json()
        setBrand(data)
      } catch (error) {
        console.error("Error fetching brand:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrand()
  }, [brandId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("seriesForBrand", { brand: brand?.name || "" })}</h1>
        <p className="text-muted-foreground">{t("manageSeriesForBrand", { brand: brand?.name || "" })}</p>
      </div>

      <SeriesList brandId={brandId} />
    </div>
  )
}
