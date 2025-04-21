"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Ім'я</h3>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <div className="rounded-md border px-3 py-2 w-full">{user?.name || "Не вказано"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="rounded-md border px-3 py-2 w-full">{user?.email || "Не вказано"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Телефон</h3>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="rounded-md border px-3 py-2 w-full">{user?.phone || "Не вказано"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Дата реєстрації</h3>
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div className="rounded-md border px-3 py-2 w-full">{formatDate(user?.created_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
