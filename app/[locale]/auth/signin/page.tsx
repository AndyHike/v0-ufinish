"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { loginWithRedirect, registerWithRedirect } from "@/app/actions/auth"

export default function SignInPage() {
  const t = useTranslations("Auth")
  const { locale } = useParams() as { locale: string }
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const [formErrors, setFormErrors] = useState<{
    signin?: string
    signup?: { email?: string; password?: string; name?: string }
  }>({})

  // Check if user was just registered
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast({
        title: t("success"),
        description: t("accountCreated"),
      })
    }
  }, [searchParams, toast, t])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setFormErrors({})

    try {
      const result = await loginWithRedirect(new FormData(e.currentTarget), locale)

      if (!result.success) {
        setFormErrors({ signin: result.message })
      }
    } catch (error) {
      console.error("Login error:", error)
      setFormErrors({ signin: t("somethingWentWrong") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setFormErrors({})

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    // Client-side validation
    const errors: { email?: string; password?: string; name?: string } = {}

    if (password.length < 8) {
      errors.password = t("passwordTooShort")
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors({ signup: errors })
      setIsLoading(false)
      return
    }

    try {
      const result = await registerWithRedirect(formData, locale)

      if (!result.success) {
        setFormErrors({ signup: { email: result.message } })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setFormErrors({ signup: { email: t("somethingWentWrong") } })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
          <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>{t("signIn")}</CardTitle>
              <CardDescription>{t("signInDescription")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("password")}</Label>
                    <Link
                      href={`/${locale}/auth/forgot-password`}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <Input id="password" name="password" type="password" required />
                </div>
                {formErrors.signin && <div className="text-sm text-destructive">{formErrors.signin}</div>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("signingIn") : t("signIn")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>{t("signUp")}</CardTitle>
              <CardDescription>{t("signUpDescription")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input id="name" name="name" placeholder={t("fullName")} required />
                  {formErrors.signup?.name && <div className="text-sm text-destructive">{formErrors.signup.name}</div>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">{t("email")}</Label>
                  <Input id="email-signup" name="email" type="email" placeholder="name@example.com" required />
                  {formErrors.signup?.email && (
                    <div className="text-sm text-destructive">{formErrors.signup.email}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">{t("password")}</Label>
                  <Input id="password-signup" name="password" type="password" required />
                  {formErrors.signup?.password && (
                    <div className="text-sm text-destructive">{formErrors.signup.password}</div>
                  )}
                  <p className="text-xs text-muted-foreground">{t("passwordRequirements")}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("signingUp") : t("signUp")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
