import { createIntl } from "next-intl"

export async function getMessages(locale) {
  try {
    return (await import(`./messages/${locale}.json`)).default
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error)
    return {}
  }
}

export async function createIntlInstance(locale) {
  const messages = await getMessages(locale)
  return createIntl({ locale, messages })
}
