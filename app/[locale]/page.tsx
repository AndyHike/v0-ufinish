import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { ContactSection } from "@/components/contact-section"
import { BrandsSection } from "@/components/brands-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandsSection />
      <ServicesSection />
      <ContactSection />
    </>
  )
}
