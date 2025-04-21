import type { Metadata } from "next"
import { UsersManagement } from "@/components/admin/users-management"

export const metadata: Metadata = {
  title: "Управління користувачами",
  description: "Управління користувачами системи",
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Користувачі</h1>
        <p className="text-muted-foreground">Управління користувачами системи</p>
      </div>
      <UsersManagement />
    </div>
  )
}
