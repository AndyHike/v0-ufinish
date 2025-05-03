"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import ContactForm from "@/components/contact/contact-form"
import MapSection from "@/components/contact/map-section"
import { useTranslations } from "next-intl"

export default function ContactPage() {
  const t = useTranslations("Contact")

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
              <ContactForm />
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
                  <p className="text-sm text-muted-foreground">+420 775 848 259</p>
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
                  <p className="text-sm text-muted-foreground">info@devicehelp.cz</p>
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

      <MapSection address={t("addressDetails")} height={400} />
    </div>
  )
}
