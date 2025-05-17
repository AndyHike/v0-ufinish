import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Створюємо клієнта Supabase
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Отримуємо сесію користувача
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("[contact-message] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[contact-message] User ID:", session.user.id)

    // Отримуємо повідомлення за ID
    const { data, error } = await supabase.from("contact_messages").select("*").eq("id", id).single()

    if (error) {
      console.error("[contact-message] Error fetching contact message:", error)
      return NextResponse.json({ error: "Failed to fetch contact message" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 })
    }

    // Успішна відповідь
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[contact-message] Error in contact message API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { status } = body

    // Валідація
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Створюємо клієнта Supabase
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Отримуємо сесію користувача
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("[contact-message] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[contact-message] User ID:", session.user.id)

    // Оновлюємо статус повідомлення
    const { data, error } = await supabase
      .from("contact_messages")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[contact-message] Error updating contact message:", error)
      return NextResponse.json({ error: "Failed to update contact message" }, { status: 500 })
    }

    // Успішна відповідь
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[contact-message] Error in contact message API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
