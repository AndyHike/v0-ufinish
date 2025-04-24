"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "i18next"

interface ModernLoginFormProps {
  onSuccess: () => void
}

const ModernLoginForm: React.FC<ModernLoginFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<"initial" | "verification">("initial")
  const [identifier, setIdentifier] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate API call for login and sending verification code
    setTimeout(() => {
      // Assuming the API returns success and user email
      setUserEmail("test@example.com") // Replace with actual email from API
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
      onSuccess()
      setIsLoading(false)
    }, 1500)
  }

  const handleResendCode = () => {
    setIsLoading(true)
    // Simulate resending the code
    setTimeout(() => {
      setIsLoading(false)
      alert("Verification code resent!")
    }, 1000)
  }

  return (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <CardTitle>{t("login")}</CardTitle>
        <CardDescription>{t("enterYourCredentials")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {step === "initial" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailOrUsername")}</Label>
              <Input
                id="email"
                placeholder={t("emailOrUsernamePlaceholder")}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("processing") : t("login")}
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
              <p>{t("verificationCodeSent")}</p>
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
                {error && <p className="text-sm text-destructive">{t(error) || error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("processing") : t("verifyAndLogin")}
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
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ModernLoginForm }
export default ModernLoginForm
