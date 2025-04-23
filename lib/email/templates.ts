// Email templates for various authentication flows

export function getVerificationEmailTemplate(verificationLink: string, locale: string): string {
  const translations = {
    en: {
      title: "Verify your email address",
      greeting: "Hello,",
      message: "Please verify your email address by clicking the button below:",
      button: "Verify Email",
      alternative: "If the button doesn't work, copy and paste this link into your browser:",
      footer: "If you didn't request this email, you can safely ignore it.",
    },
    uk: {
      title: "Підтвердіть вашу електронну адресу",
      greeting: "Вітаємо,",
      message: "Будь ласка, підтвердіть вашу електронну адресу, натиснувши кнопку нижче:",
      button: "Підтвердити Email",
      alternative: "Якщо кнопка не працює, скопіюйте та вставте це посилання у ваш браузер:",
      footer: "Якщо ви не запитували цей лист, ви можете безпечно ігнорувати його.",
    },
    cs: {
      title: "Ověřte svou e-mailovou adresu",
      greeting: "Dobrý den,",
      message: "Ověřte prosím svou e-mailovou adresu kliknutím na tlačítko níže:",
      button: "Ověřit Email",
      alternative: "Pokud tlačítko nefunguje, zkopírujte a vložte tento odkaz do prohlížeče:",
      footer: "Pokud jste o tento e-mail nežádali, můžete jej bezpečně ignorovat.",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .link { word-break: break-all; color: #4F46E5; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${t.title}</h2>
        <p>${t.greeting}</p>
        <p>${t.message}</p>
        <a href="${verificationLink}" class="button">${t.button}</a>
        <p>${t.alternative}</p>
        <p class="link">${verificationLink}</p>
        <p class="footer">${t.footer}</p>
      </div>
    </body>
    </html>
  `
}

export function getPasswordResetEmailTemplate(resetLink: string, locale: string): string {
  const translations = {
    en: {
      title: "Reset your password",
      greeting: "Hello,",
      message: "We received a request to reset your password. Click the button below to create a new password:",
      button: "Reset Password",
      alternative: "If the button doesn't work, copy and paste this link into your browser:",
      expiry: "This link will expire in 24 hours.",
      footer: "If you didn't request a password reset, you can safely ignore this email.",
    },
    uk: {
      title: "Скидання вашого пароля",
      greeting: "Вітаємо,",
      message: "Ми отримали запит на скидання вашого пароля. Натисніть кнопку нижче, щоб створити новий пароль:",
      button: "Скинути Пароль",
      alternative: "Якщо кнопка не працює, скопіюйте та вставте це посилання у ваш браузер:",
      expiry: "Це посилання буде дійсним протягом 24 годин.",
      footer: "Якщо ви не запитували скидання пароля, ви можете безпечно ігнорувати цей лист.",
    },
    cs: {
      title: "Obnovení hesla",
      greeting: "Dobrý den,",
      message: "Obdrželi jsme žádost o obnovení hesla. Klikněte na tlačítko níže pro vytvoření nového hesla:",
      button: "Obnovit Heslo",
      alternative: "Pokud tlačítko nefunguje, zkopírujte a vložte tento odkaz do prohlížeče:",
      expiry: "Tento odkaz vyprší za 24 hodin.",
      footer: "Pokud jste o obnovení hesla nežádali, můžete tento e-mail bezpečně ignorovat.",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .link { word-break: break-all; color: #4F46E5; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${t.title}</h2>
        <p>${t.greeting}</p>
        <p>${t.message}</p>
        <a href="${resetLink}" class="button">${t.button}</a>
        <p>${t.alternative}</p>
        <p class="link">${resetLink}</p>
        <p>${t.expiry}</p>
        <p class="footer">${t.footer}</p>
      </div>
    </body>
    </html>
  `
}

export function getVerificationCodeEmailTemplate(code: string, locale: string, isLogin = true): string {
  const translations = {
    en: {
      title: isLogin ? "Your login verification code" : "Your registration verification code",
      greeting: "Hello,",
      message: isLogin
        ? "Here is your verification code to complete your login:"
        : "Here is your verification code to complete your registration:",
      codeLabel: "Your verification code:",
      expiry: "This code will expire in 15 minutes.",
      footer: "If you didn't request this code, please ignore this email.",
    },
    uk: {
      title: isLogin ? "Ваш код підтвердження входу" : "Ваш код підтвердження реєстрації",
      greeting: "Вітаємо,",
      message: isLogin
        ? "Ось ваш код підтвердження для завершення входу:"
        : "Ось ваш код підтвердження для завершення реєстрації:",
      codeLabel: "Ваш код підтвердження:",
      expiry: "Цей код буде дійсним протягом 15 хвилин.",
      footer: "Якщо ви не запитували цей код, будь ласка, ігноруйте цей лист.",
    },
    cs: {
      title: isLogin ? "Váš ověřovací kód pro přihlášení" : "Váš ověřovací kód pro registraci",
      greeting: "Dobrý den,",
      message: isLogin
        ? "Zde je váš ověřovací kód pro dokončení přihlášení:"
        : "Zde je váš ověřovací kód pro dokončení registrace:",
      codeLabel: "Váš ověřovací kód:",
      expiry: "Tento kód vyprší za 15 minut.",
      footer: "Pokud jste o tento kód nežádali, ignorujte prosím tento e-mail.",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
        .code-container { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; text-align: center; }
        .code { font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${t.title}</h2>
        <p>${t.greeting}</p>
        <p>${t.message}</p>
        <div class="code-container">
          <p>${t.codeLabel}</p>
          <p class="code">${code}</p>
        </div>
        <p>${t.expiry}</p>
        <p class="footer">${t.footer}</p>
      </div>
    </body>
    </html>
  `
}
