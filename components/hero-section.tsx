"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const t = useTranslations("Hero")

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_450px] lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">{t("subtitle")}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>{t("feature1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>{t("feature2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>{t("feature3")}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row mt-4">
              <Link href="/contact" passHref>
                <Button size="lg" className="px-8">
                  {t("contactButton")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services" passHref>
                <Button size="lg" variant="outline" className="px-8">
                  {t("servicesButton")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[450px] h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/phone-repair-close-up.png"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 450px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
