import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { BrandsSection } from "@/components/brands-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ContactSection } from "@/components/contact-section"

export default function Home() {
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
