"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Smartphone, Tag, Percent, Users, Settings } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Brands",
      href: "/admin/brands",
      icon: Tag,
    },
    {
      name: "Models",
      href: "/admin/models",
      icon: Smartphone,
    },
    {
      name: "Discounts",
      href: "/admin/discounts",
      icon: Percent,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="hidden w-64 flex-col border-r md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Smartphone className="h-5 w-5" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
