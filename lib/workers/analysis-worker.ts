// This is a web worker for heavy computations
// It will run in a separate thread to avoid blocking the main thread

import type { TransactionFlowData } from "@/types/transaction"

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data

  switch (type) {
    case "analyze_transaction_flow":
      const result = analyzeTransactionFlow(data)
      self.postMessage({ type: "analysis_result", data: result })
      break

    case "identify_clusters":
      const clusters = identifyTransactionClusters(data)
      self.postMessage({ type: "clusters_result", data: clusters })
      break

    case "calculate_risk_score":
      const riskScore = calculateRiskScore(data)
      self.postMessage({ type: "risk_score_result", data: riskScore })
      break

    default:
      self.postMessage({ type: "error", message: "Unknown command" })
  }
})

// Heavy computation functions
function analyzeTransactionFlow(flowData: TransactionFlowData) {
  // Perform complex analysis on the transaction flow data
  // This could include graph algorithms, pattern detection, etc.

  // For demonstration, we'll just do some basic analysis
  const nodeCount = flowData.nodes.length
  const linkCount = flowData.links.length

  // Calculate total transaction volume
  const totalVolume = flowData.links.reduce((sum, link) => sum + (link.value || 0), 0)

  // Identify high-value transactions (top 10%)
  const sortedLinks = [...flowData.links].sort((a, b) => (b.value || 0) - (a.value || 0))
  const highValueThreshold = sortedLinks[Math.floor(sortedLinks.length * 0.1)]?.value || 0
  const highValueTransactions = sortedLinks.filter((link) => (link.value || 0) >= highValueThreshold)

  // Identify central nodes (those with most connections)
  const nodeDegrees = new Map<string, number>()
  for (const link of flowData.links) {
    nodeDegrees.set(link.source, (nodeDegrees.get(link.source) || 0) + 1)
    nodeDegrees.set(link.target, (nodeDegrees.get(link.target) || 0) + 1)
  }

  const centralNodes = Array.from(nodeDegrees.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => flowData.nodes.find((node) => node.id === id))
    .filter(Boolean)

  return {
    nodeCount,
    linkCount,
    totalVolume,
    highValueTransactions,
    centralNodes,
    processingTime: new Date().toISOString(),
  }
}

function identifyTransactionClusters(flowData: TransactionFlowData) {
  // This would implement sophisticated clustering algorithms
  // For demonstration, we'll just do basic clustering

  // Group transactions by date (simplified)
  const dateGroups = new Map<string, any[]>()

  for (const link of flowData.links) {
    if (!link.timestamp) continue

    const date = link.timestamp.split("T")[0]
    if (!dateGroups.has(date)) {
      dateGroups.set(date, [])
    }
    dateGroups.get(date)!.push(link)
  }

  // Convert to clusters
  const clusters = Array.from(dateGroups.entries()).map(([date, links], index) => {
    // Get all unique wallet addresses in this cluster
    const wallets = new Set<string>()
    links.forEach((link) => {
      wallets.add(link.source)
      wallets.add(link.target)
    })

    // Calculate total value
    const totalValue = links.reduce((sum, link) => sum + (link.value || 0), 0)

    return {
      id: `cluster-${index}`,
      name: `Transactions on ${date}`,
      type: "temporal",
      transactions: links.length,
      wallets: Array.from(wallets),
      totalValue,
      risk: totalValue > 100 ? "high" : totalValue > 50 ? "medium" : "low",
    }
  })

  return clusters
}

function calculateRiskScore(data: any) {
  // This would implement sophisticated risk scoring algorithms
  // For demonstration, we'll just do basic scoring

  const { walletData, flowData } = data

  // Base score
  let score = 50

  // Adjust based on transaction volume
  if (walletData.transactionCount > 1000) score += 10
  if (walletData.transactionCount > 100) score += 5

  // Adjust based on wallet age
  const firstActivity = new Date(walletData.firstActivity)
  const now = new Date()
  const ageInDays = (now.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24)

  if (ageInDays < 7) score += 15 // New wallets are higher risk
  if (ageInDays > 365) score -= 10 // Old wallets are lower risk

  // Adjust based on connections to high-risk wallets
  const highRiskConnections = flowData.nodes.filter((node) => node.group === 4).length
  score += highRiskConnections * 5

  // Cap score between 0-100
  return Math.max(0, Math.min(100, score))
}
