"use client"

import { useState } from "react"
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
import { MoreHorizontal, Search, DollarSign, Pencil, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function ModelsList() {
  const t = useTranslations("Admin")
  const [searchQuery, setSearchQuery] = useState("")

  // In a real app, this would fetch data from an API
  const models = [
    {
      id: "1",
      name: "iPhone 15",
      brand: "Apple",
      brandLogo: "/bitten-fruit-silhouette.png",
      image: "/sleek-slate-iphone.png",
      year: "2023",
      createdAt: "21.04.2025",
    },
    {
      id: "2",
      name: "iPhone 14",
      brand: "Apple",
      brandLogo: "/bitten-fruit-silhouette.png",
      image: "/sleek-slate-iphone.png",
      year: "2022",
      createdAt: "21.04.2025",
    },
    {
      id: "3",
      name: "iPhone 13",
      brand: "Apple",
      brandLogo: "/bitten-fruit-silhouette.png",
      image: "/sleek-slate-iphone.png",
      year: "2021",
      createdAt: "21.04.2025",
    },
    {
      id: "4",
      name: "Galaxy Z Fold 5",
      brand: "Samsung",
      brandLogo: "/samsung-wordmark.png",
      image: "/phantom-violet-s21.png",
      year: "2023",
      createdAt: "21.04.2025",
    },
    {
      id: "5",
      name: "Galaxy S23",
      brand: "Samsung",
      brandLogo: "/samsung-wordmark.png",
      image: "/phantom-violet-s21.png",
      year: "2023",
      createdAt: "21.04.2025",
    },
  ]

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brand.toLowerCase().includes(searchQuery.toLowerCase()),
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
                      src={model.image || "/placeholder.svg"}
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
                      src={model.brandLogo || "/placeholder.svg"}
                      alt={model.brand}
                      width={20}
                      height={20}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  {model.brand}
                </div>
              </TableCell>
              <TableCell>{model.year}</TableCell>
              <TableCell>{model.createdAt}</TableCell>
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
                    <DropdownMenuItem className="text-destructive">
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
    </div>
  )
}
