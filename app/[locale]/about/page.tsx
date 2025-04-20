"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AboutPage() {
  const t = useTranslations("About")

  // Mock team members
  const team = [
    {
      name: "Alex Johnson",
      role: t("founder"),
      image: "/diverse-group-city.png",
      bio: "With over 15 years of experience in mobile device repair, Alex founded our company with a vision to provide high-quality repairs with exceptional customer service.",
    },
    {
      name: "Maria Rodriguez",
      role: t("seniorSpecialist"),
      image: "/diverse-group-city.png",
      bio: "Maria specializes in microsoldering and board-level repairs. Her attention to detail and precision make her our go-to expert for the most challenging repairs.",
    },
    {
      name: "David Kim",
      role: t("customerManager"),
      image: "/diverse-group-city.png",
      bio: "David ensures that every customer receives personalized attention and clear communication throughout the repair process.",
    },
    {
      name: "Sarah Chen",
      role: t("techSupport"),
      image: "/diverse-group-city.png",
      bio: "Sarah helps customers troubleshoot issues and provides expert advice on device maintenance and care.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{t("about")}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{t("aboutSubtitle")}</p>
      </div>

      <div className="mb-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">{t("ourStory")}</h2>
          <p className="mb-4 text-muted-foreground">{t("storyPart1")}</p>
          <p className="mb-4 text-muted-foreground">{t("storyPart2")}</p>
          <p className="text-muted-foreground">{t("storyPart3")}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
            <Image src="/tech-fix-storefront.png" alt={t("ourShop")} fill className="object-cover" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-8 text-center text-2xl font-bold">{t("meetOurTeam")}</h2>
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
