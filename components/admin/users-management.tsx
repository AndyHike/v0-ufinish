"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  created_at: string
}

export function UsersManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (searchQuery) queryParams.set("query", searchQuery)
      queryParams.set("sortBy", sortBy)
      queryParams.set("sortOrder", sortOrder)

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data)
    } catch (err: any) {
      console.error("Error fetching users:", err)
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, sortBy, sortOrder])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
    })
  }

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user)
  }

  const handleViewClick = (user: User) => {
    setViewingUser(user)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      })

      setEditingUser(null)
      fetchUsers()
    } catch (err: any) {
      console.error("Error updating user:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update user",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      })

      setDeletingUser(null)
      fetchUsers()
    } catch (err: any) {
      console.error("Error deleting user:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete user",
      })
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === "asc" ? "↑" : "↓"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Пошук за ім'ям, email або телефоном..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mx-4 mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                Користувач {getSortIcon("email")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                Роль {getSortIcon("role")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                Дата реєстрації {getSortIcon("created_at")}
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Завантаження...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Користувачів не знайдено
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name
                            ? user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || "Без імені"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role === "admin" ? "Адміністратор" : "Користувач"}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Меню</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Дії</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewClick(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Переглянути профіль
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Редагувати
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Видалити
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редагувати користувача</DialogTitle>
            <DialogDescription>
              Внесіть зміни до даних користувача. Натисніть зберегти, коли закінчите.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Ім'я
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Телефон
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Роль
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Оберіть роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Користувач</SelectItem>
                  <SelectItem value="admin">Адміністратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Скасувати
            </Button>
            <Button onClick={handleUpdateUser}>Зберегти зміни</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewingUser !== null} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Профіль користувача</DialogTitle>
            <DialogDescription>Детальна інформація про користувача.</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    {viewingUser.name
                      ? viewingUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : viewingUser.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium">{viewingUser.name || "Без імені"}</h3>
                  <p className="text-sm text-muted-foreground">{viewingUser.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Роль:</span>
                  <span className="font-medium">{viewingUser.role === "admin" ? "Адміністратор" : "Користувач"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Телефон:</span>
                  <span className="font-medium">{viewingUser.phone || "Не вказано"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Дата реєстрації:</span>
                  <span className="font-medium">{formatDate(viewingUser.created_at)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>
              Закрити
            </Button>
            {viewingUser && (
              <Button
                onClick={() => {
                  setViewingUser(null)
                  handleEditClick(viewingUser)
                }}
              >
                Редагувати
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deletingUser !== null} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Ця дія не може бути скасована. Користувач буде повністю видалений з системи.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
