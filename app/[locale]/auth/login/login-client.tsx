"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Mail } from "lucide-react"
import { initiateLogin, verifyLoginCode } from "@/app/actions/auth-api"

export default function LoginClient() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [identifier, setIdentifier] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"identifier" | "verification">("identifier")
  const [maskedEmail, setMaskedEmail] = useState("")

  const handleInitiateLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await initiateLogin(identifier, loginMethod === "email")

      if (result.success) {
        setMaskedEmail(result.email || "")
        setStep("verification")
      } else {
        setError(t(result.message || "loginFailed"))
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(t("somethingWentWrong"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await verifyLoginCode(verificationCode)

      if (result.success) {
        // Redirect based on role
        if (result.role === "admin") {
          router.push(`/${locale}/admin`)
        } else {
          router.push(`/${locale}/profile`)
        }
      } else {
        setError(t(result.message || "verificationFailed"))
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError(t("somethingWentWrong"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToIdentifier = () => {
    setStep("identifier")
    setVerificationCode("")
    setError("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t("signInToAccount")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {step === "identifier" ? (
          <>
            <Tabs
              defaultValue={loginMethod}
              className="w-full"
              onValueChange={(value) => setLoginMethod(value as "email" | "phone")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">
                  <Mail className="mr-2 h-4 w-4" />
                  {t("email")}
                </TabsTrigger>
                <TabsTrigger value="phone">
                  <Smartphone className="mr-2 h-4 w-4" />
                  {t("phone")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="mt-4">
                <form onSubmit={handleInitiateLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      required
                    />
                  </div>
                  {error && <div className="text-sm text-destructive">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("processing") : t("continue")}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="phone" className="mt-4">
                <form onSubmit={handleInitiateLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={t("phonePlaceholder")}
                      required
                    />
                  </div>
                  {error && <div className="text-sm text-destructive">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("processing") : t("continue")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t("noAccount")}</span>{" "}
              <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">
                {t("register")}
              </Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2 text-center mb-4">
              <p className="text-muted-foreground">
                {t("verificationCodeSent")} {maskedEmail}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-code">{t("verificationCode")}</Label>
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t("verificationCodePlaceholder")}
                required
                maxLength={6}
                className="text-center text-xl tracking-widest"
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("processing") : t("verify")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleBackToIdentifier}
              disabled={isLoading}
            >
              {t("backToLogin")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
