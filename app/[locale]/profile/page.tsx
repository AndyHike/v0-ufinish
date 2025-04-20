"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, History, CreditCard, Settings, Upload } from "lucide-react"

// Mock user data - in a real app, this would come from your API
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+380 12 345 6789",
  avatar: "/placeholder.svg?height=100&width=100&query=person",
}

export default function ProfilePage() {
  const t = useTranslations("Profile")
  const { toast } = useToast()
  const [user, setUser] = useState(mockUser)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Get form data
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string

    // Update user state
    setUser({
      ...user,
      name,
      email,
      phone,
    })

    toast({
      title: t("profileUpdated"),
      description: t("profileUpdatedDescription"),
    })

    setIsLoading(false)
  }

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Separator />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-center">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    {t("uploadAvatar")}
                  </Button>
                </div>
                <Separator className="my-6" />
                <nav className="flex flex-col space-y-1">
                  <Button variant="ghost" className="justify-start">
                    <User className="mr-2 h-4 w-4" />
                    {t("personalInfo")}
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <Phone className="mr-2 h-4 w-4" />
                    {t("devices")}
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <History className="mr-2 h-4 w-4" />
                    {t("repairHistory")}
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("billing")}
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("settings")}
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>
          <div className="flex-1 lg:max-w-2xl">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">{t("personalInfo")}</TabsTrigger>
                <TabsTrigger value="devices">{t("devices")}</TabsTrigger>
                <TabsTrigger value="history">{t("repairHistory")}</TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("personalInfo")}</CardTitle>
                    <CardDescription>{t("personalInfoDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("nameLabel")}</Label>
                        <Input id="name" name="name" defaultValue={user.name} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("emailLabel")}</Label>
                        <Input id="email" name="email" type="email" defaultValue={user.email} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("phoneLabel")}</Label>
                        <Input id="phone" name="phone" type="tel" defaultValue={user.phone} />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? t("saving") : t("save")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="devices">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("devices")}</CardTitle>
                    <CardDescription>{t("devicesDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">{t("noDevices")}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{t("noDevicesDescription")}</p>
                      <Button className="mt-4">{t("addDevice")}</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("repairHistory")}</CardTitle>
                    <CardDescription>{t("repairHistoryDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <History className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">{t("noRepairHistory")}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{t("noRepairHistoryDescription")}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
