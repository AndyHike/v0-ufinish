export function getVerificationEmailTemplate(verificationLink: string, locale: string): string {
  const translations = {
    en: {
      subject: "Verify your email address",
      greeting: "Hello,",
      message: "Please verify your email address by clicking the button below:",
      buttonText: "Verify Email",
      alternativeText: "If the button doesn't work, you can also click on the link below or copy it to your browser:",
      footer: "If you didn't request this email, you can safely ignore it.",
    },
    uk: {
      subject: "Підтвердіть вашу електронну адресу",
      greeting: "Вітаємо,",
      message: "Будь ласка, підтвердіть вашу електронну адресу, натиснувши кнопку нижче:",
      buttonText: "Підтвердити Email",
      alternativeText:
        "Якщо кнопка не працює, ви також можете натиснути на посилання нижче або скопіювати його у ваш браузер:",
      footer: "Якщо ви не запитували цей лист, ви можете безпечно ігнорувати його.",
    },
    cs: {
      subject: "Ověřte svou e-mailovou adresu",
      greeting: "Dobrý den,",
      message: "Prosím, ověřte svou e-mailovou adresu kliknutím na tlačítko níže:",
      buttonText: "Ověřit Email",
      alternativeText:
        "Pokud tlačítko nefunguje, můžete také kliknout na odkaz níže nebo jej zkopírovat do prohlížeče:",
      footer: "Pokud jste o tento e-mail nežádali, můžete jej bezpečně ignorovat.",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${t.subject}</h2>
      <p>${t.greeting}</p>
      <p>${t.message}</p>
      <a href="${verificationLink}" class="button">${t.buttonText}</a>
      <p>${t.alternativeText}</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <div class="footer">
        <p>${t.footer}</p>
      </div>
    </body>
    </html>
  `
}

export function getPasswordResetEmailTemplate(resetLink: string, locale: string): string {
  const translations = {
    en: {
      subject: "Reset your password",
      greeting: "Hello,",
      message: "We received a request to reset your password. Click the button below to create a new password:",
      buttonText: "Reset Password",
      alternativeText: "If the button doesn't work, you can also click on the link below or copy it to your browser:",
      expiry: "This link will expire in 1 hour.",
      footer: "If you didn't request a password reset, you can safely ignore this email.",
    },
    uk: {
      subject: "Скидання вашого пароля",
      greeting: "Вітаємо,",
      message: "Ми отримали запит на скидання вашого пароля. Натисніть кнопку нижче, щоб створити новий пароль:",
      buttonText: "Скинути Пароль",
      alternativeText:
        "Якщо кнопка не працює, ви також можете натиснути на посилання нижче або скопіювати його у ваш браузер:",
      expiry: "Це посилання буде дійсне протягом 1 години.",
      footer: "Якщо ви не запитували скидання пароля, ви можете безпечно ігнорувати цей лист.",
    },
    cs: {
      subject: "Obnovení hesla",
      greeting: "Dobrý den,",
      message: "Obdrželi jsme žádost o obnovení vašeho hesla. Klikněte na tlačítko níže pro vytvoření nového hesla:",
      buttonText: "Obnovit Heslo",
      alternativeText:
        "Pokud tlačítko nefunguje, můžete také kliknout na odkaz níže nebo jej zkopírovat do prohlížeče:",
      expiry: "Tento odkaz vyprší za 1 hodinu.",
      footer: "Pokud jste o obnovení hesla nežádali, můžete tento e-mail bezpečně ignorovat.",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${t.subject}</h2>
      <p>${t.greeting}</p>
      <p>${t.message}</p>
      <a href="${resetLink}" class="button">${t.buttonText}</a>
      <p>${t.alternativeText}</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>${t.expiry}</p>
      <div class="footer">
        <p>${t.footer}</p>
      </div>
    </body>
    </html>
  `
}

// Fallback templates in case the locale-specific ones are not available
function getFallbackVerificationEmailTemplate(verificationLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email address</h2>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <p><a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
      <p>If you did not request this verification, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `
}

function getFallbackPasswordResetEmailTemplate(resetLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `
}

function getEnVerificationEmailTemplate(verificationLink: string): string {
  const translations = {
    subject: "Verify your email address",
    greeting: "Hello,",
    message: "Please verify your email address by clicking the button below:",
    buttonText: "Verify Email",
    alternativeText: "If the button doesn't work, you can also click on the link below or copy it to your browser:",
    footer: "If you didn't request this email, you can safely ignore it.",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${translations.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${translations.subject}</h2>
      <p>${translations.greeting}</p>
      <p>${translations.message}</p>
      <a href="${verificationLink}" class="button">${translations.buttonText}</a>
      <p>${translations.alternativeText}</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <div class="footer">
        <p>${translations.footer}</p>
      </div>
    </body>
    </html>
  `
}

function getUkVerificationEmailTemplate(verificationLink: string): string {
  const translations = {
    subject: "Підтвердіть вашу електронну адресу",
    greeting: "Вітаємо,",
    message: "Будь ласка, підтвердіть вашу електронну адресу, натиснувши кнопку нижче:",
    buttonText: "Підтвердити Email",
    alternativeText:
      "Якщо кнопка не працює, ви також можете натиснути на посилання нижче або скопіювати його у ваш браузер:",
    footer: "Якщо ви не запитували цей лист, ви можете безпечно ігнорувати його.",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${translations.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${translations.subject}</h2>
      <p>${translations.greeting}</p>
      <p>${translations.message}</p>
      <a href="${verificationLink}" class="button">${translations.buttonText}</a>
      <p>${translations.alternativeText}</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <div class="footer">
        <p>${translations.footer}</p>
      </div>
    </body>
    </html>
  `
}

function getCsVerificationEmailTemplate(verificationLink: string): string {
  const translations = {
    subject: "Ověřte svou e-mailovou adresu",
    greeting: "Dobrý den,",
    message: "Prosím, ověřte svou e-mailovou adresu kliknutím na tlačítko níže:",
    buttonText: "Ověřit Email",
    alternativeText: "Pokud tlačítko nefunguje, můžete také kliknout na odkaz níže nebo jej zkopírovat do prohlížeče:",
    footer: "Pokud jste o tento e-mail nežádali, můžete jej bezpečně ignorovat.",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${translations.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${translations.subject}</h2>
      <p>${translations.greeting}</p>
      <p>${translations.message}</p>
      <a href="${verificationLink}" class="button">${translations.buttonText}</a>
      <p>${translations.alternativeText}</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <div class="footer">
        <p>${translations.footer}</p>
      </div>
    </body>
    </html>
  `
}

function getEnPasswordResetEmailTemplate(resetLink: string): string {
  const translations = {
    subject: "Reset your password",
    greeting: "Hello,",
    message: "We received a request to reset your password. Click the button below to create a new password:",
    buttonText: "Reset Password",
    alternativeText: "If the button doesn't work, you can also click on the link below or copy it to your browser:",
    expiry: "This link will expire in 1 hour.",
    footer: "If you didn't request a password reset, you can safely ignore this email.",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${translations.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${translations.subject}</h2>
      <p>${translations.greeting}</p>
      <p>${translations.message}</p>
      <a href="${resetLink}" class="button">${translations.buttonText}</a>
      <p>${translations.alternativeText}</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>${translations.expiry}</p>
      <div class="footer">
        <p>${translations.footer}</p>
      </div>
    </body>
    </html>
  `
}

function getUkPasswordResetEmailTemplate(resetLink: string): string {
  const translations = {
    subject: "Скидання вашого пароля",
    greeting: "Вітаємо,",
    message: "Ми отримали запит на скидання вашого пароля. Натисніть кнопку нижче, щоб створити новий пароль:",
    buttonText: "Скинути Пароль",
    alternativeText:
      "Якщо кнопка не працює, ви також можете натиснути на посилання нижче або скопіювати його у ваш браузер:",
    expiry: "Це посилання буде дійсне протягом 1 години.",
    footer: "Якщо ви не запитували скидання пароля, ви можете безпечно ігнорувати цей лист.",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${translations.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${translations.subject}</h2>
      <p>${translations.greeting}</p>
      <p>${translations.message}</p>
      <a href="${resetLink}" class="button">${translations.buttonText}</a>
      <p>${translations.alternativeText}</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>${translations.expiry}</p>
      <div class="footer">
        <p>${translations.footer}</p>
      </div>
    </body>
    </html>
  `
}

function getCsPasswordResetEmailTemplate(resetLink: string): string {
  const translations = {
    subject: "Obnovení hesla",
    greeting: "Dobrý den,",
    message: "Obdrželi jsme žádost o obnovení vašeho hesla. Klikněte na tlačítko níže pro vytvoření nového hesla:",
    buttonText: "Obnovit Heslo",
    alternativeText: "Pokud tlačítko nefunguje, můžete také kliknout na odkaz níže nebo jej zkopírovat do prohlížeče:",
    expiry: "Tento odkaz vyprší za 1 hodinu.",
    footer: "Pokud jste o obnovení hesla nežádali, můžete tento e-mail bezpečně ignorovat.",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${translations.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h2>${translations.subject}</h2>
      <p>${translations.greeting}</p>
      <p>${translations.message}</p>
      <a href="${resetLink}" class="button">${translations.buttonText}</a>
      <p>${translations.alternativeText}</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>${translations.expiry}</p>
      <div class="footer">
        <p>${translations.footer}</p>
      </div>
    </body>
    </html>
  `
}

// Update the export functions to use fallbacks
export function getVerificationEmailTemplateFinal(verificationLink: string, locale: string): string {
  try {
    switch (locale) {
      case "en":
        return getEnVerificationEmailTemplate(verificationLink)
      case "uk":
        return getUkVerificationEmailTemplate(verificationLink)
      case "cs":
        return getCsVerificationEmailTemplate(verificationLink)
      default:
        return getFallbackVerificationEmailTemplate(verificationLink)
    }
  } catch (error) {
    console.error(`Error getting verification email template for locale ${locale}:`, error)
    return getFallbackVerificationEmailTemplate(verificationLink)
  }
}

export function getPasswordResetEmailTemplateFinal(resetLink: string, locale: string): string {
  try {
    switch (locale) {
      case "en":
        return getEnPasswordResetEmailTemplate(resetLink)
      case "uk":
        return getUkPasswordResetEmailTemplate(resetLink)
      case "cs":
        return getCsPasswordResetEmailTemplate(resetLink)
      default:
        return getFallbackPasswordResetEmailTemplate(resetLink)
    }
  } catch (error) {
    console.error(`Error getting password reset email template for locale ${locale}:`, error)
    return getFallbackPasswordResetEmailTemplate(resetLink)
  }
}
