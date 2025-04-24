"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Tag,
  Smartphone,
  Percent,
  Users,
  LogOut,
  Menu,
  FileText,
  Database,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function AdminSidebar() {
  const t = useTranslations("Admin")
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Extract locale from pathname
  const locale = pathname.split("/")[1]

  const routes = [
    {
      label: t("dashboard"),
      icon: LayoutDashboard,
      href: `/${locale}/admin`,
      active: pathname.endsWith("/admin"),
    },
    {
      label: t("users"),
      icon: Users,
      href: `/${locale}/admin/users`,
      active: pathname.includes("/admin/users"),
    },
    {
      label: t("brands"),
      icon: Tag,
      href: `/${locale}/admin/brands`,
      active: pathname.includes("/admin/brands"),
    },
    {
      label: t("models"),
      icon: Smartphone,
      href: `/${locale}/admin/models`,
      active: pathname.includes("/admin/models") && !pathname.includes("/services"),
    },
    {
      label: t("bulkServices"),
      icon: Database,
      href: `/${locale}/admin/bulk-services`,
      active: pathname.includes("/admin/bulk-services"),
    },
    {
      label: t("descriptions"),
      icon: FileText,
      href: `/${locale}/admin/descriptions`,
      active: pathname.includes("/admin/descriptions"),
    },
    {
      label: t("discounts"),
      icon: Percent,
      href: `/${locale}/admin/discounts`,
      active: pathname.includes("/admin/discounts"),
    },
    {
      label: t("syncWithRemonline"),
      icon: RefreshCw,
      href: `/${locale}/admin/sync`,
      active: pathname.includes("/admin/sync"),
    },
  ]

  const SidebarContent = () => (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href={`/${locale}/admin`} className="flex items-center pl-3 mb-14">
          <h1 className="text-xl font-bold">{t("adminPanel")}</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                route.active ? "text-white bg-white/10" : "text-zinc-400",
              )}
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Link
          href={`/${locale}/api/auth/signout`}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3" />
            {t("logout")}
          </div>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 z-50 w-full bg-slate-900 border-b border-slate-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-xl text-white">{t("adminPanel")}</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0 bg-slate-900">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile padding to prevent content from being hidden under the header */}
      <div className="md:hidden h-16"></div>
    </>
  )
}
