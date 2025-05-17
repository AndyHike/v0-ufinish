"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3Icon,
  UsersIcon,
  SmartphoneIcon,
  TagIcon,
  SettingsIcon,
  FileTextIcon,
  PackageIcon,
  UploadIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  MessageSquareTextIcon,
  BellIcon,
} from "lucide-react"

interface AdminSidebarProps {
  locale: string
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname()

  const translations = {
    uk: {
      dashboard: "Панель керування",
      users: "Користувачі",
      brands: "Бренди",
      models: "Моделі",
      series: "Серії",
      services: "Послуги",
      descriptions: "Описи",
      discounts: "Знижки",
      orderStatuses: "Статуси замовлень",
      bulkImport: "Масовий імпорт",
      bulkServices: "Масові послуги",
      sync: "Синхронізація",
      testRemonline: "Тест Remonline",
      settings: "Налаштування",
      infoBanner: "Інформаційний банер",
      contactMessages: "Повідомлення",
    },
    cs: {
      dashboard: "Ovládací panel",
      users: "Uživatelé",
      brands: "Značky",
      models: "Modely",
      series: "Série",
      services: "Služby",
      descriptions: "Popisy",
      discounts: "Slevy",
      orderStatuses: "Stavy objednávek",
      bulkImport: "Hromadný import",
      bulkServices: "Hromadné služby",
      sync: "Synchronizace",
      testRemonline: "Test Remonline",
      settings: "Nastavení",
      infoBanner: "Informační banner",
      contactMessages: "Zprávy",
    },
    en: {
      dashboard: "Dashboard",
      users: "Users",
      brands: "Brands",
      models: "Models",
      series: "Series",
      services: "Services",
      descriptions: "Descriptions",
      discounts: "Discounts",
      orderStatuses: "Order Statuses",
      bulkImport: "Bulk Import",
      bulkServices: "Bulk Services",
      sync: "Synchronization",
      testRemonline: "Test Remonline",
      settings: "Settings",
      infoBanner: "Info Banner",
      contactMessages: "Messages",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  const isActive = (path: string) => {
    return pathname === `/${locale}/admin${path}`
  }

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/${locale}/admin`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <BarChart3Icon className="h-4 w-4" />
        {t.dashboard}
      </Link>
      <Link
        href={`/${locale}/admin/users`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/users") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <UsersIcon className="h-4 w-4" />
        {t.users}
      </Link>
      <Link
        href={`/${locale}/admin/brands`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/brands") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <SmartphoneIcon className="h-4 w-4" />
        {t.brands}
      </Link>
      <Link
        href={`/${locale}/admin/models`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/models") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <PackageIcon className="h-4 w-4" />
        {t.models}
      </Link>
      <Link
        href={`/${locale}/admin/series`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/series") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <TagIcon className="h-4 w-4" />
        {t.series}
      </Link>
      <Link
        href={`/${locale}/admin/descriptions`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/descriptions") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <FileTextIcon className="h-4 w-4" />
        {t.descriptions}
      </Link>
      <Link
        href={`/${locale}/admin/discounts`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/discounts") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <TagIcon className="h-4 w-4" />
        {t.discounts}
      </Link>
      <Link
        href={`/${locale}/admin/order-statuses`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/order-statuses") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <AlertTriangleIcon className="h-4 w-4" />
        {t.orderStatuses}
      </Link>
      <Link
        href={`/${locale}/admin/bulk-import`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/bulk-import") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <UploadIcon className="h-4 w-4" />
        {t.bulkImport}
      </Link>
      <Link
        href={`/${locale}/admin/bulk-services`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/bulk-services") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <UploadIcon className="h-4 w-4" />
        {t.bulkServices}
      </Link>
      <Link
        href={`/${locale}/admin/sync`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/sync") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <RefreshCwIcon className="h-4 w-4" />
        {t.sync}
      </Link>
      <Link
        href={`/${locale}/admin/test-remonline`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/test-remonline") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <SmartphoneIcon className="h-4 w-4" />
        {t.testRemonline}
      </Link>
      <Link
        href={`/${locale}/admin/banner`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/banner") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <BellIcon className="h-4 w-4" />
        {t.infoBanner}
      </Link>
      <Link
        href={`/${locale}/admin/contact-messages`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/contact-messages") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <MessageSquareTextIcon className="h-4 w-4" />
        {t.contactMessages}
      </Link>
      <Link
        href={`/${locale}/admin/settings`}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          isActive("/settings") ? "bg-muted font-medium text-primary" : "text-muted-foreground",
        )}
      >
        <SettingsIcon className="h-4 w-4" />
        {t.settings}
      </Link>
    </div>
  )
}
