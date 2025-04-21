"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Mail, Phone, UserIcon } from "lucide-react"

interface UserProfileProps {
  user: User & {
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
  const t = useTranslations("Profile")
  const [isEditing, setIsEditing] = useState(false)

  // Debug log to see what user data we have
  console.log("User profile data:", user)

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return t("notSpecified")
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
            <CardTitle className="text-2xl">{user?.name || t("unnamed")}</CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="flex items-center justify-center sm:justify-start">
                <Mail className="mr-1 h-4 w-4" />
                {user?.email || t("notSpecified")}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center justify-center sm:justify-start">
                <Phone className="mr-1 h-4 w-4" />
                {user?.phone || t("notSpecified")}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{t("details")}</TabsTrigger>
            <TabsTrigger value="security">{t("security")}</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="w-full">
                      {isEditing ? (
                        <Input id="name" defaultValue={user?.name || ""} />
                      ) : (
                        <div className="rounded-md border border-transparent px-3 py-2">
                          {user?.name || t("notSpecified")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="w-full">
                      {isEditing ? (
                        <Input id="email" defaultValue={user?.email || ""} />
                      ) : (
                        <div className="rounded-md border border-transparent px-3 py-2">
                          {user?.email || t("notSpecified")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="w-full">
                      {isEditing ? (
                        <Input id="phone" defaultValue={user?.phone || ""} />
                      ) : (
                        <div className="rounded-md border border-transparent px-3 py-2">
                          {user?.phone || t("notSpecified")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="created">{t("memberSince")}</Label>
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
                <Label htmlFor="current-password">{t("currentPassword")}</Label>
                <Input id="current-password" type="password" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("newPassword")}</Label>
                <Input id="new-password" type="password" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
                <Input id="confirm-password" type="password" disabled={!isEditing} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? t("cancel") : t("edit")}
        </Button>
        {isEditing && <Button type="submit">{t("save")}</Button>}
      </CardFooter>
    </Card>
  )
}
