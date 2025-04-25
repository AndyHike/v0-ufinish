"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Edit, Trash2, Plus } from "lucide-react"

type OrderStatus = {
  id: number
  remonline_status_id: number
  name_uk: string
  name_en: string
  name_cs: string
  color: string
  created_at: string
  updated_at: string
}

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
  const t = useTranslations("Admin")
  const { data: session } = useSession()
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    remonline_status_id: "",
    name_uk: "",
    name_en: "",
    name_cs: "",
    color: "bg-gray-100 text-gray-800",
  })

  useEffect(() => {
    fetchStatuses()
  }, [])

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

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function resetForm() {
    setFormData({
      remonline_status_id: "",
      name_uk: "",
      name_en: "",
      name_cs: "",
      color: "bg-gray-100 text-gray-800",
    })
  }

  function handleEditClick(status: OrderStatus) {
    console.log("Edit button clicked", status)
    setCurrentStatus(status)
    setFormData({
      remonline_status_id: status.remonline_status_id.toString(),
      name_uk: status.name_uk,
      name_en: status.name_en,
      name_cs: status.name_cs,
      color: status.color,
    })
    setIsEditDialogOpen(true)
  }

  function handleDeleteClick(status: OrderStatus) {
    console.log("Delete button clicked", status)
    setCurrentStatus(status)
    setIsDeleteDialogOpen(true)
  }

  async function handleAddStatus() {
    if (!session?.user?.id) return

    try {
      setIsSubmitting(true)
      console.log("Adding status with data:", formData) // Log the form data
      const response = await fetch("/api/admin/order-statuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          remonline_status_id: Number.parseInt(formData.remonline_status_id, 10),
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
      setIsAddDialogOpen(false)
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

  async function handleUpdateStatus() {
    console.log("handleUpdateStatus called")
    if (!session?.user?.id || !currentStatus) return

    try {
      setIsSubmitting(true)
      console.log("handleUpdateStatus called")
      console.log("formData:", formData)
      const response = await fetch(`/api/admin/order-statuses/${currentStatus.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          remonline_status_id: Number.parseInt(formData.remonline_status_id, 10),
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
      setIsEditDialogOpen(false) // Add this line
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
      setIsEditDialogOpen(false) // Add this line
    }
  }

  async function handleDeleteStatus() {
    if (!session?.user?.id || !currentStatus) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/order-statuses/${currentStatus.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to delete status")
      }

      toast({
        title: "Статус видалено",
        description: "Статус замовлення успішно видалено",
      })

      setIsDeleteDialogOpen(false)
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Статуси замовлень</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Додати статус
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Додати новий статус замовлення</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                console.log("Add form submitted") // Add this line
                handleAddStatus()
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="remonline_status_id" className="text-right">
                    Код RemOnline
                  </Label>
                  <Input
                    id="remonline_status_id"
                    name="remonline_status_id"
                    value={formData.remonline_status_id}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="3153189"
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name_uk" className="text-right">
                    Назва (UK)
                  </Label>
                  <Input
                    id="name_uk"
                    name="name_uk"
                    value={formData.name_uk}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Новий статус"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name_en" className="text-right">
                    Назва (EN)
                  </Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="New Status"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name_cs" className="text-right">
                    Назва (CS)
                  </Label>
                  <Input
                    id="name_cs"
                    name="name_cs"
                    value={formData.name_cs}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Nový stav"
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
                      value={formData.color}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Badge className={formData.color}>Приклад</Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Скасувати</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  Додати
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
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
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(status)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(status)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редагувати статус замовлення</DialogTitle>
          </DialogHeader>
          {/* Add onSubmit handler to the form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              console.log("Edit form submitted") // Add this line
              handleUpdateStatus()
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-remonline_status_id" className="text-right">
                  Код RemOnline
                </Label>
                <Input
                  id="edit-remonline_status_id"
                  name="remonline_status_id"
                  value={formData.remonline_status_id}
                  onChange={handleInputChange}
                  className="col-span-3"
                  type="number"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name_uk" className="text-right">
                  Назва (UK)
                </Label>
                <Input
                  id="edit-name_uk"
                  name="name_uk"
                  value={formData.name_uk}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name_en" className="text-right">
                  Назва (EN)
                </Label>
                <Input
                  id="edit-name_en"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name_cs" className="text-right">
                  Назва (CS)
                </Label>
                <Input
                  id="edit-name_cs"
                  name="name_cs"
                  value={formData.name_cs}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-color" className="text-right">
                  Колір
                </Label>
                <div className="col-span-3 flex gap-2">
                  <select
                    id="edit-color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Badge className={formData.color}>Приклад</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Скасувати</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                Зберегти
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Видалити статус замовлення</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Ви впевнені, що хочете видалити статус "{currentStatus?.name_uk}"? Це може вплинути на існуючі замовлення.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Скасувати</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteStatus} disabled={isSubmitting}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
