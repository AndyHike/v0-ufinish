// This is a wrapper for the Remonline API
class RemonlineClient {
  private token: string | null = null
  private baseUrl = "https://api.remonline.app"
  private tokenExpiry: number | null = null

  // Authenticate with the Remonline API using the API key
  async auth() {
    try {
      console.log("Authenticating with Remonline API...")

      // Check if we have a valid token that hasn't expired
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log("Using existing valid token")
        return { success: true, token: this.token }
      }

      // Get API key from environment variable
      // Try both possible environment variable names
      const apiKey = process.env.REMONLINE_API_KEY || process.env.REMONLINE_API_TOKEN
      if (!apiKey) {
        console.error("Neither REMONLINE_API_KEY nor REMONLINE_API_TOKEN environment variables are set")
        return {
          success: false,
          message: "API key environment variables are not set",
        }
      }

      // Trim the API key to remove any whitespace
      const trimmedApiKey = apiKey.trim()

      console.log("Requesting new token using API key")
      console.log("API key length:", trimmedApiKey.length)
      console.log("API key first 5 chars:", trimmedApiKey.substring(0, 5) + "...")
      console.log("API key last 5 chars:", "..." + trimmedApiKey.substring(trimmedApiKey.length - 5))

      // Check if the API key looks valid (basic validation)
      if (trimmedApiKey.length < 10) {
        console.warn("API key seems too short, might be invalid")
      }

      if (/\s/.test(trimmedApiKey)) {
        console.warn("API key contains whitespace, might cause issues")
      }

      // Request a new token
      console.log("Making API request to:", `${this.baseUrl}/token/new`)

      const requestBody = JSON.stringify({ api_key: trimmedApiKey })
      console.log("Request body length:", requestBody.length)

      const response = await fetch(`${this.baseUrl}/token/new`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: requestBody,
      })

      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("Response text length:", responseText.length)
      console.log("Response text preview:", responseText.substring(0, 100))

      let data
      try {
        data = JSON.parse(responseText)
        console.log("Response data:", data)
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText)
        return {
          success: false,
          message: `Failed to parse response: ${responseText}`,
        }
      }

      if (!response.ok) {
        console.error(`Token request failed with status ${response.status}:`, data)

        // Try to provide more specific error information
        if (response.status === 401) {
          console.error("Authentication failed. This usually means the API key is invalid or expired.")

          // Check if we can get more details from the error message
          const errorMessage = data.message || "Unknown error"
          console.error("Error message:", errorMessage)

          return {
            success: false,
            message: `Authentication failed: ${errorMessage}`,
            details: data,
            suggestions: [
              "Verify that the API key is correct and not expired",
              "Check if the RemOnline API has changed its authentication method",
              "Try generating a new API key in the RemOnline dashboard",
            ],
          }
        }

        return {
          success: false,
          message: `Failed to get token: ${response.status}`,
          details: data,
        }
      }

      if (!data.success || !data.token) {
        console.error("Failed to get token from response:", data)
        return {
          success: false,
          message: "Invalid response from token endpoint",
          details: data,
        }
      }

      console.log("Successfully obtained new token")
      this.token = data.token

      // Set token expiry (tokens typically last 24 hours, but we'll set it to 23 hours to be safe)
      this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000

      return { success: true, token: this.token }
    } catch (error) {
      console.error("Remonline auth error:", error)
      return {
        success: false,
        message: "Failed to authenticate with Remonline API",
        details: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Get clients with optional query parameters
  async getClients(params = {}) {
    try {
      // Ensure we have a valid token
      const authResult = await this.auth()
      if (!authResult.success) {
        return {
          success: false,
          message: "Authentication failed",
          details: authResult,
        }
      }

      // Build query string from params
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value))
      })

      let url = `${this.baseUrl}/clients/?token=${this.token}`
      if (queryParams.toString()) {
        url += `&${queryParams.toString()}`
      }

      console.log("Fetching clients from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to fetch clients with status ${response.status}: ${errorText}`)
        return {
          success: false,
          message: `Failed to fetch clients with status ${response.status}`,
          details: errorText,
        }
      }

      const data = await response.json()
      console.log("Clients response:", data)

      return { success: true, data }
    } catch (error) {
      console.error("Remonline getClients error:", error)
      return {
        success: false,
        message: "Failed to fetch clients from Remonline API",
        details: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Find a client by email
  async getClientByEmail(email: string) {
    try {
      console.log(`Looking for client with email: ${email}`)

      // Use the query parameter to search for the client
      const response = await this.getClients({ query: email })

      if (response.success && response.data.data) {
        // Find the client with the exact email match
        const client = response.data.data.find((c: any) => c.email && c.email.toLowerCase() === email.toLowerCase())

        console.log("Client found by email:", client || "None")

        return {
          success: true,
          exists: !!client,
          client: client || null,
        }
      }

      return {
        success: false,
        exists: false,
        message: "Failed to find client",
        details: response,
      }
    } catch (error) {
      console.error("Remonline getClientByEmail error:", error)
      return {
        success: false,
        exists: false,
        message: "Failed to find client by email",
        details: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Find a client by phone number
  async getClientByPhone(phone: string) {
    try {
      console.log(`Looking for client with phone: ${phone}`)

      // Normalize phone number by removing non-digit characters
      const normalizedPhone = phone.replace(/\D/g, "")

      // Use the query parameter to search for the client
      const response = await this.getClients({ query: normalizedPhone })

      if (response.success && response.data.data) {
        // Find the client with a matching phone number
        const client = response.data.data.find((c: any) => {
          if (!c.phone || !Array.isArray(c.phone)) return false

          // Normalize stored phone numbers for comparison
          const clientPhones = c.phone.map((p: string) => p.replace(/\D/g, ""))
          return clientPhones.some((p) => p.includes(normalizedPhone) || normalizedPhone.includes(p))
        })

        console.log("Client found by phone:", client || "None")

        return {
          success: true,
          exists: !!client,
          client: client || null,
        }
      }

      return {
        success: false,
        exists: false,
        message: "Failed to find client",
        details: response,
      }
    } catch (error) {
      console.error("Remonline getClientByPhone error:", error)
      return {
        success: false,
        exists: false,
        message: "Failed to find client by phone",
        details: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Create a new client
  async createClient(clientData: {
    first_name: string
    last_name: string
    email: string
    phone?: string[]
    address?: string
  }) {
    try {
      // Ensure we have a valid token
      const authResult = await this.auth()
      if (!authResult.success) {
        return {
          success: false,
          message: "Authentication failed",
          details: authResult,
        }
      }

      console.log("Creating client with data:", clientData)

      const response = await fetch(`${this.baseUrl}/clients/?token=${this.token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to create client with status ${response.status}: ${errorText}`)
        return {
          success: false,
          message: `Failed to create client with status ${response.status}`,
          details: errorText,
        }
      }

      const data = await response.json()
      console.log("Create client response:", data)

      if (data.success) {
        return { success: true, client: data.data }
      } else {
        console.error("Failed to create client:", data)
        return { success: false, message: data.message || "Failed to create client", details: data }
      }
    } catch (error) {
      console.error("Remonline createClient error:", error)
      return {
        success: false,
        message: "Failed to create client in Remonline API",
        details: error instanceof Error ? error.message : String(error),
      }
    }
  }
}

// Create a singleton instance
console.log("Initializing Remonline client")
const remonline = new RemonlineClient()

export default remonline
