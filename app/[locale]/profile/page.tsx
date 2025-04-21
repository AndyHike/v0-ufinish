import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/profile/user-profile"
import { UserOrders } from "@/components/profile/user-orders"
import { UserDiscounts } from "@/components/profile/user-discounts"
import { createClient } from "@/lib/supabase"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  // Get user profile data from database
  const supabase = createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, address")
    .eq("id", session.user.id)
    .single()

  // Combine session user data with profile data
  const userData = {
    ...session.user,
    phone: profile?.phone || null,
    address: profile?.address || null,
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Особистий кабінет</h1>
        <p className="text-muted-foreground">Керуйте своїм профілем та переглядайте історію ремонтів.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Профіль</TabsTrigger>
          <TabsTrigger value="orders">Історія ремонтів</TabsTrigger>
          <TabsTrigger value="discounts">Мої знижки</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <UserProfile user={userData} />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <UserOrders />
        </TabsContent>
        <TabsContent value="discounts" className="space-y-4">
          <UserDiscounts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
