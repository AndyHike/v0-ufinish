"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Smartphone } from "lucide-react"
import { useParams } from "next/navigation"

export function HeroSection() {
  const t = useTranslations("Hero")
  const params = useParams()
  const locale = params.locale as string

  return (
    <section className="w-full py-8 md:py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Мобільна версія - компактніша з чіткішим закликом до дії */}
        <div className="md:hidden flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter mb-4">{t("title")}</h1>
          <div className="relative w-full h-[200px] rounded-xl overflow-hidden shadow-lg mb-6">
            <img
              src="/focused-phone-fix.png"
              alt={t("imageAlt")}
              className="w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <p className="text-gray-500 mb-6">{t("subtitle")}</p>

          <div className="grid grid-cols-1 gap-3 w-full mb-6">
            <Link href={`/${locale}/brands`} passHref className="w-full">
              <Button size="lg" className="w-full">
                <Smartphone className="mr-2 h-5 w-5" />
                {t("repairMyDevice")}
              </Button>
            </Link>
            <Link href={`/${locale}/contact`} passHref className="w-full">
              <Button size="lg" variant="outline" className="w-full">
                {t("contactButton")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3 text-left">
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
        </div>

        {/* Десктопна версія - залишається як була, але з покращеннями */}
        <div className="hidden md:grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 items-center">
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
              <Link href={`/${locale}/brands`} passHref>
                <Button size="lg" className="w-full sm:w-auto">
                  <Smartphone className="mr-2 h-4 w-4" />
                  {t("repairMyDevice")}
                </Button>
              </Link>
              <Link href={`/${locale}/contact`} passHref>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t("contactButton")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-[250px] md:h-[350px] w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src="/focused-phone-fix.png"
              alt={t("imageAlt")}
              className="w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
