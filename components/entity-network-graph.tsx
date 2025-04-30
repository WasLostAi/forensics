"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RefreshCw, Filter, Download } from "lucide-react"
import { getEntityRelationships } from "@/lib/entity-relationship-service"
import type { EntityGraph } from "@/types/entity-graph"
import { cn } from "@/lib/utils"

// We'll use ForceGraph from react-force-graph
// This is a dynamic import to avoid SSR issues
import dynamic from "next/dynamic"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d").then((mod) => mod.default), { ssr: false })

interface EntityNetworkGraphProps {
  centralAddress: string
  className?: string
}

export function EntityNetworkGraph({ centralAddress, className }: EntityNetworkGraphProps) {
  const [graphData, setGraphData] = useState<EntityGraph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [depth, setDepth] = useState(2)
  const [maxNodes, setMaxNodes] = useState(50)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterRiskScore, setFilterRiskScore] = useState([0, 100])
  const graphRef = useRef<any>(null)

  // Fetch graph data
  useEffect(() => {
    async function fetchGraphData() {
      setLoading(true)
      setError(null)

      try {
        const data = await getEntityRelationships(centralAddress, depth, maxNodes)
        setGraphData(data)
      } catch (err) {
        console.error("Failed to fetch entity relationships:", err)
        setError("Failed to load entity relationships. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchGraphData()
  }, [centralAddress, depth, maxNodes])

  // Apply filters to graph data
  const filteredGraphData = graphData ? filterGraphData(graphData, filterCategory, filterRiskScore) : null

  // Handle zoom in/out
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom * 1.5, 400)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom / 1.5, 400)
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getEntityRelationships(centralAddress, depth, maxNodes)
      setGraphData(data)
    } catch (err) {
      console.error("Failed to refresh entity relationships:", err)
      setError("Failed to refresh entity relationships. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle export as PNG
  const handleExport = () => {
    if (graphRef.current) {
      const canvas = graphRef.current.canvas()
      if (canvas) {
        const link = document.createElement("a")
        link.download = `entity-network-${centralAddress.substring(0, 8)}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      }
    }
  }

  // Node color based on category and risk score
  const getNodeColor = (node: any) => {
    const category = node.category || "other"
    const riskScore = node.riskScore || 50

    // Base colors for categories
    const categoryColors: Record<string, string> = {
      exchange: "#3498db", // Blue
      individual: "#2ecc71", // Green
      contract: "#9b59b6", // Purple
      scam: "#e74c3c", // Red
      mixer: "#f39c12", // Orange
      other: "#95a5a6", // Gray
    }

    // Get base color
    const baseColor = categoryColors[category] || categoryColors.other

    // Adjust color based on risk score
    if (riskScore >= 80) {
      return "#e74c3c" // High risk is always red
    } else if (riskScore >= 60) {
      return "#f39c12" // Medium-high risk is orange
    }

    return baseColor
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Entity Network Graph</CardTitle>
        <CardDescription>Visualize relationships between entities on the Solana blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
            </Button>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Depth:</span>
              <Select value={depth.toString()} onValueChange={(value) => setDepth(Number.parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Max Nodes:</span>
              <Select value={maxNodes.toString()} onValueChange={(value) => setMaxNodes(Number.parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filterCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory(null)}
            >
              All
            </Badge>
            <Badge
              variant={filterCategory === "exchange" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory("exchange")}
            >
              Exchanges
            </Badge>
            <Badge
              variant={filterCategory === "individual" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory("individual")}
            >
              Individuals
            </Badge>
            <Badge
              variant={filterCategory === "contract" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory("contract")}
            >
              Contracts
            </Badge>
            <Badge
              variant={filterCategory === "mixer" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory("mixer")}
            >
              Mixers
            </Badge>
            <Badge
              variant={filterCategory === "scam" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory("scam")}
            >
              Scams
            </Badge>
          </div>

          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-sm">Risk Score:</span>
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              value={filterRiskScore}
              onValueChange={setFilterRiskScore}
              className="w-[100px]"
            />
            <span className="text-sm">
              {filterRiskScore[0]}-{filterRiskScore[1]}
            </span>
          </div>
        </div>

        {/* Graph */}
        <div className="h-[600px] border rounded-md relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading entity relationships...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2 max-w-md text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button size="sm" variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Try Again
                </Button>
              </div>
            </div>
          )}

          {filteredGraphData && !loading && (
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredGraphData}
              nodeId="id"
              nodeLabel={(node) => `${node.label} (Risk: ${node.riskScore})`}
              nodeColor={getNodeColor}
              nodeVal={(node) => node.size}
              linkSource="source"
              linkTarget="target"
              linkWidth={(link) => Math.sqrt(link.value) * 0.5}
              linkLabel={(link) => `${link.type}: ${link.value} SOL (${new Date(link.timestamp).toLocaleDateString()})`}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={0.8}
              linkDirectionalParticles={1}
              linkDirectionalParticleSpeed={(link) => link.value * 0.001}
              backgroundColor="rgba(0,0,0,0)"
              width={800}
              height={600}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#3498db]"></div>
            <span>Exchange</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#2ecc71]"></div>
            <span>Individual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#9b59b6]"></div>
            <span>Contract</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#e74c3c]"></div>
            <span>Scam</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#f39c12]"></div>
            <span>Mixer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#95a5a6]"></div>
            <span>Other</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to filter graph data
function filterGraphData(
  graphData: EntityGraph,
  filterCategory: string | null,
  filterRiskScore: number[],
): EntityGraph {
  // If no filters are applied, return the original data
  if (!filterCategory && filterRiskScore[0] === 0 && filterRiskScore[1] === 100) {
    return graphData
  }

  // Filter nodes based on category and risk score
  const filteredNodes = graphData.nodes.filter((node) => {
    const categoryMatch = !filterCategory || node.category === filterCategory
    const riskScoreMatch = node.riskScore >= filterRiskScore[0] && node.riskScore <= filterRiskScore[1]
    return categoryMatch && riskScoreMatch
  })

  // Get the IDs of filtered nodes
  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))

  // Filter links to only include connections between filtered nodes
  const filteredLinks = graphData.links.filter(
    (link) => filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string),
  )

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  }
}
