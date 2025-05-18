"use client"

import { useTranslations } from "next-intl"
import { Smartphone, Battery, Wifi, Shield, Brush, Droplet } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"

export function QuickServicesSection() {
  const t = useTranslations("Services")
  const params = useParams()
  const locale = params.locale as string

  const services = [
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      titleKey: "screenReplacement.title",
      descriptionKey: "screenReplacement.description",
      link: `/${locale}/services#screen-replacement`,
    },
    {
      icon: <Battery className="h-6 w-6 text-primary" />,
      titleKey: "batteryReplacement.title",
      descriptionKey: "batteryReplacement.description",
      link: `/${locale}/services#battery-replacement`,
    },
    {
      icon: <Wifi className="h-6 w-6 text-primary" />,
      titleKey: "boardRepair.title",
      descriptionKey: "boardRepair.description",
      link: `/${locale}/services#board-repair`,
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      titleKey: "screenProtection.title",
      descriptionKey: "screenProtection.description",
      link: `/${locale}/services#screen-protection`,
    },
    {
      icon: <Brush className="h-6 w-6 text-primary" />,
      titleKey: "phoneCleaning.title",
      descriptionKey: "phoneCleaning.description",
      link: `/${locale}/services#phone-cleaning`,
    },
    {
      icon: <Droplet className="h-6 w-6 text-primary" />,
      titleKey: "waterDamage.title",
      descriptionKey: "waterDamage.description",
      link: `/${locale}/services#water-damage-repair`,
    },
  ]

  return (
    <section className="py-12 bg-white">
      <div className="container px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Мобільна версія - горизонтальна прокрутка */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="snap-center min-w-[250px] p-4 border rounded-lg shadow-sm bg-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">{service.icon}</div>
                  <h3 className="font-medium">{t(service.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4 flex-grow">{t(service.descriptionKey)}</p>
                  <Link href={service.link}>
                    <Button variant="outline" size="sm">
                      {t("moreDetails")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Десктопна версія - сітка */}
        <div className="hidden md:block">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="p-6 border rounded-lg shadow-sm bg-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">{service.icon}</div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">{t(service.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t(service.descriptionKey)}</p>
                    <Link href={service.link}>
                      <Button variant="outline" size="sm">
                        {t("moreDetails")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href={`/${locale}/services`}>
            <Button variant="default" size="lg">
              {t("allServices")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
