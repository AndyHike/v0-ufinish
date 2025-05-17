import { getTranslations } from "next-intl/server"
import ServicesClientPage from "./ServicesClientPage"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "services" })

  return {
    title: t("title"),
    description: t("subtitle"),
  }
}

export default function ServicesPage() {
  return <ServicesClientPage />
}
