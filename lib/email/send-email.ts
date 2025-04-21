"use server"

import nodemailer from "nodemailer"

// Configure email transporter
// For production, use a real email service
// For development, you can use services like Mailtrap, SendGrid, or Amazon SES
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER || "user",
    pass: process.env.EMAIL_SERVER_PASSWORD || "password",
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, from = process.env.EMAIL_FROM || "noreply@example.com" } = options

  try {
    // For development, you can log the email content instead of sending it
    if (process.env.NODE_ENV === "development") {
      console.log("Email would be sent in production:")
      console.log("To:", to)
      console.log("Subject:", subject)
      console.log("HTML:", html)
      return { success: true }
    }

    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}
