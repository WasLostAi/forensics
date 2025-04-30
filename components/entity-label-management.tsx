"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash, Plus, Search, ArrowUpDown, CheckCircle2 } from "lucide-react"
import type { EntityLabel } from "@/types/entity"
import { getErrorMessage } from "@/lib/utils"
import { EntityLabelBulkOperations } from "./entity-label-bulk-operations"
import { EntityLabelImportExport } from "./entity-label-import-export"
import { EntityLabelStatistics } from "./entity-label-statistics"

interface EntityLabelManagementProps {
  initialLabels?: EntityLabel[]
  onAddLabel?: (label: Omit<EntityLabel, "id">) => Promise<void>
  onUpdateLabel?: (id: string, label: Partial<EntityLabel>) => Promise<void>
  onDeleteLabel?: (id: string) => Promise<void>
  onDeleteBulk?: (ids: string[]) => Promise<void>
  onImportLabels?: (labels: EntityLabel[]) => Promise<void>
  onUpdateBulkCategory?: (ids: string[], category: string) => Promise<void>
  onUpdateBulkVerified?: (ids: string[], verified: boolean) => Promise<void>
  onUpdateBulkRiskScore?: (ids: string[], riskScore: number) => Promise<void>
  searchQuery?: string
  categoryFilter?: string
}

export function EntityLabelManagement({
  initialLabels = [],
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
  onDeleteBulk,
  onImportLabels,
  onUpdateBulkCategory,
  onUpdateBulkVerified,
  onUpdateBulkRiskScore,
  searchQuery = "",
  categoryFilter = "",
}: EntityLabelManagementProps) {
  const [labels, setLabels] = useState<EntityLabel[]>(initialLabels)
  const [filteredLabels, setFilteredLabels] = useState<EntityLabel[]>(initialLabels)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [addressInput, setAddressInput] = useState("")
  const [descriptionInput, setDescriptionInput] = useState("")
  const [categoryInput, setcategoryInput] = useState("Exchange")
  const [riskScoreInput, setRiskScoreInput] = useState(0)
  const [verifiedInput, setVerifiedInput] = useState(false)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof EntityLabel; direction: "asc" | "desc" } | null>(null)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [localCategoryFilter, setLocalCategoryFilter] = useState(categoryFilter)

  const categoryOptions = ["Exchange", "DeFi Protocol", "NFT Marketplace", "Wallet", "DAO", "Gaming", "Social", "Other"]

  useEffect(() => {
    setLabels(initialLabels)
  }, [initialLabels])

  useEffect(() => {
    let result = [...labels]

    // Apply search filter
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase()
      result = result.filter(
        (label) =>
          label.name.toLowerCase().includes(query) ||
          label.address.toLowerCase().includes(query) ||
          (label.description && label.description.toLowerCase().includes(query)),
      )
    }

    // Apply category filter
    if (localCategoryFilter) {
      result = result.filter((label) => label.category === localCategoryFilter)
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredLabels(result)
  }, [labels, localSearchQuery, localCategoryFilter, sortConfig])

  const resetForm = () => {
    setNameInput("")
    setAddressInput("")
    setDescriptionInput("")
    setcategoryInput("Exchange")
    setRiskScoreInput(0)
    setVerifiedInput(false)
    setEditingLabelId(null)
    setError(null)
  }

  const handleAddLabel = async () => {
    if (!nameInput || !addressInput || !categoryInput) {
      setError("Name, address, and category are required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (onAddLabel) {
        await onAddLabel({
          name: nameInput,
          address: addressInput,
          description: descriptionInput,
          category: categoryInput,
          riskScore: riskScoreInput,
          verified: verifiedInput,
        })
      } else {
        const newLabel: EntityLabel = {
          id: `local-${Date.now()}`,
          name: nameInput,
          address: addressInput,
          description: descriptionInput,
          category: categoryInput,
          riskScore: riskScoreInput,
          verified: verifiedInput,
        }
        setLabels([...labels, newLabel])
      }
      resetForm()
      setIsAddDialogOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEditLabel = async () => {
    if (!editingLabelId || !nameInput || !addressInput || !categoryInput) {
      setError("Name, address, and category are required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updatedFields: Partial<EntityLabel> = {
        name: nameInput,
        address: addressInput,
        description: descriptionInput,
        category: categoryInput,
        riskScore: riskScoreInput,
        verified: verifiedInput,
      }

      if (onUpdateLabel) {
        await onUpdateLabel(editingLabelId, updatedFields)
      } else {
        setLabels(labels.map((label) => (label.id === editingLabelId ? { ...label, ...updatedFields } : label)))
      }
      resetForm()
      setIsEditDialogOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLabel = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this label?")) {
      try {
        if (onDeleteLabel) {
          await onDeleteLabel(id)
        } else {
          setLabels(labels.filter((label) => label.id !== id))
        }
      } catch (err) {
        console.error("Error deleting label:", err)
        alert(`Error deleting label: ${getErrorMessage(err)}`)
      }
    }
  }

  const handleEditClick = (label: EntityLabel) => {
    setEditingLabelId(label.id)
    setNameInput(label.name)
    setAddressInput(label.address)
    setDescriptionInput(label.description || "")
    setcategoryInput(label.category)
    setRiskScoreInput(label.riskScore || 0)
    setVerifiedInput(label.verified || false)
    setIsEditDialogOpen(true)
  }

  const handleDeleteBulk = async (ids: string[]) => {
    try {
      if (onDeleteBulk) {
        await onDeleteBulk(ids)
      } else {
        setLabels(labels.filter((label) => !ids.includes(label.id)))
      }
    } catch (err) {
      console.error("Error deleting labels in bulk:", err)
      alert(`Error deleting labels: ${getErrorMessage(err)}`)
    }
  }

  const handleImportLabels = async (importedLabels: EntityLabel[]) => {
    try {
      if (onImportLabels) {
        await onImportLabels(importedLabels)
      } else {
        setLabels([...labels, ...importedLabels])
      }
    } catch (err) {
      console.error("Error importing labels:", err)
      throw err
    }
  }

  const handleUpdateBulkCategory = async (ids: string[], category: string) => {
    try {
      if (onUpdateBulkCategory) {
        await onUpdateBulkCategory(ids, category)
      } else {
        setLabels(labels.map((label) => (ids.includes(label.id) ? { ...label, category } : label)))
      }
    } catch (err) {
      console.error("Error updating categories in bulk:", err)
      throw err
    }
  }

  const handleUpdateBulkVerified = async (ids: string[], verified: boolean) => {
    try {
      if (onUpdateBulkVerified) {
        await onUpdateBulkVerified(ids, verified)
      } else {
        setLabels(labels.map((label) => (ids.includes(label.id) ? { ...label, verified } : label)))
      }
    } catch (err) {
      console.error("Error updating verification status in bulk:", err)
      throw err
    }
  }

  const handleUpdateBulkRiskScore = async (ids: string[], riskScore: number) => {
    try {
      if (onUpdateBulkRiskScore) {
        await onUpdateBulkRiskScore(ids, riskScore)
      } else {
        setLabels(labels.map((label) => (ids.includes(label.id) ? { ...label, riskScore } : label)))
      }
    } catch (err) {
      console.error("Error updating risk scores in bulk:", err)
      throw err
    }
  }

  const handleSort = (key: keyof EntityLabel) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Label List</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search labels..."
                  className="pl-8 w-[300px]"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>

              <Select value={localCategoryFilter} onValueChange={setLocalCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Label
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Entity Label</DialogTitle>
                  <DialogDescription>Add a new entity label to the database.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Entity name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Solana wallet address"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Description"
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryInput} onValueChange={setcategoryInput}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskScore">Risk Score (0-100)</Label>
                    <Input
                      id="riskScore"
                      type="number"
                      min="0"
                      max="100"
                      value={riskScoreInput}
                      onChange={(e) => setRiskScoreInput(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="verified" checked={verifiedInput} onCheckedChange={setVerifiedInput} />
                    <Label htmlFor="verified">Verified</Label>
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsAddDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddLabel} disabled={loading}>
                    {loading ? "Adding..." : "Add Label"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Entity Label</DialogTitle>
                  <DialogDescription>Update the entity label information.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="Entity name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      placeholder="Solana wallet address"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description (Optional)</Label>
                    <Input
                      id="edit-description"
                      placeholder="Description"
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={categoryInput} onValueChange={setcategoryInput}>
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-riskScore">Risk Score (0-100)</Label>
                    <Input
                      id="edit-riskScore"
                      type="number"
                      min="0"
                      max="100"
                      value={riskScoreInput}
                      onChange={(e) => setRiskScoreInput(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="edit-verified" checked={verifiedInput} onCheckedChange={setVerifiedInput} />
                    <Label htmlFor="edit-verified">Verified</Label>
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsEditDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditLabel} disabled={loading}>
                    {loading ? "Updating..." : "Update Label"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("riskScore")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Risk Score</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Verification
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-gray-200">
                {filteredLabels.length > 0 ? (
                  filteredLabels.map((label) => (
                    <tr key={label.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{label.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground truncate max-w-[150px]">{label.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">{label.category}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            label.riskScore > 75
                              ? "text-red-500"
                              : label.riskScore > 50
                                ? "text-orange-500"
                                : label.riskScore > 25
                                  ? "text-yellow-500"
                                  : "text-green-500"
                          }`}
                        >
                          {label.riskScore || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {label.verified ? (
                          <Badge variant="success" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unverified</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(label)} className="mr-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteLabel(label.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No entity labels found. Add a new label to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <EntityLabelBulkOperations
            labels={labels}
            onDelete={handleDeleteBulk}
            onUpdateCategory={handleUpdateBulkCategory}
            onUpdateVerified={handleUpdateBulkVerified}
            onUpdateRiskScore={handleUpdateBulkRiskScore}
          />
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <EntityLabelImportExport labels={labels} onImport={handleImportLabels} />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <EntityLabelStatistics labels={labels} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
