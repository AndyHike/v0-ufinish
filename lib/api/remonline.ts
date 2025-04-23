// Remonline API client

interface RemonlineClient {
  id: number
  name: string
  first_name: string
  last_name: string
  email: string
  phone: string[]
  [key: string]: any
}

interface RemonlineResponse<T> {
  data: T
  page?: number
  count?: number
  success: boolean
}

interface CreateClientData {
  first_name: string
  last_name: string
  email: string
  address?: string
  phone?: string
  [key: string]: any
}

class RemonlineAPI {
  private baseUrl = "https://api.remonline.app"
  private token: string | null = null

  auth(token: string) {
    this.token = token
    return this
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<RemonlineResponse<T>> {
    if (!this.token) {
      throw new Error("Authentication token is required")
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)

    // Add token to query parameters
    url.searchParams.append("token", this.token)

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "API request failed")
    }

    return await response.json()
  }

  async getClients(params: Record<string, string> = {}): Promise<RemonlineResponse<RemonlineClient[]>> {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/clients?${queryParams}`
    return this.request<RemonlineClient[]>(endpoint)
  }

  async getClientByEmail(email: string): Promise<RemonlineClient | null> {
    try {
      const response = await this.getClients({ email })
      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error("Error fetching client by email:", error)
      return null
    }
  }

  async getClientByPhone(phone: string): Promise<RemonlineClient | null> {
    try {
      const response = await this.getClients({ phone })
      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error("Error fetching client by phone:", error)
      return null
    }
  }

  async createClient(data: CreateClientData): Promise<RemonlineResponse<RemonlineClient>> {
    return this.request<RemonlineClient>("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

const remonline = new RemonlineAPI()
export default remonline
