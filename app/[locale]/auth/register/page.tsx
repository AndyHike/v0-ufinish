import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { register } from "../actions"
import { getLocale } from "next-intl/server"
import RegisterForm from "./register-form"

export default async function Register() {
  const locale = await getLocale()
  const t = await getTranslations("Auth")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">{t("createAccount")}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("alreadyHaveAccount")}{" "}
            <Link href={`/${locale}/auth/signin`} className="font-medium text-blue-600 hover:text-blue-500">
              {t("signIn")}
            </Link>
          </p>
        </div>
        <RegisterForm action={register.bind(null, locale)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t("name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder={t("emailPlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t("phone")}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder={t("phonePlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder={t("passwordPlaceholder")}
              />
              <p className="mt-1 text-xs text-gray-500">{t("passwordRequirements")}</p>
            </div>
          </div>
        </RegisterForm>
      </div>
    </div>
  )
}
