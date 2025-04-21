import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyPasswordResetToken, resetPasswordWithToken } from "@/lib/auth/actions"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; success?: string; error?: string }
}) {
  const locale = await getLocale()
  const t = await getTranslations("Auth")

  const token = searchParams.token
  const showSuccessMessage = searchParams.success === "true"
  const showErrorMessage = searchParams.error === "true"

  // Verify token if provided
  let isValidToken = false
  if (token) {
    isValidToken = await verifyPasswordResetToken(token)
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("resetPassword")}</CardTitle>
          <CardDescription className="text-center">{t("enterNewPassword")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSuccessMessage && (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">{t("passwordResetSuccess")}</AlertTitle>
              <AlertDescription className="text-green-700">{t("passwordResetSuccessDescription")}</AlertDescription>
            </Alert>
          )}

          {showErrorMessage && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTitle className="text-red-800">{t("passwordResetError")}</AlertTitle>
              <AlertDescription className="text-red-700">{t("passwordResetErrorDescription")}</AlertDescription>
            </Alert>
          )}

          {!token && !showSuccessMessage && !showErrorMessage && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTitle className="text-yellow-800">{t("missingToken")}</AlertTitle>
              <AlertDescription className="text-yellow-700">{t("missingTokenDescription")}</AlertDescription>
            </Alert>
          )}

          {token && !isValidToken && !showSuccessMessage && !showErrorMessage && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTitle className="text-red-800">{t("invalidToken")}</AlertTitle>
              <AlertDescription className="text-red-700">{t("invalidTokenDescription")}</AlertDescription>
            </Alert>
          )}

          {token && isValidToken && !showSuccessMessage && !showErrorMessage && (
            <form
              action={async (formData) => {
                "use server"
                formData.append("token", token)
                const result = await resetPasswordWithToken(formData)

                if (!result.success) {
                  return { redirect: `/${locale}/auth/reset-password?error=true` }
                }

                return { redirect: `/${locale}/auth/reset-password?success=true` }
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("newPassword")}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder={t("newPasswordPlaceholder")}
                  />
                  <p className="text-xs text-muted-foreground">{t("passwordRequirements")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("resetPassword")}
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
