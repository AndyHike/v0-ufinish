"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Brand = {
  id: string
  name: string
}

type Model = {
  id: string
  name: string
  brand_id: string
  image_url: string | null
  created_at: string
  brands: {
    name: string
  }
}

export default function ModelsPage() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const [models, setModels] = useState<Model[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [newModel, setNewModel] = useState({ name: "", brandId: "", imageUrl: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    Promise.all([fetchModels(), fetchBrands()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [])

  async function fetchModels() {
    try {
      const response = await fetch("/api/admin/models")
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error("Error fetching models:", error)
      toast({
        title: "Error",
        description: "Failed to fetch models",
        variant: "destructive",
      })
    }
  }

  async function fetchBrands() {
    try {
      const response = await fetch("/api/admin/brands")
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      })
    }
  }

  async function handleAddModel() {
    try {
      const response = await fetch("/api/admin/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newModel),
      })

      if (!response.ok) {
        throw new Error("Failed to add model")
      }

      const data = await response.json()
      await fetchModels() // Refetch to get the brand name
      setNewModel({ name: "", brandId: "", imageUrl: "" })
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Model added successfully",
      })
    } catch (error) {
      console.error("Error adding model:", error)
      toast({
        title: "Error",
        description: "Failed to add model",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("models")}</h1>
          <p className="text-muted-foreground">Manage phone models in your system</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Model</DialogTitle>
              <DialogDescription>Add a new phone model to your system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  placeholder="Enter model name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={newModel.brandId}
                  onValueChange={(value) => setNewModel({ ...newModel, brandId: value })}
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newModel.imageUrl}
                  onChange={(e) => setNewModel({ ...newModel, imageUrl: e.target.value })}
                  placeholder="Enter image URL (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddModel} disabled={!newModel.name || !newModel.brandId}>
                Add Model
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Models</CardTitle>
          <CardDescription>List of all phone models in your system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p>Loading models...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No models found
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{model.brands?.name}</TableCell>
                      <TableCell>
                        {model.image_url ? (
                          <img
                            src={model.image_url || "/placeholder.svg"}
                            alt={model.name}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          "No image"
                        )}
                      </TableCell>
                      <TableCell>{new Date(model.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
