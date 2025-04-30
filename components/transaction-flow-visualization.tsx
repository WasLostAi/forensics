"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"

// Define custom node types
const nodeTypes = {
  walletNode: WalletNode,
}

interface TransactionFlowVisualizationProps {
  nodes: {
    id: string
    label?: string
    group?: number
    value?: number
  }[]
  links: {
    source: string
    target: string
    value: number
    timestamp?: string
  }[]
  onNodeClick?: (nodeId: string) => void
  isLoading?: boolean
}

export function TransactionFlowVisualization({
  nodes,
  links,
  onNodeClick,
  isLoading = false,
}: TransactionFlowVisualizationProps) {
  const [valueThreshold, setValueThreshold] = useState(0)
  const [maxLinkValue, setMaxLinkValue] = useState(0)
  const [visibleNodeCount, setVisibleNodeCount] = useState(0)
  const [visibleEdgeCount, setVisibleEdgeCount] = useState(0)
  const [isLayouting, setIsLayouting] = useState(false)

  // Calculate max link value for filtering
  useEffect(() => {
    if (links && links.length > 0) {
      const max = Math.max(...links.map((link) => link.value || 0))
      setMaxLinkValue(max)
    }
  }, [links])

  // Filter nodes and links based on threshold
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!nodes || !links || nodes.length === 0 || links.length === 0) {
      return { filteredNodes: [], filteredEdges: [] }
    }

    // Filter links by value threshold
    const visibleLinks = links.filter((link) => (link.value || 0) >= valueThreshold)

    // Get unique node IDs from filtered links
    const nodeIds = new Set<string>()
    visibleLinks.forEach((link) => {
      nodeIds.add(link.source)
      nodeIds.add(link.target)
    })

    // Filter nodes to only include those in visible links
    const visibleNodes = nodes.filter((node) => nodeIds.has(node.id))

    // Update counts
    setVisibleNodeCount(visibleNodes.length)
    setVisibleEdgeCount(visibleLinks.length)

    return {
      filteredNodes: visibleNodes,
      filteredEdges: visibleLinks,
    }
  }, [nodes, links, valueThreshold])

  // Convert the data to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    return filteredNodes.map((node) => {
      // Determine node color based on group
      let color = "#9945FF" // Default Solana purple
      if (node.group === 1) {
        color = "#14F195" // Solana green for main wallet
      } else if (node.group === 2) {
        color = "#9945FF" // Solana purple for exchanges
      } else if (node.group === 3) {
        color = "#F5A623" // Orange for unknown wallets
      } else if (node.group === 4) {
        color = "#FF4A4A" // Red for mixers or high-risk wallets
      }

      return {
        id: node.id,
        type: "walletNode",
        position: { x: 0, y: 0 }, // Will be positioned by layout
        data: {
          label: node.label || node.id.substring(0, 6) + "...",
          value: node.value || 1,
          color,
          group: node.group || 0,
          address: node.id,
        },
      }
    })
  }, [filteredNodes])

  const initialEdges: Edge[] = useMemo(() => {
    return filteredEdges.map((link, index) => {
      // Calculate edge thickness based on value
      const value = link.value || 1
      const maxValue = Math.max(...filteredEdges.map((l) => l.value || 1))
      const minWidth = 1
      const maxWidth = 6
      const width = minWidth + (value / maxValue) * (maxWidth - minWidth)

      return {
        id: `e-${index}`,
        source: link.source,
        target: link.target,
        animated: true,
        style: {
          strokeWidth: width,
          stroke: "#9945FF80", // Semi-transparent Solana purple
        },
        label: `${link.value} SOL`,
        labelStyle: { fill: "#fff", fontWeight: 500 },
        labelBgStyle: { fill: "#1e1e2e", fillOpacity: 0.7 },
        data: {
          value: link.value,
          timestamp: link.timestamp,
        },
      }
    })
  }, [filteredEdges])

  // Use React Flow hooks to manage nodes and edges
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { fitView } = useReactFlow()

  // Apply force-directed layout
  const applyLayout = useCallback(() => {
    if (initialNodes.length === 0) return

    setIsLayouting(true)

    // Simple force-directed layout
    const centerX = 400
    const centerY = 300
    const radius = Math.min(200, 50 + initialNodes.length * 10)

    // Position nodes in a circle
    const angleStep = (2 * Math.PI) / initialNodes.length
    const newNodes = initialNodes.map((node, i) => {
      const angle = angleStep * i
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Place the main wallet (group 1) in the center
      if (node.data.group === 1) {
        return {
          ...node,
          position: { x: centerX, y: centerY },
        }
      }

      return {
        ...node,
        position: { x, y },
      }
    })

    setFlowNodes(newNodes)

    // Fit the view to show all nodes
    setTimeout(() => {
      fitView({ padding: 0.2 })
      setIsLayouting(false)
    }, 100)
  }, [initialNodes, setFlowNodes, fitView])

  // Apply layout when nodes change
  useEffect(() => {
    applyLayout()
  }, [applyLayout])

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id)
      }
    },
    [onNodeClick],
  )

  if (isLoading) {
    return (
      <div className="h-[600px] w-full rounded-md overflow-hidden border border-border bg-card/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading transaction flow data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {visibleNodeCount} Wallets
          </Badge>
          <Badge variant="outline" className="text-xs">
            {visibleEdgeCount} Transactions
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Min Value:</span>
            <Slider
              className="w-32"
              value={[valueThreshold]}
              min={0}
              max={maxLinkValue}
              step={0.1}
              onValueChange={(value) => setValueThreshold(value[0])}
            />
            <span className="text-xs font-mono w-12">{valueThreshold.toFixed(1)}</span>
          </div>

          <Button variant="outline" size="sm" onClick={applyLayout} disabled={isLayouting}>
            {isLayouting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Layout
          </Button>
        </div>
      </div>

      <div className="h-[600px] w-full rounded-md overflow-hidden border border-border bg-card/30">
        <ReactFlow
          nodes={flowNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#9945FF20" gap={16} />
          <Controls className="bg-background/80 border border-border rounded-md" />
          <MiniMap
            nodeColor={(node) => {
              return (node.data?.color || "#9945FF") + "80"
            }}
            maskColor="#00000040"
            className="bg-background/80 border border-border rounded-md"
          />
        </ReactFlow>
      </div>
    </div>
  )
}

// Custom node component
function WalletNode({ data }: NodeProps) {
  const { label, value, color, address } = data

  // Calculate node size based on value
  const minSize = 60
  const maxSize = 120
  const size = value ? minSize + Math.min(value, 100) / 2 : minSize

  return (
    <div
      className="relative flex items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
      style={{
        width: size,
        height: size,
        borderColor: color,
        boxShadow: `0 0 10px ${color}40`,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />
      <div className="flex flex-col items-center justify-center p-2 text-center">
        <div className="font-medium text-sm truncate max-w-[80%]">{label}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[80%]">
          {address.substring(0, 4)}...{address.substring(address.length - 4)}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  )
}
