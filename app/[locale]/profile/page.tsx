import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/profile/user-profile"
import { UserOrders } from "@/components/profile/user-orders"
import { UserDiscounts } from "@/components/profile/user-discounts"
import { createClient } from "@/lib/supabase"
import { syncUserProfile } from "@/lib/user/profile-sync"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  // Sync user profile data
  await syncUserProfile(session.user.id)

  // Get user profile data from database
  const supabase = createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, address")
    .eq("id", session.user.id)
    .single()

  // If profile data is missing, get from users table
  const userData = {
    ...session.user,
    phone: profile?.phone || null,
    address: profile?.address || null,
  }

  if (!profile?.phone) {
    const { data: user } = await supabase.from("users").select("phone").eq("id", session.user.id).single()

    if (user?.phone) {
      userData.phone = user.phone
    }
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
