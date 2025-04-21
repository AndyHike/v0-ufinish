"use client"

import type React from "react"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Search } from "lucide-react"
import { format } from "date-fns"

type User = {
  id: string
  email: string
  name?: string | null
  role: string
  created_at: string
}

export function UsersManagement() {
  const t = useTranslations("Admin")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingUser, setViewingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const userData = await response.json()
      console.log("Fetched users data:", userData) // Debug log

      if (Array.isArray(userData)) {
        setUsers(userData)
      } else {
        console.error("Unexpected API response format:", userData)
        setUsers([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleViewUser = (user: User) => {
    setViewingUser({ ...user })
    setIsViewDialogOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const saveUserChanges = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Update the user in the local state
      setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)))
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err instanceof Error ? err.message : "Failed to update user")
    }
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Remove the user from the local state
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  if (loading) {
    return <div>{t("loading")}</div>
  }

  if (error) {
    return (
      <div className="text-red-500">
        {t("errorFetchingUsers")}: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchUsers")}
            className="w-full pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("registrationDate")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("noUsersFound")}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || t("notSpecified")}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), "dd.MM.yyyy") : t("notSpecified")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t("openMenu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>{t("viewProfile")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>{t("edit")}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user)}>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("editUser")}</DialogTitle>
            <DialogDescription>{t("editUserDescription")}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("name")}
                </Label>
                <Input
                  id="name"
                  value={editingUser.name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  {t("role")}
                </Label>
                <select
                  id="role"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="user">{t("roleUser")}</option>
                  <option value="admin">{t("roleAdmin")}</option>
                </select>
              </div>
            </div>
          )}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("userProfile")}</DialogTitle>
            <DialogDescription>{t("userProfileDescription")}</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">{t("name")}:</Label>
                <div className="col-span-3">{viewingUser.name || t("notSpecified")}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">{t("email")}:</Label>
                <div className="col-span-3">{viewingUser.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">{t("role")}:</Label>
                <div className="col-span-3">{viewingUser.role}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">{t("registrationDate")}:</Label>
                <div className="col-span-3">
                  {viewingUser.created_at ? format(new Date(viewingUser.created_at), "dd.MM.yyyy") : t("notSpecified")}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeletion")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteUserConfirmation")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
