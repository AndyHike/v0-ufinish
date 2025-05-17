import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { sendNewContactMessageNotification } from "@/lib/email/send-email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, message, locale = "uk" } = body

    // Валідація
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // Створюємо клієнта Supabase
    const supabase = createClient()

    // Перевіряємо, чи існує таблиця contact_messages
    const { error: tableCheckError } = await supabase.from("contact_messages").select("id").limit(1)

    // Якщо таблиці не існує, створюємо її
    if (tableCheckError) {
      // Використовуємо SQL для створення таблиці
      const { error: createTableError } = await supabase.rpc("create_contact_messages_table")

      if (createTableError) {
        console.error("Error creating table:", createTableError)
        return NextResponse.json({ error: "Failed to create contact messages table" }, { status: 500 })
      }
    }

    // Зберігаємо повідомлення в базі даних
    const { error: insertError } = await supabase.from("contact_messages").insert([
      {
        name,
        email,
        phone: phone || null,
        message,
        status: "new",
      },
    ])

    if (insertError) {
      console.error("Error inserting contact message:", insertError)
      return NextResponse.json({ error: "Failed to save contact message" }, { status: 500 })
    }

    // Надсилаємо сповіщення електронною поштою
    const contactMessage = { name, email, phone, message }
    await sendNewContactMessageNotification(contactMessage, locale)

    // Успішна відповідь
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
