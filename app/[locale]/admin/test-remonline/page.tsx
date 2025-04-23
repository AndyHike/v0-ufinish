"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function TestRemonlinePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/test-remonline")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || "Failed to test Remonline API")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const searchClient = async (type: "email" | "phone") => {
    setSearchLoading(true)
    setSearchError(null)
    setSearchResult(null)

    try {
      const identifier = type === "email" ? email : phone
      const response = await fetch(
        `/api/admin/clients/search?type=${type}&identifier=${encodeURIComponent(identifier)}`,
      )
      const data = await response.json()

      if (response.ok) {
        setSearchResult(data)
      } else {
        setSearchError(data.message || "Failed to search client")
      }
    } catch (err) {
      setSearchError("An unexpected error occurred")
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Remonline API</h1>
          <p className="text-muted-foreground">Test the connection to the Remonline API</p>
        </div>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Test Connection
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.success ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Connection Successful
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="mr-2 h-5 w-5" />
                  Connection Failed
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {result.success
                ? "Successfully connected to the Remonline API"
                : "Failed to connect to the Remonline API"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="auth">
              <TabsList>
                <TabsTrigger value="auth">Authentication</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="raw">Raw Response</TabsTrigger>
              </TabsList>
              <TabsContent value="auth" className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm">{JSON.stringify(result.auth, null, 2)}</pre>
                </div>
              </TabsContent>
              <TabsContent value="clients" className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm">{JSON.stringify(result.clients, null, 2)}</pre>
                </div>
              </TabsContent>
              <TabsContent value="raw" className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Search Client</CardTitle>
          <CardDescription>Search for a client by email or phone</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email">
            <TabsList>
              <TabsTrigger value="email">By Email</TabsTrigger>
              <TabsTrigger value="phone">By Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                  <Button onClick={() => searchClient("email")} disabled={searchLoading || !email}>
                    {searchLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="phone" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                  <Button onClick={() => searchClient("phone")} disabled={searchLoading || !phone}>
                    {searchLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {searchError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {searchResult && (
            <div className="mt-4">
              <h3 className="mb-2 text-lg font-medium">Search Result</h3>
              <div className="rounded-md bg-muted p-4">
                <pre className="text-sm">{JSON.stringify(searchResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
