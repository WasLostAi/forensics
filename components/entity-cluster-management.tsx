"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, Users, Network, ArrowRight } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  getEntityClusters,
  createEntityCluster,
  updateEntityCluster,
  deleteEntityCluster,
  getClusterMembers,
} from "@/lib/entity-service"
import type { EntityCluster, EntityLabel } from "@/types/entity"
import Link from "next/link"

export function EntityClusterManagement() {
  const [clusters, setClusters] = useState<EntityCluster[]>([])
  const [filteredClusters, setFilteredClusters] = useState<EntityCluster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EntityCluster | null
    direction: "ascending" | "descending"
  }>({ key: null, direction: "ascending" })

  // Cluster members state
  const [selectedCluster, setSelectedCluster] = useState<EntityCluster | null>(null)
  const [clusterMembers, setClusterMembers] = useState<EntityLabel[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewMembersDialogOpen, setIsViewMembersDialogOpen] = useState(false)
  const [currentCluster, setCurrentCluster] = useState<EntityCluster | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "exchange",
    riskScore: 50,
    tags: "",
    behaviorPatterns: "",
  })

  // Load clusters
  useEffect(() => {
    loadClusters()
  }, [])

  // Filter and search clusters
  useEffect(() => {
    if (!clusters.length) return

    let result = [...clusters]

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((cluster) => cluster.category === categoryFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (cluster) =>
          cluster.name.toLowerCase().includes(query) ||
          (cluster.description && cluster.description.toLowerCase().includes(query)) ||
          cluster.category.toLowerCase().includes(query) ||
          (cluster.tags && cluster.tags.some((tag) => tag.toLowerCase().includes(query))) ||
          (cluster.behaviorPatterns &&
            cluster.behaviorPatterns.some((pattern) => pattern.toLowerCase().includes(query))),
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

    setFilteredClusters(result)
  }, [clusters, searchQuery, categoryFilter, sortConfig])

  async function loadClusters() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getEntityClusters()
      setClusters(data)
      setFilteredClusters(data)
    } catch (error) {
      console.error("Failed to load entity clusters:", error)
      setError("Failed to load entity clusters. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadClusterMembers(clusterId: string) {
    setIsLoadingMembers(true)
    try {
      const data = await getClusterMembers(clusterId)
      setClusterMembers(data)
    } catch (error) {
      console.error("Failed to load cluster members:", error)
      setError("Failed to load cluster members. Please try again.")
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const handleAddCluster = async () => {
    try {
      setError(null)

      if (!formData.name.trim()) {
        setError("Cluster name is required")
        return
      }

      const newCluster = await createEntityCluster({
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        riskScore: formData.riskScore,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : undefined,
        behaviorPatterns: formData.behaviorPatterns
          ? formData.behaviorPatterns.split(",").map((pattern) => pattern.trim())
          : undefined,
        createdBy: "user", // In a real app, this would be the current user's ID
      })

      setClusters([...clusters, newCluster])
      resetForm()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add cluster:", error)
      setError("Failed to add cluster. Please try again.")
    }
  }

  const handleEditCluster = async () => {
    if (!currentCluster) return

    try {
      setError(null)

      if (!formData.name.trim()) {
        setError("Cluster name is required")
        return
      }

      const updatedCluster = await updateEntityCluster(currentCluster.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        riskScore: formData.riskScore,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : undefined,
        behaviorPatterns: formData.behaviorPatterns
          ? formData.behaviorPatterns.split(",").map((pattern) => pattern.trim())
          : undefined,
      })

      setClusters(clusters.map((cluster) => (cluster.id === currentCluster.id ? updatedCluster : cluster)))

      resetForm()
      setIsEditDialogOpen(false)
      setCurrentCluster(null)
    } catch (error) {
      console.error("Failed to update cluster:", error)
      setError("Failed to update cluster. Please try again.")
    }
  }

  const handleDeleteCluster = async () => {
    if (!currentCluster) return

    try {
      await deleteEntityCluster(currentCluster.id)
      setClusters(clusters.filter((cluster) => cluster.id !== currentCluster.id))
      setIsDeleteDialogOpen(false)
      setCurrentCluster(null)
    } catch (error) {
      console.error("Failed to delete cluster:", error)
      setError("Failed to delete cluster. Please try again.")
    }
  }

  const openEditDialog = (cluster: EntityCluster) => {
    setCurrentCluster(cluster)
    setFormData({
      name: cluster.name,
      description: cluster.description || "",
      category: cluster.category,
      riskScore: cluster.riskScore,
      tags: cluster.tags ? cluster.tags.join(", ") : "",
      behaviorPatterns: cluster.behaviorPatterns ? cluster.behaviorPatterns.join(", ") : "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (cluster: EntityCluster) => {
    setCurrentCluster(cluster)
    setIsDeleteDialogOpen(true)
  }

  const openViewMembersDialog = async (cluster: EntityCluster) => {
    setSelectedCluster(cluster)
    setIsViewMembersDialogOpen(true)
    await loadClusterMembers(cluster.id)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "exchange",
      riskScore: 50,
      tags: "",
      behaviorPatterns: "",
    })
    setError(null)
  }

  const handleSort = (key: keyof EntityCluster) => {
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

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
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
          <h2 className="text-2xl font-bold">Entity Clusters</h2>
          <Badge variant="outline">{filteredClusters.length}</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Search clusters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
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
          <Button
            onClick={() => {
              resetForm()
              setIsAddDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Cluster
          </Button>
        </div>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20 backdrop-blur-sm">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  Name {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                  Category {sortConfig.key === "category" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("riskScore")}>
                  Risk {sortConfig.key === "riskScore" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("memberCount")}>
                  Members {sortConfig.key === "memberCount" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Behavior Patterns</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  Created {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Loading entity clusters...
                  </TableCell>
                </TableRow>
              ) : filteredClusters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No entity clusters found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClusters.map((cluster) => (
                  <TableRow key={cluster.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{cluster.name}</div>
                        {cluster.description && (
                          <div className="text-xs text-muted-foreground">{cluster.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getCategoryColor(cluster.category)} text-white`}>{cluster.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRiskColor(cluster.riskScore)} text-white`}>{cluster.riskScore}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background/50">
                        {cluster.memberCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cluster.behaviorPatterns && cluster.behaviorPatterns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cluster.behaviorPatterns.slice(0, 2).map((pattern, index) => (
                            <Badge key={index} variant="outline" className="bg-background/50">
                              {pattern}
                            </Badge>
                          ))}
                          {cluster.behaviorPatterns.length > 2 && (
                            <Badge variant="outline" className="bg-background/50">
                              +{cluster.behaviorPatterns.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cluster.tags && cluster.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cluster.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-background/50">
                              {tag}
                            </Badge>
                          ))}
                          {cluster.tags.length > 2 && (
                            <Badge variant="outline" className="bg-background/50">
                              +{cluster.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(cluster.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openViewMembersDialog(cluster)}>
                          <Users className="h-4 w-4" />
                          <span className="sr-only">View Members</span>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/entity-clusters/${cluster.id}`}>
                            <Network className="h-4 w-4" />
                            <span className="sr-only">View Network</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(cluster)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(cluster)}>
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

      {/* Add Cluster Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Add Entity Cluster</DialogTitle>
            <DialogDescription>
              Create a new cluster to group entities with similar behavior patterns.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Exchange-related Wallets"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Brief description of this cluster"
                rows={2}
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
                <SelectTrigger className="col-span-3" id="category">
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
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="col-span-3"
                placeholder="e.g., exchange, high-volume, verified (comma separated)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="behaviorPatterns" className="text-right">
                Behavior Patterns
              </Label>
              <Input
                id="behaviorPatterns"
                value={formData.behaviorPatterns}
                onChange={(e) => setFormData({ ...formData, behaviorPatterns: e.target.value })}
                className="col-span-3"
                placeholder="e.g., regular-withdrawals, large-deposits (comma separated)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCluster}>Create Cluster</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cluster Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Edit Entity Cluster</DialogTitle>
            <DialogDescription>Update the information for this entity cluster.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                rows={2}
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
              <Label htmlFor="edit-tags" className="text-right">
                Tags
              </Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-behaviorPatterns" className="text-right">
                Behavior Patterns
              </Label>
              <Input
                id="edit-behaviorPatterns"
                value={formData.behaviorPatterns}
                onChange={(e) => setFormData({ ...formData, behaviorPatterns: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCluster}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the cluster "{currentCluster?.name}"? This will remove all entity
              memberships in this cluster. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCluster}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={isViewMembersDialogOpen} onOpenChange={setIsViewMembersDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>Cluster Members: {selectedCluster?.name}</DialogTitle>
            <DialogDescription>
              Entities that belong to this cluster based on similar behavior patterns.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingMembers ? (
              <div className="text-center py-8">Loading cluster members...</div>
            ) : clusterMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No members found in this cluster.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clusterMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.label}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {member.address.slice(0, 4)}...{member.address.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCategoryColor(member.category)} text-white`}>{member.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {member.similarityScore !== undefined && (
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${member.similarityScore * 100}%` }} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.riskScore !== undefined && (
                          <Badge className={`${getRiskColor(member.riskScore)} text-white`}>{member.riskScore}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/wallet/${member.address}`}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewMembersDialogOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href={`/entity-clusters/${selectedCluster?.id}`}>
                <Network className="mr-2 h-4 w-4" />
                View Network Graph
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
