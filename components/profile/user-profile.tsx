"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

interface UserProfileProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    phone?: string | null
    address?: string | null
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const { toast } = useToast()

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.name) return "U"
    return user.name
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
              <AvatarImage src={user.image || "/placeholder.svg?height=96&width=96&query=user"} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-2xl font-semibold">{user.name || "Користувач"}</h3>
              <p className="text-sm text-muted-foreground">{user.email || "Немає email"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ім'я</p>
                <p className="mt-1 text-base">{user.name || "Не вказано"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="mt-1 text-base">{user.email || "Не вказано"}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                <p className="mt-1 text-base">{user.phone || "Не вказано"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Адреса</p>
                <p className="mt-1 text-base">{user.address || "Не вказано"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
