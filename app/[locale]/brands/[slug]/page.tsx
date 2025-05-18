import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createServerClient } from "@/utils/supabase/server"
import BrandPageClient from "./BrandPageClient"

type Props = {
  params: {
    locale: string
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = params
  const t = await getTranslations({ locale, namespace: "Brands" })

  const supabase = createServerClient()

  // Спочатку спробуємо знайти за слагом
  let { data: brand } = await supabase.from("brands").select("*").eq("slug", slug).single()

  // Якщо не знайдено за слагом, спробуємо знайти за ID
  if (!brand) {
    const { data } = await supabase.from("brands").select("*").eq("id", slug).single()
    brand = data
  }

  if (!brand) {
    return {
      title: t("brandNotFound"),
      description: t("brandNotFoundDesc"),
    }
  }

  return {
    title: `${brand.name} - ${t("repairServices")}`,
    description: t("brandPageDescription", { brand: brand.name }),
  }
}

export default function BrandPage({ params }: Props) {
  return <BrandPageClient params={params} />
}
