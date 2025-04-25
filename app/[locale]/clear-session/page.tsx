"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function ClearSessionPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const clearSession = async () => {
    try {
      setStatus("loading")

      // Спочатку спробуємо очистити через API
      try {
        const response = await fetch("/api/auth/clear-session")
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage("Сесію успішно очищено. Ви можете повернутися на головну сторінку.")
        } else {
          throw new Error("API returned error")
        }
      } catch (apiError) {
        console.error("API error:", apiError)

        // Якщо API не спрацював, очищаємо cookie через JavaScript
        document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        setStatus("success")
        setMessage("Сесію очищено через fallback механізм. Ви можете повернутися на головну сторінку.")
      }

      // Перенаправляємо на головну сторінку через 3 секунди
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error) {
      setStatus("error")
      setMessage("Сталася помилка при очищенні сесії. Спробуйте ще раз або зверніться до адміністратора.")
      console.error("Error clearing session:", error)
    }
  }

  // Автоматично очищаємо сесію при завантаженні сторінки
  useEffect(() => {
    clearSession()
  }, [])

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Очищення сесії</CardTitle>
          <CardDescription>Відновлення доступу до сайту</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Успішно!</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Помилка</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")} disabled={status === "loading"}>
            На головну
          </Button>
          <Button onClick={clearSession} disabled={status === "loading" || status === "success"}>
            Спробувати ще раз
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
