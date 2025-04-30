"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Check, Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveEntityLabel } from "@/lib/entity-service"
import { searchEntities } from "@/lib/entity-database"
import { cn } from "@/lib/utils"
import type { EntityLabel } from "@/types/entity"

interface BulkEntityLabelingProps {
  onComplete?: () => void
}

export function BulkEntityLabeling({ onComplete }: BulkEntityLabelingProps) {
  const [activeTab, setActiveTab] = useState<string>("paste")
  const [addresses, setAddresses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [progress, setProgress] = useState<{ completed: number; total: number; current: string | null }>({
    completed: 0,
    total: 0,
    current: null,
  })

  // Form state for the label to apply to all selected addresses
  const [formData, setFormData] = useState({
    label: "",
    category: "exchange",
    confidence: 0.8,
    source: "user",
    notes: "",
    tags: "",
    riskScore: 0,
    verified: false,
  })

  // Handle pasted addresses
  const handlePastedAddresses = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const lines = text
      .split(/[\n,]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    setAddresses(lines)
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text
        .split(/[\n,]/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
      setAddresses(lines)
    } catch (err) {
      setError("Failed to read the file. Please make sure it's a valid text file.")
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      // In a real app, this would search the blockchain or your database
      const results = searchEntities(searchQuery)
      setSearchResults(results)
    } catch (err) {
      setError("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Toggle selection of an address
  const toggleAddressSelection = (address: string) => {
    if (selectedAddresses.includes(address)) {
      setSelectedAddresses(selectedAddresses.filter((addr) => addr !== address))
    } else {
      setSelectedAddresses([...selectedAddresses, address])
    }
  }

  // Select all addresses
  const selectAllAddresses = () => {
    if (activeTab === "paste" || activeTab === "upload") {
      if (selectedAddresses.length === addresses.length) {
        setSelectedAddresses([])
      } else {
        setSelectedAddresses([...addresses])
      }
    } else if (activeTab === "search") {
      const searchAddresses = searchResults.map((result) => result.address)
      if (selectedAddresses.length === searchAddresses.length) {
        setSelectedAddresses([])
      } else {
        setSelectedAddresses([...searchAddresses])
      }
    }
  }

  // Process the bulk labeling
  const processBulkLabeling = async () => {
    if (selectedAddresses.length === 0) {
      setError("Please select at least one address to label.")
      return
    }

    if (!formData.label.trim()) {
      setError("Label name is required.")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    setProgress({
      completed: 0,
      total: selectedAddresses.length,
      current: null,
    })

    const results: { success: EntityLabel[]; failed: { address: string; error: string }[] } = {
      success: [],
      failed: [],
    }

    for (let i = 0; i < selectedAddresses.length; i++) {
      const address = selectedAddresses[i]
      setProgress({
        completed: i,
        total: selectedAddresses.length,
        current: address,
      })

      try {
        const newLabel = await saveEntityLabel({
          address,
          label: formData.label,
          category: formData.category as "exchange" | "individual" | "contract" | "scam" | "other",
          confidence: formData.confidence,
          source: formData.source as "user" | "community" | "algorithm",
          notes: formData.notes,
          tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : undefined,
          riskScore: formData.riskScore,
          verified: formData.verified,
        })

        results.success.push(newLabel)
      } catch (err) {
        results.failed.push({
          address,
          error: (err as Error).message || "Unknown error",
        })
      }

      // Small delay to prevent overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setProgress({
      completed: selectedAddresses.length,
      total: selectedAddresses.length,
      current: null,
    })

    if (results.failed.length === 0) {
      setSuccess(true)
    } else if (results.success.length === 0) {
      setError(`All ${results.failed.length} operations failed. Please check your input and try again.`)
    } else {
      setError(`${results.success.length} labels created successfully, but ${results.failed.length} operations failed.`)
    }

    setIsProcessing(false)

    // Call the onComplete callback if provided
    if (onComplete && results.success.length > 0) {
      onComplete()
    }
  }

  // Reset the form
  const resetForm = () => {
    setAddresses([])
    setSearchQuery("")
    setSearchResults([])
    setSelectedAddresses([])
    setError(null)
    setSuccess(false)
    setFormData({
      label: "",
      category: "exchange",
      confidence: 0.8,
      source: "user",
      notes: "",
      tags: "",
      riskScore: 0,
      verified: false,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Entity Labeling</CardTitle>
        <CardDescription>Apply labels to multiple entities at once to save time.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="bg-green-50 border-green-500 text-green-700">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Successfully labeled {progress.completed} entities with "{formData.label}".
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="paste">Paste Addresses</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="search">Search Entities</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="addresses">Wallet Addresses (one per line or comma-separated)</Label>
                <Textarea
                  id="addresses"
                  placeholder="Enter wallet addresses..."
                  rows={8}
                  onChange={handlePastedAddresses}
                  disabled={isProcessing}
                />
                <p className="text-sm text-muted-foreground">
                  {addresses.length} addresses found. {selectedAddresses.length} selected.
                </p>
              </div>

              {addresses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Addresses</Label>
                    <Button variant="outline" size="sm" onClick={selectAllAddresses}>
                      {selectedAddresses.length === addresses.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {addresses.map((address, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center space-x-2 p-2 rounded-md",
                          selectedAddresses.includes(address) ? "bg-secondary/50" : "hover:bg-secondary/20",
                        )}
                      >
                        <Checkbox
                          checked={selectedAddresses.includes(address)}
                          onCheckedChange={() => toggleAddressSelection(address)}
                          id={`address-${index}`}
                          disabled={isProcessing}
                        />
                        <Label htmlFor={`address-${index}`} className="flex-1 cursor-pointer font-mono text-sm">
                          {address}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload a text file with addresses (one per line or comma-separated)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                  <Button variant="outline" onClick={() => setAddresses([])} disabled={isProcessing}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {addresses.length} addresses found. {selectedAddresses.length} selected.
                </p>
              </div>

              {addresses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Addresses</Label>
                    <Button variant="outline" size="sm" onClick={selectAllAddresses}>
                      {selectedAddresses.length === addresses.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {addresses.map((address, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center space-x-2 p-2 rounded-md",
                          selectedAddresses.includes(address) ? "bg-secondary/50" : "hover:bg-secondary/20",
                        )}
                      >
                        <Checkbox
                          checked={selectedAddresses.includes(address)}
                          onCheckedChange={() => toggleAddressSelection(address)}
                          id={`upload-address-${index}`}
                          disabled={isProcessing}
                        />
                        <Label htmlFor={`upload-address-${index}`} className="flex-1 cursor-pointer font-mono text-sm">
                          {address}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4 pt-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search-query">Search for entities</Label>
                  <Input
                    id="search-query"
                    placeholder="Search by address, label, or transaction..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isProcessing || isSearching}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isProcessing || isSearching || !searchQuery.trim()}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Search Results</Label>
                    <Button variant="outline" size="sm" onClick={selectAllAddresses}>
                      {selectedAddresses.length === searchResults.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox
                              checked={selectedAddresses.includes(result.address)}
                              onCheckedChange={() => toggleAddressSelection(result.address)}
                              id={`search-result-${index}`}
                              disabled={isProcessing}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {result.address.slice(0, 8)}...{result.address.slice(-8)}
                          </TableCell>
                          <TableCell>{result.name || "Unlabeled"}</TableCell>
                          <TableCell>
                            {result.category && (
                              <Badge
                                className={cn(
                                  result.category === "exchange" && "bg-blue-500",
                                  result.category === "individual" && "bg-green-500",
                                  result.category === "contract" && "bg-purple-500",
                                  result.category === "mixer" && "bg-yellow-500",
                                  result.category === "scam" && "bg-red-500",
                                  "text-white",
                                )}
                              >
                                {result.category}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {selectedAddresses.length > 0 && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-medium mb-4">Label Information</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-label">Label Name</Label>
                    <Input
                      id="bulk-label"
                      placeholder="e.g., Exchange Hot Wallet"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      disabled={isProcessing}
                    >
                      <SelectTrigger id="bulk-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="mixer">Mixer</SelectItem>
                        <SelectItem value="scam">Scam</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-confidence">Confidence ({(formData.confidence * 100).toFixed(0)}%)</Label>
                  <Slider
                    id="bulk-confidence"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[formData.confidence]}
                    onValueChange={(value) => setFormData({ ...formData, confidence: value[0] })}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-risk-score">Risk Score ({formData.riskScore})</Label>
                  <Slider
                    id="bulk-risk-score"
                    min={0}
                    max={100}
                    step={5}
                    value={[formData.riskScore]}
                    onValueChange={(value) => setFormData({ ...formData, riskScore: value[0] })}
                    disabled={isProcessing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-source">Source</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => setFormData({ ...formData, source: value })}
                      disabled={isProcessing}
                    >
                      <SelectTrigger id="bulk-source">
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="algorithm">Algorithm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-tags">Tags (comma separated)</Label>
                    <Input
                      id="bulk-tags"
                      placeholder="e.g., exchange, verified, high-volume"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bulk-verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) => setFormData({ ...formData, verified: checked === true })}
                    disabled={isProcessing}
                  />
                  <Label
                    htmlFor="bulk-verified"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark as verified entity
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-notes">Notes</Label>
                  <Textarea
                    id="bulk-notes"
                    placeholder="Additional information about these entities"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>
                  {progress.completed} of {progress.total} ({Math.round((progress.completed / progress.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
              {progress.current && (
                <p className="text-xs text-muted-foreground truncate">Currently processing: {progress.current}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetForm} disabled={isProcessing}>
          Reset
        </Button>
        <Button
          onClick={processBulkLabeling}
          disabled={isProcessing || selectedAddresses.length === 0 || !formData.label.trim()}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Apply Labels to {selectedAddresses.length} Addresses</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
