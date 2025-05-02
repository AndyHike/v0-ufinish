"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

type Brand = {
  id: string
  name: string
}

type Series = {
  id: string
  name: string
  brand_id: string
}

interface AddModelDialogProps {
  isOpen: boolean
  onClose: () => void
  onModelAdded: () => void
}

export function AddModelDialog({ isOpen, onClose, onModelAdded }: AddModelDialogProps) {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [brands, setBrands] = useState<Brand[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [brandId, setBrandId] = useState("")
  const [seriesId, setSeriesId] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  // Завантажуємо бренди при відкритті діалогу
  useEffect(() => {
    if (isOpen) {
      fetchBrands()
      // Скидаємо стан форми при відкритті
      resetForm()
    }
  }, [isOpen])

  // Завантажуємо серії при зміні бренду
  useEffect(() => {
    if (brandId) {
      fetchSeries(brandId)
    } else {
      setSeries([])
      setSeriesId("")
    }
  }, [brandId])

  function resetForm() {
    setName("")
    setBrandId("")
    setSeriesId("")
    setImageUrl("")
  }

  async function fetchBrands() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/brands")
      const data = await response.json()
      setBrands(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching brands:", error)
      setLoading(false)
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

  async function handleAddModel() {
    if (!name || !brandId) {
      toast({
        title: t("validationError"),
        description: t("nameAndBrandRequired"),
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Підготуємо дані для відправки
      const modelData = {
        name,
        brandId,
        seriesId: seriesId === "_none" ? "" : seriesId,
        imageUrl,
        userId: session?.user?.id,
      }

      const response = await fetch("/api/admin/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modelData),
      })

      if (!response.ok) {
        throw new Error("Failed to add model")
      }

      // Закриваємо діалог
      onClose()

      // Оновлюємо список моделей
      onModelAdded()

      toast({
        title: t("success"),
        description: t("modelAddedSuccess"),
      })
    } catch (error) {
      console.error("Error adding model:", error)
      toast({
        title: t("error"),
        description: t("modelAddedError"),
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addNewModel")}</DialogTitle>
          <DialogDescription>{t("addNewModelDescription")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="model-name">{t("modelName")}</Label>
            <Input
              id="model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("modelNamePlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand">{t("brand")}</Label>
            <Select value={brandId} onValueChange={setBrandId}>
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
            <Label htmlFor="series">{t("series") || "Series"}</Label>
            <Select value={seriesId} onValueChange={setSeriesId} disabled={!brandId}>
              <SelectTrigger id="series">
                <SelectValue placeholder={t("selectSeries") || "Select Series"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">{t("noSeries") || "No Series"}</SelectItem>
                {series.length > 0 ? (
                  series.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_no_series_available" disabled>
                    {t("noSeriesAvailable") || "No series available for this brand"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image-url">{t("imageUrl")}</Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t("imageUrlPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddModel} disabled={submitting}>
            {submitting ? t("processing") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
