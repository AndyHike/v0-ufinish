"use client"

import { Suspense } from "react"
import { useTranslations } from "next-intl"
import { ModelsFilter } from "@/components/admin/models-filter"
import { ModelsList } from "@/components/admin/models-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, MoveVertical } from "lucide-react"
import Link from "next/link"

export default function ModelsPage() {
  const t = useTranslations("Admin")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("models")}</h1>
        <p className="text-muted-foreground">{t("manageModels")}</p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/models/reorder">
            <MoveVertical className="mr-2 h-4 w-4" />
            {t("reorderModels")}
          </Link>
        </Button>
        <Button asChild>
          <Link href="/admin/models/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("addModel")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div>
            <h2 className="text-xl font-semibold">{t("models")}</h2>
            <p className="text-sm text-muted-foreground">{t("modelsDescription")}</p>
          </div>

          <div className="mt-4">
            <ModelsFilter />
            <Suspense fallback={<div className="flex justify-center p-8">{t("loading")}</div>}>
              <ModelsList />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
