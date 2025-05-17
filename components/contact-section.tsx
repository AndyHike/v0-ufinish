"use client"

import { useState, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, Loader2 } from "lucide-react"

export function ContactSection() {
  const t = useTranslations("Contact")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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

      if (response.ok) {
        setIsSuccess(true)
        setName("")
        setEmail("")
        setPhone("")
        setMessage("")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">{t("title")}</h2>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          {isSuccess ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-bold mb-2">{t("successTitle")}</h3>
              <p className="text-gray-500 mb-4">{t("successMessage")}</p>
              <Button onClick={() => setIsSuccess(false)}>{t("sendAnother")}</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("nameLabel")}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">{t("emailLabel")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="phone">{t("phoneLabel")}</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="message">{t("messageLabel")}</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
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
          )}
        </div>

        <div className="mt-10 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">{t("contactInfo")}</h3>
              <p className="mb-1">
                <strong>{t("phone")}:</strong> +42075848259
              </p>
              <p className="mb-1">
                <strong>{t("email")}:</strong> info@devicehelp.cz
              </p>
              <p className="mb-1">
                <strong>{t("address")}:</strong> Praha 2
              </p>
              <p>
                <strong>{t("workingHours")}:</strong> {t("workingHoursWeekdays")}
              </p>
            </div>
            <div className="h-[200px]">
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
        </div>
      </div>
    </section>
  )
}
