"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ForgotPasswordClient({ locale }: { locale: string }) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate sending reset email
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSent(true)
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{t("resetPassword")}</CardTitle>
        <p className="text-center text-sm text-muted-foreground">{t("enterEmail")}</p>
      </CardHeader>
      <CardContent>
        {sent ? (
          <>
            <Alert className="bg-green-50 border-green-200 mb-4">
              <AlertTitle className="text-green-800">{t("resetLinkSent")}</AlertTitle>
              <AlertDescription className="text-green-700">{t("checkEmailForResetLink")}</AlertDescription>
            </Alert>
            <div className="text-center">
              <Link href={`/${locale}/auth/signin`} className="text-sm text-muted-foreground hover:text-foreground">
                {t("backToSignIn")}
              </Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("processing") : t("sendResetLink")}
            </Button>
            <div className="text-center">
              <Link href={`/${locale}/auth/signin`} className="text-sm text-muted-foreground hover:text-foreground">
                {t("backToSignIn")}
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
