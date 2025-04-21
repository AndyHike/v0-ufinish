import { createClient } from "@/lib/supabase"

type ActivityType = "create" | "update" | "delete" | "view"
type EntityType = "brand" | "model" | "repair" | "user" | "discount"

interface LogActivityParams {
  userId: string
  actionType: ActivityType
  entityType: EntityType
  entityId: string
  details?: Record<string, any>
}

export async function logActivity({ userId, actionType, entityType, entityId, details = {} }: LogActivityParams) {
  try {
    const supabase = createClient()

    await supabase.from("activities").insert([
      {
        user_id: userId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details,
      },
    ])

    return true
  } catch (error) {
    console.error("Error logging activity:", error)
    return false
  }
}
