"use server"

import { createClient } from "@/lib/supabase"

export async function getProductLines(brandId?: string) {
  try {
    const supabase = createClient()

    let query = supabase
      .from("product_lines")
      .select("*, brands(name)")
      .order("position", { ascending: true, nullsLast: true })

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    const { data, error } = await query

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching product lines:", error)
    return []
  }
}

export async function getProductLinesByBrand(brandId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("product_lines")
      .select("*")
      .eq("brand_id", brandId)
      .order("position", { ascending: true, nullsLast: true })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching product lines by brand:", error)
    return []
  }
}
