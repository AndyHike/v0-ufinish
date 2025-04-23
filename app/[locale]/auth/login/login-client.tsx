"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DevEmailNotification } from "@/components/dev-email-notification"

import { checkUserExists, sendVerificationCode, verifyCode } from "@/app/actions/auth-api"

const emailSchema = z.object({
  email: z.string().email(),
})

const phoneSchema = z.object({
  phone: z.string().min(9).max(15),
})

const verificationSchema = z.object({
  code: z.string().length(6),
})

export default function LoginClient() {
  const t = useTranslations("Auth")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState<"credentials" | "verification">("credentials")
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  })

  const verificationForm = useForm({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  })

  const handleCredentialsSubmit = async (data: { email?: string; phone?: string }) => {
    setError(null)
    setIsLoading(true)

    try {
      const identifier = data.email || data.phone || ""
      setIdentifier(identifier)

      const userExists = await checkUserExists(identifier)

      if (!userExists.success) {
        setError(t("userNotFound"))
        setIsLoading(false)
        return
      }

      // Send verification code
      const result = await sendVerificationCode(identifier, "login")

      if (!result.success) {
        setError(result.message || t("somethingWentWrong"))
        setIsLoading(false)
        return
      }

      // Move to verification step
      setStep("verification")
    } catch (error) {
      console.error("Login error:", error)
      setError(t("unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (data: { code: string }) => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await verifyCode(identifier, data.code, "login")

      if (!result.success) {
        setError(result.message || t("invalidVerificationCode"))
        setIsLoading(false)
        return
      }

      // Redirect to home page or intended destination
      router.push(`/${locale}`)
    } catch (error) {
      console.error("Verification error:", error)
      setError(t("unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await sendVerificationCode(identifier, "login")

      if (!result.success) {
        setError(result.message || t("somethingWentWrong"))
      }
    } catch (error) {
      console.error("Resend code error:", error)
      setError(t("unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t("signInToAccount")}</CardTitle>
        <CardDescription>
          {t("noAccount")}{" "}
          <Link href={`/${locale}/auth/register`} className="text-primary underline">
            {t("register")}
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "credentials" ? (
          <Tabs defaultValue="email" onValueChange={(value) => setLoginMethod(value as "email" | "phone")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">{t("loginWithEmail")}</TabsTrigger>
              <TabsTrigger value="phone">{t("loginWithPhone")}</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={emailForm.handleSubmit(handleCredentialsSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    {...emailForm.register("email")}
                    disabled={isLoading}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("processing") : t("signIn")}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="phone">
              <form onSubmit={phoneForm.handleSubmit(handleCredentialsSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("phonePlaceholder")}
                    {...phoneForm.register("phone")}
                    disabled={isLoading}
                  />
                  {phoneForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("processing") : t("signIn")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p>{t("verificationCodeSent")}</p>
            </div>
            <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("enterVerificationCode")}</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  {...verificationForm.register("code")}
                  disabled={isLoading}
                  maxLength={6}
                />
                {verificationForm.formState.errors.code && (
                  <p className="text-sm text-destructive">{verificationForm.formState.errors.code.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("processing") : t("verifyCode")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                {t("resendCode")}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setStep("credentials")}
                disabled={isLoading}
              >
                {t("backToSignIn")}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <DevEmailNotification />
      </CardFooter>
    </Card>
  )
}
