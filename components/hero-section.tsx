"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

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
                <Link href="/brands">
                  {t("chooseModelButton")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">{t("contactButton")}</Link>
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
            <img
              alt={t("imageAlt")}
              className="aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height="550"
              src="/focused-phone-fix.png"
              width="550"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
