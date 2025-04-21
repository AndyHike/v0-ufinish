import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"

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

  // Fetch brands from our unified API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/brands`, {
    cache: "no-store",
  })

  if (!response.ok) {
    console.error(`Failed to fetch brands: ${response.status}`)
  }

  const brands = await response.json()

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("brands.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("brands.subtitle")}</p>
      </div>
      <div className="space-y-4">
        {/* Render your brands list here */}
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center space-x-4">
              {brand.logo_url && (
                <img src={brand.logo_url || "/placeholder.svg"} alt={brand.name} className="w-10 h-10 object-contain" />
              )}
              <span className="font-medium">{brand.name}</span>
            </div>
            <div className="flex space-x-2">{/* Add your action buttons here */}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
