"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Smartphone, Search } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SearchDialog } from "@/components/search-dialog"
import { UserNav } from "@/components/user-nav"
import { useState } from "react"

export function Header({ user }) {
  const t = useTranslations("Header")
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navigation = [
    { name: t("home"), href: `/${locale}` },
    { name: t("services"), href: `/${locale}/services` },
    { name: t("chooseModel"), href: `/${locale}/brands` },
    { name: t("about"), href: `/${locale}/about` },
    { name: t("contact"), href: `/${locale}/contact` },
  ]

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}`
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("openMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b py-4">
                  <Smartphone className="h-5 w-5" />
                  <span className="font-semibold">{t("siteTitle")}</span>
                </div>
                <nav className="flex-1 overflow-auto py-4">
                  <ul className="grid gap-2">
                    {navigation.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block rounded-md px-3 py-2 text-sm hover:bg-accent ${
                            isActive(item.href) ? "font-medium text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="border-t py-4">
                  <LanguageSwitcher />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <span className="hidden font-semibold md:inline-block">{t("siteTitle")}</span>
          </Link>
        </div>
        <nav className="hidden md:flex md:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm ${
                isActive(item.href) ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} aria-label={t("search")}>
            <Search className="h-5 w-5" />
          </Button>
          <LanguageSwitcher className="hidden md:flex" />
          <UserNav user={user} />
        </div>
      </div>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  )
}
