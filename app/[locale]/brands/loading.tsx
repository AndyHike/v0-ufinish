import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function BrandsLoading() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-2 h-10 w-64" />
          <Skeleton className="mx-auto h-4 w-full max-w-md" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
