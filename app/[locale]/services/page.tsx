import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import { createServerClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "Services" })

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  }
}

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Services" })
  const supabase = createServerClient()

  // Fetch services with translations
  const { data: services } = await supabase
    .from("services")
    .select(`
      id, 
      position,
      services_translations!inner(
        name,
        description,
        locale
      )
    `)
    .eq("services_translations.locale", params.locale)
    .order("position", { ascending: true })

  // Transform the data
  const transformedServices =
    services?.map((service) => ({
      id: service.id,
      position: service.position,
      name: service.services_translations[0]?.name || "",
      description: service.services_translations[0]?.description || "",
    })) || []

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pageTitle")}</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("pageDescription")}
          </p>
        </div>

        <div className="grid gap-8">
          {transformedServices.map((service, index) => (
            <div
              key={service.id}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 rounded-lg border p-6 shadow-sm`}
            >
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-bold">{service.name}</h2>
                <p className="mb-6 text-muted-foreground">{service.description}</p>
                <Button asChild>
                  <Link href={`/${params.locale}/contact?service=${service.name}`}>{t("requestService")}</Link>
                </Button>
              </div>
              <div className="relative h-48 w-full flex-1 overflow-hidden rounded-lg md:h-auto">
                <Image
                  src={`/phone-repair-close-up.png?height=300&width=400&query=phone+repair+${service.name}`}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
