import type { ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "@/lib/get-messages"
import { getLocale } from "@/lib/get-locale"

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages(locale)
  const actualLocale = await getLocale(locale)

  return (
    <NextIntlClientProvider locale={actualLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
