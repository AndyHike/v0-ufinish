import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "@/lib/get-messages"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
