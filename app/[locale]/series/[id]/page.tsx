"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft } from "lucide-react"

type Series = {
  id: string
  name: string
  brand_id: string
  brands: {
    id: string
    name: string
    logo_url: string | null
  }
}

type Model = {
  id: string
  name: string
  brand_id: string
  series_id: string
  image_url: string | null
}

export default function SeriesModelsPage() {
  const t = useTranslations("Brands")
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string
  const [series, setSeries] = useState<Series | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch series
        const seriesResponse = await fetch(`/api/admin/series/${seriesId}`)
        if (!seriesResponse.ok) {
          throw new Error("Failed to fetch series")
        }
        const seriesData = await seriesResponse.json()
        setSeries(seriesData)

        // Fetch models for this series
        const modelsResponse = await fetch(`/api/admin/models?series_id=${seriesId}`)
        if (!modelsResponse.ok) {
          throw new Error("Failed to fetch models")
        }
        const modelsData = await modelsResponse.json()
        setModels(modelsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [seriesId])

  if (loading) {
    return (
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="mb-8">
            <Skeleton className="mb-2 h-10 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="mb-8">
            <Skeleton className="mb-4 h-6 w-48" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4">
                      <Skeleton className="mb-2 h-4 w-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">{t("seriesNotFound")}</h1>
          <p className="mt-4">{t("seriesNotFoundDesc")}</p>
          <Button asChild className="mt-6">
            <Link href="/brands">{t("backToAllBrands")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/brands/${series.brand_id}`}
          className="mb-8 flex items-center text-muted-foreground hover:text-foreground"
          aria-label={t("backToBrand", { brand: series.brands?.name })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("backToBrand", { brand: series.brands?.name })}
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            {series.brands?.logo_url && (
              <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                <Image
                  src={series.brands.logo_url || "/placeholder.svg"}
                  alt={series.brands.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">{series.brands?.name}</div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{series.name}</h1>
            </div>
          </div>
          <p className="mt-4 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("seriesPageDescription", { series: series.name, brand: series.brands?.name })}
          </p>
        </div>

        <h2 className="mb-6 text-2xl font-bold">{t("availableModels")}</h2>

        {models.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {models.map((model) => (
              <Link key={model.id} href={`/models/${model.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                      <Image
                        src={model.image_url || "/placeholder.svg?height=200&width=200&query=phone"}
                        alt={model.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{model.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h2 className="mb-2 text-xl font-medium">
              {t("noModelsAvailable", { brand: `${series.brands?.name} ${series.name}` })}
            </h2>
            <p className="text-muted-foreground">{t("checkBackLater")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
