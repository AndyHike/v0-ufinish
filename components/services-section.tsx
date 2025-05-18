"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
    }, 500)
    return () => clearTimeout(timer)
  }, [])

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
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {isLoading
            ? Array(6)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <div className="mb-2 h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
                      <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                      <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                    </CardHeader>
                    <CardContent className="flex-1" />
                    <CardFooter>
                      <div className="h-10 w-full animate-pulse rounded bg-muted"></div>
                    </CardFooter>
                  </Card>
                ))
            : services.map((service) => {
                const Icon = service.icon
                return (
                  <Card key={service.id} className="flex flex-col">
                    <CardHeader>
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{t(service.titleKey)}</CardTitle>
                      <CardDescription>{t(service.descriptionKey)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1" />
                    <CardFooter>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/contact">{t("requestService")}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
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
