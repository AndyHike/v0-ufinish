"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash, MoveVertical, MoreHorizontal, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { AddModelDialog } from "@/components/admin/add-model-dialog"

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
  created_at: string
  position: number
  brands: {
    name: string
  }
  series: {
    name: string
  } | null
}

export default function ModelsPage() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [models, setModels] = useState<Model[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [editModel, setEditModel] = useState<Model | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("")
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>("")

  useEffect(() => {
    Promise.all([fetchModels(), fetchBrands()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [selectedBrandFilter, selectedSeriesFilter])

  useEffect(() => {
    if (selectedBrandFilter) {
      fetchSeries(selectedBrandFilter)
    } else {
      setSeries([])
      setSelectedSeriesFilter("")
    }
  }, [selectedBrandFilter])

  // Додаємо ефект для завантаження серій при відкритті діалогу редагування
  useEffect(() => {
    if (editModel && isEditDialogOpen) {
      fetchSeriesForEdit(editModel.brand_id)
    }
  }, [editModel, isEditDialogOpen])

  async function fetchModels() {
    try {
      let url = "/api/admin/models"
      const params = new URLSearchParams()

      if (selectedBrandFilter) {
        params.append("brand_id", selectedBrandFilter)
      }

      if (selectedSeriesFilter) {
        params.append("series_id", selectedSeriesFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error("Error fetching models:", error)
      toast({
        title: "Error",
        description: "Failed to fetch models",
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

  // Окрема функція для завантаження серій при редагуванні
  async function fetchSeriesForEdit(brandId: string) {
    try {
      const response = await fetch(`/api/admin/series?brand_id=${brandId}`)
      const data = await response.json()
      setSeries(data)
    } catch (error) {
      console.error("Error fetching series for edit:", error)
      toast({
        title: "Error",
        description: "Failed to fetch series for edit",
        variant: "destructive",
      })
    }
  }

  async function handleEditModel() {
    if (!editModel) return

    try {
      const response = await fetch(`/api/admin/models/${editModel.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editModel.name,
          brandId: editModel.brand_id,
          seriesId: editModel.series_id === "_none" ? null : editModel.series_id,
          imageUrl: editModel.image_url,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update model")
      }

      await fetchModels()
      setIsEditDialogOpen(false)
      setEditModel(null) // Скидаємо стан після закриття

      toast({
        title: t("success"),
        description: t("modelUpdatedSuccess"),
      })
    } catch (error) {
      console.error("Error updating model:", error)
      toast({
        title: t("error"),
        description: t("modelUpdatedError"),
        variant: "destructive",
      })
    }
  }

  async function handleDeleteModel() {
    if (!modelToDelete) return

    try {
      const response = await fetch(`/api/admin/models/${modelToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete model")
      }

      await fetchModels()
      setIsDeleteDialogOpen(false)
      setModelToDelete(null)

      toast({
        title: t("success"),
        description: t("modelDeletedSuccess"),
      })
    } catch (error) {
      console.error("Error deleting model:", error)
      toast({
        title: t("error"),
        description: t("modelDeletedError"),
        variant: "destructive",
      })
    }
  }

  async function handleReorderModels(result: any) {
    if (!result.destination) return

    const items = Array.from(models)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }))

    setModels(updatedItems)

    try {
      const response = await fetch("/api/admin/models/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          models: updatedItems.map((item) => ({
            id: item.id,
            position: item.position,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder models")
      }

      toast({
        title: t("success"),
        description: t("modelReorderedSuccess"),
      })
    } catch (error) {
      console.error("Error reordering models:", error)
      toast({
        title: t("error"),
        description: t("modelReorderedError"),
        variant: "destructive",
      })
      // Revert to original order
      await fetchModels()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("models")}</h1>
          <p className="text-muted-foreground">{t("manageModels")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={isReorderMode ? "default" : "outline"} onClick={() => setIsReorderMode(!isReorderMode)}>
            <MoveVertical className="mr-2 h-4 w-4" />
            {isReorderMode ? t("doneReordering") : t("reorderModels")}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addModel")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("models")}</CardTitle>
          <CardDescription>{t("modelsDescription")}</CardDescription>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="brand-filter">{t("filterByBrand")}</Label>
              <Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
                <SelectTrigger id="brand-filter" className="mt-1">
                  <SelectValue placeholder={t("allBrands")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">{t("allBrands")}</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="series-filter">{t("filterBySeries") || "Filter by Series"}</Label>
              <Select
                value={selectedSeriesFilter}
                onValueChange={setSelectedSeriesFilter}
                disabled={!selectedBrandFilter || series.length === 0}
              >
                <SelectTrigger id="series-filter" className="mt-1">
                  <SelectValue placeholder={t("allSeries") || "All Series"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">{t("allSeries") || "All Series"}</SelectItem>
                  {series.length > 0 ? (
                    series.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_no_series_available">
                      {t("noSeriesAvailable") || "No series available for this brand"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p>{t("loading")}</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleReorderModels}>
              <Table>
                <TableHeader>
                  <TableRow>
                    {isReorderMode && <TableHead className="w-[50px]"></TableHead>}
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("brand")}</TableHead>
                    <TableHead>{t("series") || "Series"}</TableHead>
                    <TableHead>{t("image")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <Droppable droppableId="models" isDropDisabled={!isReorderMode}>
                  {(provided) => (
                    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                      {models.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isReorderMode ? 7 : 6} className="text-center">
                            {t("noModels")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        models.map((model, index) => (
                          <Draggable
                            key={model.id}
                            draggableId={model.id}
                            index={index}
                            isDragDisabled={!isReorderMode}
                          >
                            {(provided) => (
                              <TableRow ref={provided.innerRef} {...provided.draggableProps}>
                                {isReorderMode && (
                                  <TableCell {...provided.dragHandleProps}>
                                    <MoveVertical className="h-5 w-5 text-muted-foreground" />
                                  </TableCell>
                                )}
                                <TableCell className="font-medium">
                                  <Link href={`/admin/models/${model.id}/services`} className="hover:underline">
                                    {model.name}
                                  </Link>
                                </TableCell>
                                <TableCell>{model.brands?.name}</TableCell>
                                <TableCell>{model.series?.name || t("noSeries") || "No Series"}</TableCell>
                                <TableCell>
                                  {model.image_url ? (
                                    <div className="h-10 w-10 overflow-hidden rounded-md">
                                      <Image
                                        src={model.image_url || "/placeholder.svg"}
                                        alt={model.name}
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">{t("noImage")}</span>
                                  )}
                                </TableCell>
                                <TableCell>{new Date(model.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
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
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditModel(model)
                                          setIsEditDialogOpen(true)
                                        }}
                                      >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t("edit")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/admin/models/${model.id}/services`}>
                                          <DollarSign className="mr-2 h-4 w-4" />
                                          {t("manageServices")}
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => {
                                          setModelToDelete(model)
                                          setIsDeleteDialogOpen(true)
                                        }}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        {t("delete")}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </Table>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Add Model Dialog */}
      <AddModelDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onModelAdded={fetchModels} />

      {/* Edit Model Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditModel(null) // Скидаємо стан при закритті діалогу
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editModel")}</DialogTitle>
            <DialogDescription>{t("editModelDescription")}</DialogDescription>
          </DialogHeader>
          {editModel && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t("modelName")}</Label>
                <Input
                  id="edit-name"
                  value={editModel.name}
                  onChange={(e) => setEditModel({ ...editModel, name: e.target.value })}
                  placeholder={t("modelNamePlaceholder")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-brand">{t("brand")}</Label>
                <Select
                  value={editModel.brand_id}
                  onValueChange={(value) => {
                    setEditModel({ ...editModel, brand_id: value, series_id: null })
                    fetchSeriesForEdit(value)
                  }}
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
              <div className="grid gap-2">
                <Label htmlFor="edit-series">{t("series") || "Series"}</Label>
                <Select
                  value={editModel.series_id || "_none"}
                  onValueChange={(value) => setEditModel({ ...editModel, series_id: value === "_none" ? null : value })}
                >
                  <SelectTrigger id="edit-series">
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
                      <SelectItem value="_no_series_available">
                        {t("noSeriesAvailable") || "No series available for this brand"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">{t("imageUrl")}</Label>
                <Input
                  id="edit-image"
                  value={editModel.image_url || ""}
                  onChange={(e) => setEditModel({ ...editModel, image_url: e.target.value })}
                  placeholder={t("imageUrlPlaceholder")}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditModel}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Model Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setModelToDelete(null) // Скидаємо стан при закритті діалогу
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteModel")}</DialogTitle>
            <DialogDescription>{t("deleteModelDescription")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>{t("deleteModelConfirmation", { model: modelToDelete?.name })}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteModel}>
              {t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
