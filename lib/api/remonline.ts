// This is a wrapper for the Remonline API
class RemonlineClient {
  private apiKey: string
  private token: string | null = null
  private tokenExpiry: number | null = null
  private baseUrl = "https://api.remonline.app"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Authenticate with the Remonline API
  async auth() {
    try {
      console.log("Authenticating with Remonline API...")

      // Check if we have a valid token already
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log("Using existing token (still valid)")
        return { success: true, token: this.token }
      }

      // Make a POST request to get a token
      const response = await fetch(`${this.baseUrl}/token/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api_key: this.apiKey }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Authentication failed with status ${response.status}: ${errorText}`)
        return {
          success: false,
          message: `Authentication failed with status ${response.status}`,
          details: errorText,
        }
      }

      const data = await response.json()
      console.log("Auth response:", data)

      if (data.success) {
        this.token = data.token
        // Token expires in 24 hours, but we'll set it to expire in 23 hours to be safe
        this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
        return { success: true, token: data.token }
      } else {
        console.error("Authentication failed:", data)
        return { success: false, message: data.message || "Authentication failed", details: data }
      }
    } catch (error) {
      console.error("Remonline auth error:", error)
      return {
        success: false,
        message: "Failed to authenticate with Remonline API",
        details: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Ensure we have a valid token before making requests
  private async ensureAuth() {
    if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      const authResult = await this.auth()
      if (!authResult.success) {
        throw new Error(`Failed to authenticate with Remonline API: ${authResult.message}`)
      }
    }
    return this.token
  }

  // Get clients with optional query parameters
  async getClients(params = {}) {
    try {
      const token = await this.ensureAuth()

      // Build query string from params
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value))
      })

      const url = `${this.baseUrl}/clients/?${queryParams.toString()}`
      console.log("Fetching clients from:", url)

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

      if (data.success) {
        return { success: true, data }
      } else {
        console.error("Failed to fetch clients:", data)
        return { success: false, message: data.message || "Failed to fetch clients", details: data }
      }
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
      const token = await this.ensureAuth()

      console.log("Creating client with data:", clientData)

      const response = await fetch(`${this.baseUrl}/clients/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
const apiKey = process.env.REMONLINE_API_TOKEN || ""
console.log("Initializing Remonline client with API key:", apiKey ? "Key exists" : "No key provided")
const remonline = new RemonlineClient(apiKey)

export default remonline
