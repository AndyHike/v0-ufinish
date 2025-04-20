import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { login } from "@/lib/auth/actions"

export default async function SignIn() {
  const locale = await getLocale()
  const t = await getTranslations("Auth")

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

        <form
          action={async (formData) => {
            "use server"
            const result = await login(formData)
            if (result.success) {
              return { redirect: `/${locale}` }
            }
            return { error: result.message || t("somethingWentWrong") }
          }}
          className="mt-8 space-y-6"
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

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={t("passwordPlaceholder")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id="remember-me" name="remember-me" className="mr-2" />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("rememberMe")}
                </Label>
              </div>

              <div className="text-sm">
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
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
