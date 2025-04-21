"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Users, Tag, Wrench, TrendingUp, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type AdminStats = {
  brands: number
  models: number
  users: number
  repairs: number
}

type Activity = {
  id: string
  action_type: string
  entity_type: string
  created_at: string
  details: any
  users: {
    name: string
    email: string
  } | null
}

export default function AdminDashboard() {
  const t = useTranslations("AdminDashboard")
  const [stats, setStats] = useState<AdminStats>({ brands: 0, models: 0, users: 0, repairs: 0 })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setStats(data.stats)
        setActivities(data.activities)
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function formatActivityTitle(activity: Activity) {
    const entityType = activity.entity_type.charAt(0).toUpperCase() + activity.entity_type.slice(1)
    const actionType = activity.action_type.charAt(0).toUpperCase() + activity.action_type.slice(1)

    if (activity.details?.name) {
      return `${actionType} ${entityType}: ${activity.details.name}`
    }

    return `${actionType} ${entityType} #${activity.id.slice(0, 8)}`
  }

  function getTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 1) return t("activityTime", { minutes: 1 })
    return t("activityTime", { minutes: diffMins })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
          <TabsTrigger value="reports">{t("reports")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalBrands")}</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.brands}</div>
                <p className="text-xs text-muted-foreground">+2 {t("fromLastMonth")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalModels")}</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.models}</div>
                <p className="text-xs text-muted-foreground">+8 {t("fromLastMonth")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalUsers")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
                <p className="text-xs text-muted-foreground">+32 {t("fromLastMonth")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalRepairs")}</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.repairs}</div>
                <p className="text-xs text-muted-foreground">+18 {t("fromLastMonth")}</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t("repairsOverTime")}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="aspect-[2/1] flex items-center justify-center rounded-md border border-dashed p-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">{t("chartPlaceholder")}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t("recentActivity")}</CardTitle>
                <CardDescription>{t("recentActivityDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none animate-pulse bg-muted h-4 w-32 rounded"></p>
                          <p className="text-xs text-muted-foreground animate-pulse bg-muted h-3 w-20 rounded"></p>
                        </div>
                      </div>
                    ))
                  ) : activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-center">
                        <Avatar className="mr-4 h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&query=user`}
                            alt={activity.users?.name || "User"}
                          />
                          <AvatarFallback>{activity.users?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{formatActivityTitle(activity)}</p>
                          <p className="text-xs text-muted-foreground">{getTimeAgo(activity.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="h-[400px] flex items-center justify-center border rounded-md">
          <div className="text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">{t("analyticsTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{t("analyticsDescription")}</p>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="h-[400px] flex items-center justify-center border rounded-md">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">{t("reportsTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{t("reportsDescription")}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
