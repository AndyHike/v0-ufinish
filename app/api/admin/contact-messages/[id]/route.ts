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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Перевіряємо права адміністратора
    const isAdmin = await checkAdminRole(request)
    if (!isAdmin) {
      console.log("Unauthorized access attempt to GET contact message")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Створюємо клієнта Supabase
    const supabase = createClient()

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
    // Перевіряємо права адміністратора
    const isAdmin = await checkAdminRole(request)
    if (!isAdmin) {
      console.log("Unauthorized access attempt to PATCH contact message")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    const { status } = body

    // Валідація
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Створюємо клієнта Supabase
    const supabase = createClient()

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
