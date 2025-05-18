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
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "battery-replacement",
      icon: Battery,
      translationKey: "batteryReplacement",
      color: "bg-green-50 text-green-600",
    },
    {
      id: "board-repair",
      icon: Wifi,
      translationKey: "boardRepair",
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "screen-protection",
      icon: Shield,
      translationKey: "screenProtection",
      color: "bg-amber-50 text-amber-600",
    },
    {
      id: "phone-cleaning",
      icon: Brush,
      translationKey: "phoneCleaning",
      color: "bg-teal-50 text-teal-600",
    },
    {
      id: "water-damage-repair",
      icon: Droplet,
      translationKey: "waterDamageRepair",
      color: "bg-cyan-50 text-cyan-600",
    },
  ]

  return (
    <div className="container px-4 py-6 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 md:mb-12 space-y-2 md:space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">{t("pageTitle")}</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-sm md:text-base">{t("pageDescription")}</p>
        </div>

        {/* Мобільна версія - сучасні картки */}
        <div className="md:hidden">
          <div className="space-y-4">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${service.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold">{t(`${service.translationKey}.name`)}</h2>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {t(`${service.translationKey}.shortDescription`)}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">{t("timeLabel")}</p>
                        <p className="text-sm font-medium">{t(`${service.translationKey}.estimatedTime`)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">{t("priceLabel")}</p>
                        <p className="text-sm font-medium">{t(`${service.translationKey}.priceRange`)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">{t("warrantyLabel")}</p>
                        <p className="text-sm font-medium">{t(`${service.translationKey}.warranty`)}</p>
                      </div>
                    </div>

                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-3">
                        <TabsTrigger value="details" className="text-xs">
                          {t("detailsTab")}
                        </TabsTrigger>
                        <TabsTrigger value="process" className="text-xs">
                          {t("processTab")}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="text-xs">
                        <p>{t(`${service.translationKey}.fullDescription`)}</p>
                      </TabsContent>
                      <TabsContent value="process" className="text-xs">
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>{t(`${service.translationKey}.process.step1`)}</li>
                          <li>{t(`${service.translationKey}.process.step2`)}</li>
                          <li>{t(`${service.translationKey}.process.step3`)}</li>
                        </ol>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-4">
                      <Button asChild className="w-full rounded-lg text-sm">
                        <Link
                          href={`/${params.locale}/contact?service=${encodeURIComponent(t(`${service.translationKey}.name`))}`}
                        >
                          {t("requestService")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Десктопна версія - картки з якорями */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card key={service.id} id={service.id} className="scroll-mt-24 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${service.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>{t(`${service.translationKey}.name`)}</CardTitle>
                        <CardDescription>{t(`${service.translationKey}.shortDescription`)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t("estimatedTimeLabel")}</p>
                        <p className="font-medium">{t(`${service.translationKey}.estimatedTime`)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t("priceRangeLabel")}</p>
                        <p className="font-medium">{t(`${service.translationKey}.priceRange`)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t("warrantyLabel")}</p>
                        <p className="font-medium">{t(`${service.translationKey}.warranty`)}</p>
                      </div>
                    </div>

                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4 max-w-md">
                        <TabsTrigger value="details">{t("detailsTab")}</TabsTrigger>
                        <TabsTrigger value="process">{t("processTab")}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details">
                        <p className="mb-6">{t(`${service.translationKey}.fullDescription`)}</p>
                      </TabsContent>
                      <TabsContent value="process">
                        <div className="mb-6">
                          <h3 className="font-medium mb-2">{t("processTitle")}</h3>
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>{t(`${service.translationKey}.process.step1`)}</li>
                            <li>{t(`${service.translationKey}.process.step2`)}</li>
                            <li>{t(`${service.translationKey}.process.step3`)}</li>
                          </ol>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full md:w-auto">
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
