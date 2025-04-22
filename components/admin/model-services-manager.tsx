"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/format-currency"

type Service = {
  id: string
  name: string
  description: string
  position: number
}

type ModelService = {
  id: string
  model_id: string
  service_id: string
  price: number | null
  services: Service
}

type ModelServicesManagerProps = {
  modelId: string
  locale: string
}

export function ModelServicesManager({ modelId, locale }: ModelServicesManagerProps) {
  const t = useTranslations("Admin")
  const { toast } = useToast()

  const [modelServices, setModelServices] = useState<ModelService[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

  // Fetch model services and all services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch model services
        const modelServicesRes = await fetch(`/api/admin/model-services?model_id=${modelId}&locale=${locale}`)
        if (!modelServicesRes.ok) throw new Error("Failed to fetch model services")
        const modelServicesData = await modelServicesRes.json()

        // Fetch all services
        const servicesRes = await fetch(`/api/admin/services?locale=${locale}`)
        if (!servicesRes.ok) throw new Error("Failed to fetch services")
        const servicesData = await servicesRes.json()

        setModelServices(modelServicesData)
        setAllServices(servicesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: t("error"),
          description: t("errorFetchingData"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [modelId, locale, t, toast])

  // Get services that are not already assigned to the model
  const availableServices = allServices.filter((service) => !modelServices.some((ms) => ms.service_id === service.id))

  const handleAddService = async () => {
    if (!selectedService) {
      toast({
        title: t("validationError"),
        description: t("pleaseSelectService"),
        variant: "destructive",
      })
      return
    }

    // Allow empty price (will be stored as null)
    const priceValue = price.trim() === "" ? null : Number.parseFloat(price)

    // If price is provided, validate it's a positive number
    if (priceValue !== null && (isNaN(priceValue) || priceValue <= 0)) {
      toast({
        title: t("validationError"),
        description: t("pleaseEnterValidPrice"),
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/admin/model-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId,
          serviceId: selectedService,
          price: priceValue,
        }),
      })

      if (!res.ok) throw new Error("Failed to add service")

      const newModelService = await res.json()

      // Find the service details
      const serviceDetails = allServices.find((s) => s.id === selectedService)

      if (serviceDetails) {
        // Add the new model service to the list
        setModelServices([
          ...modelServices,
          {
            ...newModelService,
            services: serviceDetails,
          },
        ])
      }

      // Reset form
      setSelectedService("")
      setPrice("")
      setIsDialogOpen(false)

      toast({
        title: t("success"),
        description: t("serviceAddedSuccessfully"),
      })
    } catch (error) {
      console.error("Error adding service:", error)
      toast({
        title: t("error"),
        description: t("errorAddingService"),
        variant: "destructive",
      })
    }
  }

  const handleEditService = async () => {
    if (!editingServiceId) {
      toast({
        title: t("validationError"),
        description: t("serviceNotSelected"),
        variant: "destructive",
      })
      return
    }

    // Allow empty price (will be stored as null)
    const priceValue = price.trim() === "" ? null : Number.parseFloat(price)

    // If price is provided, validate it's a positive number
    if (priceValue !== null && (isNaN(priceValue) || priceValue <= 0)) {
      toast({
        title: t("validationError"),
        description: t("pleaseEnterValidPrice"),
        variant: "destructive",
      })
      return
    }

    try {
      const modelService = modelServices.find((ms) => ms.id === editingServiceId)
      if (!modelService) return

      const res = await fetch("/api/admin/model-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId,
          serviceId: modelService.service_id,
          price: priceValue,
        }),
      })

      if (!res.ok) throw new Error("Failed to update service")

      // Update the model service in the list
      setModelServices(modelServices.map((ms) => (ms.id === editingServiceId ? { ...ms, price: priceValue } : ms)))

      // Reset form
      setEditingServiceId(null)
      setPrice("")
      setIsDialogOpen(false)

      toast({
        title: t("success"),
        description: t("serviceUpdatedSuccessfully"),
      })
    } catch (error) {
      console.error("Error updating service:", error)
      toast({
        title: t("error"),
        description: t("errorUpdatingService"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm(t("confirmDeleteService"))) return

    try {
      const res = await fetch(`/api/admin/model-services/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete service")

      // Remove the model service from the list
      setModelServices(modelServices.filter((ms) => ms.id !== id))

      toast({
        title: t("success"),
        description: t("serviceDeletedSuccessfully"),
      })
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: t("error"),
        description: t("errorDeletingService"),
        variant: "destructive",
      })
    }
  }

  const openAddDialog = () => {
    setEditingServiceId(null)
    setSelectedService("")
    setPrice("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (modelService: ModelService) => {
    setEditingServiceId(modelService.id)
    setSelectedService(modelService.service_id)
    setPrice(modelService.price !== null ? modelService.price.toString() : "")
    setIsDialogOpen(true)
  }

  const renderPrice = (price: number | null) => {
    return price !== null ? formatCurrency(price) : t("priceOnRequest")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">{t("manageModelServices")}</h2>
        <Button onClick={openAddDialog} disabled={availableServices.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addService")}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">{t("loading")}</div>
      ) : modelServices.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t("noServicesForModel")}</p>
          <Button onClick={openAddDialog} className="mt-4" disabled={availableServices.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addService")}
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("serviceName")}</TableHead>
              <TableHead>{t("serviceDescription")}</TableHead>
              <TableHead className="text-right">{t("price")}</TableHead>
              <TableHead className="w-[100px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelServices.map((modelService) => (
              <TableRow key={modelService.id}>
                <TableCell className="font-medium">{modelService.services?.name}</TableCell>
                <TableCell className="max-w-md truncate">{modelService.services?.description}</TableCell>
                <TableCell className="text-right">{renderPrice(modelService.price)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(modelService)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">{t("edit")}</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteService(modelService.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t("delete")}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingServiceId ? t("editServicePrice") : t("addServiceToModel")}</DialogTitle>
            <DialogDescription>
              {editingServiceId ? t("editServicePriceDescription") : t("addServiceToModelDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingServiceId && (
              <div className="grid gap-2">
                <label htmlFor="service">{t("service")}</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectService")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="price">{t("price")}</label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t("priceOnRequest")}
              />
              <p className="text-xs text-muted-foreground">{t("leaveEmptyForPriceOnRequest")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={editingServiceId ? handleEditService : handleAddService}>
              {editingServiceId ? t("saveChanges") : t("addService")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
