"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Battery, Cpu, Shield, Droplets, Sparkles } from "lucide-react"

export function QuickServicesSection() {
  const t = useTranslations("Services")
  const params = useParams()
  const locale = params.locale as string

  const services = [
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      titleKey: "service1.title",
      descriptionKey: "service1.description",
    },
    {
      icon: <Battery className="h-8 w-8 text-primary" />,
      titleKey: "service2.title",
      descriptionKey: "service2.description",
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      titleKey: "service3.title",
      descriptionKey: "service3.description",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      titleKey: "service4.title",
      descriptionKey: "service4.description",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      titleKey: "phoneCleaning.title",
      descriptionKey: "phoneCleaning.description",
    },
    {
      icon: <Droplets className="h-8 w-8 text-primary" />,
      titleKey: "waterDamage.title",
      descriptionKey: "waterDamage.description",
    },
  ]

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="mb-2">{service.icon}</div>
                <CardTitle className="text-xl">{t(service.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{t(service.descriptionKey)}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${locale}/services`}>{t("learnMore")}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild>
            <Link href={`/${locale}/services`}>{t("allServicesButton")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
