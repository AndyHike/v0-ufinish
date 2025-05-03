"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface LazyMapProps {
  address: string
  center: { lat: number; lng: number }
  zoom?: number
  height?: number
  className?: string
  mapUrl: string
}

export default function LazyMap({ address, center, zoom = 15, height = 400, className = "", mapUrl }: LazyMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Функція для завантаження інтерактивної карти
  const loadInteractiveMap = () => {
    if (typeof window === "undefined" || mapLoaded) return

    // Створюємо iframe для безпечного вбудовування карти
    const iframe = document.createElement("iframe")
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=${center.lat},${center.lng}&zoom=${zoom}`
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.style.border = "0"
    iframe.allowFullscreen = true
    iframe.loading = "lazy"
    iframe.referrerPolicy = "no-referrer-when-downgrade"

    const mapContainer = document.getElementById("google-map")
    if (mapContainer) {
      mapContainer.innerHTML = ""
      mapContainer.appendChild(iframe)
    }

    setMapLoaded(true)
    setMapVisible(true)
  }

  // Відстежуємо видимість карти для відкладеного завантаження
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !mapLoaded) {
          // При перетині видимої області просто показуємо статичну карту
          setMapVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    )

    observerRef.current.observe(mapRef.current)

    return () => {
      if (observerRef.current && mapRef.current) {
        observerRef.current.unobserve(mapRef.current)
      }
    }
  }, [mapLoaded])

  return (
    <div
      ref={mapRef}
      id="map-container"
      className={`relative w-full overflow-hidden rounded-lg ${className}`}
      style={{ height: `${height}px` }}
    >
      {!mapVisible ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Карта завантажується...</p>
        </div>
      ) : (
        <div className="w-full h-full">
          <Image
            src={mapUrl || "/placeholder.svg"}
            alt={`Карта розташування: ${address}`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover cursor-pointer"
            onClick={loadInteractiveMap}
            priority={false}
          />
          <div className="absolute bottom-4 left-0 right-0 bg-white/80 p-2 text-center">
            <p className="text-sm font-medium">Натисніть для інтерактивної карти</p>
          </div>
          <div id="google-map" className="w-full h-full hidden"></div>
        </div>
      )}
    </div>
  )
}
