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

interface AddProductLineDialogProps {
  isOpen: boolean
  onClose: () => void
  onProductLineAdded: () => void
  brandId?: string
}

export function AddProductLineDialog({ isOpen, onClose, onProductLineAdded, brandId }: AddProductLineDialogProps) {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [newProductLine, setNewProductLine] = useState({ name: "", brandId: brandId || "" })

  useEffect(() => {
    if (isOpen) {
      fetchBrands()
      if (brandId) {
        setNewProductLine((prev) => ({ ...prev, brandId }))
      }
    }
  }, [isOpen, brandId])

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

  async function handleAddProductLine() {
    if (!newProductLine.name || !newProductLine.brandId) {
      toast({
        title: t("validationError"),
        description: t("nameAndBrandRequired"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/product-lines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProductLine,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add product line")
      }

      setNewProductLine({ name: "", brandId: brandId || "" })
      onProductLineAdded()
      onClose()

      toast({
        title: t("success"),
        description: t("productLineAddedSuccess") || "Product line added successfully",
      })
    } catch (error) {
      console.error("Error adding product line:", error)
      toast({
        title: t("error"),
        description: t("productLineAddedError") || "Failed to add product line",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addNewProductLine") || "Add New Product Line"}</DialogTitle>
          <DialogDescription>
            {t("addNewProductLineDescription") || "Add a new product line to the catalog"}
          </DialogDescription>
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
            <Label htmlFor="product-line-name">{t("productLineName") || "Product Line Name"}</Label>
            <Input
              id="product-line-name"
              value={newProductLine.name}
              onChange={(e) => setNewProductLine({ ...newProductLine, name: e.target.value })}
              placeholder={t("productLineNamePlaceholder") || "Enter product line name"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand">{t("brand")}</Label>
            <Select
              value={newProductLine.brandId}
              onValueChange={(value) => setNewProductLine({ ...newProductLine, brandId: value })}
              disabled={!!brandId}
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAddProductLine} disabled={loading}>
            {loading ? t("processing") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
