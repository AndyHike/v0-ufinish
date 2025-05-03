"use client"

import { useState, useEffect, useRef } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string
  lowQualitySrc?: string
  loadingClassName?: string
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  lowQualitySrc,
  className,
  loadingClassName,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imgSrc, setImgSrc] = useState(lowQualitySrc || src)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Функція для завантаження зображення коли воно стає видимим
  useEffect(() => {
    if (typeof window === "undefined" || !imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Коли зображення стає видимим, завантажуємо повну версію
          if (lowQualitySrc && imgSrc === lowQualitySrc) {
            setImgSrc(src)
          }

          // Відключаємо спостереження після завантаження
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current)
          }
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current)
      }
    }
  }, [lowQualitySrc, imgSrc, src])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && <div className={cn("absolute inset-0 bg-gray-100 animate-pulse", loadingClassName)} />}
      <Image
        ref={imgRef}
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc)
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
}
