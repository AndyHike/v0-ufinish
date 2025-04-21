"use client"

import { useTranslations } from "next-intl"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ContactSection } from "@/components/contact-section"
import { BrandsSection } from "@/components/brands-section"

export default function Home() {
  const t = useTranslations("Home")

  return (
    <div className="container mx-auto px-4">
      <HeroSection />
      <ServicesSection />
      <BrandsSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  )
}
