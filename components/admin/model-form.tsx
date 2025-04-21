"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type Brand = {
  id: string
  name: string
}

type ModelFormProps = {
  modelId?: string
}

export function ModelForm({ modelId }: ModelFormProps) {
  const t = useTranslations("Admin")
  const router = useRouter()
  const { toast } = useToast()

  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [name, setName] = useState("")
  const [brandId, setBrandId] = useState("")
  const [year, setYear] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/admin/brands")
        if (!response.ok) throw new Error("Failed to fetch brands")

        const data = await response.json()
        setBrands(data)
      } catch (error) {
        console.error("Error fetching brands:", error)
        toast({
          title: t("error"),
          description: t("errorFetchingBrands"),
          variant: "destructive",
        })
      }
    }

    fetchBrands()
  }, [t, toast])

  // Fetch model data if editing
  useEffect(() => {
    const fetchModel = async () => {
      if (!modelId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/models/${modelId}`)

        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: t("error"),
              description: t("modelNotFound"),
              variant: "destructive",
            })
            router.push("/admin/models")
            return
          }
          throw new Error("Failed to fetch model")
        }

        const data = await response.json()

        setName(data.name)
        setBrandId(data.brand_id)
        setYear(data.year || "")
        setImageUrl(data.image_url || "")
      } catch (error) {
        console.error("Error fetching model:", error)
        toast({
          title: t("error"),
          description: t("errorFetchingModel"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchModel()
  }, [modelId, router, t, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !brandId) {
      toast({
        title: t("validationError"),
        description: t("nameAndBrandRequired"),
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const url = modelId ? `/api/admin/models/${modelId}` : "/api/admin/models"

      const method = modelId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          brandId,
          year: year || null,
          imageUrl: imageUrl || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to save model")

      toast({
        title: t("success"),
        description: modelId ? t("modelUpdatedSuccess") : t("modelAddedSuccess"),
      })

      router.push("/admin/models")
      router.refresh()
    } catch (error) {
      console.error("Error saving model:", error)
      toast({
        title: t("error"),
        description: modelId ? t("modelUpdatedError") : t("modelAddedError"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{modelId ? t("editModel") : t("addNewModel")}</CardTitle>
          <CardDescription>{modelId ? t("editModelDescription") : t("addNewModelDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("modelName")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("modelNamePlaceholder")}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brand">{t("brand")}</Label>
            <Select value={brandId} onValueChange={setBrandId} required>
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
            <Label htmlFor="year">{t("year")}</Label>
            <Input
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={t("yearPlaceholder")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageUrl">{t("imageUrl")}</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t("imageUrlPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{t("imageUrlDescription")}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/models")} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {modelId ? t("saveChanges") : t("addModel")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
