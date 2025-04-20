"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function UserDiscounts() {
  // In a real app, this would fetch data from an API
  const discounts = [
    {
      id: "1",
      name: "Знижка для постійних клієнтів",
      code: "LOYAL2023",
      amount: "15%",
      validUntil: "31.12.2023",
      description: "Знижка для клієнтів, які зробили більше 3 ремонтів",
    },
    {
      id: "2",
      name: "Літня знижка",
      code: "SUMMER2023",
      amount: "10%",
      validUntil: "31.08.2023",
      description: "Сезонна знижка на всі види ремонту",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мої знижки</CardTitle>
        <CardDescription>Перегляньте доступні вам знижки та промокоди.</CardDescription>
      </CardHeader>
      <CardContent>
        {discounts.length === 0 ? (
          <p className="text-center text-muted-foreground">У вас ще немає доступних знижок.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {discounts.map((discount) => (
              <Card key={discount.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{discount.name}</CardTitle>
                    <Badge>{discount.amount}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{discount.description}</p>
                    <div className="flex items-center justify-between">
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{discount.code}</code>
                      <span className="text-xs text-muted-foreground">Дійсна до: {discount.validUntil}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
