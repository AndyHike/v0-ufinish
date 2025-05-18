"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone, Battery, Wifi, Shield, Droplet, Brush } from "lucide-react"
import { useEffect, useState } from "react"

export function ServicesSection() {
  const t = useTranslations("Services")
  const [isLoading, setIsLoading] = useState(true)

  // Define the services with their icons
  const services = [
    {
      id: "1",
      icon: Smartphone,
      titleKey: "service1.title",
      descriptionKey: "service1.description",
    },
    {
      id: "2",
      icon: Battery,
      titleKey: "service2.title",
      descriptionKey: "service2.description",
    },
    {
      id: "3",
      icon: Wifi,
      titleKey: "service3.title",
      descriptionKey: "service3.description",
    },
    {
      id: "4",
      icon: Shield,
      titleKey: "service4.title",
      descriptionKey: "service4.description",
    },
    {
      id: "5",
      icon: Brush,
      titleKey: "phoneCleaning.title",
      descriptionKey: "phoneCleaning.description",
    },
    {
      id: "6",
      icon: Droplet,
      titleKey: "waterDamage.title",
      descriptionKey: "waterDamage.description",
    },
  ]

  useEffect(() => {
    // Simulate loading for a brief moment
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-8 md:py-12 bg-gray-50" id="services">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">{t("title")}</h2>
          <p className="max-w-[700px] text-muted-foreground text-sm md:text-base">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {isLoading
            ? Array(6)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm h-[140px] md:h-[160px] animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-gray-200 mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                  </div>
                ))
            : services.map((service) => {
                const Icon = service.icon
                return (
                  <Link
                    href="/services"
                    key={service.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow transition-all duration-200 flex flex-col h-[140px] md:h-[160px] group"
                  >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm md:text-base mb-1">{t(service.titleKey)}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{t(service.descriptionKey)}</p>
                    <div className="mt-auto pt-2">
                      <span className="text-xs text-primary font-medium group-hover:underline">{t("learnMore")} →</span>
                    </div>
                  </Link>
                )
              })}
        </div>

        <div className="flex justify-center mt-6">
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/services">{t("allServicesButton")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
