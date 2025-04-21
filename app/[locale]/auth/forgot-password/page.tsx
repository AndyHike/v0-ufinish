import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendPasswordResetEmail } from "@/lib/auth/actions"

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string }
}) {
  const locale = await getLocale()
  const t = await getTranslations("Auth")

  const showSentMessage = searchParams.sent === "true"
  const showError = searchParams.error === "true"

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("resetPassword")}</CardTitle>
          <CardDescription className="text-center">{t("enterEmail")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSentMessage && (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">{t("resetLinkSent")}</AlertTitle>
              <AlertDescription className="text-green-700">{t("checkEmailForResetLink")}</AlertDescription>
            </Alert>
          )}

          {showError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTitle className="text-red-800">{t("errorSendingResetLink")}</AlertTitle>
              <AlertDescription className="text-red-700">{t("tryAgainLater")}</AlertDescription>
            </Alert>
          )}

          {!showSentMessage && (
            <form
              action={async (formData) => {
                "use server"
                const email = formData.get("email") as string
                const result = await sendPasswordResetEmail(email, locale)

                if (!result.success) {
                  return { redirect: `/${locale}/auth/forgot-password?error=true` }
                }

                return { redirect: `/${locale}/auth/forgot-password?sent=true` }
              }}
            >
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
                <Button type="submit" className="w-full">
                  {t("sendResetLink")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href={`/${locale}/auth/signin`} className="text-sm text-muted-foreground hover:text-foreground">
            {t("backToSignIn")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
