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
import { X } from "lucide-react"

type Brand = {
  id: string
  name: string
}

type ProductLine = {
  id: string
  name: string
  brand_id: string
}

interface AddModelDialogProps {
  isOpen: boolean
  onClose: () => void
  onModelAdded: () => void
  productLineId?: string
}

export function AddModelDialog({ isOpen, onClose, onModelAdded, productLineId }: AddModelDialogProps) {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [brands, setBrands] = useState<Brand[]>([])
  const [productLines, setProductLines] = useState<ProductLine[]>([])
  const [loading, setLoading] = useState(false)
  const [newModel, setNewModel] = useState({
    name: "",
    brandId: "",
    productLineId: productLineId || "",
    imageUrl: "",
  })
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      fetchBrands()
      if (productLineId) {
        setNewModel((prev) => ({ ...prev, productLineId }))
        fetchProductLineDetails(productLineId)
      }
    }
  }, [isOpen, productLineId])

  useEffect(() => {
    if (selectedBrandId) {
      fetchProductLinesByBrand(selectedBrandId)
    } else {
      setProductLines([])
    }
  }, [selectedBrandId])

  async function fetchBrands() {
    try {
      const response = await fetch("/api/admin/brands")
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

  async function fetchProductLinesByBrand(brandId: string) {
    try {
      const response = await fetch(`/api/admin/product-lines?brand_id=${brandId}`)
      const data = await response.json()
      setProductLines(data)
    } catch (error) {
      console.error("Error fetching product lines:", error)
      toast({
        title: t("error"),
        description: t("errorFetchingProductLines") || "Failed to fetch product lines",
        variant: "destructive",
      })
    }
  }

  async function fetchProductLineDetails(productLineId: string) {
    try {
      const response = await fetch(`/api/admin/product-lines/${productLineId}`)
      const data = await response.json()
      setSelectedBrandId(data.brand_id)
      setNewModel((prev) => ({ ...prev, brandId: data.brand_id }))
    } catch (error) {
      console.error("Error fetching product line details:", error)
    }
  }

  async function handleAddModel() {
    if (!newModel.name || !newModel.productLineId) {
      toast({
        title: t("validationError"),
        description: t("nameAndProductLineRequired") || "Name and product line are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newModel,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add model")
      }

      setNewModel({ name: "", brandId: "", productLineId: productLineId || "", imageUrl: "" })
      onModelAdded()
      onClose()

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
      setLoading(false)
    }
  }

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId)
    setNewModel((prev) => ({ ...prev, brandId, productLineId: "" }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addNewModel")}</DialogTitle>
          <DialogDescription>{t("addNewModelDescription")}</DialogDescription>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="model-name">{t("modelName")}</Label>
            <Input
              id="model-name"
              value={newModel.name}
              onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              placeholder={t("modelNamePlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand">{t("brand")}</Label>
            <Select value={selectedBrandId} onValueChange={handleBrandChange} disabled={!!productLineId}>
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
            <Label htmlFor="product-line">{t("productLine") || "Product Line"}</Label>
            <Select
              value={newModel.productLineId}
              onValueChange={(value) => setNewModel({ ...newModel, productLineId: value })}
              disabled={!selectedBrandId || !!productLineId}
            >
              <SelectTrigger id="product-line">
                <SelectValue placeholder={t("selectProductLine") || "Select product line"} />
              </SelectTrigger>
              <SelectContent>
                {productLines.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image-url">{t("imageUrl")}</Label>
            <Input
              id="image-url"
              value={newModel.imageUrl}
              onChange={(e) => setNewModel({ ...newModel, imageUrl: e.target.value })}
              placeholder={t("imageUrlPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddModel} disabled={loading}>
            {loading ? t("processing") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
