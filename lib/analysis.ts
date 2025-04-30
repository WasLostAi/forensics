import type { TransactionFlowData } from "@/types/transaction"

/**
 * Identifies critical paths in transaction flow data
 * Critical paths are high-value transactions or suspicious patterns
 */
export function identifyCriticalPaths(data: TransactionFlowData, criticalThreshold = 5): TransactionFlowData {
  if (!data || !data.nodes || !data.links) {
    return data
  }

  // Clone the data to avoid mutating the original
  const processedData = {
    nodes: [...data.nodes],
    links: [...data.links],
  }

  // Calculate average transaction value
  const totalValue = processedData.links.reduce((sum, link) => sum + link.value, 0)
  const avgValue = totalValue / processedData.links.length || 0

  // Standard deviation calculation
  const squaredDiffs = processedData.links.map((link) => Math.pow(link.value - avgValue, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length
  const stdDev = Math.sqrt(avgSquaredDiff)

  // Identify high-risk wallets (those involved in many high-value transactions)
  const walletRiskScores = new Map<string, number>()

  // Process links to identify critical and unusual paths
  processedData.links = processedData.links.map((link) => {
    // Mark as critical if value exceeds threshold
    const isCritical = link.value >= criticalThreshold

    // Mark as unusual if value is more than 2 standard deviations above average
    const isUnusual = !isCritical && link.value > avgValue + 2 * stdDev

    // Update risk scores for wallets involved in critical transactions
    if (isCritical) {
      const sourceScore = walletRiskScores.get(link.source) || 0
      walletRiskScores.set(link.source, sourceScore + 1)

      const targetScore = walletRiskScores.get(link.target) || 0
      walletRiskScores.set(link.target, targetScore + 1)
    }

    return {
      ...link,
      isCritical,
      isUnusual,
    }
  })

  // Mark high-risk wallets (involved in multiple critical transactions)
  processedData.nodes = processedData.nodes.map((node) => {
    const riskScore = walletRiskScores.get(node.id) || 0
    const isHighRisk = riskScore >= 2 // Involved in 2+ critical transactions

    return {
      ...node,
      isHighRisk,
      riskScore,
    }
  })

  return processedData
}

/**
 * Analyzes transaction patterns to identify clusters
 */
export function identifyTransactionClusters(data: TransactionFlowData): any[] {
  if (!data || !data.nodes || !data.links || data.links.length === 0) {
    return []
  }

  const clusters = []

  // Time-based clustering
  const timeBasedClusters = identifyTimeBasedClusters(data.links)
  clusters.push(...timeBasedClusters)

  // Value-based clustering
  const valueBasedClusters = identifyValueBasedClusters(data.links)
  clusters.push(...valueBasedClusters)

  // Pattern-based clustering (e.g., circular transactions)
  const patternClusters = identifyPatternClusters(data)
  clusters.push(...patternClusters)

  return clusters
}

/**
 * Identifies clusters of transactions that occurred close together in time
 */
function identifyTimeBasedClusters(links: any[]): any[] {
  // Sort links by timestamp
  const sortedLinks = [...links].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const clusters = []
  let currentCluster = { transactions: [sortedLinks[0]], timeframe: "", wallets: new Set() }

  // Add source and target to wallets set
  currentCluster.wallets.add(sortedLinks[0].source)
  currentCluster.wallets.add(sortedLinks[0].target)

  // Time window for clustering (5 minutes in milliseconds)
  const timeWindow = 5 * 60 * 1000

  for (let i = 1; i < sortedLinks.length; i++) {
    const prevTime = new Date(sortedLinks[i - 1].timestamp).getTime()
    const currTime = new Date(sortedLinks[i].timestamp).getTime()

    if (currTime - prevTime <= timeWindow) {
      // Add to current cluster
      currentCluster.transactions.push(sortedLinks[i])
      currentCluster.wallets.add(sortedLinks[i].source)
      currentCluster.wallets.add(sortedLinks[i].target)
    } else {
      // Finalize current cluster if it has multiple transactions
      if (currentCluster.transactions.length > 1) {
        const startTime = new Date(currentCluster.transactions[0].timestamp)
        const endTime = new Date(currentCluster.transactions[currentCluster.transactions.length - 1].timestamp)

        currentCluster.timeframe = `${startTime.toLocaleString()} to ${endTime.toLocaleString()}`
        clusters.push({
          id: `time-cluster-${clusters.length}`,
          name: `Time-based Cluster ${clusters.length + 1}`,
          transactions: currentCluster.transactions,
          wallets: Array.from(currentCluster.wallets),
          timeframe: currentCluster.timeframe,
          type: "time-based",
          risk: currentCluster.transactions.some((tx) => tx.isCritical) ? "high" : "low",
        })
      }

      // Start a new cluster
      currentCluster = {
        transactions: [sortedLinks[i]],
        timeframe: "",
        wallets: new Set([sortedLinks[i].source, sortedLinks[i].target]),
      }
    }
  }

  // Check the last cluster
  if (currentCluster.transactions.length > 1) {
    const startTime = new Date(currentCluster.transactions[0].timestamp)
    const endTime = new Date(currentCluster.transactions[currentCluster.transactions.length - 1].timestamp)

    currentCluster.timeframe = `${startTime.toLocaleString()} to ${endTime.toLocaleString()}`
    clusters.push({
      id: `time-cluster-${clusters.length}`,
      name: `Time-based Cluster ${clusters.length + 1}`,
      transactions: currentCluster.transactions,
      wallets: Array.from(currentCluster.wallets),
      timeframe: currentCluster.timeframe,
      type: "time-based",
      risk: currentCluster.transactions.some((tx) => tx.isCritical) ? "high" : "low",
    })
  }

  return clusters
}

/**
 * Identifies clusters of transactions with similar values
 */
function identifyValueBasedClusters(links: any[]): any[] {
  // Sort links by value
  const sortedLinks = [...links].sort((a, b) => a.value - b.value)

  const clusters = []
  let currentCluster = { transactions: [sortedLinks[0]], wallets: new Set() }

  // Add source and target to wallets set
  currentCluster.wallets.add(sortedLinks[0].source)
  currentCluster.wallets.add(sortedLinks[0].target)

  // Value similarity threshold (10%)
  const valueSimilarityThreshold = 0.1

  for (let i = 1; i < sortedLinks.length; i++) {
    const prevValue = sortedLinks[i - 1].value
    const currValue = sortedLinks[i].value

    // Check if values are similar (within threshold percentage)
    if (Math.abs(currValue - prevValue) / prevValue <= valueSimilarityThreshold) {
      // Add to current cluster
      currentCluster.transactions.push(sortedLinks[i])
      currentCluster.wallets.add(sortedLinks[i].source)
      currentCluster.wallets.add(sortedLinks[i].target)
    } else {
      // Finalize current cluster if it has multiple transactions
      if (currentCluster.transactions.length > 1) {
        clusters.push({
          id: `value-cluster-${clusters.length}`,
          name: `Similar Value Cluster ${clusters.length + 1}`,
          transactions: currentCluster.transactions,
          wallets: Array.from(currentCluster.wallets),
          value: currentCluster.transactions[0].value.toFixed(2),
          type: "value-based",
          risk: "medium",
        })
      }

      // Start a new cluster
      currentCluster = {
        transactions: [sortedLinks[i]],
        wallets: new Set([sortedLinks[i].source, sortedLinks[i].target]),
      }
    }
  }

  // Check the last cluster
  if (currentCluster.transactions.length > 1) {
    clusters.push({
      id: `value-cluster-${clusters.length}`,
      name: `Similar Value Cluster ${clusters.length + 1}`,
      transactions: currentCluster.transactions,
      wallets: Array.from(currentCluster.wallets),
      value: currentCluster.transactions[0].value.toFixed(2),
      type: "value-based",
      risk: "medium",
    })
  }

  return clusters
}

/**
 * Identifies pattern-based clusters like circular transactions
 */
function identifyPatternClusters(data: TransactionFlowData): any[] {
  const clusters = []

  // Build a directed graph from the links
  const graph = new Map<string, string[]>()

  for (const link of data.links) {
    if (!graph.has(link.source)) {
      graph.set(link.source, [])
    }
    graph.get(link.source)!.push(link.target)
  }

  // Find circular patterns (A -> B -> C -> A)
  const circularPatterns = findCircularPatterns(graph)

  // Create clusters from circular patterns
  for (let i = 0; i < circularPatterns.length; i++) {
    const pattern = circularPatterns[i]

    // Find all transactions involved in this pattern
    const transactions = data.links.filter((link) => {
      for (let j = 0; j < pattern.length - 1; j++) {
        if (link.source === pattern[j] && link.target === pattern[j + 1]) {
          return true
        }
      }
      // Check the last link (back to the start)
      return link.source === pattern[pattern.length - 1] && link.target === pattern[0]
    })

    if (transactions.length > 0) {
      clusters.push({
        id: `pattern-cluster-${clusters.length}`,
        name: `Circular Transaction Pattern ${clusters.length + 1}`,
        transactions: transactions,
        wallets: pattern,
        type: "circular-pattern",
        risk: "high", // Circular patterns are often suspicious
      })
    }
  }

  return clusters
}

/**
 * Finds circular patterns in a directed graph
 */
function findCircularPatterns(graph: Map<string, string[]>): string[][] {
  const patterns: string[][] = []
  const visited = new Set<string>()

  // For each node, try to find cycles starting from it
  for (const [node, _] of graph) {
    if (!visited.has(node)) {
      const path: string[] = []
      dfs(node, node, path, visited, graph, patterns, 0)
    }
  }

  return patterns
}

/**
 * Depth-first search to find cycles in a graph
 */
function dfs(
  start: string,
  current: string,
  path: string[],
  visited: Set<string>,
  graph: Map<string, string[]>,
  patterns: string[][],
  depth: number,
): void {
  // Limit search depth to prevent stack overflow
  if (depth > 10) return

  path.push(current)
  visited.add(current)

  const neighbors = graph.get(current) || []

  for (const neighbor of neighbors) {
    if (neighbor === start && path.length > 2) {
      // Found a cycle
      patterns.push([...path])
    } else if (!visited.has(neighbor)) {
      dfs(start, neighbor, [...path], visited, graph, patterns, depth + 1)
    }
  }
}

/**
 * Analyzes the funding sources for a wallet
 */
export function analyzeFundingSources(data: TransactionFlowData, walletAddress: string): any {
  if (!data || !data.links || data.links.length === 0) {
    return {
      sources: [],
      totalIncoming: 0,
      largestSource: null,
    }
  }

  // Get all incoming transactions to the wallet
  const incomingTransactions = data.links.filter((link) => link.target === walletAddress)

  // Group by source
  const sourceMap = new Map<string, number>()

  for (const tx of incomingTransactions) {
    const currentAmount = sourceMap.get(tx.source) || 0
    sourceMap.set(tx.source, currentAmount + tx.value)
  }

  // Convert to array and sort by amount
  const sources = Array.from(sourceMap.entries())
    .map(([address, amount]) => {
      // Find node info for this address
      const nodeInfo = data.nodes.find((node) => node.id === address) || { label: address }

      return {
        address,
        label: nodeInfo.label || address,
        amount,
        percentage: 0, // Will calculate after getting total
        isHighRisk: nodeInfo.isHighRisk || false,
      }
    })
    .sort((a, b) => b.amount - a.amount)

  // Calculate total and percentages
  const totalIncoming = sources.reduce((sum, source) => sum + source.amount, 0)

  sources.forEach((source) => {
    source.percentage = totalIncoming > 0 ? (source.amount / totalIncoming) * 100 : 0
  })

  return {
    sources,
    totalIncoming,
    largestSource: sources.length > 0 ? sources[0] : null,
  }
}
