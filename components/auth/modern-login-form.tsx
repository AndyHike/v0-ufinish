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
import { Smartphone } from "lucide-react"
import { login } from "@/lib/auth/actions"

interface ModernLoginFormProps {
  locale: string
}

export function ModernLoginForm({ locale }: ModernLoginFormProps) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("email", email)

      // Use the regular login function instead of loginWithRedirect
      const result = await login(formData)

      if (!result.success) {
        // Translate the error message using the message key
        if (result.message) {
          setError(t(result.message))
        } else {
          setError(t("loginFailed"))
        }
        setIsLoading(false)
        return
      }

      // Handle successful login manually
      if (result.role === "admin") {
        router.push(`/${locale}/admin`)
      } else {
        router.push(`/${locale}/profile`)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(t("somethingWentWrong"))
      setIsLoading(false)
    }
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
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("processing") : t("signIn")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{t("noAccount")}</span>{" "}
          <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">
            {t("register")}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
