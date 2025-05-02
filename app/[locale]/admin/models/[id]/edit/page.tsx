"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type Brand = {
  id: string
  name: string
}

type Series = {
  id: string
  name: string
  brand_id: string
}

type Model = {
  id: string
  name: string
  brand_id: string
  series_id: string | null
  image_url: string | null
}

export default function EditModelPage({ params }: { params: { id: string } }) {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()
  const [model, setModel] = useState<Model | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([fetchModel(), fetchBrands()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (model?.brand_id) {
      fetchSeries(model.brand_id)
    }
  }, [model?.brand_id])

  async function fetchModel() {
    try {
      const response = await fetch(`/api/admin/models/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch model")
      const data = await response.json()
      setModel(data)
    } catch (error) {
      console.error("Error fetching model:", error)
      toast({
        title: t("error"),
        description: t("errorFetchingModel"),
        variant: "destructive",
      })
    }
  }

  async function fetchBrands() {
    try {
      const response = await fetch("/api/admin/brands")
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
    }
  }

  async function fetchSeries(brandId: string) {
    try {
      const response = await fetch(`/api/admin/series?brand_id=${brandId}`)
      const data = await response.json()
      setSeries(data)
    } catch (error) {
      console.error("Error fetching series:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!model) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/models/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: model.name,
          brandId: model.brand_id,
          seriesId: model.series_id === "_none" ? null : model.series_id,
          imageUrl: model.image_url,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update model")
      }

      toast({
        title: t("success"),
        description: t("modelUpdatedSuccess"),
      })

      // Перенаправляємо на сторінку моделей
      router.push("/admin/models")
    } catch (error) {
      console.error("Error updating model:", error)
      toast({
        title: t("error"),
        description: t("modelUpdatedError"),
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t("loading")}</p>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl mb-4">{t("modelNotFound")}</p>
        <Button asChild>
          <Link href="/admin/models">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToModels")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("editModel")}</h1>
          <p className="text-muted-foreground">{t("editModelDescription")}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/models">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToModels")}
          </Link>
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{t("editModel")}</CardTitle>
            <CardDescription>{t("editModelDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("modelName")}</Label>
              <Input
                id="name"
                value={model.name}
                onChange={(e) => setModel({ ...model, name: e.target.value })}
                placeholder={t("modelNamePlaceholder")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brand">{t("brand")}</Label>
              <Select
                value={model.brand_id}
                onValueChange={(value) => {
                  setModel({ ...model, brand_id: value, series_id: null })
                }}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder={t("selectBrand")} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="series">{t("series")}</Label>
              <Select
                value={model.series_id || "_none"}
                onValueChange={(value) => setModel({ ...model, series_id: value === "_none" ? null : value })}
              >
                <SelectTrigger id="series">
                  <SelectValue placeholder={t("selectSeries")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">{t("noSeries")}</SelectItem>
                  {series.length > 0 ? (
                    series.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_no_series_available" disabled>
                      {t("noSeriesAvailable")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">{t("image")}</Label>
              <Input
                id="image"
                value={model.image_url || ""}
                onChange={(e) => setModel({ ...model, image_url: e.target.value })}
                placeholder={t("imageUrlPlaceholder")}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/models">{t("cancel")}</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("processing") : t("save")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
