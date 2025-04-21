import { getLocale } from "next-intl/server"
import TestTranslations from "../test-translations"
import SignInClient from "./signin-client"

export default async function SignInPage() {
  const locale = await getLocale()

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <TestTranslations />
        <SignInClient locale={locale} />
      </div>
    </div>
  )
}
