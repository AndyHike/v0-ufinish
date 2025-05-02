"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Label } from "@/components/ui/label"

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("")
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>("")

  // Спрощуємо ефекти, щоб уникнути зайвих рендерів
  useEffect(() => {
    fetchModels()
    fetchBrands()
  }, []) // Завантажуємо дані лише при монтуванні компонента

  // Окремий ефект для фільтрації
  useEffect(() => {
    if (selectedBrandFilter || selectedSeriesFilter) {
      fetchModels()
    }
  }, [selectedBrandFilter, selectedSeriesFilter])

  // Завантажуємо серії при зміні бренду
  useEffect(() => {
    if (selectedBrandFilter) {
      fetchSeries(selectedBrandFilter)
    } else {
      setSeries([])
      setSelectedSeriesFilter("")
    }
  }, [selectedBrandFilter])

  async function fetchModels() {
    try {
      let url = "/api/admin/models"
      const params = new URLSearchParams()

      if (selectedBrandFilter && selectedBrandFilter !== "_all") {
        params.append("brand_id", selectedBrandFilter)
      }

      if (selectedSeriesFilter && selectedSeriesFilter !== "_all") {
        params.append("series_id", selectedSeriesFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setModels(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching models:", error)
      setLoading(false)
    }
  }

  async function fetchBrands() {
    try {
      const response = await fetch("/api/admin/brands")
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
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
      fetchModels()
    }
  }

  // Функція для видалення моделі
  async function handleDeleteModel(modelId: string) {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete model")
      }

      // Оновлюємо список моделей
      fetchModels()

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
                                      <DropdownMenuItem asChild>
                                        <Link href={`/admin/models/${model.id}/edit`}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          {t("edit")}
                                        </Link>
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
                                          if (window.confirm(t("deleteModelConfirmation", { model: model.name }))) {
                                            handleDeleteModel(model.id)
                                          }
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
    </div>
  )
}
