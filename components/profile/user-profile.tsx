"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { formatPhoneNumber } from "@/utils/format-phone"

// Схема валідації для форми профілю
const profileFormSchema = z.object({
  first_name: z.string().min(2, { message: "Ім'я повинно містити щонайменше 2 символи" }),
  last_name: z.string().min(2, { message: "Прізвище повинно містити щонайменше 2 символи" }),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

type UserProfileProps = {
  user: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    address: string | null
    created_at: string
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Ініціалізуємо форму з даними користувача
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      address: user.address || "",
    },
  })

  // Функція для обробки відправки форми
  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Профіль оновлено",
          description: "Ваші дані успішно збережено",
        })
      } else {
        throw new Error(result.message || "Помилка при оновленні профілю")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Помилка",
        description: error instanceof Error ? error.message : "Не вдалося оновити профіль",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Форматуємо дату реєстрації
  const formattedDate = new Date(user.created_at).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
          <CardTitle className="text-xl">Інформація профілю</CardTitle>
          <CardDescription>Оновіть свої персональні дані</CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-2 sm:px-6 sm:py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Ім'я</Label>
              <Input
                id="first_name"
                placeholder="Введіть ваше ім'я"
                {...form.register("first_name")}
                className="w-full"
              />
              {form.formState.errors.first_name && (
                <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Прізвище</Label>
              <Input
                id="last_name"
                placeholder="Введіть ваше прізвище"
                {...form.register("last_name")}
                className="w-full"
              />
              {form.formState.errors.last_name && (
                <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="w-full bg-muted" />
            <p className="text-xs text-muted-foreground">Ваша електронна адреса не може бути змінена</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              placeholder="Введіть ваш номер телефону"
              {...form.register("phone")}
              className="w-full"
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value)
                form.setValue("phone", formatted)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адреса</Label>
            <Input id="address" placeholder="Введіть вашу адресу" {...form.register("address")} className="w-full" />
          </div>

          <div className="text-sm text-muted-foreground">
            Дата реєстрації: <span className="font-medium">{formattedDate}</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 sm:px-6 sm:py-4 flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Зберегти зміни
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
