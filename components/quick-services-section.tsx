"use client"

import { useTranslations } from "next-intl"
import { Smartphone, Battery, Wifi, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export function QuickServicesSection() {
  const t = useTranslations()

  const services = [
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      title: "Заміна екрану",
      description: "Швидка та якісна заміна екрану для всіх моделей",
      link: "/services#screen-replacement",
    },
    {
      icon: <Battery className="h-6 w-6 text-primary" />,
      title: "Заміна батареї",
      description: "Відновіть тривалість роботи вашого пристрою",
      link: "/services#battery-replacement",
    },
    {
      icon: <Wifi className="h-6 w-6 text-primary" />,
      title: "Ремонт плати",
      description: "Вирішення проблем з підключенням та живленням",
      link: "/services#board-repair",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Захист екрану",
      description: "Професійне встановлення захисного скла",
      link: "/services#screen-protection",
    },
  ]

  return (
    <section className="py-8 bg-gray-50">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Популярні послуги</h2>

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
                <h3 className="font-medium">{service.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4 flex-grow">{service.description}</p>
                <Link href={service.link}>
                  <Button variant="outline" size="sm">
                    Детальніше
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/services">
            <Button variant="default">Всі послуги</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
