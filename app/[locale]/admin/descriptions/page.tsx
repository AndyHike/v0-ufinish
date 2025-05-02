import { getTranslations } from "next-intl/server"

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "Admin" })
  return {
    title: t("descriptions"),
  }
}

export default function DescriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Descriptions</h2>
        <p className="text-muted-foreground">This page is under development. Please check back later.</p>
      </div>
    </div>
  )
}
