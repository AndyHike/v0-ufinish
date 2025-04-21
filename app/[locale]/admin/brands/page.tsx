import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { BrandsList } from "@/components/admin/brands/brands-list"

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Admin" })

  return {
    title: t("brands.metaTitle"),
    description: t("brands.metaDescription"),
  }
}

export default async function AdminBrandsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "Admin" })
  const session = await getSession()

  if (!session || session.user.role !== "admin") {
    redirect(`/${locale}/auth/signin`)
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("brands.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("brands.subtitle")}</p>
      </div>

      {/* Use the BrandsList component from the correct path */}
      <BrandsList />
    </div>
  )
}
