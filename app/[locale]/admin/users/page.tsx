import { UsersManagement } from "@/components/admin/users-management"

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Користувачі</h1>
        <p className="text-muted-foreground">Управління користувачами системи</p>
      </div>

      <UsersManagement />
    </div>
  )
}
