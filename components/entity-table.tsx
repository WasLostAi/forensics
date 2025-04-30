"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, ExternalLink, Link, Network, Pencil, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchEntityLabelsFromDB, deleteEntityLabel } from "@/lib/entity-service"
import type { EntityLabel } from "@/types/entity"
import type { EntitySearchFilter } from "@/components/entity-advanced-search"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EntityTableProps {
  searchFilters?: EntitySearchFilter[]
  onEditEntity: (id: string) => void
}

export function EntityTable({ searchFilters = [], onEditEntity }: EntityTableProps) {
  const [entities, setEntities] = useState<EntityLabel[]>([])
  const [filteredEntities, setFilteredEntities] = useState<EntityLabel[]>([])
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<EntityLabel | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EntityLabel | null
    direction: "ascending" | "descending"
  }>({ key: "updatedAt", direction: "descending" })

  const { toast } = useToast()

  // Load entities
  useEffect(() => {
    loadEntities()
  }, [])

  // Filter and search entities
  useEffect(() => {
    if (!entities.length) return

    let result = [...entities]

    // Apply advanced search filters
    if (searchFilters.length > 0) {
      result = result.filter((entity) => {
        return searchFilters.every((filter) => {
          if (!filter.active) return true

          switch (filter.field) {
            case "label":
              switch (filter.operator) {
                case "contains":
                  return entity.label.toLowerCase().includes((filter.value as string).toLowerCase())
                case "equals":
                  return entity.label.toLowerCase() === (filter.value as string).toLowerCase()
                case "startsWith":
                  return entity.label.toLowerCase().startsWith((filter.value as string).toLowerCase())
                case "endsWith":
                  return entity.label.toLowerCase().endsWith((filter.value as string).toLowerCase())
                default:
                  return true
              }
            case "address":
              switch (filter.operator) {
                case "contains":
                  return entity.address.toLowerCase().includes((filter.value as string).toLowerCase())
                case "equals":
                  return entity.address.toLowerCase() === (filter.value as string).toLowerCase()
                case "startsWith":
                  return entity.address.toLowerCase().startsWith((filter.value as string).toLowerCase())
                case "endsWith":
                  return entity.address.toLowerCase().endsWith((filter.value as string).toLowerCase())
                default:
                  return true
              }
            case "category":
              return entity.category === filter.value
            case "source":
              return entity.source === filter.value
            case "tags":
              if (!entity.tags) return false
              switch (filter.operator) {
                case "includes":
                  return (filter.value as string[]).some((tag) =>
                    entity.tags?.some((entityTag) => entityTag.toLowerCase().includes(tag.toLowerCase())),
                  )
                case "excludes":
                  return !(filter.value as string[]).some((tag) =>
                    entity.tags?.some((entityTag) => entityTag.toLowerCase().includes(tag.toLowerCase())),
                  )
                default:
                  return true
              }
            case "riskScore":
              if (entity.riskScore === undefined) return false
              switch (filter.operator) {
                case "equals":
                  return entity.riskScore === filter.value
                case "greaterThan":
                  return entity.riskScore > (filter.value as number)
                case "lessThan":
                  return entity.riskScore < (filter.value as number)
                case "between":
                  const [min, max] = filter.value as number[]
                  return entity.riskScore >= min && entity.riskScore <= max
                default:
                  return true
              }
            case "confidence":
              switch (filter.operator) {
                case "equals":
                  return entity.confidence === filter.value
                case "greaterThan":
                  return entity.confidence > (filter.value as number)
                case "lessThan":
                  return entity.confidence < (filter.value as number)
                case "between":
                  const [min, max] = filter.value as number[]
                  return entity.confidence >= min && entity.confidence <= max
                default:
                  return true
              }
            case "verified":
              return entity.verified === filter.value
            case "notes":
              if (!entity.notes) return false
              switch (filter.operator) {
                case "contains":
                  return entity.notes.toLowerCase().includes((filter.value as string).toLowerCase())
                case "equals":
                  return entity.notes.toLowerCase() === (filter.value as string).toLowerCase()
                case "startsWith":
                  return entity.notes.toLowerCase().startsWith((filter.value as string).toLowerCase())
                case "endsWith":
                  return entity.notes.toLowerCase().endsWith((filter.value as string).toLowerCase())
                default:
                  return true
              }
            case "createdAt":
              switch (filter.operator) {
                case "before":
                  return new Date(entity.createdAt) < new Date(filter.value as string)
                case "after":
                  return new Date(entity.createdAt) > new Date(filter.value as string)
                case "between":
                  const [start, end] = filter.value as string[]
                  return new Date(entity.createdAt) >= new Date(start) && new Date(entity.createdAt) <= new Date(end)
                default:
                  return true
              }
            case "updatedAt":
              switch (filter.operator) {
                case "before":
                  return new Date(entity.updatedAt) < new Date(filter.value as string)
                case "after":
                  return new Date(entity.updatedAt) > new Date(filter.value as string)
                case "between":
                  const [start, end] = filter.value as string[]
                  return new Date(entity.updatedAt) >= new Date(start) && new Date(entity.updatedAt) <= new Date(end)
                default:
                  return true
              }
            case "inCluster":
              return filter.value ? !!entity.clusterIds?.length : !entity.clusterIds?.length
            default:
              return true
          }
        })
      })
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

    setFilteredEntities(result)
  }, [entities, searchFilters, sortConfig])

  async function loadEntities() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchEntityLabelsFromDB()
      setEntities(data)
      setFilteredEntities(data)
    } catch (error) {
      console.error("Failed to load entities:", error)
      setError("Failed to load entities. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (key: keyof EntityLabel) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  const handleDeleteEntity = async () => {
    if (!entityToDelete) return

    try {
      await deleteEntityLabel(entityToDelete.id)
      setEntities(entities.filter((entity) => entity.id !== entityToDelete.id))
      setIsDeleteDialogOpen(false)
      setEntityToDelete(null)

      toast({
        title: "Entity deleted",
        description: `${entityToDelete.label} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Failed to delete entity:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete entity. Please try again.",
      })
    }
  }

  const openDeleteDialog = (entity: EntityLabel) => {
    setEntityToDelete(entity)
    setIsDeleteDialogOpen(true)
  }

  const toggleSelectAll = () => {
    if (selectedEntities.length === filteredEntities.length) {
      setSelectedEntities([])
    } else {
      setSelectedEntities(filteredEntities.map((entity) => entity.id))
    }
  }

  const toggleSelectEntity = (id: string) => {
    if (selectedEntities.includes(id)) {
      setSelectedEntities(selectedEntities.filter((entityId) => entityId !== id))
    } else {
      setSelectedEntities([...selectedEntities, id])
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

  const getRiskColor = (score?: number) => {
    if (!score) return "bg-gray-500"
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedEntities.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <span className="text-sm font-medium">{selectedEntities.length} entities selected</span>
          <div className="flex-1"></div>
          <Button size="sm" variant="outline">
            <Link className="mr-2 h-4 w-4" />
            Link
          </Button>
          <Button size="sm" variant="outline">
            <Network className="mr-2 h-4 w-4" />
            Cluster
          </Button>
          <Button size="sm" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20 backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedEntities.length === filteredEntities.length && filteredEntities.length > 0}
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
                <TableHead>Address</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("confidence")}>
                  Confidence {sortConfig.key === "confidence" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("riskScore")}>
                  Risk {sortConfig.key === "riskScore" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("updatedAt")}>
                  Updated {sortConfig.key === "updatedAt" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Loading entities...
                  </TableCell>
                </TableRow>
              ) : filteredEntities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No entities found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEntities.includes(entity.id)}
                        onCheckedChange={() => toggleSelectEntity(entity.id)}
                        aria-label={`Select ${entity.label}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                      {entity.label}
                      {entity.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" title="Verified" />}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getCategoryColor(entity.category)} text-white`}>{entity.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {entity.address.slice(0, 4)}...{entity.address.slice(-4)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{entity.address}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{(entity.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      {entity.riskScore !== undefined && (
                        <Badge className={`${getRiskColor(entity.riskScore)} text-white`}>{entity.riskScore}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entity.tags && entity.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {entity.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-background/50">
                              {tag}
                            </Badge>
                          ))}
                          {entity.tags.length > 2 && (
                            <Badge variant="outline" className="bg-background/50">
                              +{entity.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(entity.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEditEntity(entity.id)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/wallet/${entity.address}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(entity)}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the entity "{entityToDelete?.label}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntity}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
