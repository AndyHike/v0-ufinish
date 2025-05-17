"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  const t = useTranslations("Hero")
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_800px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {t("title")}
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">{t("subtitle")}</p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/uk/contact" passHref>
                <Button size="lg" className="px-8">
                  {t("requestService")}
                </Button>
              </Link>
              <Link href="/uk/services" passHref>
                <Button size="lg" variant="outline" className="px-8">
                  {t("viewServices")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px]">
            <div
              className={`absolute inset-0 bg-gray-100 rounded-lg ${
                isImageLoaded ? "hidden" : "flex items-center justify-center"
              }`}
            >
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <Image
              src="/phone-repair-close-up.png"
              alt={t("imageAlt")}
              fill
              className={`object-cover rounded-lg ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setIsImageLoaded(true)}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
