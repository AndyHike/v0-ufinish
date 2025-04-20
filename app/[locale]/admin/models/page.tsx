"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  { id: "1", name: "Apple" },
  { id: "2", name: "Samsung" },
  { id: "3", name: "Xiaomi" },
  { id: "4", name: "Huawei" },
  { id: "5", name: "Google" },
  { id: "6", name: "OnePlus" },
]

const initialModels = [
  { id: "1", name: "iPhone 13", brandId: "1", year: 2021, repairCount: 24 },
  { id: "2", name: "iPhone 14", brandId: "1", year: 2022, repairCount: 18 },
  { id: "3", name: "Galaxy S21", brandId: "2", year: 2021, repairCount: 15 },
  { id: "4", name: "Galaxy S22", brandId: "2", year: 2022, repairCount: 12 },
  { id: "5", name: "Redmi Note 10", brandId: "3", year: 2021, repairCount: 10 },
  { id: "6", name: "Redmi Note 11", brandId: "3", year: 2022, repairCount: 8 },
  { id: "7", name: "P40 Pro", brandId: "4", year: 2020, repairCount: 6 },
  { id: "8", name: "Pixel 6", brandId: "5", year: 2021, repairCount: 9 },
]

export default function ModelsPage() {
  const t = useTranslations("AdminModels")
  const { toast } = useToast()
  const [brands] = useState(initialBrands)
  const [models, setModels] = useState(initialModels)
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentModel, setCurrentModel] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    year: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = brandFilter ? model.brandId === brandFilter : true
    return matchesSearch && matchesBrand
  })

  const getBrandName = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId)
    return brand ? brand.name : "Unknown"
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newModel = {
      id: String(models.length + 1),
      name: formData.name,
      brandId: formData.brandId,
      year: Number.parseInt(formData.year),
      repairCount: 0,
    }

    setModels([...models, newModel])
    setFormData({ name: "", brandId: "", year: "" })
    setIsAddDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: t("modelAdded"),
      description: t("modelAddedDescription", { name: newModel.name }),
    })
  }

  const handleEditModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentModel) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedModels = models.map((model) =>
      model.id === currentModel.id
        ? {
            ...model,
            name: formData.name,
            brandId: formData.brandId,
            year: Number.parseInt(formData.year),
          }
        : model,
    )

    setModels(updatedModels)
    setIsEditDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: t("modelUpdated"),
      description: t("modelUpdatedDescription", { name: formData.name }),
    })
  }

  const handleDeleteModel = async () => {
    if (!currentModel) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedModels = models.filter((model) => model.id !== currentModel.id)

    setModels(updatedModels)
    setIsDeleteDialogOpen(false)
    setIsSubmitting(false)

    toast({
      title: t("modelDeleted"),
      description: t("modelDeletedDescription", { name: currentModel.name }),
    })
  }

  const openEditDialog = (model: any) => {
    setCurrentModel(model)
    setFormData({
      name: model.name,
      brandId: model.brandId,
      year: String(model.year),
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (model: any) => {
    setCurrentModel(model)
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
              {t("addModel")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addModelTitle")}</DialogTitle>
              <DialogDescription>{t("addModelDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddModel}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {t("modelNameLabel")}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t("modelNamePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="brand" className="text-sm font-medium">
                    {t("brandLabel")}
                  </label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) => handleSelectChange("brandId", value)}
                    required
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
                <div className="space-y-2">
                  <label htmlFor="year" className="text-sm font-medium">
                    {t("yearLabel")}
                  </label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder={t("yearPlaceholder")}
                    min="2000"
                    max={new Date().getFullYear()}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filterByBrand")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allBrands")}</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("modelName")}</TableHead>
              <TableHead>{t("brand")}</TableHead>
              <TableHead>{t("year")}</TableHead>
              <TableHead>{t("repairCount")}</TableHead>
              <TableHead className="w-[100px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchQuery || brandFilter ? t("noSearchResults") : t("noModels")}
                </TableCell>
              </TableRow>
            ) : (
              filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{getBrandName(model.brandId)}</TableCell>
                  <TableCell>{model.year}</TableCell>
                  <TableCell>{model.repairCount}</TableCell>
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
                        <DropdownMenuItem onClick={() => openEditDialog(model)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(model)}
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

      {/* Edit Model Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editModelTitle")}</DialogTitle>
            <DialogDescription>{t("editModelDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditModel}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  {t("modelNameLabel")}
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("modelNamePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-brand" className="text-sm font-medium">
                  {t("brandLabel")}
                </label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) => handleSelectChange("brandId", value)}
                  required
                >
                  <SelectTrigger id="edit-brand">
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
              <div className="space-y-2">
                <label htmlFor="edit-year" className="text-sm font-medium">
                  {t("yearLabel")}
                </label>
                <Input
                  id="edit-year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder={t("yearPlaceholder")}
                  min="2000"
                  max={new Date().getFullYear()}
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

      {/* Delete Model Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteModelTitle")}</DialogTitle>
            <DialogDescription>{t("deleteModelDescription", { name: currentModel?.name || "" })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteModel} disabled={isSubmitting}>
              {isSubmitting ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
