"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

interface User {
  id?: string
  email?: string | null
  role?: string
  name?: string | null
  phone?: string | null
  image?: string | null
  address?: string | null
  avatar_url?: string | null
}

interface UserProfileProps {
  user: User
}

export function UserProfile({ user }: UserProfileProps) {
  const { toast } = useToast()
  const [userData, setUserData] = useState<User>(user)

  // Debug log to check what data we're getting in the component
  useEffect(() => {
    console.log("User data in profile component:", user)
  }, [user])

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!userData.name) return "U"
    return userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Інформація профілю</CardTitle>
        <CardDescription>Ваші особисті дані.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={userData.avatar_url || userData.image || "/placeholder.svg?height=96&width=96&query=user"}
              />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-2xl font-semibold">{userData.name || "Користувач"}</h3>
              <p className="text-sm text-muted-foreground">{userData.email || "Немає email"}</p>
              {userData.phone && <p className="text-sm text-muted-foreground">{userData.phone}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ім'я</p>
                <p className="mt-1 text-base">{userData.name || "Не вказано"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="mt-1 text-base">{userData.email || "Не вказано"}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                <p className="mt-1 text-base">{userData.phone || "Не вказано"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Адреса</p>
                <p className="mt-1 text-base">{userData.address || "Не вказано"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
