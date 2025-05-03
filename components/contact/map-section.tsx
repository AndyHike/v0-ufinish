"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"

// Dynamically import the map component with no SSR
const ContactMap = dynamic(() => import("@/components/map/contact-map"), {
  loading: () => <MapPlaceholder />,
  ssr: false,
})

function MapPlaceholder() {
  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-2">
          <div className="h-8 w-8 rounded-full bg-gray-300 mx-auto"></div>
        </div>
        <p className="text-gray-500">Карта завантажується...</p>
      </div>
    </div>
  )
}

interface MapSectionProps {
  address: string
  height?: number
}

export default function MapSection({ address, height = 400 }: MapSectionProps) {
  const t = useTranslations("Contact")
  const [mapLoaded, setMapLoaded] = useState(false)

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">{t("ourLocation")}</h2>
      <div className="relative">
        <ContactMap address={address} height={height} className="shadow-md" onLoad={() => setMapLoaded(true)} />
      </div>
    </div>
  )
}
