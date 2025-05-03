"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useInView } from "react-intersection-observer"

interface LazyMapProps {
  address: string
  center: { lat: number; lng: number }
  zoom: number
  height: number
  className?: string
  mapUrl: string
}

export default function LazyMap({ address, center, height, className = "", mapUrl }: LazyMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Load Google Maps script only once when component is in view
  useEffect(() => {
    if (!inView || mapLoaded || window.google?.maps) return

    const loadGoogleMapsScript = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        if (window.google?.maps) {
          setMapLoaded(true)
          initMap()
        }
        return
      }

      const script = document.createElement("script")
      script.src = `/api/maps/script`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapLoaded(true)
        initMap()
      }
      script.onerror = () => {
        console.error("Failed to load Google Maps script")
        setMapError(true)
      }
      document.head.appendChild(script)
    }

    // Debounce the script loading to prevent multiple calls
    const timer = setTimeout(loadGoogleMapsScript, 300)
    return () => clearTimeout(timer)
  }, [inView, mapLoaded])

  // Initialize map when script is loaded
  const initMap = () => {
    if (!mapRef.current || !window.google?.maps) return

    try {
      if (mapInstance.current) return // Map already initialized

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
      })

      new window.google.maps.Marker({
        position: center,
        map: mapInstance.current,
        title: address,
      })
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapError(true)
    }
  }

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-lg ${className}`} style={{ height: `${height}px` }}>
      {!inView || (!mapLoaded && !mapError) ? (
        // Show static image until map is loaded
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          {mapUrl && (
            <Image
              src={mapUrl || "/placeholder.svg"}
              alt={address}
              width={800}
              height={height}
              className="w-full h-full object-cover"
              priority={false}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <p className="text-sm text-gray-600">Карта завантажується...</p>
          </div>
        </div>
      ) : mapError ? (
        // Show error state
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <p className="text-red-500">Не вдалося завантажити карту</p>
        </div>
      ) : (
        // Show interactive map
        <div ref={mapRef} className="w-full h-full" />
      )}
    </div>
  )
}
