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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, phone, address, created_at")
    .eq("id", session.user.id)
    .single()

  console.log("Profile data from database:", profile)
  console.log("Profile error:", profileError)

  // If profile data is missing, get from users table
  const userData = {
    ...session.user,
    name: session.user.name || profile?.name || null,
    phone: profile?.phone || session.user.phone || null,
    address: profile?.address || null,
    created_at: profile?.created_at || new Date().toISOString(),
  }

  console.log("User data being passed to profile component:", userData)

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
