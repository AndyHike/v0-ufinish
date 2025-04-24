"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Smartphone } from "lucide-react"

interface ModernLoginFormProps {
  locale: string
  onSuccess?: () => void
}

export function ModernLoginForm({ locale, onSuccess }: ModernLoginFormProps) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const [step, setStep] = useState<"initial" | "verification">("initial")
  const [identifier, setIdentifier] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate API call for login and sending verification code
    setTimeout(() => {
      // Assuming the API returns success and user email
      setUserEmail(identifier) // Use the entered identifier as the email
      setStep("verification")
      setIsLoading(false)
    }, 1500)
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate API call for verification
    setTimeout(() => {
      // Assuming the API returns success
      if (verificationCode === "123456") {
        // Redirect to home page or dashboard
        router.push(`/${locale}`)
      } else {
        setError("invalidVerificationCode")
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleResendCode = () => {
    setIsLoading(true)
    // Simulate resending the code
    setTimeout(() => {
      setIsLoading(false)
      // Show a toast or message
      alert("Verification code resent!")
    }, 1000)
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t("signInToAccount")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {step === "initial" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Continue"}
            </Button>
          </form>
        )}

        {step === "verification" && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 -ml-2 flex items-center text-muted-foreground"
              onClick={() => setStep("initial")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("backToLogin")}
            </Button>

            <div className="text-center mb-4">
              <p>A verification code has been sent to your email</p>
              <p className="text-sm text-muted-foreground mt-1">{userEmail || identifier}</p>
            </div>

            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("enterVerificationCode")}</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                {error && <p className="text-sm text-destructive">{t(error)}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify and Login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add named export to fix deployment error
export default ModernLoginForm
