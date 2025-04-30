"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Filter, Search, Zap } from "lucide-react"
import { clusterEntitiesByBehavior, getAllEntityClusters } from "@/lib/entity-clustering-service"
import { fetchEntityLabelsFromDB } from "@/lib/entity-service"
import type { EntityCluster } from "@/types/clustering"
import type { EntityLabel } from "@/types/entity"
import Link from "next/link"

interface EntityClustersViewProps {
  initialEntities?: EntityLabel[]
}

export function EntityClustersView({ initialEntities }: EntityClustersViewProps) {
  const [clusters, setClusters] = useState<EntityCluster[]>([])
  const [entities, setEntities] = useState<EntityLabel[]>(initialEntities || [])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("clusters")

  // Clustering parameters
  const [minSimilarity, setMinSimilarity] = useState(70)
  const [maxClusters, setMaxClusters] = useState(10)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterRisk, setFilterRisk] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load clusters on component mount
  useEffect(() => {
    loadClusters()
  }, [])

  // Load entities if not provided
  useEffect(() => {
    if (!initialEntities) {
      loadEntities()
    }
  }, [initialEntities])

  // Filter clusters when filters change
  const filteredClusters = clusters
    .filter((cluster) => !filterCategory || cluster.dominantCategory === filterCategory)
    .filter((cluster) => !filterRisk || cluster.riskLevel === filterRisk)
    .filter(
      (cluster) =>
        !searchQuery ||
        cluster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  async function loadEntities() {
    try {
      // In a real implementation, we would fetch all entities
      // For now, we'll use a mock implementation that returns entities for a specific address
      const data = await fetchEntityLabelsFromDB("all")
      setEntities(data)
    } catch (error) {
      console.error("Failed to load entities:", error)
      setError("Failed to load entities. Using demonstration data.")
    }
  }

  async function loadClusters() {
    setIsLoading(true)
    setError(null)

    try {
      // Get all clusters from the database
      const data = await getAllEntityClusters()
      setClusters(data)
    } catch (error) {
      console.error("Failed to load entity clusters:", error)
      setError("Failed to load entity clusters. Using demonstration data.")

      // Set mock clusters
      setClusters([
        {
          id: "cluster-1",
          name: "Exchange Group",
          description: "A cluster of exchange entities with similar transaction patterns",
          entities: [
            "5xrTWJ6UYbVqyxXKUEFkT6RM5a1yZ1xJjK",
            "7zQpLmGj8XyPdHBVnvzjGp2MJ3kRZF1Lq",
            "9aTcF2VhXnYdBj7xPjVt8jRqtNd1pLmS",
          ],
          entityCount: 3,
          dominantCategory: "exchange",
          behaviorPatterns: [
            "Regular large deposits and withdrawals",
            "High transaction volume during market hours",
            "Multiple token types handled",
          ],
          similarityScore: 0.85,
          riskLevel: "low",
          createdAt: new Date().toISOString(),
        },
        {
          id: "cluster-2",
          name: "Mixer Group",
          description: "A cluster of mixer entities with similar transaction patterns",
          entities: ["3aRtWJ6UYbVqyxXKUEFkT6RM5a1yZ1xJjK", "4zQpLmGj8XyPdHBVnvzjGp2MJ3kRZF1Lq"],
          entityCount: 2,
          dominantCategory: "mixer",
          behaviorPatterns: ["Multiple small output transactions", "Delayed withdrawals", "Privacy token usage"],
          similarityScore: 0.92,
          riskLevel: "high",
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRunClustering() {
    setIsLoading(true)
    setError(null)

    try {
      // Run clustering algorithm
      const newClusters = await clusterEntitiesByBehavior(entities, {
        minSimilarity: minSimilarity / 100,
        maxClusters,
      })

      setClusters(newClusters)
    } catch (error) {
      console.error("Failed to cluster entities:", error)
      setError("Failed to cluster entities. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500 hover:bg-red-600"
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "low":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "exchange":
        return "bg-blue-500 hover:bg-blue-600"
      case "individual":
        return "bg-green-500 hover:bg-green-600"
      case "contract":
        return "bg-purple-500 hover:bg-purple-600"
      case "mixer":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "scam":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clusters">Entity Clusters</TabsTrigger>
          <TabsTrigger value="settings">Clustering Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="clusters" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm">Category:</span>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant={filterCategory === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setFilterCategory(null)}
                    >
                      All
                    </Badge>
                    <Badge
                      variant={filterCategory === "exchange" ? "default" : "outline"}
                      className={`cursor-pointer ${filterCategory === "exchange" ? "" : "hover:bg-blue-100 dark:hover:bg-blue-900"}`}
                      onClick={() => setFilterCategory("exchange")}
                    >
                      Exchange
                    </Badge>
                    <Badge
                      variant={filterCategory === "individual" ? "default" : "outline"}
                      className={`cursor-pointer ${filterCategory === "individual" ? "" : "hover:bg-green-100 dark:hover:bg-green-900"}`}
                      onClick={() => setFilterCategory("individual")}
                    >
                      Individual
                    </Badge>
                    <Badge
                      variant={filterCategory === "contract" ? "default" : "outline"}
                      className={`cursor-pointer ${filterCategory === "contract" ? "" : "hover:bg-purple-100 dark:hover:bg-purple-900"}`}
                      onClick={() => setFilterCategory("contract")}
                    >
                      Contract
                    </Badge>
                    <Badge
                      variant={filterCategory === "mixer" ? "default" : "outline"}
                      className={`cursor-pointer ${filterCategory === "mixer" ? "" : "hover:bg-yellow-100 dark:hover:bg-yellow-900"}`}
                      onClick={() => setFilterCategory("mixer")}
                    >
                      Mixer
                    </Badge>
                    <Badge
                      variant={filterCategory === "scam" ? "default" : "outline"}
                      className={`cursor-pointer ${filterCategory === "scam" ? "" : "hover:bg-red-100 dark:hover:bg-red-900"}`}
                      onClick={() => setFilterCategory("scam")}
                    >
                      Scam
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm">Risk Level:</span>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant={filterRisk === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setFilterRisk(null)}
                    >
                      All
                    </Badge>
                    <Badge
                      variant={filterRisk === "low" ? "default" : "outline"}
                      className={`cursor-pointer ${filterRisk === "low" ? "" : "hover:bg-green-100 dark:hover:bg-green-900"}`}
                      onClick={() => setFilterRisk("low")}
                    >
                      Low
                    </Badge>
                    <Badge
                      variant={filterRisk === "medium" ? "default" : "outline"}
                      className={`cursor-pointer ${filterRisk === "medium" ? "" : "hover:bg-yellow-100 dark:hover:bg-yellow-900"}`}
                      onClick={() => setFilterRisk("medium")}
                    >
                      Medium
                    </Badge>
                    <Badge
                      variant={filterRisk === "high" ? "default" : "outline"}
                      className={`cursor-pointer ${filterRisk === "high" ? "" : "hover:bg-red-100 dark:hover:bg-red-900"}`}
                      onClick={() => setFilterRisk("high")}
                    >
                      High
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Search className="h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search clusters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clusters List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 flex justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading entity clusters...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredClusters.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 flex justify-center items-center h-32">
                  <p className="text-muted-foreground">No clusters found matching your filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredClusters.map((cluster) => (
                <Card key={cluster.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{cluster.name}</CardTitle>
                      <Badge className={`${getRiskBadgeColor(cluster.riskLevel)} text-white`}>
                        {cluster.riskLevel.charAt(0).toUpperCase() + cluster.riskLevel.slice(1)} Risk
                      </Badge>
                    </div>
                    <CardDescription>{cluster.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className={`${getCategoryBadgeColor(cluster.dominantCategory)} text-white`}>
                        {cluster.dominantCategory.charAt(0).toUpperCase() + cluster.dominantCategory.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {cluster.entityCount} entities • {(cluster.similarityScore * 100).toFixed(0)}% similarity
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Behavior Patterns:</h4>
                      <ul className="text-sm space-y-1">
                        {cluster.behaviorPatterns.slice(0, 3).map((pattern, index) => (
                          <li key={index} className="text-muted-foreground">
                            • {pattern}
                          </li>
                        ))}
                        {cluster.behaviorPatterns.length > 3 && (
                          <li className="text-muted-foreground">
                            • {cluster.behaviorPatterns.length - 3} more patterns...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(cluster.createdAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/entity-clusters/${cluster.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clustering Parameters</CardTitle>
              <CardDescription>Adjust parameters to control how entities are clustered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Minimum Similarity (%)</label>
                  <span className="text-sm text-muted-foreground">{minSimilarity}%</span>
                </div>
                <Slider
                  value={[minSimilarity]}
                  min={50}
                  max={95}
                  step={5}
                  onValueChange={(value) => setMinSimilarity(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values create more distinct clusters with more similar entities.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Number of Clusters</label>
                <Select
                  value={maxClusters.toString()}
                  onValueChange={(value) => setMaxClusters(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum clusters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 clusters</SelectItem>
                    <SelectItem value="10">10 clusters</SelectItem>
                    <SelectItem value="15">15 clusters</SelectItem>
                    <SelectItem value="20">20 clusters</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Limits the total number of clusters created by the algorithm.
                </p>
              </div>

              <div className="pt-4">
                <Button onClick={handleRunClustering} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Clustering Entities...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Clustering Algorithm
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Weights</CardTitle>
              <CardDescription>Adjust the importance of different behavioral features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Transaction Patterns</label>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Slider defaultValue={[100]} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Transaction Timing</label>
                  <span className="text-sm text-muted-foreground">80%</span>
                </div>
                <Slider defaultValue={[80]} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Transaction Amounts</label>
                  <span className="text-sm text-muted-foreground">70%</span>
                </div>
                <Slider defaultValue={[70]} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Counterparties</label>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Slider defaultValue={[100]} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Token Usage</label>
                  <span className="text-sm text-muted-foreground">60%</span>
                </div>
                <Slider defaultValue={[60]} disabled />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Feature weights determine how much each behavior aspect influences clustering.
                <br />
                Custom weight adjustment will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
