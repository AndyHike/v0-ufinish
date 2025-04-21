"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

type Brand = {
  id: string
  name: string
  logo_url?: string
  position: number
}

export function ModelsFilter() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<string>("all")

  // Get the current brand filter from URL
  useEffect(() => {
    const brandId = searchParams.get("brand")
    if (brandId) {
      setSelectedBrand(brandId)
    } else {
      setSelectedBrand("all")
    }
  }, [searchParams])

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/brands")
        if (!response.ok) throw new Error("Failed to fetch brands")

        const data = await response.json()
        setBrands(data)
      } catch (error) {
        console.error("Error fetching brands:", error)
        toast({
          title: t("error"),
          description: t("errorFetchingBrands"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [t, toast])

  // Handle brand selection
  const handleBrandChange = (value: string) => {
    setSelectedBrand(value)

    // Update URL with selected brand
    if (value === "all") {
      router.push("/admin/models")
    } else {
      router.push(`/admin/models?brand=${value}`)
    }
  }

  return (
    <div className="mb-4">
      <Select value={selectedBrand} onValueChange={handleBrandChange} disabled={isLoading}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder={t("filterByBrand")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allBrands")}</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
