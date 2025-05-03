"use client"

import { useTranslations } from "next-intl"
import { PageHeader } from "@/components/page-header"
import { BulkServiceImport } from "@/components/admin/bulk-service-import"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BulkModelImport } from "@/components/admin/bulk-model-import"

export default function BulkServicesPage() {
  const t = useTranslations("Admin")

  return (
    <div className="space-y-6">
      <PageHeader heading={t("bulkImport")} text={t("bulkImportDescription")} />

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">{t("services")}</TabsTrigger>
          <TabsTrigger value="models">{t("models")}</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("bulkServiceImport")}</CardTitle>
              <CardDescription>{t("bulkServiceImportDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkServiceImport />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("bulkModelImport") || "Bulk Model Import"}</CardTitle>
              <CardDescription>
                {t("bulkModelImportDescription") ||
                  "Import multiple models at once using a CSV file. The file should contain columns for brand, model, and optionally series and image URL."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkModelImport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
