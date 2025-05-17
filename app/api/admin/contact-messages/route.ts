import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { checkAdminRole } from "@/utils/auth"

export async function GET(request: Request) {
  try {
    // Перевіряємо права адміністратора
    const isAdmin = await checkAdminRole()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Створюємо клієнта Supabase
    const supabase = createClient()

    // Формуємо запит
    let query = supabase.from("contact_messages").select("*", { count: "exact" })

    // Фільтруємо за статусом, якщо він вказаний
    if (status) {
      query = query.eq("status", status)
    }

    // Отримуємо дані з пагінацією
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching contact messages:", error)
      return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 })
    }

    // Успішна відповідь
    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch (error) {
    console.error("Error in contact messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
