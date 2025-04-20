"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function SignInPage() {
  const t = useTranslations("Auth")
  const router = useRouter()
  const { locale } = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // For demo purposes, let's simulate a successful login
      toast({
        title: t("success"),
        description: "Login successful",
      })

      router.push(`/${locale}`)
    } catch (error) {
      toast({
        title: t("error"),
        description: t("somethingWentWrong"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // For demo purposes, let's simulate a successful registration
      toast({
        title: t("success"),
        description: t("accountCreated"),
      })

      // Redirect to home page after successful registration
      setTimeout(() => {
        router.push(`/${locale}`)
      }, 1500)
    } catch (error) {
      toast({
        title: t("error"),
        description: t("somethingWentWrong"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Tabs defaultValue="signin" className="w-full max-w-md">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">{t("email")}</Label>
                  <Input id="email-signup" name="email" type="email" placeholder="name@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">{t("password")}</Label>
                  <Input id="password-signup" name="password" type="password" required />
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
