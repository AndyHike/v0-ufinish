import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone } from "lucide-react"
import { login } from "@/lib/auth/actions"

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
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("signInToAccount")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server"
                const email = formData.get("email") as string
                const password = formData.get("password") as string

                const result = await login(email, password)

                if (!result.success) {
                  if (result.blocked) {
                    return { redirect: `/${locale}/auth/signin?blocked=true` }
                  }

                  if (result.emailNotVerified) {
                    return { redirect: `/${locale}/auth/resend-verification?email=${encodeURIComponent(email)}` }
                  }

                  return { redirect: `/${locale}/auth/signin?error=true` }
                }

                return { redirect: `/${locale}` }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Link
                    href={`/${locale}/auth/forgot-password`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder={t("passwordPlaceholder")}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("signIn")}
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
      </div>
    </div>
  )
}
