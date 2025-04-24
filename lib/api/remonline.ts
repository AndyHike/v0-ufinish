// This is a wrapper for the Remonline API
class RemonlineClient {
  private staticApiKey: string | null = process.env.REMONLINE_API_TOKEN || null
  private token: string | null = null
  private tokenExpiration: Date | null = null
  private baseUrl = "https://api.remonline.app"

  constructor() {
    // Initialize the token when the client is created
    this.initializeToken()
  }

  private async initializeToken() {
    if (this.staticApiKey) {
      await this.refreshToken()
    } else {
      console.error("REMONLINE_API_TOKEN environment variable is not set")
    }
  }

  private async refreshToken() {
    try {
      console.log("Refreshing Remonline API token...")

      const options = {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ api_key: this.staticApiKey }),
      }

      const response = await fetch(`${this.baseUrl}/token/new`, options)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to refresh token with status ${response.status}: ${errorText}`)
        throw new Error(`Failed to refresh token: ${response.status}`)
      }

      const data = await response.json()

      this.token = data.token
      // Set token expiration to 1 hour from now
      this.tokenExpiration = new Date(Date.now() + 60 * 60 * 1000)
      console.log("Remonline API token refreshed successfully. Expires at:", this.tokenExpiration)
    } catch (error) {
      console.error("Error refreshing Remonline API token:", error)
      throw error
    }
  }

  private async ensureToken() {
    if (!this.token || !this.tokenExpiration || this.tokenExpiration <= new Date()) {
      console.log("API token is expired or missing, refreshing...")
      await this.refreshToken()
    }
  }

  // Authenticate with the Remonline API using the token directly
  async auth() {
    try {
      await this.ensureToken()

      if (!this.token) {
        console.error("No token available")
        return {
          success: false,
          message: "No token available",
        }
      }

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
      const authResult = await this.auth()
      if (!authResult.success) {
        return {
          success: false,
          message: "Not authenticated. Please call auth() first.",
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
      await this.ensureToken()

      console.log("Creating client with data:", clientData)

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(clientData),
      }

      const response = await fetch(`${this.baseUrl}/clients/?token=${this.token}`, options)
      const data = await response.json()

      console.log("Remonline createClient response:", data)

      if (!response.ok) {
        const errorText = await response.json()
        console.error(`Failed to create client with status ${response.status}: ${JSON.stringify(errorText)}`)
        return {
          success: false,
          message: `Failed to create client with status ${response.status}`,
          details: errorText,
        }
      }

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
