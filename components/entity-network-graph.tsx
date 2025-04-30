"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Filter,
  Download,
  Search,
  Loader2,
  Maximize2,
  Minimize2,
  Settings,
  Share2,
  Info,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  X,
} from "lucide-react"
import { getEntityRelationships } from "@/lib/entity-relationship-service"
import type { EntityGraph, EntityNode } from "@/types/entity-graph"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

// We'll use ForceGraph from react-force-graph
// This is a dynamic import to avoid SSR issues
import dynamic from "next/dynamic"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d").then((mod) => mod.default), { ssr: false })
const ForceGraph3D = dynamic(() => import("react-force-graph-3d").then((mod) => mod.default), { ssr: false })

interface EntityNetworkGraphProps {
  centralAddress?: string
  className?: string
  initialDepth?: number
  initialMaxNodes?: number
  showControls?: boolean
  height?: number
  isEmbedded?: boolean
  onNodeClick?: (node: EntityNode) => void
  presetFilters?: {
    category?: string
    riskScoreRange?: [number, number]
    dateRange?: [Date, Date]
  }
}

export function EntityNetworkGraph({
  centralAddress,
  className,
  initialDepth = 2,
  initialMaxNodes = 50,
  showControls = true,
  height = 600,
  isEmbedded = false,
  onNodeClick,
  presetFilters,
}: EntityNetworkGraphProps) {
  // State
  const [graphData, setGraphData] = useState<EntityGraph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [depth, setDepth] = useState(initialDepth)
  const [maxNodes, setMaxNodes] = useState(initialMaxNodes)
  const [filterCategory, setFilterCategory] = useState<string | null>(presetFilters?.category || null)
  const [filterRiskScore, setFilterRiskScore] = useState<[number, number]>(presetFilters?.riskScoreRange || [0, 100])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null)
  const [pinnedNodes, setPinnedNodes] = useState<Set<string>>(new Set())
  const [showLegend, setShowLegend] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [layoutSettings, setLayoutSettings] = useState({
    linkStrength: 0.5,
    nodeCharge: -30,
    linkDistance: 100,
    centerStrength: 0.1,
  })

  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch graph data
  useEffect(() => {
    if (!centralAddress) return

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
  const filteredGraphData = useMemo(() => {
    if (!graphData) return null

    let result = filterGraphData(graphData, filterCategory, filterRiskScore)

    // Apply search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filteredNodes = result.nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(query) ||
          node.id.toLowerCase().includes(query) ||
          node.category.toLowerCase().includes(query),
      )

      const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))

      const filteredLinks = result.links.filter(
        (link) => filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string),
      )

      result = { nodes: filteredNodes, links: filteredLinks }
    }

    return result
  }, [graphData, filterCategory, filterRiskScore, searchQuery])

  // Graph statistics
  const graphStats = useMemo(() => {
    if (!filteredGraphData) return null

    const nodeCategories = new Map<string, number>()
    let totalRiskScore = 0
    let highRiskCount = 0

    filteredGraphData.nodes.forEach((node) => {
      // Count by category
      const count = nodeCategories.get(node.category) || 0
      nodeCategories.set(node.category, count + 1)

      // Risk stats
      totalRiskScore += node.riskScore
      if (node.riskScore >= 70) highRiskCount++
    })

    const avgRiskScore = filteredGraphData.nodes.length > 0 ? totalRiskScore / filteredGraphData.nodes.length : 0

    return {
      nodeCount: filteredGraphData.nodes.length,
      linkCount: filteredGraphData.links.length,
      categories: Object.fromEntries(nodeCategories),
      avgRiskScore: avgRiskScore,
      highRiskCount,
      highRiskPercentage:
        filteredGraphData.nodes.length > 0 ? (highRiskCount / filteredGraphData.nodes.length) * 100 : 0,
    }
  }, [filteredGraphData])

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
    if (!centralAddress) return

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
        link.download = `entity-network-${centralAddress ? centralAddress.substring(0, 8) : "graph"}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      }
    }
  }

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }

    setIsFullscreen(!isFullscreen)
  }

  // Handle node click
  const handleNodeClick = (node: any) => {
    if (onNodeClick) {
      onNodeClick(node)
    } else {
      // Toggle pin status
      setPinnedNodes((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(node.id)) {
          newSet.delete(node.id)
        } else {
          newSet.add(node.id)
        }
        return newSet
      })
    }
  }

  // Node color based on category and risk score
  const getNodeColor = (node: any) => {
    // If node is highlighted, return highlight color
    if (highlightedNode === node.id) {
      return "#ff9900" // Bright orange for highlighted node
    }

    // If node is pinned, add a border
    if (pinnedNodes.has(node.id)) {
      // Return with border
      return node.borderColor || "#ffffff"
    }

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

  // Link color based on type and value
  const getLinkColor = (link: any) => {
    const value = link.value || 0

    // Color based on transaction value
    if (value > 10) return "rgba(231, 76, 60, 0.6)" // High value: red
    if (value > 5) return "rgba(243, 156, 18, 0.6)" // Medium value: orange
    if (value > 1) return "rgba(52, 152, 219, 0.6)" // Low value: blue

    return "rgba(149, 165, 166, 0.4)" // Very low value: gray
  }

  // Save current view as image
  const saveAsImage = () => {
    if (!graphRef.current) return

    const canvas = graphRef.current.canvas()
    if (!canvas) return

    // Create a download link
    const link = document.createElement("a")
    link.download = `entity-network-${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  // Share current view (simplified implementation)
  const shareGraph = () => {
    if (!centralAddress) return

    // Create a shareable URL with current filters
    const url = new URL(window.location.href)
    url.searchParams.set("address", centralAddress)
    url.searchParams.set("depth", depth.toString())
    url.searchParams.set("maxNodes", maxNodes.toString())

    if (filterCategory) {
      url.searchParams.set("category", filterCategory)
    }

    url.searchParams.set("riskMin", filterRiskScore[0].toString())
    url.searchParams.set("riskMax", filterRiskScore[1].toString())

    // Copy to clipboard
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        alert("Link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy link:", err)
      })
  }

  // Reset graph view
  const resetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400)
    }
  }

  // Render the appropriate graph component based on view mode
  const renderGraph = () => {
    if (!filteredGraphData) return null

    const commonProps = {
      graphData: filteredGraphData,
      nodeId: "id",
      nodeLabel: (node: any) => `${node.label} (Risk: ${node.riskScore})`,
      nodeColor: getNodeColor,
      nodeVal: (node: any) => node.size,
      linkSource: "source",
      linkTarget: "target",
      linkWidth: (link: any) => Math.sqrt(link.value) * 0.5,
      linkLabel: (link: any) => `${link.type}: ${link.value} SOL (${new Date(link.timestamp).toLocaleDateString()})`,
      linkColor: getLinkColor,
      linkDirectionalArrowLength: 3,
      linkDirectionalArrowRelPos: 0.8,
      linkDirectionalParticles: 1,
      linkDirectionalParticleSpeed: (link: any) => link.value * 0.001,
      backgroundColor: "rgba(0,0,0,0)",
      width: containerRef.current?.clientWidth || 800,
      height: height,
      onNodeClick: handleNodeClick,
      onNodeHover: (node: any) => {
        setHighlightedNode(node ? node.id : null)
      },
      nodeCanvasObject: showLabels
        ? (node: any, ctx: any, globalScale: number) => {
            const label = node.label
            const fontSize = 12 / globalScale
            ctx.font = `${fontSize}px Sans-Serif`
            const textWidth = ctx.measureText(label).width
            const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2)

            // Draw node
            ctx.fillStyle = getNodeColor(node)
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.size || 5, 0, 2 * Math.PI)
            ctx.fill()

            // Draw label for central node, pinned nodes, or when zoomed in enough
            if (node.id === centralAddress || pinnedNodes.has(node.id) || globalScale > 0.8) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2 - fontSize,
                bckgDimensions[0],
                bckgDimensions[1],
              )

              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillStyle = "#000000"
              ctx.fillText(label, node.x, node.y - fontSize / 2)
            }
          }
        : undefined,
      cooldownTicks: 100,
      linkDirectionalParticleWidth: 2,
      d3AlphaDecay: 0.02,
      d3VelocityDecay: 0.3,
      d3Force: (d3: any) => {
        // Apply custom force parameters
        d3.force("link").strength(layoutSettings.linkStrength)
        d3.force("charge").strength(layoutSettings.nodeCharge)
        d3.force("link").distance(layoutSettings.linkDistance)
        d3.force("center").strength(layoutSettings.centerStrength)
      },
    }

    return viewMode === "2d" ? (
      <ForceGraph2D ref={graphRef} {...commonProps} />
    ) : (
      <ForceGraph3D
        ref={graphRef}
        {...commonProps}
        nodeThreeObject={(node: any) => {
          const sprite = new (window as any).THREE.Sprite(
            new (window as any).THREE.SpriteMaterial({
              color: getNodeColor(node),
              sizeAttenuation: false,
              depthWrite: false,
            }),
          )
          sprite.scale.set(8, 8, 1)
          return sprite
        }}
      />
    )
  }

  return (
    <Card className={cn("w-full", className)} ref={containerRef}>
      <CardHeader className={cn("pb-3", isFullscreen && "hidden")}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Entity Network Graph</CardTitle>
            <CardDescription>Visualize relationships between entities on the Solana blockchain</CardDescription>
          </div>
          {showStats && graphStats && (
            <div className="flex gap-2">
              <Badge variant="outline">{graphStats.nodeCount} Entities</Badge>
              <Badge variant="outline">{graphStats.linkCount} Connections</Badge>
              <Badge variant={graphStats.avgRiskScore > 60 ? "destructive" : "outline"}>
                Avg Risk: {graphStats.avgRiskScore.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", isFullscreen && "pt-0")}>
        {/* Controls */}
        {showControls && (
          <div className={cn("flex flex-wrap gap-2 items-center justify-between", isFullscreen && "pt-2")}>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={resetView}>
                      <Layers className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset View</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh Data</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={saveAsImage}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save as Image</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={shareGraph}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Graph</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setShowLabels(!showLabels)}>
                      {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showLabels ? "Hide Labels" : "Show Labels"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={handleFullscreenToggle}>
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "2d" | "3d")} className="w-[180px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="2d">2D View</TabsTrigger>
                    <TabsTrigger value="3d">3D View</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" /> Layout
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Layout Settings</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="link-strength" className="text-right">
                          Link Strength
                        </Label>
                        <div className="col-span-3 flex items-center gap-4">
                          <Slider
                            id="link-strength"
                            min={0}
                            max={1}
                            step={0.1}
                            value={[layoutSettings.linkStrength]}
                            onValueChange={([value]) => setLayoutSettings({ ...layoutSettings, linkStrength: value })}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{layoutSettings.linkStrength.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="node-charge" className="text-right">
                          Node Charge
                        </Label>
                        <div className="col-span-3 flex items-center gap-4">
                          <Slider
                            id="node-charge"
                            min={-100}
                            max={0}
                            step={5}
                            value={[layoutSettings.nodeCharge]}
                            onValueChange={([value]) => setLayoutSettings({ ...layoutSettings, nodeCharge: value })}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{layoutSettings.nodeCharge}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="link-distance" className="text-right">
                          Link Distance
                        </Label>
                        <div className="col-span-3 flex items-center gap-4">
                          <Slider
                            id="link-distance"
                            min={10}
                            max={200}
                            step={10}
                            value={[layoutSettings.linkDistance]}
                            onValueChange={([value]) => setLayoutSettings({ ...layoutSettings, linkDistance: value })}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{layoutSettings.linkDistance}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setLayoutSettings({
                          linkStrength: 0.5,
                          nodeCharge: -30,
                          linkDistance: 100,
                          centerStrength: 0.1,
                        })
                      }
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Filters */}
        {showControls && (
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

            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] h-8"
              />
            </div>
          </div>
        )}

        {/* Graph */}
        <div className={cn(`h-[${height}px]`, "border rounded-md relative")}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
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

          {filteredGraphData && !loading && renderGraph()}

          {/* Pinned nodes info */}
          {pinnedNodes.size > 0 && (
            <div className="absolute top-2 right-2 bg-background/90 p-2 rounded-md border shadow-sm max-w-[250px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Pinned Nodes
                </span>
                <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => setPinnedNodes(new Set())}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="max-h-[150px] overflow-y-auto">
                {Array.from(pinnedNodes).map((nodeId) => {
                  const node = filteredGraphData?.nodes.find((n) => n.id === nodeId)
                  return node ? (
                    <div key={nodeId} className="text-xs py-1 border-t flex justify-between">
                      <span className="truncate">{node.label}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={() =>
                          setPinnedNodes((prev) => {
                            const newSet = new Set(prev)
                            newSet.delete(nodeId)
                            return newSet
                          })
                        }
                      >
                        <Unlock className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
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
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ff9900]"></div>
              <span>Highlighted</span>
            </div>
          </div>
        )}

        {/* Stats */}
        {showStats && graphStats && (
          <div className="border rounded-md p-3 bg-background/50">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Info className="h-4 w-4" /> Network Statistics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Entities</p>
                <p className="text-lg font-medium">{graphStats.nodeCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Connections</p>
                <p className="text-lg font-medium">{graphStats.linkCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Risk Score</p>
                <p className="text-lg font-medium">{graphStats.avgRiskScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High Risk Entities</p>
                <p className="text-lg font-medium">
                  {graphStats.highRiskCount} ({graphStats.highRiskPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>

            <Separator className="my-2" />

            <div>
              <p className="text-xs text-muted-foreground mb-1">Entity Categories</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(graphStats.categories).map(([category, count]) => (
                  <Badge key={category} variant="outline">
                    {category}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
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
