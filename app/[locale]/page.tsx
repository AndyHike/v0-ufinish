import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { ContactSection } from "@/components/contact-section"
import { BrandsSection } from "@/components/brands-section"
import OptimizedImage from "@/components/ui/optimized-image"
import { getLowQualityImageUrl } from "@/lib/image-utils"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandsSection />
      <OptimizedImage
        src="/smartphone-repair-close-up.png"
        alt="Ремонт смартфонів"
        lowQualitySrc={getLowQualityImageUrl("/smartphone-repair-close-up.png")}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 1200px"
        className="rounded-lg shadow-lg"
        priority={true} // Для зображень у видимій області екрану
      />
      <ServicesSection />
      <ContactSection />
    </>
  )
}
