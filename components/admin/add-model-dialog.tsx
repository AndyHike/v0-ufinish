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
import { useAsyncAction } from "@/hooks/use-async-action"

type Brand = {
  id: string
  name: string
}

type Series = {
  id: string
  name: string
  brand_id: string
}

export function AddModelDialog({
  isOpen,
  onClose,
  onModelAdded,
}: {
  isOpen: boolean
  onClose: () => void
  onModelAdded: () => void
}) {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [brands, setBrands] = useState<Brand[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedSeries, setSelectedSeries] = useState<string>("_none")
  const [modelName, setModelName] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const { execute: executeAddModel, isLoading } = useAsyncAction({
    successMessage: t("modelAddedSuccess"),
    errorMessage: t("modelAddedError"),
    onSuccess: () => {
      resetForm()
      onClose()
      onModelAdded()
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchBrands()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedBrand) {
      fetchSeries(selectedBrand)
    } else {
      setSeries([])
      setSelectedSeries("_none")
    }
  }, [selectedBrand])

  async function fetchBrands() {
    try {
      const response = await fetch("/api/admin/brands")
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      })
    }
  }

  async function fetchSeries(brandId: string) {
    try {
      const response = await fetch(`/api/admin/series?brand_id=${brandId}`)
      const data = await response.json()
      setSeries(data)
    } catch (error) {
      console.error("Error fetching series:", error)
      toast({
        title: "Error",
        description: "Failed to fetch series",
        variant: "destructive",
      })
    }
  }

  async function handleAddModel() {
    if (!modelName || !selectedBrand) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    await executeAddModel(async () => {
      const response = await fetch("/api/admin/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
          brandId: selectedBrand,
          seriesId: selectedSeries === "_none" ? null : selectedSeries,
          imageUrl: imageUrl || null,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add model")
      }

      return response.json()
    })
  }

  function resetForm() {
    setModelName("")
    setSelectedBrand("")
    setSelectedSeries("_none")
    setImageUrl("")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isLoading && !open) {
          onClose()
          resetForm()
        }
      }}
    >
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t("addModel")}</DialogTitle>
          <DialogDescription>{t("addModelDescription")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="model-name">{t("modelName")}</Label>
            <Input
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={t("modelNamePlaceholder")}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand">{t("brand")}</Label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={isLoading}>
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
            <Select value={selectedSeries} onValueChange={setSelectedSeries} disabled={isLoading || !selectedBrand}>
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
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">{t("noSeriesForBrand")}</div>
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
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddModel} disabled={isLoading}>
            {isLoading ? t("adding") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
