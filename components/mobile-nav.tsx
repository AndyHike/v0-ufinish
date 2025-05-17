"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Smartphone, Info, MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()
  const t = useTranslations()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const navigation = [
    {
      name: t("Header.services"),
      href: "/services",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      name: t("Header.chooseModel"),
      href: "/brands",
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      name: t("Header.about"),
      href: "/about",
      icon: <Info className="h-5 w-5" />,
    },
    {
      name: t("Header.contact"),
      href: "/contact",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t py-2 px-4 shadow-lg">
      <div className="flex justify-around items-center">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-1/4 p-1",
              isActive(item.href) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <div className="flex items-center justify-center mb-1 w-full">{item.icon}</div>
            <span className="text-xs text-center w-full truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
