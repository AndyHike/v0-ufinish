"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Plus, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react"

// Mock data - in a real app, this would come from your API
const initialBrands = [
  { id: "1", name: "Apple", models: 24 },
  { id: "2", name: "Samsung", models: 32 },
  { id: "3", name: "Xiaomi", models: 18 },
  { id: "4", name: "Huawei", models: 15 },
  { id: "5", name: "Google", models: 8 },
  { id: "6", name: "OnePlus", models: 10 },
  { id: "7", name: "Sony", models: 6 },
  { id: "8", name: "Nokia", models: 12 },
]

export default function BrandsPage() {
  const t = useTranslations("AdminBrands")
  const { toast } = useToast()
  const [brands, setBrands] = useState(initialBrands)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentBrand, setCurrentBrand] = useState<{ id: string; name: string } | null>(null)
  const [newBrandName, setNewBrandName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newBrand = {
      id: String(brands.length + 1),
      name: newBrandName,
      models: 0,
    }

    setBrands([...brands, newBrand])
    setNewBrandName("")
    setIsAddDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: t("brandAdded"),
      description: t("brandAddedDescription", { name: newBrand.name }),
    })
  }

  const handleEditBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBrand) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedBrands = brands.map((brand) =>
      brand.id === currentBrand.id ? { ...brand, name: newBrandName } : brand,
    )

    setBrands(updatedBrands)
    setIsEditDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: t("brandUpdated"),
      description: t("brandUpdatedDescription", { name: newBrandName }),
    })
  }

  const handleDeleteBrand = async () => {
    if (!currentBrand) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedBrands = brands.filter((brand) => brand.id !== currentBrand.id)

    setBrands(updatedBrands)
    setIsDeleteDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: t("brandDeleted"),
      description: t("brandDeletedDescription", { name: currentBrand.name }),
    })
  }

  const openEditDialog = (brand: { id: string; name: string }) => {
    setCurrentBrand(brand)
    setNewBrandName(brand.name)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (brand: { id: string; name: string }) => {
    setCurrentBrand(brand)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
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
              <DialogTitle>{t("addBrandTitle")}</DialogTitle>
              <DialogDescription>{t("addBrandDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBrand}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {t("brandNameLabel")}
                  </label>
                  <Input
                    id="name"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder={t("brandNamePlaceholder")}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("adding") : t("add")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("brandName")}</TableHead>
              <TableHead>{t("models")}</TableHead>
              <TableHead className="w-[100px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {searchQuery ? t("noSearchResults") : t("noBrands")}
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.models}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t("openMenu")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(brand)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(brand)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editBrandTitle")}</DialogTitle>
            <DialogDescription>{t("editBrandDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBrand}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  {t("brandNameLabel")}
                </label>
                <Input
                  id="edit-name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder={t("brandNamePlaceholder")}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteBrandTitle")}</DialogTitle>
            <DialogDescription>{t("deleteBrandDescription", { name: currentBrand?.name || "" })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteBrand} disabled={isSubmitting}>
              {isSubmitting ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
