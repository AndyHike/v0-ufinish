import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone } from "lucide-react"
import { register } from "@/lib/auth/actions"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const t = await getTranslations("Auth")
  const locale = await getLocale()

  const showError = searchParams.error === "true"

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("createAccount")}</h1>
        </div>

        {showError && (
          <Alert variant="destructive">
            <AlertTitle>{t("registrationError")}</AlertTitle>
            <AlertDescription>{t("somethingWentWrong")}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("createAccount")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link href={`/${locale}/auth/signin`} className="text-primary hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server"
                const email = formData.get("email") as string
                const password = formData.get("password") as string
                const name = formData.get("name") as string

                const result = await register(email, password, name, locale)

                if (!result.success) {
                  return { redirect: `/${locale}/auth/register?error=true` }
                }

                return { redirect: `/${locale}/auth/signin?registered=true` }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input id="name" name="name" required placeholder={t("namePlaceholder")} />
              </div>
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder={t("passwordPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">{t("passwordRequirements")}</p>
              </div>
              <Button type="submit" className="w-full">
                {t("register")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
