import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/auth/actions"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string; mismatch?: string }
}) {
  const locale = await getLocale()
  const t = await getTranslations("Auth")

  const token = searchParams.token
  const showError = searchParams.error === "true"
  const showMismatchError = searchParams.mismatch === "true"

  if (!token) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t("missingToken")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>{t("passwordResetError")}</AlertTitle>
              <AlertDescription>{t("missingTokenDescription")}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("resetPassword")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("resetPassword")}</CardTitle>
          <CardDescription className="text-center">{t("enterNewPassword")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showError && (
            <Alert variant="destructive">
              <AlertTitle>{t("passwordResetError")}</AlertTitle>
              <AlertDescription>{t("passwordResetErrorDescription")}</AlertDescription>
            </Alert>
          )}

          {showMismatchError && (
            <Alert variant="destructive">
              <AlertTitle>{t("passwordResetError")}</AlertTitle>
              <AlertDescription>{t("passwordsDoNotMatch")}</AlertDescription>
            </Alert>
          )}

          <form
            action={async (formData) => {
              "use server"
              const password = formData.get("password") as string
              const confirmPassword = formData.get("confirmPassword") as string

              if (password !== confirmPassword) {
                return { redirect: `/${locale}/auth/reset-password?token=${token}&mismatch=true` }
              }

              const result = await resetPassword(token, password)

              if (!result.success) {
                return { redirect: `/${locale}/auth/reset-password?token=${token}&error=true` }
              }

              return { redirect: `/${locale}/auth/signin?reset=true` }
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("newPassword")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder={t("newPasswordPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder={t("confirmPasswordPlaceholder")}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("resetPassword")}
              </Button>
            </div>
          </form>
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
