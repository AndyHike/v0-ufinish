import { getLocale } from "next-intl/server"
import TestTranslations from "../test-translations"
import RegisterClient from "./register-client"

export default async function RegisterPage() {
  const locale = await getLocale()

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <TestTranslations />
        <RegisterClient locale={locale} />
      </div>
    </div>
  )
}
