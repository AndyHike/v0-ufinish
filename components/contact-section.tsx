"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Phone, Mail, MapPin, Send } from "lucide-react"

export function ContactSection() {
  const t = useTranslations("Contact")
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Отримуємо дані форми
      const formData = new FormData(e.currentTarget)
      const formValues = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        message: formData.get("message") as string,
      }

      // Відправляємо дані на API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      // Показуємо повідомлення про успіх
      toast({
        title: t("successTitle"),
        description: t("successMessage"),
      })

      // Очищаємо форму
      e.currentTarget.reset()
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: t("errorTitle") || "Error",
        description: t("errorMessage") || "Failed to send your message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-12 md:py-24 bg-muted/50" id="contact">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Phone className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{t("phone")}</h3>
                <p className="text-sm text-muted-foreground">+420 775 848 259</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{t("email")}</h3>
                <p className="text-sm text-muted-foreground">info@devicehelp.cz</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPin className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{t("address")}</h3>
                <p className="text-sm text-muted-foreground">{t("addressDetails")}</p>
              </div>
            </div>
            <div className="aspect-video overflow-hidden rounded-lg">
              <iframe
                title={t("mapTitle")}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20472.97391809471!2d14.4194684!3d50.0755381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b94ea69e1a1e1%3A0x7c93c7aaef9e8b!2zUHJhaGEgMiwgxIxlc2tv!5e0!3m2!1scs!2scz!4v1650000000000!5m2!1scs!2scz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
