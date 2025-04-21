"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { login } from "@/lib/auth/actions"

export default function SignIn() {
  const t = useTranslations("Auth")
  const params = useParams()
  const locale = params.locale as string

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

        <AuthForm action={login} successRedirect={`/${locale}`} submitText={t("signIn")}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={t("emailPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={t("passwordPlaceholder")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                {t("rememberMe")}
              </label>
            </div>

            <div className="text-sm">
              <Link href={`/${locale}/auth/forgot-password`} className="font-medium text-primary hover:text-primary/90">
                {t("forgotPassword")}
              </Link>
            </div>
          </div>
        </AuthForm>
      </div>
    </div>
  )
}
