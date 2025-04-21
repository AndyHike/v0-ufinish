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
