"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

type Brand = {
  id: string
  name: string
  logo_url: string | null
  created_at: string
}

export default function BrandsPage() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [newBrand, setNewBrand] = useState({ name: "", logo_url: "" })
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  async function fetchBrands() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/brands")
      if (!response.ok) {
        throw new Error("Failed to fetch brands")
      }
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({
        title: t("error"),
        description: t("brandAddedError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddBrand() {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBrand),
      })

      if (!response.ok) {
        throw new Error("Failed to add brand")
      }

      const data = await response.json()
      await fetchBrands() // Refresh the brands list
      setNewBrand({ name: "", logo_url: "" })
      setIsAddDialogOpen(false)

      toast({
        title: t("success"),
        description: t("brandAddedSuccess"),
      })
    } catch (error) {
      console.error("Error adding brand:", error)
      toast({
        title: t("error"),
        description: t("brandAddedError"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditBrand() {
    if (!editBrand) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/brands/${editBrand.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editBrand.name,
          logo_url: editBrand.logo_url,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update brand")
      }

      await fetchBrands() // Refresh the brands list
      setIsEditDialogOpen(false)

      toast({
        title: t("success"),
        description: t("brandUpdatedSuccess"),
      })
    } catch (error) {
      console.error("Error updating brand:", error)
      toast({
        title: t("error"),
        description: t("brandUpdatedError"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteBrand() {
    if (!brandToDelete) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/brands/${brandToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete brand")
      }

      await fetchBrands() // Refresh the brands list
      setIsDeleteDialogOpen(false)
      setBrandToDelete(null)

      toast({
        title: t("success"),
        description: t("brandDeletedSuccess"),
      })
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast({
        title: t("error"),
        description: t("brandDeletedError"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditDialog(brand: Brand) {
    setEditBrand(brand)
    setIsEditDialogOpen(true)
  }

  function openDeleteDialog(brand: Brand) {
    setBrandToDelete(brand)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("brands")}</h1>
          <p className="text-muted-foreground">{t("manageBrands")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("addBrand")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addNewBrand")}</DialogTitle>
              <DialogDescription>{t("addNewBrandDescription")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {t("brandName")}
                </label>
                <Input
                  id="name"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder={t("brandNamePlaceholder")}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="logo" className="text-sm font-medium">
                  {t("logoUrl")}
                </label>
                <Input
                  id="logo"
                  value={newBrand.logo_url}
                  onChange={(e) => setNewBrand({ ...newBrand, logo_url: e.target.value })}
                  placeholder={t("logoUrlPlaceholder")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddBrand} disabled={!newBrand.name || isSubmitting}>
                {isSubmitting ? "..." : t("add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("brandsTitle")}</CardTitle>
          <CardDescription>{t("brandsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p>Loading brands...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("logo")}</TableHead>
                  <TableHead>{t("createdAt")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
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
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        {brand.logo_url ? (
                          <div className="h-8 w-8 overflow-hidden">
                            <Image
                              src={brand.logo_url || "/placeholder.svg"}
                              alt={brand.name}
                              width={32}
                              height={32}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          t("noLogo")
                        )}
                      </TableCell>
                      <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(brand)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(brand)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editBrand")}</DialogTitle>
            <DialogDescription>{t("editBrandDescription")}</DialogDescription>
          </DialogHeader>
          {editBrand && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  {t("brandName")}
                </label>
                <Input
                  id="edit-name"
                  value={editBrand.name}
                  onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })}
                  placeholder={t("brandNamePlaceholder")}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-logo" className="text-sm font-medium">
                  {t("logoUrl")}
                </label>
                <Input
                  id="edit-logo"
                  value={editBrand.logo_url || ""}
                  onChange={(e) => setEditBrand({ ...editBrand, logo_url: e.target.value })}
                  placeholder={t("logoUrlPlaceholder")}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditBrand} disabled={!editBrand?.name || isSubmitting}>
              {isSubmitting ? "..." : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteBrand")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteBrandDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBrand} disabled={isSubmitting}>
              {isSubmitting ? "..." : t("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
