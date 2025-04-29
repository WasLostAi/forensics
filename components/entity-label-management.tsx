"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchEntityLabelsFromDB, saveEntityLabel, updateEntityLabel, deleteEntityLabel } from "@/lib/entity-service"
import { searchEntities } from "@/lib/entity-database"
import type { EntityLabel } from "@/types/entity"

interface EntityLabelManagementProps {
  walletAddress?: string
  onLabelsChange?: () => void
}

export function EntityLabelManagement({ walletAddress, onLabelsChange }: EntityLabelManagementProps) {
  const [labels, setLabels] = useState<EntityLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentLabel, setCurrentLabel] = useState<EntityLabel | null>(null)
  const [formData, setFormData] = useState({
    address: "",
    label: "",
    category: "exchange",
    confidence: 0.8,
    source: "user",
    notes: "",
    tags: "",
  })

  // Load labels
  useEffect(() => {
    loadLabels()
  }, [walletAddress])

  // Search known entities when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const results = searchEntities(searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  async function loadLabels() {
    setIsLoading(true)
    setError(null)
    try {
      let data: EntityLabel[] = []

      if (walletAddress) {
        // Fetch labels for a specific wallet
        data = await fetchEntityLabelsFromDB(walletAddress)
      } else {
        // Fetch all labels (this would need to be implemented in entity-service.ts)
        // For now, we'll use mock data
        data = [
          {
            id: "1",
            address: "DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z",
            label: "Binance Hot Wallet",
            category: "exchange",
            confidence: 0.95,
            source: "community",
            createdAt: "2023-05-15T14:23:45Z",
            updatedAt: "2023-05-15T14:23:45Z",
          },
          {
            id: "2",
            address: "5xoBq7f7CDgZwqHrDBdRWM84ExRetg4gZq93dyJtoSwp",
            label: "High Volume Trader",
            category: "individual",
            confidence: 0.75,
            source: "algorithm",
            createdAt: "2023-06-22T09:12:33Z",
            updatedAt: "2023-06-22T09:12:33Z",
          },
          {
            id: "3",
            address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
            label: "Suspicious Mixer",
            category: "mixer",
            confidence: 0.88,
            source: "user",
            createdAt: "2023-07-10T16:45:12Z",
            updatedAt: "2023-07-10T16:45:12Z",
          },
        ]
      }

      setLabels(data)
    } catch (error) {
      console.error("Failed to load entity labels:", error)
      setError("Failed to load entity labels. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLabel = async () => {
    try {
      setError(null)
      const address = walletAddress || formData.address

      if (!address) {
        setError("Wallet address is required")
        return
      }

      if (!formData.label.trim()) {
        setError("Label name is required")
        return
      }

      const newLabelObj = await saveEntityLabel({
        address,
        label: formData.label,
        category: formData.category as "exchange" | "individual" | "contract" | "scam" | "other",
        confidence: formData.confidence,
        source: formData.source as "user" | "community" | "algorithm",
        notes: formData.notes,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : undefined,
      })

      setLabels([...labels, newLabelObj])
      resetForm()
      setIsAddDialogOpen(false)
      if (onLabelsChange) onLabelsChange()
    } catch (error) {
      console.error("Failed to add label:", error)
      setError("Failed to add label. Please try again.")
    }
  }

  const handleEditLabel = async () => {
    if (!currentLabel) return

    try {
      setError(null)

      if (!formData.label.trim()) {
        setError("Label name is required")
        return
      }

      const updatedLabel = await updateEntityLabel(currentLabel.id, {
        label: formData.label,
        category: formData.category as "exchange" | "individual" | "contract" | "scam" | "other",
        confidence: formData.confidence,
        source: formData.source as "user" | "community" | "algorithm",
        notes: formData.notes,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : undefined,
      })

      setLabels(labels.map((label) => (label.id === currentLabel.id ? updatedLabel : label)))

      resetForm()
      setIsEditDialogOpen(false)
      setCurrentLabel(null)
      if (onLabelsChange) onLabelsChange()
    } catch (error) {
      console.error("Failed to update label:", error)
      setError("Failed to update label. Please try again.")
    }
  }

  const handleDeleteLabel = async () => {
    if (!currentLabel) return

    try {
      await deleteEntityLabel(currentLabel.id)
      setLabels(labels.filter((label) => label.id !== currentLabel.id))
      setIsDeleteDialogOpen(false)
      setCurrentLabel(null)
      if (onLabelsChange) onLabelsChange()
    } catch (error) {
      console.error("Failed to delete label:", error)
      setError("Failed to delete label. Please try again.")
    }
  }

  const handleAddKnownEntity = async (entity: any) => {
    try {
      const address = walletAddress || formData.address

      if (!address) {
        setError("Wallet address is required")
        return
      }

      const newLabelObj = await saveEntityLabel({
        address,
        label: entity.name,
        category: entity.category as any,
        confidence: 0.9,
        source: "database",
        notes: entity.description || "",
        tags: entity.tags || undefined,
      })

      setLabels([...labels, newLabelObj])
      setSearchQuery("")
      setSearchResults([])
      if (onLabelsChange) onLabelsChange()
    } catch (error) {
      console.error("Failed to add known entity:", error)
      setError("Failed to add known entity. Please try again.")
    }
  }

  const openEditDialog = (label: EntityLabel) => {
    setCurrentLabel(label)
    setFormData({
      address: label.address,
      label: label.label,
      category: label.category,
      confidence: label.confidence,
      source: label.source,
      notes: label.notes || "",
      tags: label.tags ? label.tags.join(", ") : "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (label: EntityLabel) => {
    setCurrentLabel(label)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      address: "",
      label: "",
      category: "exchange",
      confidence: 0.8,
      source: "user",
      notes: "",
      tags: "",
    })
    setSearchQuery("")
    setSearchResults([])
    setError(null)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "exchange":
        return "bg-blue-500"
      case "individual":
        return "bg-green-500"
      case "contract":
        return "bg-purple-500"
      case "mixer":
        return "bg-yellow-500"
      case "scam":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "user":
        return (
          <Badge variant="outline" className="bg-background/50">
            User
          </Badge>
        )
      case "community":
        return (
          <Badge variant="outline" className="bg-background/50">
            Community
          </Badge>
        )
      case "algorithm":
        return (
          <Badge variant="outline" className="bg-background/50">
            Algorithm
          </Badge>
        )
      case "database":
        return (
          <Badge variant="outline" className="bg-background/50">
            Database
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Entity Labels</h2>
        <Button
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Label
        </Button>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20 backdrop-blur-sm">
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Source</TableHead>
                {!walletAddress && <TableHead>Address</TableHead>}
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={walletAddress ? 6 : 7} className="h-24 text-center">
                    Loading entity labels...
                  </TableCell>
                </TableRow>
              ) : labels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={walletAddress ? 6 : 7} className="h-24 text-center">
                    No entity labels found.
                  </TableCell>
                </TableRow>
              ) : (
                labels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell className="font-medium">{label.label}</TableCell>
                    <TableCell>
                      <Badge className={`${getCategoryColor(label.category)} text-white`}>{label.category}</Badge>
                    </TableCell>
                    <TableCell>{(label.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>{getSourceIcon(label.source)}</TableCell>
                    {!walletAddress && (
                      <TableCell className="font-mono text-xs">
                        {label.address.slice(0, 4)}...{label.address.slice(-4)}
                      </TableCell>
                    )}
                    <TableCell>{new Date(label.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(label)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(label)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Label Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Add Entity Label</DialogTitle>
            <DialogDescription>
              Add a new label for a wallet address. Labels help identify and categorize entities on the blockchain.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!walletAddress && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="col-span-3"
                  placeholder="Solana wallet address"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Binance Hot Wallet"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="col-span-3">
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confidence" className="text-right">
                Confidence
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <Slider
                  id="confidence"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[formData.confidence]}
                  onValueChange={(value) => setFormData({ ...formData, confidence: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{(formData.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Source
              </Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="algorithm">Algorithm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="col-span-3"
                placeholder="e.g., high-volume, exchange, verified (comma separated)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional information about this entity"
              />
            </div>

            {/* Search Known Entities */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search" className="text-right">
                Search Known
              </Label>
              <div className="col-span-3 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search known entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="col-span-4 border rounded-md mt-2 max-h-40 overflow-y-auto">
                <Table>
                  <TableBody>
                    {searchResults.map((entity) => (
                      <TableRow
                        key={entity.address}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            label: entity.name,
                            category: entity.category,
                            source: "database",
                            notes: entity.description || "",
                            tags: entity.tags ? entity.tags.join(", ") : "",
                          })
                          setSearchQuery("")
                          setSearchResults([])
                        }}
                      >
                        <TableCell className="py-2">
                          <div className="font-medium">{entity.name}</div>
                          <div className="text-xs text-muted-foreground">{entity.description}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={`${getCategoryColor(entity.category)} text-white`}>{entity.category}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLabel}>Add Label</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Label Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Edit Entity Label</DialogTitle>
            <DialogDescription>Update the information for this entity label.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-label" className="text-right">
                Label
              </Label>
              <Input
                id="edit-label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="col-span-3" id="edit-category">
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-confidence" className="text-right">
                Confidence
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <Slider
                  id="edit-confidence"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[formData.confidence]}
                  onValueChange={(value) => setFormData({ ...formData, confidence: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{(formData.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-source" className="text-right">
                Source
              </Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger className="col-span-3" id="edit-source">
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tags" className="text-right">
                Tags
              </Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="col-span-3"
                placeholder="e.g., high-volume, exchange, verified (comma separated)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional information about this entity"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLabel}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the label "{currentLabel?.label}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLabel}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
