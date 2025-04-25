import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Отримуємо поточну сесію
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session_id")?.value

    // Якщо є сесія, видаляємо її з бази даних
    if (sessionId) {
      try {
        const supabase = createClient()
        await supabase.from("sessions").delete().eq("id", sessionId)
      } catch (dbError) {
        console.error("Failed to delete session from database:", dbError)
        // Продовжуємо виконання, навіть якщо видалення з БД не вдалося
      }
    }

    // Очищаємо cookie сесії
    cookies().set("session_id", "", {
      expires: new Date(0),
      path: "/",
    })

    // Повертаємо успішну відповідь
    return NextResponse.json({ success: true, message: "Session cleared successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error clearing session:", error)

    // Навіть якщо виникла помилка, спробуємо очистити cookie
    try {
      cookies().set("session_id", "", {
        expires: new Date(0),
        path: "/",
      })
    } catch (cookieError) {
      console.error("Failed to clear cookie:", cookieError)
    }

    return NextResponse.json({ success: false, message: "Failed to clear session" }, { status: 500 })
  }
}
