import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import SignInForm from "./signin-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone } from "lucide-react"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; blocked?: string; verified?: string; reset?: string }
}) {
  const t = await getTranslations("Auth")
  const locale = await getLocale()

  const showError = searchParams.error === "true"
  const showBlocked = searchParams.blocked === "true"
  const showVerified = searchParams.verified === "true"
  const showReset = searchParams.reset === "true"

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("signInToAccount")}</h1>
        </div>

        {showError && (
          <Alert variant="destructive">
            <AlertTitle>{t("loginError")}</AlertTitle>
            <AlertDescription>{t("somethingWentWrong")}</AlertDescription>
          </Alert>
        )}

        {showBlocked && (
          <Alert variant="destructive">
            <AlertTitle>{t("accountBlocked")}</AlertTitle>
            <AlertDescription>{t("tryAgainLater")}</AlertDescription>
          </Alert>
        )}

        {showVerified && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">{t("verificationSuccess")}</AlertTitle>
            <AlertDescription className="text-green-700">{t("verificationSuccessHelp")}</AlertDescription>
          </Alert>
        )}

        {showReset && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">{t("passwordResetSuccess")}</AlertTitle>
            <AlertDescription className="text-green-700">{t("passwordResetSuccessDescription")}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
