import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Очищаємо cookie сесії
    cookies().set("session_id", "", {
      expires: new Date(0),
      path: "/",
    })

    // Повертаємо успішну відповідь
    return NextResponse.json({ success: true, message: "Session cleared successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error clearing session:", error)
    return NextResponse.json({ success: false, message: "Failed to clear session" }, { status: 500 })
  }
}
