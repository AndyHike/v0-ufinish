"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function UserDiscounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Мої знижки</CardTitle>
        <CardDescription>Перегляньте доступні вам знижки та промокоди.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Наразі у вас немає доступних знижок.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Знижки будуть доступні після виконання певних умов або проведення акцій.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
