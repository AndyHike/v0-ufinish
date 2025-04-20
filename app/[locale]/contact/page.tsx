"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  const t = useTranslations("Contact")
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: t("successTitle"),
      description: t("successMessage"),
    })

    setIsSubmitting(false)
    e.currentTarget.reset()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("contactUs")}</CardTitle>
              <CardDescription>{t("contactUsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      {t("nameLabel")}
                    </label>
                    <Input id="name" name="name" required placeholder={t("namePlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      {t("emailLabel")}
                    </label>
                    <Input id="email" name="email" type="email" required placeholder={t("emailPlaceholder")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    {t("phoneLabel")}
                  </label>
                  <Input id="phone" name="phone" type="tel" placeholder={t("phonePlaceholder")} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    {t("messageLabel")}
                  </label>
                  <Textarea id="message" name="message" required placeholder={t("messagePlaceholder")} rows={4} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t("sending") : t("send")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("phone")}</h3>
                  <p className="text-sm text-muted-foreground">+380 12 345 6789</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("email")}</h3>
                  <p className="text-sm text-muted-foreground">info@phonerepair.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("address")}</h3>
                  <p className="text-sm text-muted-foreground">{t("addressDetails")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("workingHours")}</h3>
                  <p className="text-sm text-muted-foreground">{t("workingHoursWeekdays")}</p>
                  <p className="text-sm text-muted-foreground">{t("workingHoursSaturday")}</p>
                  <p className="text-sm text-muted-foreground">{t("workingHoursSunday")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">{t("ourLocation")}</h2>
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            title={t("mapTitle")}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d325518.68780316407!2d30.252511957059642!3d50.4016990487754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cf4ee15a4505%3A0x764931d2170146fe!2sKyiv%2C%20Ukraine%2C%2002000!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  )
}
