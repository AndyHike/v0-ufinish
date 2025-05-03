"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash, MoveVertical, MoreHorizontal, Smartphone } from "lucide-react"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { AddProductLineDialog } from "@/components/admin/add-product-line-dialog"

type Brand = {
  id: string
  name: string
}

type ProductLine = {
  id: string
  name: string
  brand_id: string
  created_at: string
  position: number
  brands: {
    name: string
  }
}

export default function ProductLinesPage() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [productLines, setProductLines] = useState<ProductLine[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [editProductLine, setEditProductLine] = useState<ProductLine | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productLineToDelete, setProductLineToDelete] = useState<ProductLine | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("")

  useEffect(() => {
    Promise.all([fetchProductLines(), fetchBrands()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [selectedBrandFilter])

  async function fetchProductLines() {
    try {
      const url = selectedBrandFilter
        ? `/api/admin/product-lines?brand_id=${selectedBrandFilter}`
        : "/api/admin/product-lines"

      const response = await fetch(url)
      const data = await response.json()
      setProductLines(data)
    } catch (error) {
      console.error("Error fetching product lines:", error)
      toast({
        title: "Error",
        description: "Failed to fetch product lines",
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

  async function handleEditProductLine() {
    if (!editProductLine) return

    try {
      const response = await fetch(`/api/admin/product-lines/${editProductLine.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editProductLine.name,
          brandId: editProductLine.brand_id,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product line")
      }

      await fetchProductLines()
      setIsEditDialogOpen(false)

      toast({
        title: t("success"),
        description: t("productLineUpdatedSuccess") || "Product line updated successfully",
      })
    } catch (error) {
      console.error("Error updating product line:", error)
      toast({
        title: t("error"),
        description: t("productLineUpdatedError") || "Failed to update product line",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteProductLine() {
    if (!productLineToDelete) return

    try {
      const response = await fetch(`/api/admin/product-lines/${productLineToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete product line")
      }

      await fetchProductLines()
      setIsDeleteDialogOpen(false)
      setProductLineToDelete(null)

      toast({
        title: t("success"),
        description: t("productLineDeletedSuccess") || "Product line deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting product line:", error)
      toast({
        title: t("error"),
        description: error.message || t("productLineDeletedError") || "Failed to delete product line",
        variant: "destructive",
      })
    }
  }

  async function handleReorderProductLines(result: any) {
    if (!result.destination) return

    const items = Array.from(productLines)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }))

    setProductLines(updatedItems)

    try {
      const response = await fetch("/api/admin/product-lines/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productLines: updatedItems.map((item) => ({
            id: item.id,
            position: item.position,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder product lines")
      }

      toast({
        title: t("success"),
        description: t("productLineReorderedSuccess") || "Product lines reordered successfully",
      })
    } catch (error) {
      console.error("Error reordering product lines:", error)
      toast({
        title: t("error"),
        description: t("productLineReorderedError") || "Failed to reorder product lines",
        variant: "destructive",
      })
      // Revert to original order
      await fetchProductLines()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("productLines") || "Product Lines"}</h1>
          <p className="text-muted-foreground">{t("manageProductLines") || "Manage product lines for your devices"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={isReorderMode ? "default" : "outline"} onClick={() => setIsReorderMode(!isReorderMode)}>
            <MoveVertical className="mr-2 h-4 w-4" />
            {isReorderMode ? t("doneReordering") : t("reorderProductLines") || "Reorder Product Lines"}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addProductLine") || "Add Product Line"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("productLines") || "Product Lines"}</CardTitle>
          <CardDescription>
            {t("productLinesDescription") || "Manage product lines for your device catalog"}
          </CardDescription>
          <div className="mt-4">
            <Label htmlFor="brand-filter">{t("filterByBrand")}</Label>
            <Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
              <SelectTrigger id="brand-filter" className="mt-1">
                <SelectValue placeholder={t("allBrands")} />
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p>{t("loading")}</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleReorderProductLines}>
              <Table>
                <TableHeader>
                  <TableRow>
                    {isReorderMode && <TableHead className="w-[50px]"></TableHead>}
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("brand")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <Droppable droppableId="productLines" isDropDisabled={!isReorderMode}>
                  {(provided) => (
                    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                      {productLines.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isReorderMode ? 5 : 4} className="text-center">
                            {t("noProductLines") || "No product lines found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        productLines.map((productLine, index) => (
                          <Draggable
                            key={productLine.id}
                            draggableId={productLine.id}
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
                                  <Link
                                    href={`/admin/product-lines/${productLine.id}/models`}
                                    className="hover:underline"
                                  >
                                    {productLine.name}
                                  </Link>
                                </TableCell>
                                <TableCell>{productLine.brands?.name}</TableCell>
                                <TableCell>{new Date(productLine.created_at).toLocaleDateString()}</TableCell>
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
                                          setEditProductLine(productLine)
                                          setIsEditDialogOpen(true)
                                        }}
                                      >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t("edit")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/admin/product-lines/${productLine.id}/models`}>
                                          <Smartphone className="mr-2 h-4 w-4" />
                                          {t("manageModels")}
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => {
                                          setProductLineToDelete(productLine)
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

      {/* Add Product Line Dialog */}
      <AddProductLineDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onProductLineAdded={fetchProductLines}
        brandId={selectedBrandFilter}
      />

      {/* Edit Product Line Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editProductLine") || "Edit Product Line"}</DialogTitle>
            <DialogDescription>{t("editProductLineDescription") || "Edit product line details"}</DialogDescription>
          </DialogHeader>
          {editProductLine && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t("productLineName") || "Product Line Name"}</Label>
                <Input
                  id="edit-name"
                  value={editProductLine.name}
                  onChange={(e) => setEditProductLine({ ...editProductLine, name: e.target.value })}
                  placeholder={t("productLineNamePlaceholder") || "Enter product line name"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-brand">{t("brand")}</Label>
                <Select
                  value={editProductLine.brand_id}
                  onValueChange={(value) => setEditProductLine({ ...editProductLine, brand_id: value })}
                  disabled={true} // Brand cannot be changed once set
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
                <p className="text-sm text-muted-foreground mt-1">
                  {t("brandCannotBeChanged") || "Brand cannot be changed after creation"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditProductLine}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Line Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteProductLine") || "Delete Product Line"}</DialogTitle>
            <DialogDescription>{t("deleteProductLineDescription") || "This action cannot be undone"}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              {t("deleteProductLineConfirmation", { productLine: productLineToDelete?.name }) ||
                `Are you sure you want to delete ${productLineToDelete?.name}?`}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("deleteProductLineWarning") || "You cannot delete a product line that has models associated with it."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProductLine}>
              {t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
