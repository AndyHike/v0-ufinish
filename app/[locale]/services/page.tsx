import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { createServerClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Battery, Wifi, Shield } from "lucide-react"

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

  // Service icons mapping
  const serviceIcons = [{ icon: Smartphone }, { icon: Battery }, { icon: Wifi }, { icon: Shield }]

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pageTitle")}</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("pageDescription")}
          </p>
        </div>

        <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {transformedServices.map((service, index) => {
            const IconComponent = serviceIcons[index % serviceIcons.length].icon
            return (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
                  </div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/${params.locale}/contact?service=${service.name}`}>{t("requestService")}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
