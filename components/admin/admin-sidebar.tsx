"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, Users, Tag, Percent, Settings } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function AdminSidebar({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn(
            "justify-start",
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
          )}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
        </Button>
      ))}
    </nav>
  )
}

export function getAdminSidebarItems(locale = "") {
  const prefix = locale ? `/${locale}` : ""

  return [
    {
      href: `${prefix}/admin`,
      title: "Огляд",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      href: `${prefix}/admin/brands`,
      title: "Бренди",
      icon: <Package className="h-4 w-4" />,
    },
    {
      href: `${prefix}/admin/models`,
      title: "Моделі",
      icon: <Tag className="h-4 w-4" />,
    },
    {
      href: `${prefix}/admin/users`,
      title: "Користувачі",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: `${prefix}/admin/discounts`,
      title: "Знижки",
      icon: <Percent className="h-4 w-4" />,
    },
    {
      href: `${prefix}/admin/settings`,
      title: "Налаштування",
      icon: <Settings className="h-4 w-4" />,
    },
  ]
}

export default function AdminSidebarWithItems() {
  return <AdminSidebar items={getAdminSidebarItems()} />
}
