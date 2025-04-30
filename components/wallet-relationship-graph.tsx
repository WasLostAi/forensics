"use client"

import type Link from "next/link"
import * as d3 from "d3"

export interface WalletNode {
  id: string
  address: string
  label?: string
  type: "ico" | "investor" | "team" | "exchange" | "unknown" | "suspicious"
  balance: number
  riskScore?: number
  transactionCount: number
}

export interface WalletLink {
  source: string
  target: string
  type: "funding" | "withdrawal" | "transfer" | "contract" | "other"
  value: number
  timestamp: number
  count: number
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface WalletRelationshipGraphProps {
  icoAddress: string
  className?: string
}

function renderGraph(
  graphData: GraphData,
  svgElement: SVGSVGElement,
  setSelectedNode: (node: Node | null) => void,
  filterType: string,
) {
  const svg = d3.select(svgElement)
  svg.selectAll("*").remove() // Clear previous graph

  const width = svgElement.clientWidth
  const height = svgElement.clientHeight

  const nodes = graphData.nodes
  const links = graphData.links.filter((link) => {
    if (filterType === "all") return true
    if (filterType === "funding" && link.type === "funding") return true
    if (filterType === "withdrawal" && link.type === "withdrawal") return true
    if (filterType === "suspicious" && link.type === "other") return true
    if (filterType === "high-value" && link.value > 1000) return true
    return false
  })

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink<Node, Link>(links)
        .id((d: any) => d.id)
        .distance(100),
    )
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))

  const drag = (simulation: any) => {
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any
  }

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d: any) => Math.sqrt(d.value) / 5)

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d: any) => Math.sqrt(d.value) + 6)
    .attr("fill", (d: any) => {
      switch (d.type) {
        case "ico":
          return "#14F195"
        case "investor":
          return "#3b82f6"
        case "team":
          return "#9333ea"
        case "exchange":
          return "#f59e0b"
        case "suspicious":
          return "#ef4444"
        default:
          return "#6b7280"
      }
    })
    .call(drag(simulation))
    .on("click", (event: any, d: any) => {
      setSelectedNode(d)
    })

  node.append("title").text((d: any) => d.label || d.address)

  simulation.on("tick", () => {
    link
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y)

    node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)
  })

  svg.call(
    d3.zoom().on("zoom", (event: any) => {
      node.attr("transform", event.transform)
      link.attr("transform", event.transform)
    }),
  )
}

function generateMockGraphData(icoAddress: string): GraphData {
  const nodes: Node[] = [
    {
      id: icoAddress,
      address: icoAddress,
      label: "ICO Project",
      type: "ico",
      value: 5000,
      riskScore: 25,
      transactionCount: 120,
    },
    {
      id: "investor1",
      address: "investor1",
      label: "Whale Investor",
      type: "investor",
      value: 2000,
      riskScore: 10,
      transactionCount: 50,
    },
    {
      id: "team1",
      address: "team1",
      label: "Team Wallet",
      type: "team",
      value: 1000,
      riskScore: 5,
      transactionCount: 30,
    },
    {
      id: "exchange1",
      address: "exchange1",
      label: "Binance",
      type: "exchange",
      value: 3000,
      riskScore: 15,
      transactionCount: 80,
    },
    {
      id: "mixer1",
      address: "mixer1",
      label: "Tornado Cash",
      type: "suspicious",
      value: 500,
      riskScore: 80,
      transactionCount: 10,
    },
  ]

  const links: Link[] = [
    {
      source: icoAddress,
      target: "investor1",
      type: "funding",
      value: 1500,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
      count: 5,
    },
    {
      source: icoAddress,
      target: "team1",
      type: "withdrawal",
      value: 500,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      count: 2,
    },
    {
      source: icoAddress,
      target: "exchange1",
      type: "transfer",
      value: 2000,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1,
      count: 8,
    },
    {
      source: icoAddress,
      target: "mixer1",
      type: "other",
      value: 100,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
      count: 1,
    },
  ]

  return { nodes, links }
}

function getNodeTypeBadgeVariant(type: string) {
  switch (type) {
    case "ico":
      return "default"
    case "investor":
      return "secondary"
    case "team":
      return "outline"
    case "exchange":
      return "ghost"
    case "suspicious":
      return "destructive"
    default:
      return "outline"
  }
}

function getRiskBadgeVariant(score: number) {
  if (score >= 75) {
    return "destructive"
  } else if (score >= 40) {
    return "warning"
  } else {
    return "outline"
  }
}

function formatValue(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export { WalletRelationshipGraph }
export type { WalletNode, WalletLink }
