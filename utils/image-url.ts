/**
 * Форматує URL зображення для правильного відображення
 * @param url URL зображення
 * @returns Відформатований URL
 */
export function formatImageUrl(url: string | null): string | null {
  if (!url) return null

  // Якщо URL вже є абсолютним (починається з http:// або https://)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // Якщо URL починається з /, вважаємо його відносним до кореня сайту
  if (url.startsWith("/")) {
    return url
  }

  // В іншому випадку додаємо / на початку
  return `/${url}`
}
