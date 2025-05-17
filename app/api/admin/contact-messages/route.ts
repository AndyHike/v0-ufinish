import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

// Функція для перевірки прав адміністратора
async function checkAdminRole(request: Request) {
  const cookieStore = cookies()

  // Створюємо клієнта Supabase з серверними куками
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  // Отримуємо сесію користувача
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    console.log("No session found")
    return false
  }

  // Отримуємо дані користувача
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (userError || !userData) {
    console.log("Error fetching user data or user not found:", userError)
    return false
  }

  // Перевіряємо роль користувача
  const isAdmin = userData.role === "admin"
  console.log(`User ${session.user.id} is admin: ${isAdmin}`)

  return isAdmin
}

export async function GET(request: Request) {
  try {
    // Перевіряємо права адміністратора
    const isAdmin = await checkAdminRole(request)
    if (!isAdmin) {
      console.log("Unauthorized access attempt to GET contact messages list")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Отримуємо параметри запиту
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const status = url.searchParams.get("status")

    // Обчислюємо зміщення для пагінації
    const offset = (page - 1) * limit

    // Створюємо клієнта Supabase
    const supabase = createClient()

    // Базовий запит
    let query = supabase.from("contact_messages").select("*", { count: "exact" })

    // Додаємо фільтр за статусом, якщо він вказаний
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Додаємо пагінацію та сортування
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
      data,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error in contact messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
