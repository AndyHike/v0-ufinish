"use server"

import { createClient } from "@/lib/supabase"
import { getSession } from "@/lib/auth/session"

export async function getUserRepairOrders() {
  try {
    // Get the current user session
    const session = await getSession()
    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" }
    }

    const userId = session.user.id
    const supabase = createClient()

    // Fetch repair orders for the current user
    const { data: orders, error } = await supabase
      .from("repair_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching repair orders:", error)
      return { success: false, message: "Failed to fetch repair orders" }
    }

    return { success: true, orders }
  } catch (error) {
    console.error("Error in getUserRepairOrders:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
