"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { GripVertical, Loader2 } from "lucide-react"
import Image from "next/image"

type Model = {
  id: string
  name: string
  brand_name: string
  image_url?: string
  position: number
}

export function ModelsReorder() {
  const t = useTranslations("Admin")
  const router = useRouter()
  const { toast } = useToast()

  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Fetch models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/models")
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
  }, [t, toast])

  const handleDragStart = (index: number) => {
    setIsDragging(true)
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null) return
    if (draggedIndex === index) return

    const newModels = [...models]
    const draggedModel = newModels[draggedIndex]

    // Remove the dragged item
    newModels.splice(draggedIndex, 1)
    // Insert it at the new position
    newModels.splice(index, 0, draggedModel)

    setModels(newModels)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedIndex(null)
  }

  const saveOrder = async () => {
    try {
      setIsSaving(true)

      const orderedIds = models.map((model) => model.id)

      const response = await fetch("/api/admin/models/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderedIds }),
      })

      if (!response.ok) throw new Error("Failed to save order")

      toast({
        title: t("success"),
        description: t("modelReorderedSuccess"),
      })

      router.push("/admin/models")
      router.refresh()
    } catch (error) {
      console.error("Error saving order:", error)
      toast({
        title: t("error"),
        description: t("modelReorderedError"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground">{t("noModelsFound")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {models.map((model, index) => (
          <li
            key={model.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center rounded-md border p-3 ${
              isDragging && draggedIndex === index ? "border-primary bg-muted" : ""
            }`}
          >
            <div className="mr-2 cursor-move">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mr-3 h-8 w-8 overflow-hidden rounded-md">
              <Image
                src={model.image_url || "/placeholder.svg?height=32&width=32&query=phone"}
                alt={model.name}
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{model.name}</p>
              <p className="text-sm text-muted-foreground">{model.brand_name}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button onClick={saveOrder} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("saveOrder")}
        </Button>
      </div>
    </div>
  )
}
