import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/lib/auth/session"

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  let messages
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error)
    // Fallback to default locale
    try {
      messages = (await import(`../../messages/uk.json`)).default
    } catch (fallbackError) {
      console.error("Failed to load fallback messages:", fallbackError)
      messages = {}
    }
  }

  const user = await getCurrentUser()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
