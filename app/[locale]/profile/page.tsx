import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/profile/user-profile"
import { UserOrders } from "@/components/profile/user-orders"
import { UserDiscounts } from "@/components/profile/user-discounts"
import { createClient } from "@/lib/supabase"
import { syncUserProfile } from "@/lib/user/profile-sync"

export default async function ProfilePage() {
  const t = await getTranslations("Profile")
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
    .select("first_name, last_name, phone, address, created_at")
    .eq("id", session.user.id)
    .single()

  console.log("Profile data from database:", profile)
  console.log("Profile error:", profileError)

  // If profile data is missing, get from users table
  const userData = {
    ...session.user,
    first_name: profile?.first_name || session.user.first_name || null,
    last_name: profile?.last_name || session.user.last_name || null,
    phone: profile?.phone || session.user.phone || null,
    address: profile?.address || null,
    created_at: profile?.created_at || new Date().toISOString(),
  }

  console.log("User data being passed to profile component:", userData)

  return (
    <div className="container py-4 sm:py-10 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("userProfile")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("manageProfileAndOrders")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
          <TabsTrigger value="orders">{t("repairHistory.title")}</TabsTrigger>
          <TabsTrigger value="discounts">{t("myDiscounts")}</TabsTrigger>
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
