"use client"

import { useState, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Send, Phone, Mail, MapPin, Loader2, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ContactSection() {
  const t = useTranslations("Contact")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error(t("submitError"))
      }

      // Успішна відправка
      setIsSuccess(true)
      // Очищаємо форму
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
    } catch (err) {
      console.error("Error submitting form:", err)
      setError(err instanceof Error ? err.message : t("submitError"))
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-gray-500">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Інформаційна картка */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="grid gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t("phone")}</h3>
                      <p className="text-gray-500">+42075848259</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t("email")}</h3>
                      <p className="text-gray-500">info@devicehelp.cz</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t("address")}</h3>
                      <p className="text-gray-500">Praha 2</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t("workingHours")}</h3>
                      <p className="text-gray-500">{t("workingHoursWeekdays")}</p>
                      <p className="text-gray-500">{t("workingHoursSaturday")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Карта */}
            <div className="overflow-hidden rounded-lg shadow-md h-[250px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20479.84323795257!2d14.41993243476561!3d50.07762499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b94ea69e1a1a1%3A0x7c93c7eb4ba09925!2sPraha%202!5e0!3m2!1scs!2scz!4v1652345678901!5m2!1scs!2scz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            </div>
          </div>

          {/* Форма */}
          <Card className="border-none shadow-md">
            {isSuccess ? (
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{t("successTitle")}</h3>
                    <p className="text-gray-500">{t("successMessage")}</p>
                  </div>
                  <Button onClick={resetForm} className="mt-2">
                    {t("sendAnother")}
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{t("contactUs")}</h3>
                  <p className="text-gray-500 text-sm mt-1">{t("formDescription")}</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>{t("errorTitle")}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("nameLabel")}</Label>
                    <Input
                      id="name"
                      placeholder={t("namePlaceholder")}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("emailLabel")}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("phoneLabel")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("messageLabel")}</Label>
                    <Textarea
                      id="message"
                      placeholder={t("messagePlaceholder")}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        {t("send")}
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
