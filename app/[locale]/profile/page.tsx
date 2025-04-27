import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getUserRepairOrders } from "@/app/actions/repair-orders"
import UserProfile from "@/components/profile/user-profile"
import UserOrders from "@/components/profile/user-orders"
import UserDiscounts from "@/components/profile/user-discounts"
import { PageHeader } from "@/components/page-header"

export default async function ProfilePage() {
  const t = await getTranslations("Profile")
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const orders = await getUserRepairOrders(session.user.id)

  // Mock discounts data - in a real app, you would fetch this from your database
  const discounts = [
    {
      id: "1",
      code: "WELCOME10",
      description: t("welcomeDiscount"),
      amount: 10,
      isPercentage: true,
      expiresAt: null,
    },
    // Add more discounts as needed
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader heading={t("userProfile")} text={t("manageProfileAndOrders")} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-1">
          <UserProfile user={session.user} />
          <div className="mt-6">
            <UserDiscounts discounts={discounts} />
          </div>
        </div>
        <div className="md:col-span-2">
          <UserOrders orders={orders} />
        </div>
      </div>
    </div>
  )
}
