"use client"

import { useTranslations } from "next-intl"
import { ModelsReorder } from "@/components/admin/models-reorder"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function ReorderModelsPage() {
  const t = useTranslations("Admin")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/models">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("backToModels")}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("reorderModels")}</h1>
        <p className="text-muted-foreground">{t("reorderModelsDescription")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("reorderModels")}</CardTitle>
          <CardDescription>{t("dragAndDropToReorder")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ModelsReorder />
        </CardContent>
      </Card>
    </div>
  )
}
