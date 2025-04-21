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
import { Plus, Pencil, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Brand = {
  id: string
  name: string
  logo_url: string | null
  created_at: string
}

export default function BrandsPage() {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [newBrand, setNewBrand] = useState({ name: "", logo_url: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  async function handleAddBrand() {
    try {
      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBrand),
      })

      if (!response.ok) {
        throw new Error("Failed to add brand")
      }

      const data = await response.json()
      setBrands([...brands, data])
      setNewBrand({ name: "", logo_url: "" })
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Brand added successfully",
      })
    } catch (error) {
      console.error("Error adding brand:", error)
      toast({
        title: "Error",
        description: "Failed to add brand",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("brands")}</h1>
          <p className="text-muted-foreground">Manage phone brands in your system</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>Add a new phone brand to your system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="Enter brand name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={newBrand.logo_url}
                  onChange={(e) => setNewBrand({ ...newBrand, logo_url: e.target.value })}
                  placeholder="Enter logo URL (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBrand} disabled={!newBrand.name}>
                Add Brand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
          <CardDescription>List of all phone brands in your system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p>Loading brands...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url || "/placeholder.svg"}
                            alt={brand.name}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          "No logo"
                        )}
                      </TableCell>
                      <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
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
