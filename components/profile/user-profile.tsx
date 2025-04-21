"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Mail, Phone, UserIcon } from "lucide-react"

interface UserProfileProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    avatar_url?: string | null
    phone?: string | null
    role?: string
    created_at?: string
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не вказано"
    return new Date(dateString).toLocaleDateString()
  }

  // Get avatar URL from either avatar_url or image
  const avatarUrl =
    user?.avatar_url ||
    user?.image ||
    `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(user?.name || "User")}`

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-2xl">{user?.name || "Не вказано"}</CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="flex items-center justify-center sm:justify-start">
                <Mail className="mr-1 h-4 w-4" />
                {user?.email || "Не вказано"}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center justify-center sm:justify-start">
                <Phone className="mr-1 h-4 w-4" />
                {user?.phone || "Не вказано"}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Деталі</TabsTrigger>
            <TabsTrigger value="security">Безпека</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Ім'я</Label>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="w-full">
                      {isEditing ? (
                        <Input id="name" defaultValue={user?.name || ""} />
                      ) : (
                        <div className="rounded-md border border-transparent px-3 py-2">
                          {user?.name || "Не вказано"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="w-full">
                      {isEditing ? (
                        <Input id="email" defaultValue={user?.email || ""} />
                      ) : (
                        <div className="rounded-md border border-transparent px-3 py-2">
                          {user?.email || "Не вказано"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="w-full">
                      {isEditing ? (
                        <Input id="phone" defaultValue={user?.phone || ""} />
                      ) : (
                        <div className="rounded-md border border-transparent px-3 py-2">
                          {user?.phone || "Не вказано"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="created">Дата реєстрації</Label>
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div className="rounded-md border border-transparent px-3 py-2 w-full">
                      {formatDate(user?.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Поточний пароль</Label>
                <Input id="current-password" type="password" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новий пароль</Label>
                <Input id="new-password" type="password" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Підтвердження паролю</Label>
                <Input id="confirm-password" type="password" disabled={!isEditing} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Скасувати" : "Редагувати"}
        </Button>
        {isEditing && <Button type="submit">Зберегти</Button>}
      </CardFooter>
    </Card>
  )
}
