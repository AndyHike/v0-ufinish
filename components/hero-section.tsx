"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function HeroSection() {
  const t = useTranslations("Hero")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  return (
    <section className="relative py-12 md:py-24 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {t("title")}
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">{t("subtitle")}</p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="#services">{t("servicesButton")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/brands">{t("chooseModelButton")}</Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CheckIcon className="h-4 w-4 text-primary" />
                <span>{t("feature1")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckIcon className="h-4 w-4 text-primary" />
                <span>{t("feature2")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckIcon className="h-4 w-4 text-primary" />
                <span>{t("feature3")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {isLoading ? (
              <div className="aspect-video w-full max-w-[600px] animate-pulse rounded-xl bg-muted"></div>
            ) : (
              <div className="relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl">
                <Image src="/phone-repair-close-up.png" alt={t("imageAlt")} fill className="object-cover" priority />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
