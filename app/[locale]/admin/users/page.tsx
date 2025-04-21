"use client"

import { useState, useEffect } from "react"
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
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { toast } from "@/components/ui/use-toast"
import { Pencil, Trash2, User, Search, UserPlus, Eye } from "lucide-react"

type UserType = {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  created_at: string
}

export default function UsersPage() {
  const t = useTranslations("Admin.Users")
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleEditUser(user: UserType) {
    setSelectedUser(user)
    setEditForm({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  function handleViewUser(user: UserType) {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  function handleDeleteUser(user: UserType) {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  async function saveUserChanges() {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) throw new Error("Failed to update user")

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      // Update the user in the local state
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, ...editForm } : user)))

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function confirmDeleteUser() {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete user")

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      // Remove the user from the local state
      setUsers(users.filter((user) => user.id !== selectedUser.id))
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.phone && user.phone.toLowerCase().includes(query))
    )
  })

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("usersList")}</CardTitle>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              {t("addUser")}
            </Button>
          </div>
          <CardDescription>{t("usersListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
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

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full h-12 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("user")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("registrationDate")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{user.name || "—"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="capitalize">{user.role}</div>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">{t("view")}</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">{t("edit")}</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t("delete")}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        {searchQuery ? t("noUsersFound") : t("noUsers")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editUser")}</DialogTitle>
            <DialogDescription>{t("editUserDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t("role")}</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t("roleUser")}</SelectItem>
                  <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={saveUserChanges}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("userProfile")}</DialogTitle>
            <DialogDescription>{t("userProfileDescription")}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{t("name")}</h3>
                <p>{selectedUser.name || t("notSpecified")}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{t("email")}</h3>
                <p>{selectedUser.email}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{t("phone")}</h3>
                <p>{selectedUser.phone || t("notSpecified")}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{t("role")}</h3>
                <p className="capitalize">{selectedUser.role}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{t("registrationDate")}</h3>
                <p>{formatDate(selectedUser.created_at)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteUser")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteUserConfirmation")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
