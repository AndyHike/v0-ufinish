import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import ModelPageClient from "./ModelPageClient"

type Props = {
  params: {
    locale: string
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = params
  const t = await getTranslations({ locale, namespace: "Models" })

  return {
    title: `Loading...`,
    description: `Loading...`,
  }
}

export default async function ModelPage({ params }: Props) {
  return <ModelPageClient params={params} />
}
