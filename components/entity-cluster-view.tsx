"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Network, Pencil, Plus, Search, Trash2, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getEntityClusters } from "@/lib/entity-service"
import type { EntityCluster } from "@/types/entity"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function EntityClusterView() {
  const [clusters, setClusters] = useState<EntityCluster[]>([])
  const [filteredClusters, setFilteredClusters] = useState<EntityCluster[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadClusters()
  }, [])

  useEffect(() => {
    if (!clusters.length) return

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredClusters(
        clusters.filter(
          (cluster) =>
            cluster.name.toLowerCase().includes(query) ||
            (cluster.description && cluster.description.toLowerCase().includes(query)) ||
            cluster.category.toLowerCase().includes(query) ||
            (cluster.tags && cluster.tags.some((tag) => tag.toLowerCase().includes(query))),
        ),
      )
    } else {
      setFilteredClusters(clusters)
    }
  }, [clusters, searchQuery])

  async function loadClusters() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getEntityClusters()
      setClusters(data)
      setFilteredClusters(data)
    } catch (error) {
      console.error("Failed to load clusters:", error)
      setError("Failed to load entity clusters. Please try again.")
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clusters..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Cluster
        </Button>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20 backdrop-blur-sm">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading clusters...
                  </TableCell>
                </TableRow>
              ) : filteredClusters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No clusters found.
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
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(cluster.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Users className="h-4 w-4" />
                          <span className="sr-only">Members</span>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/entity-clusters/${cluster.id}`}>
                            <Network className="h-4 w-4" />
                            <span className="sr-only">Network</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon">
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
    </div>
  )
}
