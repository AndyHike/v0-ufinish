import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone, Battery, Wifi, Shield, Brush, Droplet } from "lucide-react"

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
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      id: "battery-replacement",
      icon: Battery,
      translationKey: "batteryReplacement",
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      id: "board-repair",
      icon: Wifi,
      translationKey: "boardRepair",
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      id: "screen-protection",
      icon: Shield,
      translationKey: "screenProtection",
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      id: "phone-cleaning",
      icon: Brush,
      translationKey: "phoneCleaning",
      color: "bg-teal-50 text-teal-600 border-teal-100",
    },
    {
      id: "water-damage-repair",
      icon: Droplet,
      translationKey: "waterDamageRepair",
      color: "bg-cyan-50 text-cyan-600 border-cyan-100",
    },
  ]

  return (
    <div className="container px-4 py-6 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 md:mb-12 space-y-2 md:space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">{t("pageTitle")}</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-sm md:text-base">{t("pageDescription")}</p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {services.map((service) => {
            const IconComponent = service.icon
            return (
              <div
                key={service.id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm border ${service.color.split(" ").pop().replace("text-", "border-")}`}
              >
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${service.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold">{t(`${service.translationKey}.name`)}</h2>
                  </div>

                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    {t(`${service.translationKey}.shortDescription`)}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 md:p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t("timeLabel")}</p>
                      <p className="text-sm font-medium">{t(`${service.translationKey}.estimatedTime`)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 md:p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t("priceLabel")}</p>
                      <p className="text-sm font-medium">{t(`${service.translationKey}.priceRange`)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 md:p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t("warrantyLabel")}</p>
                      <p className="text-sm font-medium">{t(`${service.translationKey}.warranty`)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
                    <p className="text-xs md:text-sm">{t(`${service.translationKey}.fullDescription`)}</p>
                  </div>

                  <div className="flex justify-center md:justify-start">
                    <Button asChild className="w-full md:w-auto rounded-lg text-sm">
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
    </div>
  )
}
