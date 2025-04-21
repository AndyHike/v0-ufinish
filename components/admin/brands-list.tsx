"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Brand {
  id: string
  name: string
  logo_url: string | null
  position: number | null
}

interface BrandsListProps {
  brands: Brand[]
}

export function BrandsList({ brands: initialBrands }: BrandsListProps) {
  const t = useTranslations("Admin.brands")
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>(initialBrands)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [newBrandName, setNewBrandName] = useState("")
  const [newBrandLogo, setNewBrandLogo] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reorderLoading, setReorderLoading] = useState<string | null>(null)

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrandName.trim()) return

    setIsSubmitting(true)

    try {
      let logoUrl = null

      if (newBrandLogo) {
        const formData = new FormData()
        formData.append("file", newBrandLogo)

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload logo")
        }

        const { url } = await uploadResponse.json()
        logoUrl = url
      }

      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newBrandName,
          logo_url: logoUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add brand")
      }

      const newBrand = await response.json()
      setBrands([...brands, newBrand])
      setNewBrandName("")
      setNewBrandLogo(null)
      setIsAddDialogOpen(false)
      toast.success(t("addSuccess"))
      router.refresh()
    } catch (error) {
      console.error("Error adding brand:", error)
      toast.error(t("addError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/brands/${brandToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete brand")
      }

      setBrands(brands.filter((brand) => brand.id !== brandToDelete.id))
      setIsDeleteDialogOpen(false)
      setBrandToDelete(null)
      toast.success(t("deleteSuccess"))
      router.refresh()
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast.error(t("deleteError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewBrandLogo(e.target.files[0])
    }
  }

  const handleMoveUp = async (brandId: string) => {
    setReorderLoading(brandId)
    try {
      const currentIndex = brands.findIndex((brand) => brand.id === brandId)
      if (currentIndex <= 0) return

      // Optimistic update
      const updatedBrands = [...brands]
      const temp = updatedBrands[currentIndex]
      updatedBrands[currentIndex] = updatedBrands[currentIndex - 1]
      updatedBrands[currentIndex - 1] = temp
      setBrands(updatedBrands)

      // Update positions on server
      const response = await fetch("/api/admin/brands/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandId,
          direction: "up",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder brands")
      }

      toast.success(t("reorderSuccess"))
    } catch (error) {
      console.error("Error reordering brands:", error)
      toast.error(t("reorderError"))
      // Revert optimistic update on error
      router.refresh()
    } finally {
      setReorderLoading(null)
    }
  }

  const handleMoveDown = async (brandId: string) => {
    setReorderLoading(brandId)
    try {
      const currentIndex = brands.findIndex((brand) => brand.id === brandId)
      if (currentIndex >= brands.length - 1) return

      // Optimistic update
      const updatedBrands = [...brands]
      const temp = updatedBrands[currentIndex]
      updatedBrands[currentIndex] = updatedBrands[currentIndex + 1]
      updatedBrands[currentIndex + 1] = temp
      setBrands(updatedBrands)

      // Update positions on server
      const response = await fetch("/api/admin/brands/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandId,
          direction: "down",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder brands")
      }

      toast.success(t("reorderSuccess"))
    } catch (error) {
      console.error("Error reordering brands:", error)
      toast.error(t("reorderError"))
      // Revert optimistic update on error
      router.refresh()
    } finally {
      setReorderLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h2 className="text-xl font-semibold">{t("listTitle")}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("addButton")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addDialogTitle")}</DialogTitle>
              <DialogDescription>{t("addDialogDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBrand}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("nameLabel")}</Label>
                  <Input id="name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo">{t("logoLabel")}</Label>
                  <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("cancelButton")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("addingButton") : t("addButton")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("logoHeader")}</TableHead>
              <TableHead>{t("nameHeader")}</TableHead>
              <TableHead>{t("orderHeader")}</TableHead>
              <TableHead className="text-right">{t("actionsHeader")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {t("noBrands")}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="relative h-10 w-10">
                      <Image
                        src={
                          brand.logo_url ||
                          "/placeholder.svg?height=40&width=40&query=phone+brand+logo" ||
                          "/placeholder.svg"
                        }
                        alt={brand.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMoveUp(brand.id)}
                        disabled={reorderLoading !== null || brands.indexOf(brand) === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMoveDown(brand.id)}
                        disabled={reorderLoading !== null || brands.indexOf(brand) === brands.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/admin/brands/edit/${brand.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Dialog
                        open={isDeleteDialogOpen && brandToDelete?.id === brand.id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open)
                          if (!open) setBrandToDelete(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => setBrandToDelete(brand)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("deleteDialogTitle")}</DialogTitle>
                            <DialogDescription>
                              {t("deleteDialogDescription", {
                                name: brandToDelete?.name,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              {t("cancelButton")}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={handleDeleteBrand}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? t("deletingButton") : t("deleteButton")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
