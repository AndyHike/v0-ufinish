import { HeroSection } from "@/components/hero-section"
import { ContactSection } from "@/components/contact-section"
import { BrandsSection } from "@/components/brands-section"
import { InfoBanner } from "@/components/info-banner"
import { QuickServicesSection } from "@/components/quick-services-section"

export default function DesignTestPage() {
  return (
    <div className="design-test-page">
      <div className="bg-yellow-100 p-2 text-center text-sm">Тестова сторінка для експериментів з дизайном</div>

      <InfoBanner />

      {/* Оновлена герой-секція */}
      <HeroSection />

      {/* Нова секція швидких послуг */}
      <QuickServicesSection />

      {/* Оптимізована секція брендів */}
      <BrandsSection />

      {/* Оновлена контактна секція */}
      <ContactSection />
    </div>
  )
}
