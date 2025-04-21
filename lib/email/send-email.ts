import nodemailer from "nodemailer"
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "./templates"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER || "user",
    pass: process.env.EMAIL_SERVER_PASSWORD || "password",
  },
})

export async function sendVerificationEmail(email: string, token: string, locale: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const verificationLink = `${appUrl}/${locale}/auth/verify?token=${token}`

  const emailTemplate = getVerificationEmailTemplate(verificationLink, locale)

  const translations = {
    en: "Verify your email address",
    uk: "Підтвердіть вашу електронну адресу",
    cs: "Ověřte svou e-mailovou adresu",
  }

  const subject = translations[locale as keyof typeof translations] || translations.en

  await sendEmail(email, subject, emailTemplate)
}

export async function sendPasswordResetEmail(email: string, token: string, locale: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetLink = `${appUrl}/${locale}/auth/reset-password?token=${token}`

  const emailTemplate = getPasswordResetEmailTemplate(resetLink, locale)

  const translations = {
    en: "Reset your password",
    uk: "Скидання вашого пароля",
    cs: "Obnovení hesla",
  }

  const subject = translations[locale as keyof typeof translations] || translations.en

  await sendEmail(email, subject, emailTemplate)
}

async function sendEmail(to: string, subject: string, html: string) {
  // For development, log the email instead of sending it
  if (process.env.NODE_ENV === "development") {
    console.log("Email would be sent in production:")
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("HTML:", html.substring(0, 150) + "...")
    return
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to,
    subject,
    html,
  })
}
