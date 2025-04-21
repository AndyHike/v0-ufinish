import nodemailer from "nodemailer"
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "./templates"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, token: string, locale: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
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
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error("Email configuration is incomplete. Missing required environment variables.")
    throw new Error("Email configuration is incomplete")
  }

  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Mobile Repair Service" <noreply@example.com>`,
      to,
      subject,
      html,
    })

    console.log(`Email sent successfully to ${to}`)
    return result
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}
