"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, Search, DollarSign, Pencil, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Model = {
  id: string
  name: string
  brand_id: string
  brand_name: string
  brand_logo_url?: string
  image_url?: string
  year: string
  created_at: string
}

export function ModelsList() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true)

        // Get brand filter from URL
        const brandId = searchParams.get("brand")

        // Build API URL with optional brand filter
        let url = "/api/admin/models"
        if (brandId) {
          url += `?brand=${brandId}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch models")

        const data = await response.json()
        setModels(data)
      } catch (error) {
        console.error("Error fetching models:", error)
        toast({
          title: t("error"),
          description: t("errorFetchingModels"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [searchParams, t, toast])

  // Filter models by search query
  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brand_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle model deletion
  const handleDeleteModel = async (id: string) => {
    if (!confirm(t("confirmDeleteModel"))) return

    try {
      const response = await fetch(`/api/admin/models/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete model")

      // Remove the model from the list
      setModels(models.filter((model) => model.id !== id))

      toast({
        title: t("success"),
        description: t("modelDeletedSuccess"),
      })
    } catch (error) {
      console.error("Error deleting model:", error)
      toast({
        title: t("error"),
        description: t("modelDeletedError"),
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">{t("loading")}</div>
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchModels")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t("noModelsFound")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("brand")}</TableHead>
              <TableHead>{t("year")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModels.map((model) => (
              <TableRow key={model.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-md">
                      <Image
                        src={model.image_url || "/placeholder.svg?height=32&width=32&query=phone"}
                        alt={model.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="font-medium">{model.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 overflow-hidden rounded-full">
                      <Image
                        src={model.brand_logo_url || "/placeholder.svg?height=20&width=20&query=brand"}
                        alt={model.brand_name}
                        width={20}
                        height={20}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    {model.brand_name}
                  </div>
                </TableCell>
                <TableCell>{model.year}</TableCell>
                <TableCell>{new Date(model.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t("openMenu")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/models/${model.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("edit")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/models/${model.id}/services`}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          {t("manageServices")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteModel(model.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
