"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, Save, Trash, AlertTriangle, Search } from "lucide-react"
import { fetchEntityLabelsFromDB, saveEntityLabel, deleteEntityLabel } from "@/lib/entity-service"
import { lookupEntity, searchEntities } from "@/lib/entity-database"
import type { EntityLabel } from "@/types/entity"

interface EntityLabelsProps {
  walletAddress: string
}

export function EntityLabels({ walletAddress }: EntityLabelsProps) {
  const [labels, setLabels] = useState<EntityLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newLabel, setNewLabel] = useState("")
  const [newCategory, setNewCategory] = useState("exchange")
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLabels() {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch entity labels from Supabase
        const data = await fetchEntityLabelsFromDB(walletAddress)

        // Check if this wallet is in our known entities database
        const knownEntity = lookupEntity(walletAddress)

        if (knownEntity && !data.some((label) => label.source === "database" && label.label === knownEntity.name)) {
          // Add the known entity as a label if it doesn't exist yet
          const knownEntityLabel: EntityLabel = {
            id: "known-entity",
            address: walletAddress,
            label: knownEntity.name,
            category: knownEntity.category as any,
            confidence: 1.0,
            source: "database",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          // Save to Supabase
          try {
            const savedLabel = await saveEntityLabel({
              address: walletAddress,
              label: knownEntity.name,
              category: knownEntity.category as any,
              confidence: 1.0,
              source: "database",
            })
            setLabels([savedLabel, ...data])
          } catch (saveError) {
            console.error("Failed to save known entity label:", saveError)
            setLabels([knownEntityLabel, ...data])
          }
        } else {
          setLabels(data)
        }
      } catch (error) {
        console.error("Failed to load entity labels:", error)
        setError("Failed to load entity labels. Using demonstration data.")

        // Mock data for demo purposes
        const mockLabels: EntityLabel[] = [
          {
            id: "1",
            address: walletAddress,
            label: "Binance Hot Wallet",
            category: "exchange",
            confidence: 0.95,
            source: "community",
            createdAt: "2023-05-15T14:23:45Z",
            updatedAt: "2023-05-15T14:23:45Z",
          },
          {
            id: "2",
            address: walletAddress,
            label: "High Volume Trader",
            category: "individual",
            confidence: 0.75,
            source: "algorithm",
            createdAt: "2023-06-22T09:12:33Z",
            updatedAt: "2023-06-22T09:12:33Z",
          },
        ]

        setLabels(mockLabels)
      } finally {
        setIsLoading(false)
      }
    }

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

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return

    try {
      const newLabelObj = await saveEntityLabel({
        address: walletAddress,
        label: newLabel,
        category: newCategory as "exchange" | "individual" | "contract" | "scam" | "other",
        confidence: 0.8,
        source: "user",
      })

      setLabels([...labels, newLabelObj])
      setNewLabel("")
      setNewCategory("exchange")
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to add label:", error)
      setError("Failed to add label. Please try again.")
    }
  }

  const handleAddKnownEntity = async (entity: any) => {
    try {
      const newLabelObj = await saveEntityLabel({
        address: walletAddress,
        label: entity.name,
        category: entity.category as any,
        confidence: 0.9,
        source: "database",
      })

      setLabels([...labels, newLabelObj])
      setSearchQuery("")
      setSearchResults([])
    } catch (error) {
      console.error("Failed to add known entity:", error)
      setError("Failed to add known entity. Please try again.")
    }
  }

  const handleDeleteLabel = async (id: string) => {
    try {
      await deleteEntityLabel(id)
      setLabels(labels.filter((label) => label.id !== id))
    } catch (error) {
      console.error("Failed to delete label:", error)
      setError("Failed to delete label. Please try again.")
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

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isEditing ? (
        <div className="space-y-4 mb-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <label htmlFor="label" className="text-sm font-medium">
                Label
              </label>
              <Input
                id="label"
                placeholder="Enter label name"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="exchange">Exchange</option>
                <option value="individual">Individual</option>
                <option value="contract">Contract</option>
                <option value="mixer">Mixer</option>
                <option value="scam">Scam</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button onClick={handleAddLabel}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search Known Entities
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                <Table>
                  <TableBody>
                    {searchResults.map((entity) => (
                      <TableRow
                        key={entity.address}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleAddKnownEntity(entity)}
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
        </div>
      ) : (
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Label
        </Button>
      )}

      <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-secondary/20 backdrop-blur-sm">
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading entity labels...
                </TableCell>
              </TableRow>
            ) : labels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
                  <TableCell>{label.source}</TableCell>
                  <TableCell>{new Date(label.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLabel(label.id)}>
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
