"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash, MoveVertical, MoreHorizontal, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { AddModelDialog } from "@/components/admin/add-model-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProductLine = {
  id: string
  name: string
  brand_id: string
  brands: {
    name: string
  }
}

type Model = {
  id: string
  name: string
  product_line_id: string
  image_url: string | null
  created_at: string
  position: number
  product_lines: {
    name: string
    brand_id: string
    brands: {
      name: string
    }
  }
}

export default function ProductLineModelsPage() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const params = useParams()
  const productLineId = params.id as string

  const [models, setModels] = useState<Model[]>([])
  const [productLine, setProductLine] = useState<ProductLine | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModel, setEditModel] = useState<Model | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)

  useEffect(() => {
    Promise.all([fetchModels(), fetchProductLine()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [productLineId])

  async function fetchModels() {
    try {
      const response = await fetch(`/api/admin/models?product_line_id=${productLineId}`)
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

  async function fetchProductLine() {
    try {
      const response = await fetch(`/api/admin/product-lines/${productLineId}`)
      const data = await response.json()
      setProductLine(data)
    } catch (error) {
      console.error("Error fetching product line:", error)
      toast({
        title: "Error",
        description: "Failed to fetch product line details",
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
          productLineId: editModel.product_line_id,
          imageUrl: editModel.image_url,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update model")
      }

      await fetchModels()
      setIsEditDialogOpen(false)

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
          <div className="flex items-center gap-2">
            <Link href="/admin/product-lines" className="text-muted-foreground hover:text-foreground">
              {t("productLines") || "Product Lines"}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{productLine?.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{t("models")}</h1>
          <p className="text-muted-foreground">
            {t("manageModelsForProductLine", { productLine: productLine?.name }) ||
              `Manage models for ${productLine?.name} product line`}
          </p>
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
          <CardTitle>
            {t("modelsForProductLine", { productLine: productLine?.name }) || `Models for ${productLine?.name}`}
          </CardTitle>
          <CardDescription>
            {t("modelsForBrandDescription", { brand: productLine?.brands?.name }) ||
              `Models for ${productLine?.brands?.name} ${productLine?.name} product line`}
          </CardDescription>
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
                          <TableCell colSpan={isReorderMode ? 5 : 4} className="text-center">
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
      <AddModelDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onModelAdded={fetchModels}
        productLineId={productLineId}
      />

      {/* Edit Model Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                <Label htmlFor="edit-product-line">{t("productLine") || "Product Line"}</Label>
                <Input id="edit-product-line" value={productLine?.name || ""} disabled={true} className="bg-muted" />
                <p className="text-sm text-muted-foreground mt-1">
                  {t("productLineCannotBeChanged") || "Product line cannot be changed after creation"}
                </p>
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
