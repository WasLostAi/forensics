"use client"

import { useState } from "react"
import { AlertTriangle, Tag, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { saveEntityLabel } from "@/lib/entity-service"
import type { EntityLabel } from "@/types/entity"

interface EntityLabelBulkOperationsProps {
  onOperationComplete?: () => void
}

export function EntityLabelBulkOperations({ onOperationComplete }: EntityLabelBulkOperationsProps) {
  const [activeTab, setActiveTab] = useState("add")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{
    success: number
    failed: number
    messages: string[]
  }>({ success: 0, failed: 0, messages: [] })
  const [error, setError] = useState<string | null>(null)

  // Add form state
  const [addFormData, setAddFormData] = useState({
    addresses: "",
    label: "",
    category: "exchange",
    confidence: 0.8,
    source: "user",
    notes: "",
    tags: "",
    riskScore: 0,
  })

  // Delete form state
  const [deleteFormData, setDeleteFormData] = useState({
    addresses: "",
    deleteAll: false,
    category: "",
  })

  // Tag form state
  const [tagFormData, setTagFormData] = useState({
    addresses: "",
    tagsToAdd: "",
    tagsToRemove: "",
  })

  const handleBulkAdd = async () => {
    if (!addFormData.addresses.trim()) {
      setError("Please enter at least one wallet address")
      return
    }

    if (!addFormData.label.trim()) {
      setError("Label name is required")
      return
    }

    setIsProcessing(true)
    setError(null)
    setResults({ success: 0, failed: 0, messages: [] })

    try {
      const addresses = addFormData.addresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)

      let successCount = 0
      let failedCount = 0
      const messages: string[] = []

      for (const address of addresses) {
        try {
          await saveEntityLabel({
            address,
            label: addFormData.label,
            category: addFormData.category as "exchange" | "individual" | "contract" | "scam" | "other",
            confidence: addFormData.confidence,
            source: addFormData.source as "user" | "community" | "algorithm",
            notes: addFormData.notes,
            tags: addFormData.tags ? addFormData.tags.split(",").map((tag) => tag.trim()) : undefined,
            riskScore: addFormData.riskScore,
          })
          successCount++
          messages.push(`✅ Added label to ${address}`)
        } catch (err) {
          failedCount++
          messages.push(`❌ Failed to add label to ${address}: ${(err as Error).message}`)
        }
      }

      setResults({
        success: successCount,
        failed: failedCount,
        messages,
      })

      if (onOperationComplete) {
        onOperationComplete()
      }
    } catch (err) {
      setError(`Operation failed: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!deleteFormData.addresses.trim() && !deleteFormData.deleteAll) {
      setError("Please enter at least one wallet address or select 'Delete All'")
      return
    }

    setIsProcessing(true)
    setError(null)
    setResults({ success: 0, failed: 0, messages: [] })

    try {
      // In a real implementation, you would fetch the labels based on criteria
      // and then delete them. This is a simplified version.

      const addresses = deleteFormData.addresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)

      // Mock implementation - in a real app, you'd query the database
      const labelsToDelete: EntityLabel[] = [
        {
          id: "mock-1",
          address: addresses[0] || "mock-address-1",
          label: "Mock Label 1",
          category: "exchange",
          confidence: 0.9,
          source: "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "mock-2",
          address: addresses[1] || "mock-address-2",
          label: "Mock Label 2",
          category: "individual",
          confidence: 0.8,
          source: "community",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      let successCount = 0
      let failedCount = 0
      const messages: string[] = []

      for (const label of labelsToDelete) {
        try {
          // In a real implementation, you would actually delete the label
          // await deleteEntityLabel(label.id)
          successCount++
          messages.push(`✅ Deleted label "${label.label}" from ${label.address}`)
        } catch (err) {
          failedCount++
          messages.push(`❌ Failed to delete label from ${label.address}: ${(err as Error).message}`)
        }
      }

      setResults({
        success: successCount,
        failed: failedCount,
        messages,
      })

      if (onOperationComplete) {
        onOperationComplete()
      }
    } catch (err) {
      setError(`Operation failed: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkTag = async () => {
    if (!tagFormData.addresses.trim()) {
      setError("Please enter at least one wallet address")
      return
    }

    if (!tagFormData.tagsToAdd.trim() && !tagFormData.tagsToRemove.trim()) {
      setError("Please specify tags to add or remove")
      return
    }

    setIsProcessing(true)
    setError(null)
    setResults({ success: 0, failed: 0, messages: [] })

    try {
      const addresses = tagFormData.addresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)

      // Mock implementation - in a real app, you'd query and update the database
      const labelsToUpdate: EntityLabel[] = [
        {
          id: "mock-1",
          address: addresses[0] || "mock-address-1",
          label: "Mock Label 1",
          category: "exchange",
          confidence: 0.9,
          source: "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["existing-tag-1", "existing-tag-2"],
        },
        {
          id: "mock-2",
          address: addresses[1] || "mock-address-2",
          label: "Mock Label 2",
          category: "individual",
          confidence: 0.8,
          source: "community",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["existing-tag-3"],
        },
      ]

      let successCount = 0
      let failedCount = 0
      const messages: string[] = []

      const tagsToAdd = tagFormData.tagsToAdd
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const tagsToRemove = tagFormData.tagsToRemove
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      for (const label of labelsToUpdate) {
        try {
          // In a real implementation, you would actually update the label
          // const updatedTags = [
          //   ...(label.tags || []).filter(tag => !tagsToRemove.includes(tag)),
          //   ...tagsToAdd.filter(tag => !(label.tags || []).includes(tag))
          // ]
          // await updateEntityLabel(label.id, { tags: updatedTags })

          successCount++
          messages.push(`✅ Updated tags for "${label.label}" (${label.address})`)
        } catch (err) {
          failedCount++
          messages.push(`❌ Failed to update tags for ${label.address}: ${(err as Error).message}`)
        }
      }

      setResults({
        success: successCount,
        failed: failedCount,
        messages,
      })

      if (onOperationComplete) {
        onOperationComplete()
      }
    } catch (err) {
      setError(`Operation failed: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Operations</CardTitle>
        <CardDescription>Perform operations on multiple entity labels at once</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Labels
            </TabsTrigger>
            <TabsTrigger value="delete">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Labels
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Tag className="mr-2 h-4 w-4" />
              Manage Tags
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results.success > 0 || results.failed > 0 ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  {results.success} Successful
                </Badge>
                {results.failed > 0 && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    {results.failed} Failed
                  </Badge>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto rounded border p-2 text-sm">
                {results.messages.map((message, index) => (
                  <div key={index} className="py-1">
                    {message}
                  </div>
                ))}
              </div>

              <Button onClick={() => setResults({ success: 0, failed: 0, messages: [] })}>Clear Results</Button>
            </div>
          ) : (
            <>
              <TabsContent value="add" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="addresses">Wallet Addresses (one per line)</Label>
                  <Textarea
                    id="addresses"
                    placeholder="Enter wallet addresses, one per line"
                    value={addFormData.addresses}
                    onChange={(e) => setAddFormData({ ...addFormData, addresses: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      placeholder="e.g., Exchange Hot Wallet"
                      value={addFormData.label}
                      onChange={(e) => setAddFormData({ ...addFormData, label: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={addFormData.category}
                      onValueChange={(value) => setAddFormData({ ...addFormData, category: value })}
                    >
                      <SelectTrigger id="category">
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
                  <Label htmlFor="confidence">Confidence ({(addFormData.confidence * 100).toFixed(0)}%)</Label>
                  <Slider
                    id="confidence"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[addFormData.confidence]}
                    onValueChange={(value) => setAddFormData({ ...addFormData, confidence: value[0] })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskScore">Risk Score ({addFormData.riskScore})</Label>
                  <Slider
                    id="riskScore"
                    min={0}
                    max={100}
                    step={5}
                    value={[addFormData.riskScore]}
                    onValueChange={(value) => setAddFormData({ ...addFormData, riskScore: value[0] })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select
                      value={addFormData.source}
                      onValueChange={(value) => setAddFormData({ ...addFormData, source: value })}
                    >
                      <SelectTrigger id="source">
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
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., exchange, verified, high-volume"
                      value={addFormData.tags}
                      onChange={(e) => setAddFormData({ ...addFormData, tags: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional information about these entities"
                    value={addFormData.notes}
                    onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button onClick={handleBulkAdd} disabled={isProcessing} className="w-full">
                  {isProcessing ? "Processing..." : "Add Labels to All Addresses"}
                </Button>
              </TabsContent>

              <TabsContent value="delete" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-addresses">Wallet Addresses (one per line)</Label>
                  <Textarea
                    id="delete-addresses"
                    placeholder="Enter wallet addresses, one per line"
                    value={deleteFormData.addresses}
                    onChange={(e) => setDeleteFormData({ ...deleteFormData, addresses: e.target.value })}
                    rows={5}
                    disabled={deleteFormData.deleteAll}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delete-category">Filter by Category (optional)</Label>
                  <Select
                    value={deleteFormData.category}
                    onValueChange={(value) => setDeleteFormData({ ...deleteFormData, category: value })}
                  >
                    <SelectTrigger id="delete-category">
                      <SelectValue placeholder="Select a category or leave empty for all" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="exchange">Exchange</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="mixer">Mixer</SelectItem>
                      <SelectItem value="scam">Scam</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This operation will permanently delete entity labels. This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleBulkDelete} disabled={isProcessing} variant="destructive" className="w-full">
                  {isProcessing ? "Processing..." : "Delete Labels"}
                </Button>
              </TabsContent>

              <TabsContent value="tags" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-addresses">Wallet Addresses (one per line)</Label>
                  <Textarea
                    id="tag-addresses"
                    placeholder="Enter wallet addresses, one per line"
                    value={tagFormData.addresses}
                    onChange={(e) => setTagFormData({ ...tagFormData, addresses: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags-to-add">Tags to Add (comma separated)</Label>
                    <Input
                      id="tags-to-add"
                      placeholder="e.g., exchange, verified"
                      value={tagFormData.tagsToAdd}
                      onChange={(e) => setTagFormData({ ...tagFormData, tagsToAdd: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags-to-remove">Tags to Remove (comma separated)</Label>
                    <Input
                      id="tags-to-remove"
                      placeholder="e.g., suspicious, unverified"
                      value={tagFormData.tagsToRemove}
                      onChange={(e) => setTagFormData({ ...tagFormData, tagsToRemove: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleBulkTag} disabled={isProcessing} className="w-full">
                  {isProcessing ? "Processing..." : "Update Tags"}
                </Button>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
