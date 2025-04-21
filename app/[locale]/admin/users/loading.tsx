import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Користувачі</h2>
        <p className="text-muted-foreground">Управління користувачами системи</p>
      </div>

      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
