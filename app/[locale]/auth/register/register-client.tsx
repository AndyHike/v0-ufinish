"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Smartphone, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterClient() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create form data
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("phone", phone)
      formData.append("password", password)

      // Send registration request
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        setIsLoading(false)
      } else {
        setError(result.message || t("registrationFailed"))
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError(t("somethingWentWrong"))
      setIsLoading(false)
    }
  }

  if (isSuccess) {
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
          <p className="text-center text-muted-foreground mb-4">{t("youCanNowLogin")}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={`/${locale}/auth/signin`}>{t("signIn")}</Link>
          </Button>
        </CardFooter>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
            />
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
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">{t("passwordRequirements")}</p>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("processing") : t("register")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{t("alreadyHaveAccount")}</span>{" "}
          <Link href={`/${locale}/auth/signin`} className="text-primary hover:underline">
            {t("signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
