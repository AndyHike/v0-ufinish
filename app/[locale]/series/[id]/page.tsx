"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ModelsList } from "@/components/admin/models-list"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Series = {
  id: string
  name: string
  brand_id: string
  brands: {
    name: string
  }
}

export default function SeriesModelsPage() {
  const t = useTranslations("Admin")
  const params = useParams()
  const seriesId = params.id as string
  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSeries() {
      try {
        const response = await fetch(`/api/admin/series/${seriesId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch series")
        }
        const data = await response.json()
        setSeries(data)
      } catch (error) {
        console.error("Error fetching series:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [seriesId])

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
          {t("modelsForSeries", { series: series?.name || "_unknown" })}
        </h1>
        <p className="text-muted-foreground">
          {t("modelsForSeriesDescription", {
            series: series?.name || "_unknown",
            brand: series?.brands?.name || "_unknown",
          })}
        </p>
      </div>

      <ModelsList seriesId={seriesId} />
    </div>
  )
}
