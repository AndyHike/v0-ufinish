import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { checkAdminRole } from "@/utils/auth"

// Функція для перевірки наявності таблиці contact_messages
async function ensureContactMessagesTable() {
  const supabase = createClient()

  // Перевіряємо, чи існує таблиця contact_messages
  const { data, error } = await supabase.from("contact_messages").select("id").limit(1)

  if (error && error.code === "42P01") {
    // Код помилки для "relation does not exist"
    console.log("Table contact_messages does not exist, creating it...")

    // Створюємо таблицю contact_messages
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: createError } = await supabase.rpc("exec", { query: createTableQuery })

    if (createError) {
      console.error("Error creating contact_messages table:", createError)
      throw new Error("Failed to create contact_messages table")
    }

    console.log("Table contact_messages created successfully")
  } else if (error) {
    console.error("Error checking contact_messages table:", error)
    throw new Error("Failed to check contact_messages table")
  } else {
    console.log("Table contact_messages exists")
  }
}

export async function GET(request: Request) {
  try {
    // Перевіряємо права адміністратора
    const isAdmin = await checkAdminRole()
    if (!isAdmin) {
      console.log("Unauthorized access attempt to GET contact messages")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Перевіряємо наявність таблиці
    await ensureContactMessagesTable()

    // Отримуємо параметри запиту
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // Обчислюємо offset для пагінації
    const offset = (page - 1) * limit

    // Створюємо клієнта Supabase
    const supabase = createClient()

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
