import remonline from "@/lib/api/remonline"

export async function syncClientToRemonline(userData: {
  first_name: string
  last_name: string
  email: string
  phone?: string[]
  address?: string
}) {
  try {
    console.log("Syncing client to RemOnline in background:", userData)

    // First authenticate with RemOnline API
    const authResult = await remonline.auth(process.env.REMONLINE_API_TOKEN)
    if (!authResult.success) {
      console.error("Failed to authenticate with RemOnline API:", authResult.message)
      return {
        success: false,
        message: "Failed to connect to RemOnline. Will retry later.",
      }
    }

    // Check if client already exists in RemOnline
    const emailCheckResult = await remonline.getClientByEmail(userData.email)

    if (emailCheckResult.success && emailCheckResult.exists && emailCheckResult.client) {
      console.log("Client already exists in RemOnline:", emailCheckResult.client)
      return {
        success: true,
        message: "Client already exists in RemOnline",
        remonlineId: emailCheckResult.client.id,
      }
    }

    // Create client in RemOnline
    console.log("Creating client in RemOnline with data:", userData)

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        address: userData.address,
        phone: userData.phone,
      }),
    }

    console.log("Fetch options:", options)

    const response = await fetch(`https://api.remonline.app/clients/?token=${process.env.REMONLINE_API_TOKEN}`, options)

    console.log("Raw response:", response)

    const responseText = await response.text()
    console.log("Response text:", responseText)

    try {
      const data = JSON.parse(responseText)
      console.log("Parsed JSON data:", data)

      if (!response.ok) {
        console.error("Failed to create client in RemOnline:", response.statusText)
        return {
          success: false,
          message: `Failed to create client in RemOnline: ${response.statusText}`,
        }
      }

      console.log("Client created in RemOnline:", data)
      return {
        success: true,
        message: "Client created in RemOnline",
        remonlineId: data.id,
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      return {
        success: false,
        message: `Error parsing JSON response: ${parseError}`,
      }
    }
  } catch (error) {
    console.error("Error syncing client to RemOnline:", error)
    return {
      success: false,
      message: "Error syncing client to RemOnline. Will retry later.",
    }
  }
}

export async function updateRemonlineIdForUser(userId: string, remonlineId: number) {
  try {
    const { createClient } = await import("@/lib/supabase")
    const supabase = createClient()

    const { data, error } = await supabase.from("users").update({ remonline_id: remonlineId }).eq("id", userId).select() // Select the updated record to log it

    if (error) {
      console.error("Error updating RemOnline ID for user:", error)
      return false
    }

    console.log(`Updated RemOnline ID for user ${userId}: ${remonlineId}`, data) // Log the updated record
    return true
  } catch (error) {
    console.error("Error updating RemOnline ID for user:", error)
    return false
  }
}
