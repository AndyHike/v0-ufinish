/**
 * Генерує URL для низькоякісної версії зображення
 * @param originalSrc URL оригінального зображення
 * @param width Ширина низькоякісної версії
 * @returns URL низькоякісної версії зображення
 */
export function getLowQualityImageUrl(originalSrc: string, width = 20): string {
  // Для зовнішніх зображень використовуємо imgproxy або подібний сервіс
  if (originalSrc.startsWith("http")) {
    // Приклад з imgproxy, замініть на ваш сервіс оптимізації зображень
    return `https://imgproxy.example.com/resize:fit:${width}:0/quality:10/${encodeURIComponent(originalSrc)}`
  }

  // Для локальних зображень додаємо параметри розміру та якості
  // Це працює з Next.js Image Optimization API
  return `${originalSrc}?w=${width}&q=10`
}

/**
 * Перевіряє, чи є зображення у форматі WebP або AVIF
 * @param src URL зображення
 * @returns true, якщо зображення у сучасному форматі
 */
export function isModernImageFormat(src: string): boolean {
  const lowercaseSrc = src.toLowerCase()
  return lowercaseSrc.endsWith(".webp") || lowercaseSrc.endsWith(".avif")
}

/**
 * Конвертує URL зображення у WebP формат
 * @param src URL оригінального зображення
 * @returns URL зображення у WebP форматі
 */
export function getWebPUrl(src: string): string {
  if (isModernImageFormat(src)) return src

  // Для зовнішніх зображень використовуємо imgproxy або подібний сервіс
  if (src.startsWith("http")) {
    // Приклад з imgproxy, замініть на ваш сервіс оптимізації зображень
    return `https://imgproxy.example.com/format:webp/${encodeURIComponent(src)}`
  }

  // Для локальних зображень додаємо параметр формату
  // Це працює з Next.js Image Optimization API
  return `${src}?format=webp`
}
