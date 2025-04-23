// This is a wrapper for the Remonline API
class RemonlineClient {
  private token: string | null = null
  private baseUrl = "https://api.remonline.app"

  // Authenticate with the Remonline API using the token directly
  async auth(token?: string) {
    try {
      console.log("Authenticating with Remonline API...")

      // If token is provided, use it directly
      if (token) {
        console.log("Using provided token")
        this.token = token

        // Validate the token by making a simple API call
        const testResponse = await fetch(`${this.baseUrl}/clients?token=${this.token}&limit=1`, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        })

        if (!testResponse.ok) {
          const errorText = await testResponse.text()
          console.error(`Token validation failed with status ${testResponse.status}: ${errorText}`)
          return {
            success: false,
            message: `Invalid token: ${testResponse.status}`,
            details: errorText,
          }
        }

        return { success: true, token }
      }

      // Otherwise, use the token from environment variable
      const envToken = process.env.REMONLINE_API_TOKEN
      if (!envToken) {
        console.error("No token provided and REMONLINE_API_TOKEN environment variable is not set")
        return {
          success: false,
          message: "No token provided and REMONLINE_API_TOKEN environment variable is not set",
        }
      }

      console.log("Using token from environment variable")
      this.token = envToken

      // Validate the token
      const testResponse = await fetch(`${this.baseUrl}/clients?token=${this.token}&limit=1`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })

      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        console.error(`Token validation failed with status ${testResponse.status}: ${errorText}`)
        return {
          success: false,
          message: `Invalid token: ${testResponse.status}`,
          details: errorText,
        }
      }

      return { success: true, token: envToken }
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
      if (!this.token) {
        const authResult = await this.auth()
        if (!authResult.success) {
          return {
            success: false,
            message: "Not authenticated. Please call auth() first.",
          }
        }
      }

      // Build query string from params
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value))
      })

      let url = `${this.baseUrl}/clients?token=${this.token}`
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
      if (!this.token) {
        const authResult = await this.auth()
        if (!authResult.success) {
          return {
            success: false,
            message: "Not authenticated. Please call auth() first.",
          }
        }
      }

      console.log("Creating client with data:", clientData)

      const response = await fetch(`${this.baseUrl}/clients?token=${this.token}`, {
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
