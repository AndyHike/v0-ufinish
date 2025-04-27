export async function getLocale(locale: string) {
  // Перевіряємо, чи локаль є однією з підтримуваних
  const supportedLocales = ["uk", "en", "cs"]
  return supportedLocales.includes(locale) ? locale : "uk"
}
