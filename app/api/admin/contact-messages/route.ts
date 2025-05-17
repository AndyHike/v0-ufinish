import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Отримуємо параметри запиту
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // Обчислюємо offset для пагінації
    const offset = (page - 1) * limit

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

    // Базовий запит
    let query = supabase.from("contact_messages").select("*", { count: "exact" })

    // Додаємо фільтр за статусом, якщо він вказаний
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Додаємо сортування, пагінацію та ліміт
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    // Виконуємо запит
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching contact messages:", error)
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
    console.error("Error in contact messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
