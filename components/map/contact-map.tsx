"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface ContactMapProps {
  address: string
  height?: number
  className?: string
  onLoad?: () => void
}

export default function ContactMap({ address, height = 400, className = "", onLoad }: ContactMapProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)

  // Fetch static map URL once
  useEffect(() => {
    const getStaticMap = async () => {
      try {
        const response = await fetch(`/api/maps/static?address=${encodeURIComponent(address)}`)
        if (!response.ok) throw new Error("Failed to get static map")
        const data = await response.json()
        setStaticMapUrl(data.url)
      } catch (err) {
        console.error("Error getting static map:", err)
        setError(true)
      }
    }

    getStaticMap()
  }, [address])

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || mapInitialized.current) return

    const loadMap = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          initMap()
          return
        }

        // Load Google Maps script
        const script = document.createElement("script")
        script.src = `/api/maps/script`
        script.async = true
        script.defer = true

        script.onload = () => {
          initMap()
        }

        script.onerror = () => {
          console.error("Failed to load Google Maps")
          setError(true)
          setLoading(false)
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error("Error loading map:", err)
        setError(true)
        setLoading(false)
      }
    }

    // Delay map loading to prevent multiple requests
    const timer = setTimeout(loadMap, 500)
    return () => clearTimeout(timer)
  }, [])

  const initMap = () => {
    if (!mapRef.current || !window.google?.maps || mapInitialized.current) return

    try {
      // Geocode the address
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location

          // Create the map
          const map = new window.google.maps.Map(mapRef.current!, {
            center: location,
            zoom: 15,
            mapTypeControl: false,
            fullscreenControl: false,
          })

          // Add a marker
          new window.google.maps.Marker({
            map,
            position: location,
            title: address,
          })

          mapInitialized.current = true
          setLoading(false)
          if (onLoad) onLoad()
        } else {
          console.error("Geocode failed:", status)
          setError(true)
          setLoading(false)
        }
      })
    } catch (err) {
      console.error("Error initializing map:", err)
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height: `${height}px` }}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          {staticMapUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={staticMapUrl || "/placeholder.svg"}
                alt={`Map of ${address}`}
                fill
                className="object-cover"
                priority={false}
              />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                <div className="bg-white/80 px-4 py-2 rounded-md">
                  <p className="text-sm">Інтерактивна карта завантажується...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-pulse mb-2">
                <div className="h-8 w-8 rounded-full bg-gray-300 mx-auto"></div>
              </div>
              <p className="text-gray-500">Карта завантажується...</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <p className="text-red-500 mb-2">Не вдалося завантажити карту</p>
            <p className="text-gray-600">{address}</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  )
}
