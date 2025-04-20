"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl" // Add useLocale
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogIn } from "lucide-react"

// Mock user state - in a real app, this would come from your auth provider
const mockUser = null // Change to an object with user data to test logged-in state

export function UserNav() {
  const t = useTranslations("UserNav")
  const locale = useLocale() // Get current locale
  const [user, setUser] = useState(mockUser)
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/${locale}/auth/signin`}>
          <LogIn className="mr-2 h-4 w-4" />
          {t("login")}
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/profile`}>{t("profile")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/orders`}>{t("orders")}</Link>
          </DropdownMenuItem>
          {user.isAdmin && (
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/admin`}>{t("adminDashboard")}</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // Handle logout
            setUser(null)
            setIsOpen(false)
          }}
        >
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
