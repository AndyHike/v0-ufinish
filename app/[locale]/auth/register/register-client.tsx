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

export default function RegisterClient({ locale }: { locale: string }) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to sign-in
    router.push(`/${locale}/auth/signin`)
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
