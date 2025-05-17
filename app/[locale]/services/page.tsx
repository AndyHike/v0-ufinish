import React from "react"
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

  // Define all services with detailed information
  const services = [
    {
      id: "screen-replacement",
      name: "Заміна екрану",
      shortDescription: "Швидка та якісна заміна екрану для всіх моделей",
      fullDescription:
        "Наші фахівці виконують професійну заміну екранів для смартфонів будь-яких брендів. Ми використовуємо тільки оригінальні або високоякісні сумісні деталі, що гарантує відмінну якість зображення та тривалий термін служби.",
      icon: Smartphone,
      estimatedTime: "30-60 хвилин",
      priceRange: "від 800 грн",
      warranty: "6 місяців",
    },
    {
      id: "battery-replacement",
      name: "Заміна батареї",
      shortDescription: "Відновіть тривалість роботи вашого пристрою",
      fullDescription:
        "З часом батарея смартфона втрачає ємність і швидше розряджається. Ми пропонуємо професійну заміну батареї з використанням якісних комплектуючих, що дозволить відновити тривалість роботи вашого пристрою.",
      icon: Battery,
      estimatedTime: "20-40 хвилин",
      priceRange: "від 500 грн",
      warranty: "3 місяці",
    },
    {
      id: "board-repair",
      name: "Ремонт плати",
      shortDescription: "Вирішення проблем з підключенням та живленням",
      fullDescription:
        "Ремонт материнської плати - одна з найскладніших процедур, яка вимагає високої кваліфікації. Наші майстри мають багаторічний досвід у діагностиці та ремонті плат, вирішуючи проблеми з підключенням, живленням та іншими компонентами.",
      icon: Wifi,
      estimatedTime: "1-3 дні",
      priceRange: "від 1200 грн",
      warranty: "3 місяці",
    },
    {
      id: "screen-protection",
      name: "Захист екрану",
      shortDescription: "Професійне встановлення захисного скла",
      fullDescription:
        "Захистіть свій пристрій від подряпин та пошкоджень з професійним встановленням захисного скла або плівки. Ми гарантуємо ідеальне нанесення без бульбашок повітря та пилу.",
      icon: Shield,
      estimatedTime: "10-15 хвилин",
      priceRange: "від 200 грн",
      warranty: "1 місяць",
    },
    {
      id: "phone-cleaning",
      name: "Чищення телефону",
      shortDescription: "Професійне чищення від пилу та забруднень",
      fullDescription:
        "З часом у вашому пристрої накопичується пил, бруд та інші забруднення, які можуть впливати на його роботу. Ми пропонуємо професійне чищення як зовнішніх, так і внутрішніх компонентів вашого смартфона.",
      icon: Brush,
      estimatedTime: "30-45 хвилин",
      priceRange: "від 300 грн",
      warranty: "1 місяць",
    },
    {
      id: "water-damage-repair",
      name: "Ремонт після води",
      shortDescription: "Порятунок пристроїв після контакту з рідиною",
      fullDescription:
        "Якщо ваш пристрій потрапив у воду або іншу рідину, важливо діяти швидко. Наші фахівці проведуть професійне чищення та відновлення компонентів, що постраждали від вологи, максимально збільшуючи шанси на повне відновлення функціональності.",
      icon: Droplet,
      estimatedTime: "1-2 дні",
      priceRange: "від 1000 грн",
      warranty: "1 місяць",
    },
  ]

  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pageTitle")}</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("pageDescription")}
          </p>
        </div>

        {/* Мобільна версія - вкладки */}
        <div className="md:hidden mb-8">
          <Tabs defaultValue={services[0].id} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              {services.slice(0, 3).map((service) => (
                <TabsTrigger key={service.id} value={service.id}>
                  {service.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsList className="grid grid-cols-3 mb-8">
              {services.slice(3, 6).map((service) => (
                <TabsTrigger key={service.id} value={service.id}>
                  {service.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {services.map((service) => (
              <TabsContent key={service.id} value={service.id} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {React.createElement(service.icon, { className: "h-8 w-8 text-primary" })}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">{service.name}</h2>
                <p className="text-muted-foreground text-center mb-4">{service.shortDescription}</p>
                <p className="mb-6">{service.fullDescription}</p>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Час</p>
                    <p className="font-medium">{service.estimatedTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Ціна</p>
                    <p className="font-medium">{service.priceRange}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Гарантія</p>
                    <p className="font-medium">{service.warranty}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button asChild>
                    <Link href={`/${params.locale}/contact?service=${encodeURIComponent(service.name)}`}>
                      {t("requestService")}
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Десктопна версія - картки з якорями */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card key={service.id} id={service.id} className="scroll-mt-24">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>{service.shortDescription}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6">{service.fullDescription}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Орієнтовний час</p>
                        <p className="font-medium">{service.estimatedTime}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Діапазон цін</p>
                        <p className="font-medium">{service.priceRange}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Гарантія</p>
                        <p className="font-medium">{service.warranty}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/${params.locale}/contact?service=${encodeURIComponent(service.name)}`}>
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
