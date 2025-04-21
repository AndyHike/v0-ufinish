"use client"

import { useTranslations } from "next-intl"
import { ModelForm } from "@/components/admin/model-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function EditModelPage({ params }: { params: { id: string } }) {
  const t = useTranslations("Admin")
  const modelId = params.id

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
        <h1 className="text-2xl font-bold tracking-tight">{t("editModel")}</h1>
        <p className="text-muted-foreground">{t("editModelDescription")}</p>
      </div>

      <ModelForm modelId={modelId} />
    </div>
  )
}
