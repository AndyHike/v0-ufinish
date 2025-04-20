import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/lib/auth/actions"

export default async function Register() {
  const locale = await getLocale()
  const t = await getTranslations("Auth")

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">{t("createAccount")}</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link href={`/${locale}/auth/signin`} className="font-medium text-primary hover:text-primary/90">
              {t("signIn")}
            </Link>
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server"
            const result = await register(formData)
            if (result.success) {
              return { redirect: `/${locale}/auth/signin?registered=true` }
            }
            return { error: result.message || t("somethingWentWrong") }
          }}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" name="name" type="text" required placeholder={t("namePlaceholder")} />
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
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" name="phone" type="tel" placeholder={t("phonePlaceholder")} />
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
          </div>

          <Button type="submit" className="w-full">
            {t("register")}
          </Button>
        </form>
      </div>
    </div>
  )
}
