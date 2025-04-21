"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Battery, Wifi, Shield } from "lucide-react"
import { useEffect, useState } from "react"

type Service = {
  id: string
  name: string
  description: string
  position: number
}

export function ServicesSection() {
  const t = useTranslations("Services")
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/admin/services")
        if (!response.ok) throw new Error("Failed to fetch services")
        const data = await response.json()
        setServices(data.slice(0, 4)) // Get first 4 services for the homepage
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  const serviceIcons = [{ icon: Smartphone }, { icon: Battery }, { icon: Wifi }, { icon: Shield }]

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
          {isLoading
            ? Array(4)
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
            : services.map((service, index) => {
                const IconComponent = serviceIcons[index % serviceIcons.length].icon
                return (
                  <Card key={service.id} className="flex flex-col">
                    <CardHeader>
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
                      </div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1" />
                    <CardFooter>
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/services/${service.id}`}>{t("learnMore")}</Link>
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
