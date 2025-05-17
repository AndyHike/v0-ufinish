"use client"

import { useState, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, Send, Phone, Mail, MapPin, Loader2, Clock, ArrowRight } from "lucide-react"
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

      setIsSuccess(true)
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

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Декоративні елементи */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl mb-3">{t("title")}</h2>
          <p className="max-w-[700px] mx-auto text-gray-500 md:text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Контактна інформація */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("phone")}</h3>
                    <p className="text-gray-600">+42075848259</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("email")}</h3>
                    <p className="text-gray-600">info@devicehelp.cz</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("address")}</h3>
                    <p className="text-gray-600">Praha 2</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("workingHours")}</h3>
                    <p className="text-gray-600">{t("workingHoursWeekdays")}</p>
                    <p className="text-gray-600">{t("workingHoursSaturday")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100 h-[220px] bg-white">
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
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{t("successTitle")}</h3>
                  <p className="text-gray-500 max-w-md mb-6">{t("successMessage")}</p>
                  <Button onClick={() => setIsSuccess(false)} variant="outline" size="lg" className="gap-2">
                    {t("sendAnother")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{t("contactUs")}</h3>
                    <p className="text-gray-500 mt-1">{t("formDescription")}</p>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertTitle>{t("errorTitle")}</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">
                        {t("nameLabel")}
                      </Label>
                      <Input
                        id="name"
                        placeholder={t("namePlaceholder")}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">
                          {t("emailLabel")}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700">
                          {t("phoneLabel")}
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={t("phonePlaceholder")}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700">
                        {t("messageLabel")}
                      </Label>
                      <Textarea
                        id="message"
                        placeholder={t("messagePlaceholder")}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[150px] bg-gray-50 border-gray-200 focus:bg-white"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("sending")}
                        </>
                      ) : (
                        <>
                          {t("send")}
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
