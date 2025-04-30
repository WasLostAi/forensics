"use client"

import type React from "react"

import { useCallback, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"

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
}

export function TransactionFlowVisualization({ nodes, links, onNodeClick }: TransactionFlowVisualizationProps) {
  // Convert the data to React Flow format
  const initialNodes = nodes.map((node) => {
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

  const initialEdges = links.map((link, index) => {
    // Calculate edge thickness based on value
    const value = link.value || 1
    const maxValue = Math.max(...links.map((l) => l.value || 1))
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

  // Use React Flow hooks to manage nodes and edges
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { fitView } = useReactFlow()

  // Apply force-directed layout
  useEffect(() => {
    // Simple force-directed layout
    const centerX = 400
    const centerY = 300
    const radius = 200

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
    }, 100)
  }, [initialNodes, setFlowNodes, fitView])

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      if (onNodeClick) {
        onNodeClick(node.id)
      }
    },
    [onNodeClick],
  )

  return (
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
  )
}

// Custom node component
function WalletNode({ data }: any) {
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
