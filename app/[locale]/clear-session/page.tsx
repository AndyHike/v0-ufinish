"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ClearSessionPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  // Автоматично очищаємо сесію при завантаженні сторінки
  useEffect(() => {
    const clearSession = async () => {
      try {
        setStatus("loading")
        setMessage("Очищення сесії...")

        // Спочатку спробуємо використати API
        try {
          const response = await fetch("/api/auth/clear-session")
          const data = await response.json()

          if (data.success) {
            setStatus("success")
            setMessage("Сесію успішно очищено. Ви будете перенаправлені на головну сторінку.")

            // Перенаправляємо на головну сторінку через 2 секунди
            setTimeout(() => {
              window.location.href = "/"
            }, 2000)
            return
          }
        } catch (apiError) {
          console.error("API error:", apiError)
          // Продовжуємо виконання, якщо API не спрацював
        }

        // Якщо API не спрацював, очищаємо cookie через JavaScript
        document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

        setStatus("success")
        setMessage("Сесію успішно очищено через JavaScript. Ви будете перенаправлені на головну сторінку.")

        // Перенаправляємо на головну сторінку через 2 секунди
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      } catch (error) {
        console.error("Failed to clear session:", error)
        setStatus("error")
        setMessage("Не вдалося очистити сесію. Спробуйте очистити cookies вручну в налаштуваннях браузера.")
      }
    }

    clearSession()
  }, [])

  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Очищення сесії</CardTitle>
          <CardDescription>Очищення сесії та cookies для відновлення доступу до сайту</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Очищення сесії</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Успішно</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
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
          <Button asChild variant="outline">
            <Link href="/">На головну</Link>
          </Button>

          {status === "error" && (
            <Button onClick={() => window.location.reload()} variant="default">
              Спробувати ще раз
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
