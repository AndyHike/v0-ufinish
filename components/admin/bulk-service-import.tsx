"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload } from "lucide-react"
import Link from "next/link"

export function BulkServiceImport() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [locale, setLocale] = useState("uk") // Додаємо стан для локалі

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  async function handleUpload() {
    if (!file) {
      toast({
        title: t("error"),
        description: t("noFileSelected"),
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", session?.user?.id || "")
      formData.append("locale", locale) // Додаємо локаль до запиту

      const response = await fetch("/api/admin/bulk-import/services", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file")
      }

      setResults(data)

      toast({
        title: t("success"),
        description: t("fileUploadedSuccess"),
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: t("error"),
        description: t("fileUploadedError"),
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleExport() {
    try {
      const response = await fetch("/api/admin/export/services")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "services-export.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: t("success"),
        description: t("exportSuccess"),
      })
    } catch (error) {
      console.error("Error exporting services:", error)
      toast({
        title: t("error"),
        description: t("exportError"),
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("bulkServiceImport")}</CardTitle>
        <CardDescription>{t("bulkServiceImportDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="locale">{t("selectLanguage") || "Select Language"}</Label>
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger id="locale">
              <SelectValue placeholder={t("selectLanguage") || "Select Language"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uk">Українська</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="cs">Čeština</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {t("languageImportDescription") || "Select the language for imported service names and descriptions"}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="file">{t("selectFile")}</Label>
          <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
          <p className="text-sm text-muted-foreground mt-1">{t("csvFileDescription")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? t("uploading") : t("uploadFile")}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t("exportServices")}
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            {t("bulkImportGuide")}{" "}
            <Link href="/docs/bulk-management-guide.md" className="text-primary hover:underline" target="_blank">
              {t("viewGuide")}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("multilingualImportGuide")}{" "}
            <Link href="/docs/multilingual-import-guide.md" className="text-primary hover:underline" target="_blank">
              {t("viewGuide")}
            </Link>
          </p>
        </div>
      </CardContent>
      {results && (
        <CardFooter className="flex flex-col items-start">
          <h3 className="text-lg font-semibold mb-2">{t("importResults")}</h3>
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-green-600 font-medium">{t("successfulImports")}</p>
              <p className="text-2xl font-bold">{results.success}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-red-600 font-medium">{t("failedImports")}</p>
              <p className="text-2xl font-bold">{results.failed}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="text-yellow-600 font-medium">{t("skippedImports")}</p>
              <p className="text-2xl font-bold">{results.skipped}</p>
            </div>
          </div>
          {results.errors && results.errors.length > 0 && (
            <div className="mt-4 w-full">
              <h4 className="text-md font-semibold mb-2">{t("errors")}</h4>
              <div className="bg-red-50 p-3 rounded-md max-h-40 overflow-y-auto">
                <ul className="list-disc pl-5">
                  {results.errors.map((error: string, index: number) => (
                    <li key={index} className="text-red-600 text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
