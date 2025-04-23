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
import { Smartphone, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { initiateRegistration, verifyRegistrationCode } from "@/app/actions/auth-api"

export default function RegisterClient() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"form" | "verification" | "success">("form")
  const [maskedEmail, setMaskedEmail] = useState("")

  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create form data
      const formData = new FormData()
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)
      formData.append("email", email)
      formData.append("phone", phone)
      formData.append("address", address)

      // Send registration request
      const result = await initiateRegistration(formData)

      if (result.success) {
        setMaskedEmail(result.email || "")
        setStep("verification")
      } else {
        if (result.message === "userAlreadyExists") {
          // Redirect to login page if user already exists
          router.push(`/${locale}/auth/login`)
        } else {
          setError(t(result.message || "registrationFailed"))
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
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
      const result = await verifyRegistrationCode(verificationCode)

      if (result.success) {
        setStep("success")
        // Redirect to profile page after a short delay
        setTimeout(() => {
          router.push(`/${locale}/profile`)
        }, 3000)
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

  const handleBackToForm = () => {
    setStep("form")
    setVerificationCode("")
    setError("")
  }

  if (step === "success") {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>{t("registrationSuccess")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertTitle>{t("registrationSuccess")}</AlertTitle>
            <AlertDescription>{t("accountCreatedSuccessfully")}</AlertDescription>
          </Alert>
          <p className="text-center text-muted-foreground mb-4">{t("redirectingToProfile")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t("createAccount")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {step === "form" ? (
          <form onSubmit={handleInitiateRegistration} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("firstNamePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("lastNamePlaceholder")}
                  required
                />
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phonePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("addressPlaceholder")}
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("processing") : t("register")}
            </Button>
          </form>
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
            <Button type="button" variant="ghost" className="w-full" onClick={handleBackToForm} disabled={isLoading}>
              {t("backToRegistration")}
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{t("alreadyHaveAccount")}</span>{" "}
          <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
            {t("signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
