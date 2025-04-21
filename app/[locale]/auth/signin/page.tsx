import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth/actions"

export default async function SignIn({
  searchParams,
}: {
  searchParams: { verified?: string; registered?: string; error?: string }
}) {
  const locale = await getLocale()
  const t = await getTranslations("Auth")

  const showVerifiedMessage = searchParams.verified === "true"
  const showRegisteredMessage = searchParams.registered === "true"
  const showError = searchParams.error

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">{t("signInToAccount")}</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href={`/${locale}/auth/register`} className="font-medium text-primary hover:text-primary/90">
              {t("register")}
            </Link>
          </p>
        </div>

        {showVerifiedMessage && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">{t("verificationSuccess")}</AlertTitle>
            <AlertDescription className="text-green-700">{t("verificationSuccessDescription")}</AlertDescription>
          </Alert>
        )}

        {showRegisteredMessage && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTitle className="text-blue-800">{t("registrationSuccess")}</AlertTitle>
            <AlertDescription className="text-blue-700">{t("verificationEmailSent")}</AlertDescription>
          </Alert>
        )}

        {showError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTitle className="text-red-800">{t("loginError")}</AlertTitle>
            <AlertDescription className="text-red-700">
              {showError === "email_not_verified" ? t("emailNotVerified") : t("somethingWentWrong")}
            </AlertDescription>
          </Alert>
        )}

        <form
          action={async (formData) => {
            "use server"
            const result = await login(formData)

            if (!result.success) {
              if (result.emailNotVerified) {
                // Redirect to resend verification page or show resend option
                return {
                  error: "email_not_verified",
                  userId: result.userId,
                }
              }

              return { error: result.message }
            }

            return { redirect: `/${locale}` }
          }}
          className="mt-8 space-y-6"
        >
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-4">
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
                  className="text-sm font-medium text-primary hover:text-primary/90"
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
          </div>

          <Button type="submit" className="w-full">
            {t("signIn")}
          </Button>
        </form>
      </div>
    </div>
  )
}
