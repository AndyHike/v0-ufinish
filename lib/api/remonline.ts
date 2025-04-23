const API_BASE_URL = "https://api.remonline.app"

class RemonlineClient {
  private token: string | null = null
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async auth(apiKey?: string) {
    const key = apiKey || this.apiKey
    try {
      const response = await fetch(`${API_BASE_URL}/token/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api_key: key }),
      })

      const data = await response.json()
      if (data.success) {
        this.token = data.token
        return { success: true, token: data.token }
      } else {
        return { success: false, message: data.message || "Authentication failed" }
      }
    } catch (error) {
      console.error("Remonline auth error:", error)
      return { success: false, message: "Failed to authenticate with Remonline API" }
    }
  }

  private async ensureAuth() {
    if (!this.token) {
      await this.auth()
    }
  }

  async getClients(params = {}) {
    await this.ensureAuth()
    try {
      const queryParams = new URLSearchParams(params as Record<string, string>).toString()
      const url = `${API_BASE_URL}/clients/?${queryParams}`

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      })

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error("Remonline getClients error:", error)
      return { success: false, message: "Failed to fetch clients from Remonline API" }
    }
  }

  async getClientByEmail(email: string) {
    await this.ensureAuth()
    try {
      const response = await this.getClients({ query: email })

      if (response.success && response.data.data) {
        const client = response.data.data.find((c: any) => c.email && c.email.toLowerCase() === email.toLowerCase())

        return {
          success: true,
          exists: !!client,
          client: client || null,
        }
      }

      return { success: false, exists: false, message: "Failed to find client" }
    } catch (error) {
      console.error("Remonline getClientByEmail error:", error)
      return { success: false, exists: false, message: "Failed to find client by email" }
    }
  }

  async getClientByPhone(phone: string) {
    await this.ensureAuth()
    try {
      // Normalize phone number by removing non-digit characters
      const normalizedPhone = phone.replace(/\D/g, "")

      const response = await this.getClients({ query: normalizedPhone })

      if (response.success && response.data.data) {
        const client = response.data.data.find((c: any) => {
          if (!c.phone || !Array.isArray(c.phone)) return false

          // Normalize stored phone numbers for comparison
          const clientPhones = c.phone.map((p: string) => p.replace(/\D/g, ""))
          return clientPhones.some((p) => p.includes(normalizedPhone) || normalizedPhone.includes(p))
        })

        return {
          success: true,
          exists: !!client,
          client: client || null,
        }
      }

      return { success: false, exists: false, message: "Failed to find client" }
    } catch (error) {
      console.error("Remonline getClientByPhone error:", error)
      return { success: false, exists: false, message: "Failed to find client by phone" }
    }
  }

  async createClient(clientData: {
    first_name: string
    last_name: string
    email: string
    phone?: string[]
    address?: string
  }) {
    await this.ensureAuth()
    try {
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(clientData),
      })

      const data = await response.json()
      if (data.success) {
        return { success: true, client: data.data }
      } else {
        return { success: false, message: data.message || "Failed to create client" }
      }
    } catch (error) {
      console.error("Remonline createClient error:", error)
      return { success: false, message: "Failed to create client in Remonline API" }
    }
  }
}

// Create a singleton instance
const apiKey = process.env.REMONLINE_API_TOKEN || ""
const remonline = new RemonlineClient(apiKey)

export default remonline
