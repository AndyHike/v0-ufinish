"use client"

import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type Brand = {
  id: string
  name: string
  logo_url: string | null
}

type Model = {
  id: string
  name: string
  brand_id: string
  image_url: string | null
}

export default function BrandDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations("Brands")
  const [brand, setBrand] = useState<Brand | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrandAndModels() {
      try {
        // Fetch brand details
        const brandResponse = await fetch(`/api/admin/brands/${params.id}`)
        if (brandResponse.ok) {
          const brandData = await brandResponse.json()
          setBrand(brandData)
        }

        // Fetch models for this brand
        const modelsResponse = await fetch(`/api/admin/models?brand_id=${params.id}`)
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json()
          setModels(modelsData)
        }
      } catch (error) {
        console.error("Error fetching brand details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrandAndModels()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-40">
          <p>Loading brand details...</p>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Brand not found</h1>
          <p className="mt-4 text-xl text-muted-foreground">The brand you're looking for doesn't exist.</p>
          <Button asChild className="mt-6">
            <Link href="/brands">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all brands
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/brands">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all brands
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row items-center mb-12 gap-6">
        <div className="relative h-40 w-40 md:h-48 md:w-48">
          <Image
            src={brand.logo_url || "/placeholder.svg?height=192&width=192&query=phone+brand+logo"}
            alt={brand.name}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold">{brand.name}</h1>
          <p className="mt-4 text-xl text-muted-foreground">{t("brandModelsDescription", { brand: brand.name })}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">{t("availableModels")}</h2>

      {models.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-lg">{t("noModelsAvailable", { brand: brand.name })}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {models.map((model) => (
            <Card key={model.id} className="h-full transition-all hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="relative h-32 w-32 mb-4">
                  <Image
                    src={model.image_url || "/placeholder.svg?height=128&width=128&query=phone+model"}
                    alt={model.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center">{model.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
