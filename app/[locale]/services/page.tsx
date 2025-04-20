"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Battery, Wifi, Shield } from "lucide-react"

export default function ServicesPage() {
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {services.map((service, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <service.icon className="h-6 w-6 text-primary" />
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
    </div>
  )
}
