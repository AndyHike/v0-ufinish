"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Smartphone, Tag, Users, FileText, BarChart, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin",
      icon: BarChart,
      title: "Панель",
      exact: true,
    },
    {
      href: "/admin/brands",
      icon: Tag,
      title: "Бренди",
    },
    {
      href: "/admin/models",
      icon: Smartphone,
      title: "Моделі",
    },
    {
      href: "/admin/descriptions",
      icon: FileText,
      title: "Описи",
    },
    {
      href: "/admin/discounts",
      icon: Users,
      title: "Знижки",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: "Налаштування",
    },
  ]

  return (
    <div className="flex h-full min-h-screen w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Smartphone className="h-5 w-5" />
          <span>Адмін панель</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant="ghost"
              asChild
              className={cn(
                "justify-start",
                (route.exact ? pathname === route.href : pathname.startsWith(route.href)) &&
                  "bg-accent text-accent-foreground",
              )}
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-5 w-5" />
                {route.title}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Вийти
        </Button>
      </div>
    </div>
  )
}
