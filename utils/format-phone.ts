/**
 * Formats a phone number to a standardized format
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const digitsOnly = phone.replace(/\D/g, "")

  // If the number doesn't start with a country code, add +380 (Ukraine) by default
  // This is an assumption - adjust according to your requirements
  let formattedPhone = digitsOnly

  if (!digitsOnly.startsWith("380") && !digitsOnly.startsWith("38") && !digitsOnly.startsWith("1")) {
    // If it starts with 0, replace that 0 with 380
    if (digitsOnly.startsWith("0")) {
      formattedPhone = `38${digitsOnly.slice(1)}`
    } else {
      formattedPhone = `380${digitsOnly}`
    }
  }

  // Ensure it starts with +
  if (!formattedPhone.startsWith("+")) {
    formattedPhone = `+${formattedPhone}`
  }

  return formattedPhone
}

export const formatPhone = formatPhoneNumber
