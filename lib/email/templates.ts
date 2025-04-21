export function getVerificationEmailTemplate(options: {
  name: string
  verificationUrl: string
  locale: string
}): string {
  const { name, verificationUrl, locale } = options

  // Simple email template
  // In a real application, you would use a more sophisticated template
  const subject = locale === "uk" ? "Підтвердіть вашу електронну пошту" : "Verify your email"
  const greeting = locale === "uk" ? `Привіт, ${name}!` : `Hello, ${name}!`
  const message =
    locale === "uk"
      ? "Дякуємо за реєстрацію. Будь ласка, підтвердіть вашу електронну пошту, натиснувши на посилання нижче:"
      : "Thank you for signing up. Please verify your email by clicking the link below:"
  const buttonText = locale === "uk" ? "Підтвердити електронну пошту" : "Verify Email"
  const footer =
    locale === "uk"
      ? "Якщо ви не реєструвалися на нашому сайті, проігноруйте цей лист."
      : "If you didn't sign up for our service, please ignore this email."

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${greeting}</h2>
      <p>${message}</p>
      <div style="margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">${buttonText}</a>
      </div>
      <p style="color: #666; font-size: 14px;">${footer}</p>
    </div>
  `
}

export function getPasswordResetEmailTemplate(options: {
  name: string
  resetUrl: string
  locale: string
}): string {
  const { name, resetUrl, locale } = options

  // Simple email template
  // In a real application, you would use a more sophisticated template
  const greeting = locale === "uk" ? `Привіт, ${name}!` : locale === "cs" ? `Ahoj, ${name}!` : `Hello, ${name}!`
  const message =
    locale === "uk"
      ? "Ви отримали цей лист, тому що запросили скидання пароля. Натисніть на посилання нижче, щоб встановити новий пароль:"
      : locale === "cs"
        ? "Tento e-mail jste obdrželi, protože jste požádali o obnovení hesla. Klikněte na odkaz níže pro nastavení nového hesla:"
        : "You are receiving this email because you requested a password reset. Click the link below to set a new password:"
  const buttonText = locale === "uk" ? "Скинути пароль" : locale === "cs" ? "Obnovit heslo" : "Reset Password"
  const footer =
    locale === "uk"
      ? "Якщо ви не запитували скидання пароля, проігноруйте цей лист."
      : locale === "cs"
        ? "Pokud jste o obnovení hesla nežádali, ignorujte prosím tento e-mail."
        : "If you didn't request a password reset, please ignore this email."
  const expiry =
    locale === "uk"
      ? "Це посилання дійсне протягом 1 години."
      : locale === "cs"
        ? "Tento odkaz je platný po dobu 1 hodiny."
        : "This link is valid for 1 hour."

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${greeting}</h2>
      <p>${message}</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">${buttonText}</a>
      </div>
      <p style="color: #666; font-size: 14px;">${expiry}</p>
      <p style="color: #666; font-size: 14px;">${footer}</p>
    </div>
  `
}

export function getEmailVerificationSubject(locale: string): string {
  return locale === "uk"
    ? "Підтвердіть вашу електронну пошту"
    : locale === "cs"
      ? "Ověřte svůj e-mail"
      : "Verify your email"
}

export function getPasswordResetSubject(locale: string): string {
  return locale === "uk" ? "Скидання пароля" : locale === "cs" ? "Obnovení hesla" : "Password Reset"
}
