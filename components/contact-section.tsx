"use client"

import { useState, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Send, ArrowRight, Phone, Mail, MapPin, Loader2, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

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
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Декоративні елементи */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
          <p className="mt-4 text-gray-500 md:text-xl/relaxed">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Інформаційна картка */}
          <div className="space-y-8">
            <Card className="overflow-hidden border-none shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{t("phone")}</h3>
                      <p className="text-sm text-gray-500">+42075848259</p>
                      <p className="text-xs text-gray-400">{t("callUsAnytime") || "Телефонуйте в будь-який час"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{t("email")}</h3>
                      <p className="text-sm text-gray-500">info@devicehelp.cz</p>
                      <p className="text-xs text-gray-400">{t("emailResponse") || "Відповідаємо протягом 24 годин"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{t("address")}</h3>
                      <p className="text-sm text-gray-500">Praha 2</p>
                      <p className="text-xs text-gray-400">{t("visitUs") || "Завітайте до нашого сервісного центру"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{t("workingHours") || "Години роботи"}</h3>
                      <p className="text-sm text-gray-500">{t("weekdays") || "Пн-Пт: 9:00 - 18:00"}</p>
                      <p className="text-sm text-gray-500">{t("weekend") || "Сб: 10:00 - 15:00"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Карта */}
            <div className="relative overflow-hidden rounded-xl shadow-lg h-[300px] border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20479.84323795257!2d14.41993243476561!3d50.07762499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b94ea69e1a1a1%3A0x7c93c7eb4ba09925!2sPraha%202!5e0!3m2!1scs!2scz!4v1652345678901!5m2!1scs!2scz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
                className="absolute inset-0"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-8 border-white rounded-xl"></div>
            </div>
          </div>

          {/* Форма */}
          <Card className="overflow-hidden border-none shadow-lg bg-white">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-6">
                      <motion.div
                        className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      >
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-2xl font-bold tracking-tight">{t("thankYou") || "Дякуємо!"}</h3>
                        <p className="text-gray-500">
                          {t("messageReceived") || "Ваше повідомлення отримано. Ми зв'яжемося з вами найближчим часом."}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button onClick={resetForm} className="mt-4">
                          {t("sendAnother") || "Надіслати ще одне повідомлення"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold">{t("contactUs") || "Зв'язатися з нами"}</h3>
                      <p className="text-gray-500 mt-1">
                        {t("formDescription") || "Заповніть форму нижче, щоб надіслати нам повідомлення."}
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertTitle>{t("errorTitle") || "Помилка"}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("nameLabel") || "Ім'я"}</Label>
                        <Input
                          id="name"
                          placeholder={t("namePlaceholder") || "Введіть ваше ім'я"}
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("emailLabel") || "Email"}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("emailPlaceholder") || "Введіть ваш email"}
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("phoneLabel") || "Телефон"}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={t("phonePlaceholder") || "Введіть ваш номер телефону"}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{t("messageLabel") || "Повідомлення"}</Label>
                        <Textarea
                          id="message"
                          placeholder={t("messagePlaceholder") || "Введіть ваше повідомлення"}
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="min-h-[120px] bg-gray-50 border-gray-200 focus:bg-white"
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("sending") || "Надсилання..."}
                          </>
                        ) : (
                          <>
                            {t("send") || "Надіслати"}
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </section>
  )
}
