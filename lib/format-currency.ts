/**
 * Formats a number as Czech koruna (CZK)
 * @param value The value to format
 * @param locale The locale to use for formatting (defaults to 'cs-CZ')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string | null | undefined, locale = "cs-CZ"): string {
  if (value === null || value === undefined) return ""

  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)
}
