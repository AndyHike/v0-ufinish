import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
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
  const commonT = await getTranslations({ locale: params.locale, namespace: "Common" })

  // Define the 4 specific services
  const services = [
    {
      id: "1",
      name: t("service1.title"),
      description: t("service1.description"),
      icon: Smartphone,
    },
    {
      id: "2",
      name: t("service2.title"),
      description: t("service2.description"),
      icon: Battery,
    },
    {
      id: "3",
      name: t("service3.title"),
      description: t("service3.description"),
      icon: Wifi,
    },
    {
      id: "4",
      name: t("service4.title"),
      description: t("service4.description"),
      icon: Shield,
    },
  ]

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pageTitle")}</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("pageDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {services.map((service) => {
            const IconComponent = service.icon
            return (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/${params.locale}/contact?service=${encodeURIComponent(service.name)}`}>
                      {t("requestService")}
                    </Link>
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
