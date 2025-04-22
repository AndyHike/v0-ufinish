"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
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
import { MoreHorizontal, Search, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ModelsList() {
  const t = useTranslations("Admin")
  const params = useParams()
  const locale = params.locale as string
  const [searchQuery, setSearchQuery] = useState("")
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/models")
        if (!response.ok) throw new Error("Failed to fetch models")
        const data = await response.json()
        setModels(data)
      } catch (error) {
        console.error("Error fetching models:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brands?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("brand")}</TableHead>
            <TableHead>{t("image")}</TableHead>
            <TableHead>{t("createdAt")}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {t("loading")}
              </TableCell>
            </TableRow>
          ) : filteredModels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {t("noModels")}
              </TableCell>
            </TableRow>
          ) : (
            filteredModels.map((model) => (
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
                    {model.brands?.logo_url && (
                      <div className="h-5 w-5 overflow-hidden rounded-full">
                        <Image
                          src={model.brands.logo_url || "/placeholder.svg?height=20&width=20&query=brand"}
                          alt={model.brands.name}
                          width={20}
                          height={20}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    {model.brands?.name}
                  </div>
                </TableCell>
                <TableCell>{model.image_url ? t("hasImage") : t("noImage")}</TableCell>
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
                        <Link href={`/${locale}/admin/models/${model.id}/edit`}>{t("edit")}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/admin/models/${model.id}/services`}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          {t("manageServices")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">{t("delete")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
