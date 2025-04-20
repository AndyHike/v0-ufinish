"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function UserOrders() {
  // In a real app, this would fetch data from an API
  const orders = [
    {
      id: "ORD-001",
      date: "15.06.2023",
      device: "iPhone 12",
      service: "Заміна екрану",
      status: "Завершено",
      price: "2500 грн",
    },
    {
      id: "ORD-002",
      date: "22.05.2023",
      device: "Samsung Galaxy S21",
      service: "Заміна батареї",
      status: "Завершено",
      price: "1200 грн",
    },
    {
      id: "ORD-003",
      date: "10.07.2023",
      device: "iPhone 13",
      service: "Ремонт камери",
      status: "В процесі",
      price: "1800 грн",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Історія ремонтів</CardTitle>
        <CardDescription>Перегляньте історію ваших ремонтів та їх статус.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground">У вас ще немає історії ремонтів.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Пристрій</TableHead>
                <TableHead>Послуга</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Ціна</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.device}</TableCell>
                  <TableCell>{order.service}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "Завершено" ? "default" : "secondary"}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
