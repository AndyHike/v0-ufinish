"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AboutPage() {
  // Since we don't have about translations yet, we'll use the Services translations for the title
  const t = useTranslations("Services")

  // Mock team members
  const team = [
    {
      name: "Alex Johnson",
      role: "Founder & Master Technician",
      image: "/diverse-group-city.png",
      bio: "With over 15 years of experience in mobile device repair, Alex founded our company with a vision to provide high-quality repairs with exceptional customer service.",
    },
    {
      name: "Maria Rodriguez",
      role: "Senior Repair Specialist",
      image: "/diverse-group-city.png",
      bio: "Maria specializes in microsoldering and board-level repairs. Her attention to detail and precision make her our go-to expert for the most challenging repairs.",
    },
    {
      name: "David Kim",
      role: "Customer Service Manager",
      image: "/diverse-group-city.png",
      bio: "David ensures that every customer receives personalized attention and clear communication throughout the repair process.",
    },
    {
      name: "Sarah Chen",
      role: "Technical Support Specialist",
      image: "/diverse-group-city.png",
      bio: "Sarah helps customers troubleshoot issues and provides expert advice on device maintenance and care.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">About Us</h1>
        <p className="mt-4 text-xl text-muted-foreground">Learn more about our company and our expert team</p>
      </div>

      <div className="mb-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Our Story</h2>
          <p className="mb-4 text-muted-foreground">
            Founded in 2010, our phone repair service began with a simple mission: to provide fast, reliable, and
            affordable repairs for all types of mobile devices. What started as a small workshop has grown into a
            trusted service center with multiple locations.
          </p>
          <p className="mb-4 text-muted-foreground">
            We take pride in our technical expertise, quality parts, and commitment to customer satisfaction. Every
            repair is backed by our warranty, giving you peace of mind that your device is in good hands.
          </p>
          <p className="text-muted-foreground">
            Today, we continue to expand our services to meet the evolving needs of our customers, while maintaining the
            personalized approach that has been our hallmark from the beginning.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
            <Image src="/tech-fix-storefront.png" alt="Our repair shop" fill className="object-cover" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-8 text-center text-2xl font-bold">Meet Our Team</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <Avatar className="mx-auto h-24 w-24">
                  <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-lg font-bold">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="mt-4 text-sm text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
