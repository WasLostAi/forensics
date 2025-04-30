"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, Tag, Download, AlertCircle } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EntityLabelForm } from "@/components/entity-label-form"
import { EntityLabelStatistics } from "@/components/entity-label-statistics"
import { EntityBulkOperations } from "@/components/entity-bulk-operations"
import { EntityImportExport } from "@/components/entity-import-export"
import {
  fetchEntityLabelsFromDB,
  saveEntityLabel,
  updateEntityLabel,
  deleteEntityLabel,
  searchEntityLabels,
} from "@/lib/entity-service"
import { isMockData } from "@/lib/supabase"
import type { EntityLabel } from "@/types/entity"
import Link from "next/link"

export function EntityLabelManagement() {
  const [labels, setLabels] = useState<EntityLabel[]>([])
  const [filteredLabels, setFilteredLabels] = useState<EntityLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EntityLabel | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })

  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [isImportExportDialogOpen, setIsImportExportDialogOpen] = useState(false)
  const [currentLabel, setCurrentLabel] = useState<EntityLabel | null>(null)

  // Load labels
  useEffect(() => {
    loadLabels()
  }, [])

  // Filter and search labels
  useEffect(() => {
    if (!labels.length) return

    let result = [...labels]

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((label) => label.category === categoryFilter)
    }

    // Apply source filter
    if (sourceFilter) {
      result = result.filter((label) => label.source === sourceFilter)
    }

    // Apply verified filter
    if (verifiedFilter !== null) {
      result = result.filter((label) => label.verified === verifiedFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (label) =>
          label.label.toLowerCase().includes(query) ||
          label.address.toLowerCase().includes(query) ||
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
  }, [labels, searchQuery, categoryFilter, sourceFilter, verifiedFilter, sortConfig])

  async function loadLabels() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchEntityLabelsFromDB()
      setLabels(data)
      setFilteredLabels(data)
    } catch (error: any) {
      console.error("Failed to load entity labels:", error)
      setError(`Failed to load entity labels: ${error.message || "Unknown error"}`)
      // Set empty labels to avoid UI issues
      setLabels([])
      setFilteredLabels([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLabel = async (label: Omit<EntityLabel, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null)
      const newLabel = await saveEntityLabel(label)
      setLabels([...labels, newLabel])
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("Failed to add label:", error)
      setError(`Failed to add label: ${error.message || "Unknown error"}`)
    }
  }

  const handleEditLabel = async (id: string, updates: Partial<EntityLabel>) => {
    try {
      setError(null)
      const updatedLabel = await updateEntityLabel(id, updates)
      setLabels(labels.map((label) => (label.id === id ? updatedLabel : label)))
      setIsEditDialogOpen(false)
      setCurrentLabel(null)
    } catch (error: any) {
      console.error("Failed to update label:", error)
      setError(`Failed to update label: ${error.message || "Unknown error"}`)
    }
  }

  const handleDeleteLabel = async () => {
    if (!currentLabel) return

    try {
      await deleteEntityLabel(currentLabel.id)
      setLabels(labels.filter((label) => label.id !== currentLabel.id))
      setIsDeleteDialogOpen(false)
      setCurrentLabel(null)
    } catch (error: any) {
      console.error("Failed to delete label:", error)
      setError(`Failed to delete label: ${error.message || "Unknown error"}`)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadLabels()
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const results = await searchEntityLabels(searchQuery)
      setLabels(results)
      setFilteredLabels(results)
    } catch (error: any) {
      console.error("Failed to search entity labels:", error)
      setError(`Failed to search entity labels: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (label: EntityLabel) => {
    setCurrentLabel(label)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (label: EntityLabel) => {
    setCurrentLabel(label)
    setIsDeleteDialogOpen(true)
  }

  const handleSort = (key: keyof EntityLabel) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case "user":
        return "bg-blue-500"
      case "community":
        return "bg-green-500"
      case "algorithm":
        return "bg-purple-500"
      case "database":
        return "bg-yellow-500"
      case "system":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskColor = (score?: number) => {
    if (!score) return "bg-gray-500"
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      {isMockData && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Mock Data Mode</AlertTitle>
          <AlertDescription className="text-yellow-700">
            The application is currently using mock data because the Supabase connection is not available or properly
            configured.
          </AlertDescription>
        </Alert>
      )}

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
          <Button variant="outline" onClick={() => setIsStatsDialogOpen(true)}>
            <Tag className="mr-2 h-4 w-4" />
            Statistics
          </Button>
          <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Bulk Add
          </Button>
          <Button variant="outline" onClick={() => setIsImportExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Import/Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Label
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full"
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
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
          <Select value={sourceFilter || ""} onValueChange={(value) => setSourceFilter(value || null)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="algorithm">Algorithm</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 bg-background border rounded-md px-3">
            <Label htmlFor="verified-filter" className="text-sm">
              Verified
            </Label>
            <Select
              value={verifiedFilter === null ? "" : verifiedFilter ? "true" : "false"}
              onValueChange={(value) => setVerifiedFilter(value === "" ? null : value === "true")}
            >
              <SelectTrigger className="w-20 border-0 p-0 h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20 backdrop-blur-sm">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("label")}>
                  Label {sortConfig.key === "label" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("address")}>
                  Address {sortConfig.key === "address" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                  Category {sortConfig.key === "category" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("source")}>
                  Source {sortConfig.key === "source" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("confidence")}>
                  Confidence {sortConfig.key === "confidence" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("verified")}>
                  Verified {sortConfig.key === "verified" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("riskScore")}>
                  Risk {sortConfig.key === "riskScore" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Loading entity labels...
                  </TableCell>
                </TableRow>
              ) : filteredLabels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No entity labels found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLabels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell className="font-medium">{label.label}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/wallet/${label.address}`} className="hover:underline">
                        {label.address.slice(0, 4)}...{label.address.slice(-4)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getCategoryColor(label.category)} text-white`}>{label.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getSourceColor(label.source)} text-white`}>{label.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${label.confidence * 100}%` }} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={label.verified ? "default" : "outline"}>{label.verified ? "Yes" : "No"}</Badge>
                    </TableCell>
                    <TableCell>
                      {label.riskScore !== undefined && (
                        <Badge className={`${getRiskColor(label.riskScore)} text-white`}>{label.riskScore}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {label.tags && label.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {label.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-background/50">
                              {tag}
                            </Badge>
                          ))}
                          {label.tags.length > 2 && (
                            <Badge variant="outline" className="bg-background/50">
                              +{label.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
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
            <DialogDescription>Create a new label for a wallet or contract address.</DialogDescription>
          </DialogHeader>

          <EntityLabelForm onSubmit={handleAddLabel} />
        </DialogContent>
      </Dialog>

      {/* Edit Label Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Edit Entity Label</DialogTitle>
            <DialogDescription>Update the information for this entity label.</DialogDescription>
          </DialogHeader>

          {currentLabel && (
            <EntityLabelForm
              initialData={currentLabel}
              onSubmit={(data) => handleEditLabel(currentLabel.id, data)}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the label "{currentLabel?.label}" for address{" "}
              {currentLabel?.address.slice(0, 4)}...{currentLabel?.address.slice(-4)}? This action cannot be undone.
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

      {/* Statistics Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Entity Label Statistics</DialogTitle>
            <DialogDescription>Overview of your entity label database.</DialogDescription>
          </DialogHeader>

          <EntityLabelStatistics />

          <DialogFooter>
            <Button onClick={() => setIsStatsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Operations Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Bulk Entity Label Operations</DialogTitle>
            <DialogDescription>Add or update multiple entity labels at once.</DialogDescription>
          </DialogHeader>

          <EntityBulkOperations
            onComplete={() => {
              setIsBulkDialogOpen(false)
              loadLabels()
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import/Export Dialog */}
      <Dialog open={isImportExportDialogOpen} onOpenChange={setIsImportExportDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Import/Export Entity Labels</DialogTitle>
            <DialogDescription>Import or export entity labels in various formats.</DialogDescription>
          </DialogHeader>

          <EntityImportExport
            onComplete={() => {
              setIsImportExportDialogOpen(false)
              loadLabels()
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportExportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
