import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    // Отримуємо параметри запиту
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Обчислюємо offset для пагінації
    const offset = (page - 1) * limit

    // Створюємо клієнта Supabase
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Отримуємо сесію користувача
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("[contact-messages] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[contact-messages] User ID:", session.user.id)

    // Базовий запит
    let query = supabase.from("contact_messages").select("*", { count: "exact" })

    // Додаємо фільтр за статусом, якщо він вказаний
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Додаємо пошук, якщо він вказаний
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Додаємо пагінацію та сортування
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    // Виконуємо запит
    const { data, error, count } = await query

    if (error) {
      console.error("[contact-messages] Error fetching contact messages:", error)
      return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 })
    }

    // Обчислюємо загальну кількість сторінок
    const totalPages = count ? Math.ceil(count / limit) : 0

    // Успішна відповідь
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages,
      },
    })
  } catch (error) {
    console.error("[contact-messages] Error in contact messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
