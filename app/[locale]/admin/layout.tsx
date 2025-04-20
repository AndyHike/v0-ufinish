"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Smartphone, Tag, Percent, Users, Settings, LogOut } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations("Admin")
  const pathname = usePathname()
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)

  const handleLogout = async () => {
    setIsLogoutLoading(true)
    // Simulate logout
    await new Promise((resolve) => setTimeout(resolve, 1000))
    window.location.href = "/login"
  }

  const navigation = [
    {
      name: t("dashboard"),
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: t("brands"),
      href: "/admin/brands",
      icon: Tag,
    },
    {
      name: t("models"),
      href: "/admin/models",
      icon: Smartphone,
    },
    {
      name: t("discounts"),
      href: "/admin/discounts",
      icon: Percent,
    },
    {
      name: t("users"),
      href: "/admin/users",
      icon: Users,
    },
    {
      name: t("settings"),
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Smartphone className="h-5 w-5" />
              <span>{t("adminPanel")}</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} disabled={isLogoutLoading}>
              <LogOut className="mr-2 h-4 w-4" />
              {isLogoutLoading ? t("loggingOut") : t("logout")}
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="flex h-14 items-center border-b px-6">
            <SidebarTrigger />
            <div className="ml-4 text-lg font-semibold">{t("adminPanel")}</div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
