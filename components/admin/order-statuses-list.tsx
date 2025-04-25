"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash, AlertCircle } from "lucide-react"
import type { OrderStatus } from "@/lib/order-status-utils"

// Color options for status badges
const colorOptions = [
  { value: "bg-blue-100 text-blue-800", label: "Синій" },
  { value: "bg-green-100 text-green-800", label: "Зелений" },
  { value: "bg-amber-100 text-amber-800", label: "Жовтий" },
  { value: "bg-red-100 text-red-800", label: "Червоний" },
  { value: "bg-purple-100 text-purple-800", label: "Фіолетовий" },
  { value: "bg-pink-100 text-pink-800", label: "Рожевий" },
  { value: "bg-indigo-100 text-indigo-800", label: "Індиго" },
  { value: "bg-gray-100 text-gray-800", label: "Сірий" },
  { value: "bg-teal-100 text-teal-800", label: "Бірюзовий" },
  { value: "bg-cyan-100 text-cyan-800", label: "Блакитний" },
  { value: "bg-orange-100 text-orange-800", label: "Помаранчевий" },
  { value: "bg-lime-100 text-lime-800", label: "Лаймовий" },
]

export function OrderStatusesList() {
  const { data: session } = useSession()
  const t = useTranslations("Admin")

  // State for statuses list
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)

  // Form state
  const [formState, setFormState] = useState({
    remonline_status_id: "",
    name_uk: "",
    name_en: "",
    name_cs: "",
    color: "bg-gray-100 text-gray-800",
  })

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch statuses on component mount
  useEffect(() => {
    fetchStatuses()
  }, [])

  // Function to fetch statuses from API
  async function fetchStatuses() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/order-statuses")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch statuses")
      }

      setStatuses(data.statuses)
    } catch (err) {
      console.error("Error fetching statuses:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Reset form to default values
  function resetForm() {
    setFormState({
      remonline_status_id: "",
      name_uk: "",
      name_en: "",
      name_cs: "",
      color: "bg-gray-100 text-gray-800",
    })
  }

  // Handle input changes
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  // Open edit dialog and populate form with status data
  function handleEditClick(status: OrderStatus) {
    setSelectedStatus(status)
    setFormState({
      remonline_status_id: status.remonline_status_id.toString(),
      name_uk: status.name_uk,
      name_en: status.name_en,
      name_cs: status.name_cs,
      color: status.color,
    })
    setEditDialogOpen(true)
  }

  // Open delete dialog
  function handleDeleteClick(status: OrderStatus) {
    setSelectedStatus(status)
    setDeleteDialogOpen(true)
  }

  // Add new status
  async function handleAddStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user?.id) return

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/admin/order-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          remonline_status_id: Number.parseInt(formState.remonline_status_id, 10),
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to add status")
      }

      toast({
        title: "Статус додано",
        description: "Новий статус замовлення успішно додано",
      })

      resetForm()
      setAddDialogOpen(false)
      fetchStatuses()
    } catch (err) {
      console.error("Error adding status:", err)
      toast({
        title: "Помилка",
        description: err instanceof Error ? err.message : "Не вдалося додати статус",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update existing status
  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user?.id || !selectedStatus) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/order-statuses/${selectedStatus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          remonline_status_id: Number.parseInt(formState.remonline_status_id, 10),
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to update status")
      }

      toast({
        title: "Статус оновлено",
        description: "Статус замовлення успішно оновлено",
      })

      resetForm()
      setEditDialogOpen(false)
      fetchStatuses()
    } catch (err) {
      console.error("Error updating status:", err)
      toast({
        title: "Помилка",
        description: err instanceof Error ? err.message : "Не вдалося оновити статус",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete status
  async function handleDeleteStatus() {
    if (!session?.user?.id || !selectedStatus) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/order-statuses/${selectedStatus.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to delete status")
      }

      toast({
        title: "Статус видалено",
        description: "Статус замовлення успішно видалено",
      })

      setDeleteDialogOpen(false)
      fetchStatuses()
    } catch (err) {
      console.error("Error deleting status:", err)
      toast({
        title: "Помилка",
        description: err instanceof Error ? err.message : "Не вдалося видалити статус",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Завантаження статусів замовлень...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Помилка завантаження</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchStatuses}>Спробувати знову</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Статуси замовлень</h2>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Додати статус
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Код RemOnline</TableHead>
              <TableHead>Назва (UK)</TableHead>
              <TableHead>Назва (EN)</TableHead>
              <TableHead>Назва (CS)</TableHead>
              <TableHead>Колір</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Немає статусів замовлень
                </TableCell>
              </TableRow>
            ) : (
              statuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell className="font-medium">{status.remonline_status_id}</TableCell>
                  <TableCell>{status.name_uk}</TableCell>
                  <TableCell>{status.name_en}</TableCell>
                  <TableCell>{status.name_cs}</TableCell>
                  <TableCell>
                    <Badge className={status.color}>{status.name_uk}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(status)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Редагувати
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(status)}>
                        <Trash className="h-4 w-4 mr-1" />
                        Видалити
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Status Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Додати новий статус замовлення</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStatus}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="remonline_status_id" className="text-right">
                  Код RemOnline
                </Label>
                <Input
                  id="remonline_status_id"
                  name="remonline_status_id"
                  value={formState.remonline_status_id}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="3153189"
                  type="number"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_uk" className="text-right">
                  Назва (UK)
                </Label>
                <Input
                  id="name_uk"
                  name="name_uk"
                  value={formState.name_uk}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Новий"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_en" className="text-right">
                  Назва (EN)
                </Label>
                <Input
                  id="name_en"
                  name="name_en"
                  value={formState.name_en}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="New"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_cs" className="text-right">
                  Назва (CS)
                </Label>
                <Input
                  id="name_cs"
                  name="name_cs"
                  value={formState.name_cs}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Nový"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Колір
                </Label>
                <div className="col-span-3 flex gap-2">
                  <select
                    id="color"
                    name="color"
                    value={formState.color}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Badge className={formState.color}>Приклад</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Додавання...
                  </>
                ) : (
                  "Додати"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редагувати статус замовлення</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStatus}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_remonline_status_id" className="text-right">
                  Код RemOnline
                </Label>
                <Input
                  id="edit_remonline_status_id"
                  name="remonline_status_id"
                  value={formState.remonline_status_id}
                  onChange={handleInputChange}
                  className="col-span-3"
                  type="number"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name_uk" className="text-right">
                  Назва (UK)
                </Label>
                <Input
                  id="edit_name_uk"
                  name="name_uk"
                  value={formState.name_uk}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name_en" className="text-right">
                  Назва (EN)
                </Label>
                <Input
                  id="edit_name_en"
                  name="name_en"
                  value={formState.name_en}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name_cs" className="text-right">
                  Назва (CS)
                </Label>
                <Input
                  id="edit_name_cs"
                  name="name_cs"
                  value={formState.name_cs}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_color" className="text-right">
                  Колір
                </Label>
                <div className="col-span-3 flex gap-2">
                  <select
                    id="edit_color"
                    name="color"
                    value={formState.color}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Badge className={formState.color}>Приклад</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Збереження...
                  </>
                ) : (
                  "Зберегти"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Status Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Видалити статус замовлення</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Ви впевнені, що хочете видалити статус "{selectedStatus?.name_uk}"? Це може вплинути на існуючі
              замовлення.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteStatus} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Видалення...
                </>
              ) : (
                "Видалити"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
