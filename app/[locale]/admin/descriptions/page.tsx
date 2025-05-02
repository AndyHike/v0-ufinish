"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DescriptionsPage() {
  const t = useTranslations("Admin")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("descriptions")}</h1>
        <p className="text-muted-foreground">Керуйте описами послуг у вашій системі</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("descriptions")}</CardTitle>
          <CardDescription>Керуйте описами послуг для різних мов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">{t("featureUnderDevelopment")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
