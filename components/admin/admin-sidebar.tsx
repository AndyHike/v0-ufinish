"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Box,
  CircleUser,
  Smartphone,
  Tag,
  FileText,
  Upload,
  Layers,
  Settings,
  Repeat,
  ClipboardList,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations("Admin")

  const routes = [
    {
      href: "/admin",
      label: t("dashboard"),
      icon: BarChart3,
    },
    {
      href: "/admin/brands",
      label: t("brands"),
      icon: Box,
    },
    {
      href: "/admin/product-lines",
      label: t("productLines") || "Product Lines",
      icon: Layers,
    },
    {
      href: "/admin/models",
      label: t("models"),
      icon: Smartphone,
    },
    {
      href: "/admin/descriptions",
      label: t("descriptions"),
      icon: FileText,
    },
    {
      href: "/admin/discounts",
      label: t("discounts"),
      icon: Tag,
    },
    {
      href: "/admin/users",
      label: t("users"),
      icon: CircleUser,
    },
    {
      href: "/admin/order-statuses",
      label: t("orderStatuses"),
      icon: ClipboardList,
    },
    {
      href: "/admin/bulk-services",
      label: t("bulkManagement"),
      icon: Upload,
    },
    {
      href: "/admin/sync",
      label: t("sync"),
      icon: Repeat,
    },
    {
      href: "/admin/test-remonline",
      label: t("testRemonline"),
      icon: Settings,
    },
  ]

  return (
    <nav className="grid items-start gap-2 text-sm">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
            pathname === route.href
              ? "bg-muted text-primary font-medium"
              : pathname.startsWith(route.href) && route.href !== "/admin"
                ? "text-primary"
                : "text-muted-foreground",
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
