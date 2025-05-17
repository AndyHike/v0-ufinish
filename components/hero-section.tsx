"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle } from "lucide-react"

export function HeroSection() {
  const t = useTranslations("Hero")
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState("/phone-repair-close-up.png")

  // Перевірка доступності зображення та запасний варіант
  useEffect(() => {
    const img = new Image()
    img.src = "/phone-repair-close-up.png"

    img.onload = () => {
      setIsImageLoaded(true)
      setImageSrc("/phone-repair-close-up.png")
    }

    img.onerror = () => {
      console.warn("Primary image failed to load, using fallback")
      setImageSrc("/focused-phone-fix.png")
      setIsImageLoaded(true)
    }
  }, [])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_800px] items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {t("title")}
              </h1>
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
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] rounded-2xl overflow-hidden shadow-xl">
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {isImageLoaded && (
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={t("imageAlt")}
                fill
                className="object-cover rounded-2xl transition-opacity duration-500"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
