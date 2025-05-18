import React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Battery, Wifi, Shield, Brush, Droplet } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // Define all services with translation keys
  const services = [
    {
      id: "screen-replacement",
      icon: Smartphone,
      translationKey: "screenReplacement",
    },
    {
      id: "battery-replacement",
      icon: Battery,
      translationKey: "batteryReplacement",
    },
    {
      id: "board-repair",
      icon: Wifi,
      translationKey: "boardRepair",
    },
    {
      id: "screen-protection",
      icon: Shield,
      translationKey: "screenProtection",
    },
    {
      id: "phone-cleaning",
      icon: Brush,
      translationKey: "phoneCleaning",
    },
    {
      id: "water-damage-repair",
      icon: Droplet,
      translationKey: "waterDamageRepair",
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

        {/* Мобільна версія - вкладки */}
        <div className="md:hidden mb-8">
          <Tabs defaultValue={services[0].id} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              {services.slice(0, 3).map((service) => (
                <TabsTrigger key={service.id} value={service.id}>
                  {t(`${service.translationKey}.name`)}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsList className="grid grid-cols-3 mb-8">
              {services.slice(3, 6).map((service) => (
                <TabsTrigger key={service.id} value={service.id}>
                  {t(`${service.translationKey}.name`)}
                </TabsTrigger>
              ))}
            </TabsList>

            {services.map((service) => (
              <TabsContent key={service.id} value={service.id} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {React.createElement(service.icon, { className: "h-8 w-8 text-primary" })}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">{t(`${service.translationKey}.name`)}</h2>
                <p className="text-muted-foreground text-center mb-4">
                  {t(`${service.translationKey}.shortDescription`)}
                </p>
                <p className="mb-6">{t(`${service.translationKey}.fullDescription`)}</p>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("timeLabel")}</p>
                    <p className="font-medium">{t(`${service.translationKey}.estimatedTime`)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("priceLabel")}</p>
                    <p className="font-medium">{t(`${service.translationKey}.priceRange`)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("warrantyLabel")}</p>
                    <p className="font-medium">{t(`${service.translationKey}.warranty`)}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button asChild>
                    <Link
                      href={`/${params.locale}/contact?service=${encodeURIComponent(t(`${service.translationKey}.name`))}`}
                    >
                      {t("requestService")}
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Десктопна версія - картки з якорями */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card key={service.id} id={service.id} className="scroll-mt-24">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{t(`${service.translationKey}.name`)}</CardTitle>
                        <CardDescription>{t(`${service.translationKey}.shortDescription`)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6">{t(`${service.translationKey}.fullDescription`)}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t("estimatedTimeLabel")}</p>
                        <p className="font-medium">{t(`${service.translationKey}.estimatedTime`)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t("priceRangeLabel")}</p>
                        <p className="font-medium">{t(`${service.translationKey}.priceRange`)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t("warrantyLabel")}</p>
                        <p className="font-medium">{t(`${service.translationKey}.warranty`)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link
                        href={`/${params.locale}/contact?service=${encodeURIComponent(t(`${service.translationKey}.name`))}`}
                      >
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
    </div>
  )
}
