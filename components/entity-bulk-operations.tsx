"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, ArrowRight, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export function EntityBulkOperations() {
  const [activeTab, setActiveTab] = useState("label")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  // Bulk labeling state
  const [addresses, setAddresses] = useState("")
  const [labelData, setLabelData] = useState({
    label: "",
    category: "exchange",
    confidence: 0.8,
    source: "user",
    tags: "",
    riskScore: 50,
    verified: false,
  })

  // Bulk categorization state
  const [categoryAddresses, setCategoryAddresses] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("exchange")

  // Bulk tagging state
  const [tagAddresses, setTagAddresses] = useState("")
  const [tagsToAdd, setTagsToAdd] = useState("")
  const [tagsToRemove, setTagsToRemove] = useState("")

  const handleBulkLabel = async () => {
    if (!addresses.trim()) {
      setError("Please enter at least one address")
      return
    }

    if (!labelData.label.trim()) {
      setError("Label name is required")
      return
    }

    setError(null)
    setSuccess(null)
    setIsProcessing(true)
    setProgress(0)

    try {
      const addressList = addresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)

      if (addressList.length === 0) {
        setError("No valid addresses found")
        setIsProcessing(false)
        return
      }

      // Simulate processing with progress
      for (let i = 0; i < addressList.length; i++) {
        // In a real implementation, this would be a batch operation
        await new Promise((resolve) => setTimeout(resolve, 200))
        setProgress(Math.round(((i + 1) / addressList.length) * 100))
      }

      setSuccess(`Successfully labeled ${addressList.length} entities`)
      toast({
        title: "Bulk labeling complete",
        description: `Successfully labeled ${addressList.length} entities.`,
      })
    } catch (error) {
      console.error("Failed to perform bulk labeling:", error)
      setError("Failed to perform bulk labeling. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkCategorize = async () => {
    if (!categoryAddresses.trim()) {
      setError("Please enter at least one address")
      return
    }

    setError(null)
    setSuccess(null)
    setIsProcessing(true)
    setProgress(0)

    try {
      const addressList = categoryAddresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)

      if (addressList.length === 0) {
        setError("No valid addresses found")
        setIsProcessing(false)
        return
      }

      // Simulate processing with progress
      for (let i = 0; i < addressList.length; i++) {
        // In a real implementation, this would be a batch operation
        await new Promise((resolve) => setTimeout(resolve, 200))
        setProgress(Math.round(((i + 1) / addressList.length) * 100))
      }

      setSuccess(`Successfully categorized ${addressList.length} entities as ${selectedCategory}`)
      toast({
        title: "Bulk categorization complete",
        description: `Successfully categorized ${addressList.length} entities.`,
      })
    } catch (error) {
      console.error("Failed to perform bulk categorization:", error)
      setError("Failed to perform bulk categorization. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkTag = async () => {
    if (!tagAddresses.trim()) {
      setError("Please enter at least one address")
      return
    }

    if (!tagsToAdd.trim() && !tagsToRemove.trim()) {
      setError("Please specify tags to add or remove")
      return
    }

    setError(null)
    setSuccess(null)
    setIsProcessing(true)
    setProgress(0)

    try {
      const addressList = tagAddresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)

      if (addressList.length === 0) {
        setError("No valid addresses found")
        setIsProcessing(false)
        return
      }

      // Simulate processing with progress
      for (let i = 0; i < addressList.length; i++) {
        // In a real implementation, this would be a batch operation
        await new Promise((resolve) => setTimeout(resolve, 200))
        setProgress(Math.round(((i + 1) / addressList.length) * 100))
      }

      const addCount = tagsToAdd.trim() ? tagsToAdd.split(",").length : 0
      const removeCount = tagsToRemove.trim() ? tagsToRemove.split(",").length : 0

      setSuccess(
        `Successfully processed ${addressList.length} entities (${addCount} tags added, ${removeCount} tags removed)`,
      )
      toast({
        title: "Bulk tagging complete",
        description: `Successfully processed ${addressList.length} entities.`,
      })
    } catch (error) {
      console.error("Failed to perform bulk tagging:", error)
      setError("Failed to perform bulk tagging. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="label">Bulk Labeling</TabsTrigger>
          <TabsTrigger value="categorize">Categorization</TabsTrigger>
          <TabsTrigger value="tag">Tagging</TabsTrigger>
        </TabsList>

        <TabsContent value="label" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Entity Labeling</CardTitle>
              <CardDescription>Apply the same label and properties to multiple entities at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="addresses">Wallet Addresses (one per line)</Label>
                    <Textarea
                      id="addresses"
                      value={addresses}
                      onChange={(e) => setAddresses(e.target.value)}
                      placeholder="Enter Solana wallet addresses, one per line"
                      rows={10}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-label">Label</Label>
                    <Input
                      id="bulk-label"
                      value={labelData.label}
                      onChange={(e) => setLabelData({ ...labelData, label: e.target.value })}
                      placeholder="e.g., Exchange Hot Wallet"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-category">Category</Label>
                    <Select
                      value={labelData.category}
                      onValueChange={(value) => setLabelData({ ...labelData, category: value })}
                      disabled={isProcessing}
                    >
                      <SelectTrigger id="bulk-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="mixer">Mixer</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="scam">Scam</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-confidence">Confidence ({(labelData.confidence * 100).toFixed(0)}%)</Label>
                    <Slider
                      id="bulk-confidence"
                      min={0}
                      max={1}
                      step={0.05}
                      value={[labelData.confidence]}
                      onValueChange={(value) => setLabelData({ ...labelData, confidence: value[0] })}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-source">Source</Label>
                    <Select
                      value={labelData.source}
                      onValueChange={(value) => setLabelData({ ...labelData, source: value })}
                      disabled={isProcessing}
                    >
                      <SelectTrigger id="bulk-source">
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="algorithm">Algorithm</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-tags">Tags (comma separated)</Label>
                    <Input
                      id="bulk-tags"
                      value={labelData.tags}
                      onChange={(e) => setLabelData({ ...labelData, tags: e.target.value })}
                      placeholder="e.g., exchange, high-volume, verified"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-risk">Risk Score ({labelData.riskScore})</Label>
                    <Slider
                      id="bulk-risk"
                      min={0}
                      max={100}
                      step={5}
                      value={[labelData.riskScore]}
                      onValueChange={(value) => setLabelData({ ...labelData, riskScore: value[0] })}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bulk-verified"
                      checked={labelData.verified}
                      onCheckedChange={(checked) => setLabelData({ ...labelData, verified: checked === true })}
                      disabled={isProcessing}
                    />
                    <label
                      htmlFor="bulk-verified"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mark as verified entities
                    </label>
                  </div>
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Processing</Label>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleBulkLabel} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Apply Labels
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Categorization</CardTitle>
              <CardDescription>Quickly categorize multiple entities with the same classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-addresses">Wallet Addresses (one per line)</Label>
                  <Textarea
                    id="category-addresses"
                    value={categoryAddresses}
                    onChange={(e) => setCategoryAddresses(e.target.value)}
                    placeholder="Enter Solana wallet addresses, one per line"
                    rows={10}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selected-category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isProcessing}>
                    <SelectTrigger id="selected-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exchange">Exchange</SelectItem>
                      <SelectItem value="mixer">Mixer</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="scam">Scam</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Processing</Label>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleBulkCategorize} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Apply Category
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tag" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Tagging</CardTitle>
              <CardDescription>Add or remove tags from multiple entities at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-addresses">Wallet Addresses (one per line)</Label>
                  <Textarea
                    id="tag-addresses"
                    value={tagAddresses}
                    onChange={(e) => setTagAddresses(e.target.value)}
                    placeholder="Enter Solana wallet addresses, one per line"
                    rows={10}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags-to-add">Tags to Add (comma separated)</Label>
                  <Input
                    id="tags-to-add"
                    value={tagsToAdd}
                    onChange={(e) => setTagsToAdd(e.target.value)}
                    placeholder="e.g., exchange, high-volume, verified"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags-to-remove">Tags to Remove (comma separated)</Label>
                  <Input
                    id="tags-to-remove"
                    value={tagsToRemove}
                    onChange={(e) => setTagsToRemove(e.target.value)}
                    placeholder="e.g., unverified, suspicious"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Processing</Label>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleBulkTag} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Apply Tags
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
