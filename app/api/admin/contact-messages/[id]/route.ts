import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Створюємо клієнта Supabase з серверними куками
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Перевіряємо сесію користувача
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Отримуємо дані користувача
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    // Перевіряємо роль користувача
    const isAdmin = userData?.role === "admin"

    if (!isAdmin) {
      console.log("User is not admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Отримуємо повідомлення за ID
    const { data, error } = await supabase.from("contact_messages").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching contact message:", error)
      return NextResponse.json({ error: "Failed to fetch contact message" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 })
    }

    // Успішна відповідь
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in contact message API:", error)
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

    // Створюємо клієнта Supabase з серверними куками
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Перевіряємо сесію користувача
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Отримуємо дані користувача
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    // Перевіряємо роль користувача
    const isAdmin = userData?.role === "admin"

    if (!isAdmin) {
      console.log("User is not admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
      console.error("Error updating contact message:", error)
      return NextResponse.json({ error: "Failed to update contact message" }, { status: 500 })
    }

    // Успішна відповідь
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in contact message API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
