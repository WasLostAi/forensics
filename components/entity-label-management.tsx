"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, Link, Network } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchEntityLabelsFromDB,
  saveEntityLabel,
  updateEntityLabel,
  deleteEntityLabel,
  createEntityConnection,
  getEntityConnections,
  deleteEntityConnection,
  getEntityClusters,
  addEntityToCluster,
  removeEntityFromCluster,
} from "@/lib/entity-service"
import { searchEntities } from "@/lib/entity-database"
import type { EntityLabel, EntityConnection, EntityCluster } from "@/types/entity"

interface EntityLabelManagementProps {
  walletAddress?: string
  onLabelsChange?: () => void
  searchQuery?: string
  categoryFilter?: string
}

export function EntityLabelManagement({
  walletAddress,
  onLabelsChange,
  searchQuery = "",
  categoryFilter,
}: EntityLabelManagementProps) {
  const [labels, setLabels] = useState<EntityLabel[]>([])
  const [filteredLabels, setFilteredLabels] = useState<EntityLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EntityLabel | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })

  // Connection state
  const [connections, setConnections] = useState<EntityConnection[]>([])
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false)
  const [connectionFormData, setConnectionFormData] = useState({
    sourceEntityId: "",
    targetEntityId: "",
    relationshipType: "related",
    strength: 0.5,
    evidence: "",
  })

  // Cluster state
  const [clusters, setClusters] = useState<EntityCluster[]>([])
  const [isClusterDialogOpen, setIsClusterDialogOpen] = useState(false)
  const [selectedClusterId, setSelectedClusterId] = useState<string>("")
  const [clusterSimilarityScore, setClusterSimilarityScore] = useState(0.7)

  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [currentLabel, setCurrentLabel] = useState<EntityLabel | null>(null)
  const [formData, setFormData] = useState({
    address: "",
    label: "",
    category: "exchange",
    confidence: 0.8,
    source: "user",
    notes: "",
    tags: "",
    riskScore: 0,
    verified: false,
  })

  // Load labels
  useEffect(() => {
    loadLabels()
    loadClusters()
  }, [walletAddress])

  // Filter and search labels
  useEffect(() => {
    if (!labels.length) return

    let result = [...labels]

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((label) => label.category === categoryFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (label) =>
          label.label.toLowerCase().includes(query) ||
          label.address.toLowerCase().includes(query) ||
          label.category.toLowerCase().includes(query) ||
          label.source.toLowerCase().includes(query) ||
          (label.notes && label.notes.toLowerCase().includes(query)) ||
          (label.tags && label.tags.some((tag) => tag.toLowerCase().includes(query))),
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredLabels(result)
  }, [labels, searchQuery, categoryFilter, sortConfig])

  // Search known entities when query changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 2) {
      const results = searchEntities(searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Load connections when a label is selected
  useEffect(() => {
    if (currentLabel) {
      loadConnections(currentLabel.id)
    }
  }, [currentLabel])

  async function loadLabels() {
    setIsLoading(true)
    setError(null)
    try {
      let data: EntityLabel[] = []

      if (walletAddress) {
        // Fetch labels for a specific wallet
        data = await fetchEntityLabelsFromDB(walletAddress)
      } else {
        // Fetch all labels
        data = await fetchEntityLabelsFromDB()
      }

      setLabels(data)
      setFilteredLabels(data)
    } catch (error) {
      console.error("Failed to load entity labels:", error)
      setError("Failed to load entity labels. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadConnections(entityId: string) {
    try {
      const data = await getEntityConnections(entityId)
      setConnections(data)
    } catch (error) {
      console.error("Failed to load entity connections:", error)
      setError("Failed to load entity connections. Please try again.")
    }
  }

  async function loadClusters() {
    try {
      const data = await getEntityClusters()
      setClusters(data)
    } catch (error) {
      console.error("Failed to load entity clusters:", error)
      setError("Failed to load entity clusters. Please try again.")
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
        riskScore: formData.riskScore,
        verified: formData.verified,
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
        riskScore: formData.riskScore,
        verified: formData.verified,
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

  const handleBulkDelete = async () => {
    try {
      // In a real implementation, you might want to use a batch delete operation
      for (const id of selectedLabels) {
        await deleteEntityLabel(id)
      }

      setLabels(labels.filter((label) => !selectedLabels.includes(label.id)))
      setSelectedLabels([])
      setIsBulkDeleteDialogOpen(false)
      if (onLabelsChange) onLabelsChange()
    } catch (error) {
      console.error("Failed to delete labels:", error)
      setError("Failed to delete labels. Please try again.")
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
      setSearchResults([])
      if (onLabelsChange) onLabelsChange()
    } catch (error) {
      console.error("Failed to add known entity:", error)
      setError("Failed to add known entity. Please try again.")
    }
  }

  const handleAddConnection = async () => {
    if (!currentLabel) return

    try {
      setError(null)

      if (!connectionFormData.targetEntityId) {
        setError("Target entity is required")
        return
      }

      const newConnection = await createEntityConnection({
        sourceEntityId: currentLabel.id,
        targetEntityId: connectionFormData.targetEntityId,
        relationshipType: connectionFormData.relationshipType,
        strength: connectionFormData.strength,
        evidence: connectionFormData.evidence,
        createdBy: "user", // In a real app, this would be the current user's ID
      })

      setConnections([...connections, newConnection])
      setConnectionFormData({
        sourceEntityId: "",
        targetEntityId: "",
        relationshipType: "related",
        strength: 0.5,
        evidence: "",
      })
      setIsConnectionDialogOpen(false)
    } catch (error) {
      console.error("Failed to add connection:", error)
      setError("Failed to add connection. Please try again.")
    }
  }

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      await deleteEntityConnection(connectionId)
      setConnections(connections.filter((conn) => conn.id !== connectionId))
    } catch (error) {
      console.error("Failed to delete connection:", error)
      setError("Failed to delete connection. Please try again.")
    }
  }

  const handleAddToCluster = async () => {
    if (!currentLabel || !selectedClusterId) return

    try {
      await addEntityToCluster(currentLabel.id, selectedClusterId, clusterSimilarityScore)

      // Update the current label with the new cluster ID
      const updatedLabel = {
        ...currentLabel,
        clusterIds: [...(currentLabel.clusterIds || []), selectedClusterId],
      }

      setLabels(labels.map((label) => (label.id === currentLabel.id ? updatedLabel : label)))
      setCurrentLabel(updatedLabel)
      setIsClusterDialogOpen(false)
      setSelectedClusterId("")
      setClusterSimilarityScore(0.7)
    } catch (error) {
      console.error("Failed to add entity to cluster:", error)
      setError("Failed to add entity to cluster. Please try again.")
    }
  }

  const handleRemoveFromCluster = async (clusterId: string) => {
    if (!currentLabel) return

    try {
      await removeEntityFromCluster(currentLabel.id, clusterId)

      // Update the current label by removing the cluster ID
      const updatedLabel = {
        ...currentLabel,
        clusterIds: (currentLabel.clusterIds || []).filter((id) => id !== clusterId),
      }

      setLabels(labels.map((label) => (label.id === currentLabel.id ? updatedLabel : label)))
      setCurrentLabel(updatedLabel)
    } catch (error) {
      console.error("Failed to remove entity from cluster:", error)
      setError("Failed to remove entity from cluster. Please try again.")
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
      riskScore: label.riskScore || 0,
      verified: label.verified || false,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (label: EntityLabel) => {
    setCurrentLabel(label)
    setIsDeleteDialogOpen(true)
  }

  const openConnectionDialog = (label: EntityLabel) => {
    setCurrentLabel(label)
    setConnectionFormData({
      sourceEntityId: label.id,
      targetEntityId: "",
      relationshipType: "related",
      strength: 0.5,
      evidence: "",
    })
    setIsConnectionDialogOpen(true)
  }

  const openClusterDialog = (label: EntityLabel) => {
    setCurrentLabel(label)
    setIsClusterDialogOpen(true)
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
      riskScore: 0,
      verified: false,
    })
    setError(null)
  }

  const handleSort = (key: keyof EntityLabel) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  const toggleSelectAll = () => {
    if (selectedLabels.length === filteredLabels.length) {
      setSelectedLabels([])
    } else {
      setSelectedLabels(filteredLabels.map((label) => label.id))
    }
  }

  const toggleSelectLabel = (id: string) => {
    if (selectedLabels.includes(id)) {
      setSelectedLabels(selectedLabels.filter((labelId) => labelId !== id))
    } else {
      setSelectedLabels([...selectedLabels, id])
    }
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

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
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

  const getRelationshipTypeLabel = (type: string) => {
    switch (type) {
      case "controls":
        return "Controls"
      case "owned_by":
        return "Owned By"
      case "related":
        return "Related"
      case "interacts_with":
        return "Interacts With"
      case "funds":
        return "Funds"
      case "receives_from":
        return "Receives From"
      default:
        return type
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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Entity Labels</h2>
          <Badge variant="outline">{filteredLabels.length}</Badge>
        </div>
        <div className="flex gap-2">
          {selectedLabels.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedLabels.length})
            </Button>
          )}
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
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20 backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedLabels.length === filteredLabels.length && filteredLabels.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("label")}>
                  Label {sortConfig.key === "label" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                  Category {sortConfig.key === "category" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("confidence")}>
                  Confidence {sortConfig.key === "confidence" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Source</TableHead>
                {!walletAddress && <TableHead>Address</TableHead>}
                <TableHead className="cursor-pointer" onClick={() => handleSort("riskScore")}>
                  Risk {sortConfig.key === "riskScore" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Clusters</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  Date Added {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={walletAddress ? 9 : 10} className="h-24 text-center">
                    Loading entity labels...
                  </TableCell>
                </TableRow>
              ) : filteredLabels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={walletAddress ? 9 : 10} className="h-24 text-center">
                    No entity labels found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLabels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLabels.includes(label.id)}
                        onCheckedChange={() => toggleSelectLabel(label.id)}
                        aria-label={`Select ${label.label}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                      {label.label}
                      {label.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" title="Verified" />}
                    </TableCell>
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
                    <TableCell>
                      {label.riskScore !== undefined && (
                        <Badge className={`${getRiskColor(label.riskScore)} text-white`}>{label.riskScore}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {label.clusterIds && label.clusterIds.length > 0 ? (
                        <Badge variant="outline" className="bg-background/50">
                          {label.clusterIds.length}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(label.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(label)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openConnectionDialog(label)}>
                          <Link className="h-4 w-4" />
                          <span className="sr-only">Connections</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openClusterDialog(label)}>
                          <Network className="h-4 w-4" />
                          <span className="sr-only">Clusters</span>
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
              <Label htmlFor="riskScore" className="text-right">
                Risk Score
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <Slider
                  id="riskScore"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.riskScore]}
                  onValueChange={(value) => setFormData({ ...formData, riskScore: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{formData.riskScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="verified" className="text-right">
                Verified
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, verified: checked === true })}
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as verified entity
                </label>
              </div>
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

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional information about this entity"
                rows={3}
              />
            </div>
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
              <Label htmlFor="edit-riskScore" className="text-right">
                Risk Score
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <Slider
                  id="edit-riskScore"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.riskScore]}
                  onValueChange={(value) => setFormData({ ...formData, riskScore: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{formData.riskScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-verified" className="text-right">
                Verified
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, verified: checked === true })}
                />
                <label
                  htmlFor="edit-verified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as verified entity
                </label>
              </div>
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

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional information about this entity"
                rows={3}
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedLabels.length} selected labels? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete {selectedLabels.length} Labels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connection Dialog */}
      <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Add Entity Connection</DialogTitle>
            <DialogDescription>
              Create a connection between this entity and another entity to establish relationships.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source-entity" className="text-right">
                Source Entity
              </Label>
              <div className="col-span-3">
                <p className="text-sm font-medium">{currentLabel?.label}</p>
                <p className="text-xs text-muted-foreground">{currentLabel?.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-entity" className="text-right">
                Target Entity
              </Label>
              <Select
                value={connectionFormData.targetEntityId}
                onValueChange={(value) => setConnectionFormData({ ...connectionFormData, targetEntityId: value })}
              >
                <SelectTrigger className="col-span-3" id="target-entity">
                  <SelectValue placeholder="Select a target entity" />
                </SelectTrigger>
                <SelectContent>
                  {labels
                    .filter((label) => label.id !== currentLabel?.id)
                    .map((label) => (
                      <SelectItem key={label.id} value={label.id}>
                        {label.label} ({label.address.slice(0, 4)}...{label.address.slice(-4)})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="relationship-type" className="text-right">
                Relationship
              </Label>
              <Select
                value={connectionFormData.relationshipType}
                onValueChange={(value) => setConnectionFormData({ ...connectionFormData, relationshipType: value })}
              >
                <SelectTrigger className="col-span-3" id="relationship-type">
                  <SelectValue placeholder="Select a relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="controls">Controls</SelectItem>
                  <SelectItem value="owned_by">Owned By</SelectItem>
                  <SelectItem value="related">Related</SelectItem>
                  <SelectItem value="interacts_with">Interacts With</SelectItem>
                  <SelectItem value="funds">Funds</SelectItem>
                  <SelectItem value="receives_from">Receives From</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connection-strength" className="text-right">
                Strength
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <Slider
                  id="connection-strength"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[connectionFormData.strength]}
                  onValueChange={(value) => setConnectionFormData({ ...connectionFormData, strength: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{(connectionFormData.strength * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="connection-evidence" className="text-right pt-2">
                Evidence
              </Label>
              <Textarea
                id="connection-evidence"
                value={connectionFormData.evidence}
                onChange={(e) => setConnectionFormData({ ...connectionFormData, evidence: e.target.value })}
                className="col-span-3"
                placeholder="Evidence supporting this connection (e.g., transaction hashes, patterns)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddConnection}>Create Connection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cluster Dialog */}
      <Dialog open={isClusterDialogOpen} onOpenChange={setIsClusterDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Entity Clusters</DialogTitle>
            <DialogDescription>
              Manage cluster memberships for this entity. Clusters group similar entities based on behavior patterns.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="add" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add to Cluster</TabsTrigger>
              <TabsTrigger value="current">Current Clusters</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cluster-id" className="text-right">
                    Cluster
                  </Label>
                  <Select value={selectedClusterId} onValueChange={setSelectedClusterId}>
                    <SelectTrigger className="col-span-3" id="cluster-id">
                      <SelectValue placeholder="Select a cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      {clusters.map((cluster) => (
                        <SelectItem key={cluster.id} value={cluster.id}>
                          {cluster.name} ({cluster.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="similarity-score" className="text-right">
                    Similarity
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <Slider
                      id="similarity-score"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[clusterSimilarityScore]}
                      onValueChange={(value) => setClusterSimilarityScore(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{(clusterSimilarityScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsClusterDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddToCluster} disabled={!selectedClusterId}>
                  Add to Cluster
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="current" className="space-y-4 py-4">
              {currentLabel?.clusterIds && currentLabel.clusterIds.length > 0 ? (
                <div className="space-y-4">
                  {currentLabel.clusterIds.map((clusterId) => {
                    const cluster = clusters.find((c) => c.id === clusterId)
                    return cluster ? (
                      <div key={clusterId} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{cluster.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getCategoryColor(cluster.category)} text-white`}>
                              {cluster.category}
                            </Badge>
                            <Badge variant="outline">{cluster.memberCount} members</Badge>
                            {cluster.riskScore !== undefined && (
                              <Badge className={`${getRiskColor(cluster.riskScore)} text-white`}>
                                Risk: {cluster.riskScore}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveFromCluster(clusterId)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : null
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  This entity is not a member of any clusters.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Entity Connections Section */}
      {currentLabel && connections.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Entity Connections for {currentLabel.label}</CardTitle>
            <CardDescription>Connections between this entity and other entities in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Connected Entity</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => {
                  const isSource = connection.sourceEntityId === currentLabel.id
                  const connectedEntityId = isSource ? connection.targetEntityId : connection.sourceEntityId
                  const connectedEntity = labels.find((label) => label.id === connectedEntityId)

                  return (
                    <TableRow key={connection.id}>
                      <TableCell>
                        {isSource
                          ? getRelationshipTypeLabel(connection.relationshipType)
                          : getRelationshipTypeLabel(
                              connection.relationshipType === "controls"
                                ? "owned_by"
                                : connection.relationshipType === "owned_by"
                                  ? "controls"
                                  : connection.relationshipType === "funds"
                                    ? "receives_from"
                                    : connection.relationshipType === "receives_from"
                                      ? "funds"
                                      : connection.relationshipType,
                            )}
                      </TableCell>
                      <TableCell>
                        {connectedEntity ? (
                          <div>
                            <p className="font-medium">{connectedEntity.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {connectedEntity.address.slice(0, 4)}...{connectedEntity.address.slice(-4)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown entity</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${connection.strength * 100}%` }} />
                        </div>
                        <span className="text-xs">{(connection.strength * 100).toFixed(0)}%</span>
                      </TableCell>
                      <TableCell>
                        {connection.evidence ? (
                          <span className="text-sm">
                            {connection.evidence.slice(0, 50)}
                            {connection.evidence.length > 50 ? "..." : ""}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">No evidence provided</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(connection.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteConnection(connection.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
