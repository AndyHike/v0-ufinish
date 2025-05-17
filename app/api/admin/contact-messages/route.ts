// Перевіримо, чи правильно створюється таблиця contact_messages

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

// Функція для створення таблиці contact_messages, якщо вона не існує
async function ensureContactMessagesTable(supabase: any) {
  try {
    // Перевіряємо, чи існує таблиця
    const { error: tableCheckError } = await supabase.from("contact_messages").select("id").limit(1)

    if (tableCheckError) {
      console.log("Table contact_messages does not exist, creating it...")

      // Створюємо таблицю за допомогою SQL
      const { error: createTableError } = await supabase.rpc("create_contact_messages_table")

      if (createTableError) {
        console.error("Error creating contact_messages table:", createTableError)
        return false
      }

      console.log("Table contact_messages created successfully")
    } else {
      console.log("Table contact_messages already exists")
    }

    return true
  } catch (error) {
    console.error("Error ensuring contact_messages table:", error)
    return false
  }
}

export async function GET(request: Request) {
  try {
    // Отримуємо параметри запиту
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
    const status = url.searchParams.get("status")

    // Обчислюємо offset для пагінації
    const offset = (page - 1) * pageSize

    // Створюємо клієнта Supabase
    const supabase = createClient()

    // Переконуємося, що таблиця існує
    const tableExists = await ensureContactMessagesTable(supabase)

    if (!tableExists) {
      return NextResponse.json({ error: "Failed to ensure contact_messages table exists" }, { status: 500 })
    }

    console.log("Fetching contact messages with params:", { page, pageSize, status })

    // Будуємо запит
    let query = supabase
      .from("contact_messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Додаємо фільтр за статусом, якщо він вказаний
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Виконуємо запит
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching contact messages:", error)
      return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 })
    }

    console.log(`Retrieved ${data?.length || 0} messages out of ${count || 0} total`)

    // Обчислюємо загальну кількість сторінок
    const totalPages = count ? Math.ceil(count / pageSize) : 0

    // Повертаємо дані та інформацію про пагінацію
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems: count || 0,
      },
    })
  } catch (error) {
    console.error("Unexpected error in contact messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
