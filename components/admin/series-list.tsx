"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Plus, Pencil, Trash, MoveVertical, MoreHorizontal } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useFixAriaHidden } from "@/lib/fix-aria-hidden"

type Brand = {
  id: string
  name: string
}

type Series = {
  id: string
  name: string
  brand_id: string
  position: number
  created_at: string
  brands: {
    name: string
  }
}

type SeriesListProps = {
  brandId?: string
  brandName?: string
}

export function SeriesList({ brandId = "", brandName }: SeriesListProps) {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [series, setSeries] = useState<Series[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newSeries, setNewSeries] = useState({ name: "", brandId: brandId || "" })
  const [editSeries, setEditSeries] = useState<Series | null>(null)
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>(brandId || "")

  // Використовуємо хук для виправлення проблеми з aria-hidden
  useEffect(() => {
    const cleanup = useFixAriaHidden()
    return cleanup
  }, [])

  const fetchSeries = useCallback(async () => {
    try {
      let url = "/api/admin/series"

      // Додаємо параметр brand_id тільки якщо він не "_all"
      if (selectedBrandFilter && selectedBrandFilter !== "_all") {
        url += `?brand_id=${selectedBrandFilter}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch series: ${response.status}`)
      }
      const data = await response.json()
      setSeries(data)
    } catch (error) {
      console.error("Error fetching series:", error)
      toast({
        title: t("error"),
        description: t("seriesFetchError"),
        variant: "destructive",
      })
    }
  }, [selectedBrandFilter, t, toast])

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/brands")
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({
        title: t("error"),
        description: t("brandFetchError"),
        variant: "destructive",
      })
    }
  }, [t, toast])

  useEffect(() => {
    Promise.all([fetchSeries(), fetchBrands()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [fetchSeries, fetchBrands])

  async function handleAddSeries() {
    if (!newSeries.name || !newSeries.brandId) {
      toast({
        title: t("validationError"),
        description: t("nameAndBrandRequired"),
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSeries.name,
          brandId: newSeries.brandId,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add series")
      }

      await fetchSeries()
      setIsAddDialogOpen(false)
      setNewSeries({ name: "", brandId: selectedBrandFilter || "" })

      toast({
        title: t("success"),
        description: t("seriesAddedSuccess"),
      })
    } catch (error) {
      console.error("Error adding series:", error)
      toast({
        title: t("error"),
        description: t("seriesAddedError"),
        variant: "destructive",
      })
    }
  }

  async function handleEditSeries() {
    if (!editSeries || !editSeries.name || !editSeries.brand_id) {
      toast({
        title: t("validationError"),
        description: t("nameAndBrandRequired"),
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/series/${editSeries.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editSeries.name,
          brandId: editSeries.brand_id,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update series")
      }

      await fetchSeries()
      setIsEditDialogOpen(false)

      toast({
        title: t("success"),
        description: t("seriesUpdatedSuccess"),
      })
    } catch (error) {
      console.error("Error updating series:", error)
      toast({
        title: t("error"),
        description: t("seriesUpdatedError"),
        variant: "destructive",
      })
    }
  }

  async function handleDeleteSeries() {
    if (!seriesToDelete) return

    try {
      const response = await fetch(`/api/admin/series/${seriesToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete series")
      }

      await fetchSeries()
      setIsDeleteDialogOpen(false)
      setSeriesToDelete(null)

      toast({
        title: t("success"),
        description: t("seriesDeletedSuccess"),
      })
    } catch (error) {
      console.error("Error deleting series:", error)
      toast({
        title: t("error"),
        description: t("seriesDeletedError"),
        variant: "destructive",
      })
    }
  }

  async function handleReorderSeries(result: any) {
    if (!result.destination) return

    const items = Array.from(series)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }))

    setSeries(updatedItems)

    try {
      const response = await fetch("/api/admin/series/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          series: updatedItems.map((item) => ({
            id: item.id,
            position: item.position,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder series")
      }

      toast({
        title: t("success"),
        description: t("seriesReorderedSuccess"),
      })
    } catch (error) {
      console.error("Error reordering series:", error)
      toast({
        title: t("error"),
        description: t("seriesReorderedError"),
        variant: "destructive",
      })
      // Revert to original order
      await fetchSeries()
    }
  }

  return (
    <div className="space-y-6">
      {!brandId && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("seriesTitle")}</h1>
            <p className="text-muted-foreground">{t("seriesDescription")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={isReorderMode ? "default" : "outline"} onClick={() => setIsReorderMode(!isReorderMode)}>
              <MoveVertical className="mr-2 h-4 w-4" />
              {isReorderMode ? t("doneReordering") : t("reorderSeries")}
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addSeries")}
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("series")}</CardTitle>
          <CardDescription>{t("seriesDescription")}</CardDescription>
          {!brandId && (
            <div className="mt-4">
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
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p>{t("loading")}</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleReorderSeries}>
              <Table>
                <TableHeader>
                  <TableRow>
                    {isReorderMode && <TableHead className="w-[50px]"></TableHead>}
                    <TableHead>{t("name")}</TableHead>
                    {!brandId && <TableHead>{t("brand")}</TableHead>}
                    <TableHead>{t("createdAt")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <Droppable droppableId="series" isDropDisabled={!isReorderMode}>
                  {(provided) => (
                    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                      {series.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isReorderMode ? (brandId ? 4 : 5) : brandId ? 3 : 4}
                            className="text-center"
                          >
                            {t("noSeries")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        series.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!isReorderMode}>
                            {(provided) => (
                              <TableRow ref={provided.innerRef} {...provided.draggableProps}>
                                {isReorderMode && (
                                  <TableCell {...provided.dragHandleProps}>
                                    <MoveVertical className="h-5 w-5 text-muted-foreground" />
                                  </TableCell>
                                )}
                                <TableCell className="font-medium">{item.name}</TableCell>
                                {!brandId && <TableCell>{item.brands?.name}</TableCell>}
                                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
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
                                          setEditSeries(item)
                                          setIsEditDialogOpen(true)
                                        }}
                                      >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t("edit")}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => {
                                          setSeriesToDelete(item)
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

      {/* Add Series Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addNewSeries")}</DialogTitle>
            <DialogDescription>{t("addNewSeriesDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("seriesName")}</Label>
              <Input
                id="name"
                value={newSeries.name}
                onChange={(e) => setNewSeries({ ...newSeries, name: e.target.value })}
                placeholder={t("seriesNamePlaceholder")}
              />
            </div>
            {!brandId && (
              <div className="grid gap-2">
                <Label htmlFor="brand">{t("brand")}</Label>
                <Select
                  value={newSeries.brandId}
                  onValueChange={(value) => setNewSeries({ ...newSeries, brandId: value })}
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddSeries}>{t("add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Series Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            // Скидаємо стан при закритті діалогу
            setEditSeries(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editSeries")}</DialogTitle>
            <DialogDescription>{t("editSeriesDescription")}</DialogDescription>
          </DialogHeader>
          {editSeries && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t("seriesName")}</Label>
                <Input
                  id="edit-name"
                  value={editSeries.name}
                  onChange={(e) => setEditSeries({ ...editSeries, name: e.target.value })}
                  placeholder={t("seriesNamePlaceholder")}
                />
              </div>
              {!brandId && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand">{t("brand")}</Label>
                  <Select
                    value={editSeries.brand_id}
                    onValueChange={(value) => setEditSeries({ ...editSeries, brand_id: value })}
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
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditSeries}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Series Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setSeriesToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteSeries")}</DialogTitle>
            <DialogDescription>{t("deleteSeriesDescription")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>{t("deleteSeriesConfirmation", { series: seriesToDelete?.name })}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteSeries}>
              {t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
