"use client"

import { Suspense } from "react"
import { useTranslations } from "next-intl"
import { ModelsFilter } from "@/components/admin/models-filter"
import { ModelsList } from "@/components/admin/models-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ModelsPage() {
  const t = useTranslations("Admin")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("models")}</h1>
          <p className="text-muted-foreground">{t("modelsDescription")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/models/reorder">{t("reorderModels")}</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/models/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("addModel")}
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("modelsList")}</CardTitle>
          <CardDescription>{t("modelsListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ModelsFilter />
          <Suspense fallback={<div className="flex justify-center p-8">{t("loading")}</div>}>
            <ModelsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
