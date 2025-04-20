"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Battery, Wifi, Shield } from "lucide-react"

export function ServicesSection() {
  const t = useTranslations("Services")

  const services = [
    {
      icon: Smartphone,
      title: t("service1.title"),
      description: t("service1.description"),
      href: "/services/screen-repair",
    },
    {
      icon: Battery,
      title: t("service2.title"),
      description: t("service2.description"),
      href: "/services/battery-replacement",
    },
    {
      icon: Wifi,
      title: t("service3.title"),
      description: t("service3.description"),
      href: "/services/connectivity-issues",
    },
    {
      icon: Shield,
      title: t("service4.title"),
      description: t("service4.description"),
      href: "/services/water-damage",
    },
  ]

  return (
    <section className="py-12 md:py-24" id="services">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-8">
          {services.map((service, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href={service.href}>{t("learnMore")}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/services">{t("allServicesButton")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
