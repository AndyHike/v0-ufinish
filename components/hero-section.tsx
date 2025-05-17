"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const t = useTranslations("Hero")

  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">{t("title")}</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">{t("subtitle")}</p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/contact">
                  {t("contactButton")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/services">{t("servicesButton")}</Link>
              </Button>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">{t("feature1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">{t("feature2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">{t("feature3")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[550px] aspect-video overflow-hidden rounded-xl">
              <Image
                alt={t("imageAlt")}
                className="object-cover object-center"
                src="/focused-phone-fix.png"
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
