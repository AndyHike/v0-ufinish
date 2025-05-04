export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: number
          created_at: string
          name: string
          slug: string
          image_url: string | null
          position: number
          description: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          slug: string
          image_url?: string | null
          position?: number
          description?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          slug?: string
          image_url?: string | null
          position?: number
          description?: Json | null
        }
      }
      series: {
        Row: {
          id: number
          created_at: string
          name: string
          slug: string
          brand_id: number
          position: number
          description: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          slug: string
          brand_id: number
          position?: number
          description?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          slug?: string
          brand_id?: number
          position?: number
          description?: Json | null
        }
      }
      models: {
        Row: {
          id: number
          created_at: string
          name: string
          slug: string
          brand_id: number
          series_id: number | null
          image_url: string | null
          position: number
          description: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          slug: string
          brand_id: number
          series_id?: number | null
          image_url?: string | null
          position?: number
          description?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          slug?: string
          brand_id?: number
          series_id?: number | null
          image_url?: string | null
          position?: number
          description?: Json | null
        }
      }
      services: {
        Row: {
          id: number
          created_at: string
          name: Json
          slug: string
          position: number
        }
        Insert: {
          id?: number
          created_at?: string
          name: Json
          slug: string
          position?: number
        }
        Update: {
          id?: number
          created_at?: string
          name?: Json
          slug?: string
          position?: number
        }
      }
      model_services: {
        Row: {
          id: number
          created_at: string
          model_id: number
          service_id: number
          price: number
          discount_price: number | null
          is_available: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          model_id: number
          service_id: number
          price: number
          discount_price?: number | null
          is_available?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          model_id?: number
          service_id?: number
          price?: number
          discount_price?: number | null
          is_available?: boolean
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          phone: string | null
          role: string
          remonline_id: number | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          phone?: string | null
          role?: string
          remonline_id?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          phone?: string | null
          role?: string
          remonline_id?: number | null
        }
      }
      discounts: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string | null
          percentage: number
          code: string
          is_active: boolean
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description?: string | null
          percentage: number
          code: string
          is_active?: boolean
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string | null
          percentage?: number
          code?: string
          is_active?: boolean
          valid_from?: string | null
          valid_to?: string | null
        }
      }
      user_discounts: {
        Row: {
          id: number
          created_at: string
          user_id: string
          discount_id: number
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          discount_id: number
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          discount_id?: number
        }
      }
      admin_activity: {
        Row: {
          id: number
          created_at: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
        }
      }
      repair_orders: {
        Row: {
          id: number
          created_at: string
          user_id: string
          status_id: number
          remonline_id: number | null
          details: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          status_id: number
          remonline_id?: number | null
          details?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          status_id?: number
          remonline_id?: number | null
          details?: Json | null
        }
      }
      order_statuses: {
        Row: {
          id: number
          created_at: string
          name: Json
          color: string
          position: number
          remonline_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: Json
          color: string
          position?: number
          remonline_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: Json
          color?: string
          position?: number
          remonline_id?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
