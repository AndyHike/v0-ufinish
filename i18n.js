export const locales = ["uk", "cs", "en"]
export const defaultLocale = "uk"

// Add the named export for i18n
export const i18n = {
  locales: ["uk", "cs", "en"],
  defaultLocale: "uk",
  localeDetection: true,
}

// Keep the CommonJS export for backward compatibility
module.exports = {
  locales: ["uk", "cs", "en"],
  defaultLocale: "uk",
  localeDetection: true,
}
