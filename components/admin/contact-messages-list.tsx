"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { uk, cs, enUS } from "date-fns/locale"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  created_at: string
  updated_at: string
}

interface ContactMessagesListProps {
  locale: string
}

export function ContactMessagesList({ locale }: ContactMessagesListProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const dateLocale = locale === "uk" ? uk : locale === "cs" ? cs : enUS

  const statusColors: Record<string, string> = {
    new: "bg-blue-500",
    read: "bg-green-500",
    replied: "bg-purple-500",
    archived: "bg-gray-500",
  }

  const statusTranslations: Record<string, Record<string, string>> = {
    uk: {
      new: "Нове",
      read: "Прочитано",
      replied: "Відповідь надіслана",
      archived: "Архівовано",
    },
    cs: {
      new: "Nové",
      read: "Přečteno",
      replied: "Odpovězeno",
      archived: "Archivováno",
    },
    en: {
      new: "New",
      read: "Read",
      replied: "Replied",
      archived: "Archived",
    },
  }

  const filterTranslations: Record<string, Record<string, string>> = {
    uk: {
      all: "Всі повідомлення",
      new: "Нові",
      read: "Прочитані",
      replied: "З відповіддю",
      archived: "Архівовані",
    },
    cs: {
      all: "Všechny zprávy",
      new: "Nové",
      read: "Přečtené",
      replied: "Odpovězené",
      archived: "Archivované",
    },
    en: {
      all: "All messages",
      new: "New",
      read: "Read",
      replied: "Replied",
      archived: "Archived",
    },
  }

  const translations: Record<string, Record<string, string>> = {
    uk: {
      title: "Повідомлення з контактної форми",
      name: "Ім'я",
      email: "Email",
      message: "Повідомлення",
      status: "Статус",
      date: "Дата",
      actions: "Дії",
      view: "Переглянути",
      noMessages: "Повідомлень не знайдено",
      messageDetails: "Деталі повідомлення",
      phone: "Телефон",
      changeStatus: "Змінити статус",
      close: "Закрити",
      save: "Зберегти",
      prev: "Попередня",
      next: "Наступна",
      page: "Сторінка",
      of: "з",
    },
    cs: {
      title: "Zprávy z kontaktního formuláře",
      name: "Jméno",
      email: "Email",
      message: "Zpráva",
      status: "Stav",
      date: "Datum",
      actions: "Akce",
      view: "Zobrazit",
      noMessages: "Žádné zprávy nenalezeny",
      messageDetails: "Detaily zprávy",
      phone: "Telefon",
      changeStatus: "Změnit stav",
      close: "Zavřít",
      save: "Uložit",
      prev: "Předchozí",
      next: "Další",
      page: "Stránka",
      of: "z",
    },
    en: {
      title: "Contact Form Messages",
      name: "Name",
      email: "Email",
      message: "Message",
      status: "Status",
      date: "Date",
      actions: "Actions",
      view: "View",
      noMessages: "No messages found",
      messageDetails: "Message Details",
      phone: "Phone",
      changeStatus: "Change Status",
      close: "Close",
      save: "Save",
      prev: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
    },
  }

  const t = translations[locale] || translations.en
  const statusT = statusTranslations[locale] || statusTranslations.en
  const filterT = filterTranslations[locale] || filterTranslations.en

  // Змінимо функцію fetchMessages для кращого відстеження помилок
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : ""
      const url = `/api/admin/contact-messages?page=${page}${statusParam}`
      console.log("Fetching messages from:", url)

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", response.status, errorText)
        throw new Error(`Failed to fetch messages: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("Received messages data:", data)

      if (Array.isArray(data.data)) {
        setMessages(data.data)
        setTotalPages(data.pagination.totalPages)
      } else {
        console.error("Unexpected data format:", data)
        setMessages([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsDialogOpen(true)

    // Якщо повідомлення нове, автоматично змінюємо статус на "прочитане"
    if (message.status === "new") {
      await updateMessageStatus(message.id, "read")
    }
  }

  const updateMessageStatus = async (id: string, status: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update message status")
      }

      // Оновлюємо список повідомлень
      fetchMessages()

      // Якщо це вибране повідомлення, оновлюємо його статус
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          status,
        })
      }
    } catch (error) {
      console.error("Error updating message status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = (status: string) => {
    if (selectedMessage) {
      updateMessageStatus(selectedMessage.id, status)
    }
  }

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1) // Скидаємо сторінку при зміні фільтра
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [page, statusFilter])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={filterT.all} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filterT.all}</SelectItem>
              <SelectItem value="new">{filterT.new}</SelectItem>
              <SelectItem value="read">{filterT.read}</SelectItem>
              <SelectItem value="replied">{filterT.replied}</SelectItem>
              <SelectItem value="archived">{filterT.archived}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.email}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.date}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[message.status] || "bg-gray-500"}>
                          {statusT[message.status] || message.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewMessage(message)}>
                          {t.view}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page <= 1}>
                {t.prev}
              </Button>
              <div className="text-sm">
                {t.page} {page} {t.of} {totalPages}
              </div>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page >= totalPages}>
                {t.next}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">{t.noMessages}</div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedMessage && (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t.messageDetails}</DialogTitle>
                <DialogDescription>
                  {formatDistanceToNow(new Date(selectedMessage.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">{t.name}</h4>
                  <p>{selectedMessage.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">{t.email}</h4>
                  <p>{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <h4 className="text-sm font-medium">{t.phone}</h4>
                    <p>{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium">{t.message}</h4>
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">{t.changeStatus}</h4>
                  <Select value={selectedMessage.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{statusT.new}</SelectItem>
                      <SelectItem value="read">{statusT.read}</SelectItem>
                      <SelectItem value="replied">{statusT.replied}</SelectItem>
                      <SelectItem value="archived">{statusT.archived}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t.close}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  )
}
