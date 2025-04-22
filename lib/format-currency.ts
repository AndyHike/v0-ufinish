/**
 * Formats a number as currency (UAH)
 * @param value The value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return ""

  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)
}
