"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { BarChart3, Users, Smartphone, Tag, FileText, Percent, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function AdminSidebar() {
  const t = useTranslations("Admin")
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Extract locale from pathname
  const locale = pathname.split("/")[1]

  const isActive = (path: string) => {
    return pathname.includes(path)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const NavItems = () => (
    <ul className="space-y-2">
      <li>
        <Link
          href={`/${locale}/admin`}
          className={`flex items-center rounded-md px-4 py-2 ${
            isActive("/admin") && !pathname.includes("/admin/")
              ? "bg-slate-700 text-white"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          onClick={() => setOpen(false)}
        >
          <BarChart3 className="mr-3 h-5 w-5" />
          {t("dashboard")}
        </Link>
      </li>
      <li>
        <Link
          href={`/${locale}/admin/users`}
          className={`flex items-center rounded-md px-4 py-2 ${
            isActive("/admin/users") ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          onClick={() => setOpen(false)}
        >
          <Users className="mr-3 h-5 w-5" />
          {t("users")}
        </Link>
      </li>
      <li>
        <Link
          href={`/${locale}/admin/brands`}
          className={`flex items-center rounded-md px-4 py-2 ${
            isActive("/admin/brands") ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          onClick={() => setOpen(false)}
        >
          <Tag className="mr-3 h-5 w-5" />
          {t("brands")}
        </Link>
      </li>
      <li>
        <Link
          href={`/${locale}/admin/models`}
          className={`flex items-center rounded-md px-4 py-2 ${
            isActive("/admin/models") ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          onClick={() => setOpen(false)}
        >
          <Smartphone className="mr-3 h-5 w-5" />
          {t("models")}
        </Link>
      </li>
      <li>
        <Link
          href={`/${locale}/admin/descriptions`}
          className={`flex items-center rounded-md px-4 py-2 ${
            isActive("/admin/descriptions")
              ? "bg-slate-700 text-white"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          onClick={() => setOpen(false)}
        >
          <FileText className="mr-3 h-5 w-5" />
          {t("descriptions")}
        </Link>
      </li>
      <li>
        <Link
          href={`/${locale}/admin/discounts`}
          className={`flex items-center rounded-md px-4 py-2 ${
            isActive("/admin/discounts")
              ? "bg-slate-700 text-white"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          onClick={() => setOpen(false)}
        >
          <Percent className="mr-3 h-5 w-5" />
          {t("discounts")}
        </Link>
      </li>
    </ul>
  )

  // Mobile sidebar
  const MobileSidebar = () => (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-slate-800 px-4">
        <h1 className="text-xl font-bold text-white">{t("adminPanel")}</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="rounded-md p-2 text-white hover:bg-slate-700">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-slate-800 border-slate-700">
            <div className="flex h-full flex-col text-white">
              <div className="flex h-16 items-center border-b border-slate-700 px-6">
                <h1 className="text-xl font-bold">{t("adminPanel")}</h1>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <NavItems />
              </nav>
              <div className="border-t border-slate-700 p-4">
                <button
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center rounded-md px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  {t("logout")}
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-16"></div> {/* Spacer for fixed header */}
    </div>
  )

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:h-full md:flex-col bg-slate-800 text-white">
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <h1 className="text-xl font-bold">{t("adminPanel")}</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <NavItems />
      </nav>
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-md px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t("logout")}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
}
