"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Smartphone } from "lucide-react"

export function HeroSection() {
  const t = useTranslations("Hero")

  return (
    <section className="w-full py-8 md:py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">{t("subtitle")}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{t("feature1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{t("feature2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{t("feature3")}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row mt-4">
              <Link href="/contact" passHref>
                <Button size="lg" className="w-full sm:w-auto">
                  {t("contactButton")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/brands" passHref>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Smartphone className="mr-2 h-4 w-4" />
                  {t("servicesButton")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Зображення для всіх пристроїв */}
          <div className="relative h-[250px] md:h-[350px] w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src="/focused-phone-fix.png"
              alt={t("imageAlt")}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
