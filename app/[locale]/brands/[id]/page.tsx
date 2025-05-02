"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ModelsList } from "@/components/admin/models-list"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Brand = {
  id: string
  name: string
}

export default function BrandModelsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">
          {t("modelsForBrand", { brand: brand?.name || "_unknown" })}
        </h1>
        <p className="text-muted-foreground">{t("modelsForBrandDescription", { brand: brand?.name || "_unknown" })}</p>
      </div>

      <ModelsList brandId={brandId} />
    </div>
  )
}
