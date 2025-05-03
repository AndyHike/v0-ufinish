"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import the map component with no SSR to prevent hydration issues
const ContactMap = dynamic(() => import("@/components/map/contact-map"), {
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Карта завантажується...</p>
    </div>
  ),
  ssr: false,
})

interface MapSectionProps {
  address: string
  height?: number
}

export default function MapSection({ address, height = 400 }: MapSectionProps) {
  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Наше розташування</h2>
      <Suspense fallback={<div className="w-full h-[400px] bg-gray-100 rounded-lg"></div>}>
        <ContactMap address={address} height={height} className="shadow-md" />
      </Suspense>
    </div>
  )
}
