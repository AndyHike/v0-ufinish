"use client"

import { useState, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Send, ArrowRight, Phone, Mail, MapPin, Loader2 } from "lucide-react"
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
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t("subtitle")}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-medium">{t("phone")}</h3>
                  <p className="text-sm text-gray-500">+420 777 888 999</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-medium">{t("email")}</h3>
                  <p className="text-sm text-gray-500">info@devicehelp.cz</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-medium">{t("address")}</h3>
                  <p className="text-sm text-gray-500">Václavské náměstí 1, 110 00 Praha 1</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="w-full">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
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
                        <h3 className="text-2xl font-bold tracking-tight">{t("thankYou") || "Thank You!"}</h3>
                        <p className="text-gray-500">
                          {t("messageReceived") || "Your message has been received. We'll get back to you soon."}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button onClick={resetForm} className="mt-4">
                          {t("sendAnother") || "Send Another Message"}
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
                  <CardHeader>
                    <CardTitle>{t("contactUs")}</CardTitle>
                    <CardDescription>
                      {t("formDescription") || "Fill out the form below to send us a message."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </section>
  )
}
