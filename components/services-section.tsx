"use client"

import { useTranslations } from "next-intl"
import { Smartphone, Battery, Wifi, Shield, Droplet, Brush } from "lucide-react"

export function ServicesSection() {
  const t = useTranslations("ServicesSection")

  const services = [
    {
      icon: Smartphone,
      title: "screenReplacement.title",
      description: "screenReplacement.description",
      buttonText: "moreDetails",
    },
    {
      icon: Battery,
      title: "batteryReplacement.title",
      description: "batteryReplacement.description",
      buttonText: "moreDetails",
    },
    {
      icon: Wifi,
      title: "boardRepair.title",
      description: "boardRepair.description",
      buttonText: "moreDetails",
    },
    {
      icon: Shield,
      title: "screenProtection.title",
      description: "screenProtection.description",
      buttonText: "moreDetails",
    },
    {
      icon: Brush,
      title: "phoneCleaning.title",
      description: "phoneCleaning.description",
      buttonText: "moreDetails",
    },
    {
      icon: Droplet,
      title: "waterDamage.title",
      description: "waterDamage.description",
      buttonText: "moreDetails",
    },
  ]

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2">{t("title")}</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">{t("subtitle")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <service.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t(service.title)}</h3>
              <p className="text-gray-600 mb-4">{t(service.description)}</p>
              <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                {t(service.buttonText)}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/services"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            {t("allServices")}
          </a>
        </div>
      </div>
    </section>
  )
}
