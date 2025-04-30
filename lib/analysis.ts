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
 * Analyzes the funding sources for a wallet
 */
export function analyzeFundingSources(flowData: TransactionFlowData, walletAddress: string) {
  // Extract incoming transactions to the wallet
  const incomingTransactions = flowData.links.filter((link) => link.target === walletAddress)

  if (incomingTransactions.length === 0) {
    return {
      sources: [],
      totalIncoming: 0,
      largestSource: null,
    }
  }

  // Group by source address
  const sourceMap = new Map()
  let totalIncoming = 0

  for (const tx of incomingTransactions) {
    totalIncoming += tx.value

    if (!sourceMap.has(tx.source)) {
      // Find node info for this source
      const nodeInfo = flowData.nodes.find((node) => node.id === tx.source)

      sourceMap.set(tx.source, {
        address: tx.source,
        label: nodeInfo?.label || "Unknown Wallet",
        amount: tx.value,
        transactions: [tx],
        isHighRisk: nodeInfo?.group === 4, // Assuming group 4 is high risk
      })
    } else {
      const source = sourceMap.get(tx.source)
      source.amount += tx.value
      source.transactions.push(tx)
    }
  }

  // Convert to array and calculate percentages
  const sources = Array.from(sourceMap.values()).map((source) => ({
    ...source,
    percentage: (source.amount / totalIncoming) * 100,
  }))

  // Sort by amount (descending)
  sources.sort((a, b) => b.amount - a.amount)

  return {
    sources,
    totalIncoming,
    largestSource: sources[0] || null,
  }
}

/**
 * Identifies clusters of related transactions
 */
export function identifyTransactionClusters(flowData: TransactionFlowData) {
  // This is a simplified implementation
  // A real implementation would use more sophisticated clustering algorithms

  const clusters = []

  // 1. Look for circular patterns (A -> B -> C -> A)
  const circularPatterns = findCircularPatterns(flowData)
  if (circularPatterns.length > 0) {
    clusters.push({
      id: "cluster1",
      name: "Circular Transactions",
      type: "circular-pattern",
      wallets: circularPatterns[0].wallets,
      transactions: circularPatterns[0].transactions.length,
      volume: circularPatterns[0].totalValue,
      timeframe: getTimeframeString(circularPatterns[0].startTime, circularPatterns[0].endTime),
      risk: "high",
    })
  }

  // 2. Look for time-based clusters (multiple transactions in short time)
  const timeBasedClusters = findTimeBasedClusters(flowData)
  if (timeBasedClusters.length > 0) {
    clusters.push({
      id: "cluster2",
      name: "Rapid Succession Transactions",
      type: "time-based",
      wallets: timeBasedClusters[0].wallets,
      transactions: timeBasedClusters[0].transactions.length,
      volume: timeBasedClusters[0].totalValue,
      timeframe: getTimeframeString(timeBasedClusters[0].startTime, timeBasedClusters[0].endTime),
      risk: "medium",
    })
  }

  // 3. Look for value-based clusters (similar transaction amounts)
  const valueBasedClusters = findValueBasedClusters(flowData)
  if (valueBasedClusters.length > 0) {
    clusters.push({
      id: "cluster3",
      name: "Similar Value Transfers",
      type: "value-based",
      wallets: valueBasedClusters[0].wallets,
      transactions: valueBasedClusters[0].transactions.length,
      volume: valueBasedClusters[0].totalValue,
      timeframe: getTimeframeString(valueBasedClusters[0].startTime, valueBasedClusters[0].endTime),
      risk: "low",
    })
  }

  return clusters
}

// Helper function to find circular transaction patterns
function findCircularPatterns(flowData: TransactionFlowData) {
  const patterns = []

  // This is a simplified implementation
  // A real implementation would use graph algorithms to detect cycles

  // For now, just check if there are any A -> B -> A patterns
  const walletMap = new Map()

  for (const link of flowData.links) {
    const key = `${link.source}-${link.target}`
    walletMap.set(key, link)

    // Check if there's a reverse link
    const reverseKey = `${link.target}-${link.source}`
    if (walletMap.has(reverseKey)) {
      // Found a circular pattern
      const wallets = [link.source, link.target]
      const transactions = [link, walletMap.get(reverseKey)]
      const totalValue = transactions.reduce((sum, tx) => sum + tx.value, 0)

      // Get timeframe
      const timestamps = transactions.map((tx) => new Date(tx.timestamp).getTime())
      const startTime = new Date(Math.min(...timestamps))
      const endTime = new Date(Math.max(...timestamps))

      patterns.push({
        wallets,
        transactions,
        totalValue,
        startTime,
        endTime,
      })
    }
  }

  return patterns
}

// Helper function to find time-based clusters
function findTimeBasedClusters(flowData: TransactionFlowData) {
  const clusters = []

  // Sort transactions by timestamp
  const sortedLinks = [...flowData.links].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  if (sortedLinks.length < 3) return clusters

  // Look for transactions that happen within a short time window (1 hour)
  const timeWindow = 60 * 60 * 1000 // 1 hour in milliseconds
  let currentCluster = {
    wallets: new Set<string>(),
    transactions: [sortedLinks[0]],
    totalValue: sortedLinks[0].value,
    startTime: new Date(sortedLinks[0].timestamp),
    endTime: new Date(sortedLinks[0].timestamp),
  }

  currentCluster.wallets.add(sortedLinks[0].source)
  currentCluster.wallets.add(sortedLinks[0].target)

  for (let i = 1; i < sortedLinks.length; i++) {
    const currentTx = sortedLinks[i]
    const currentTime = new Date(currentTx.timestamp).getTime()
    const clusterEndTime = currentCluster.endTime.getTime()

    if (currentTime - clusterEndTime <= timeWindow) {
      // Add to current cluster
      currentCluster.transactions.push(currentTx)
      currentCluster.totalValue += currentTx.value
      currentCluster.endTime = new Date(currentTx.timestamp)
      currentCluster.wallets.add(currentTx.source)
      currentCluster.wallets.add(currentTx.target)
    } else {
      // If current cluster has at least 3 transactions, save it
      if (currentCluster.transactions.length >= 3) {
        clusters.push({
          wallets: Array.from(currentCluster.wallets),
          transactions: currentCluster.transactions,
          totalValue: currentCluster.totalValue,
          startTime: currentCluster.startTime,
          endTime: currentCluster.endTime,
        })
      }

      // Start a new cluster
      currentCluster = {
        wallets: new Set<string>([currentTx.source, currentTx.target]),
        transactions: [currentTx],
        totalValue: currentTx.value,
        startTime: new Date(currentTx.timestamp),
        endTime: new Date(currentTx.timestamp),
      }
    }
  }

  // Check the last cluster
  if (currentCluster.transactions.length >= 3) {
    clusters.push({
      wallets: Array.from(currentCluster.wallets),
      transactions: currentCluster.transactions,
      totalValue: currentCluster.totalValue,
      startTime: currentCluster.startTime,
      endTime: currentCluster.endTime,
    })
  }

  return clusters
}

// Helper function to find value-based clusters
function findValueBasedClusters(flowData: TransactionFlowData) {
  const clusters = []

  // Group transactions by similar values (within 10% of each other)
  const valueGroups = new Map()

  for (const link of flowData.links) {
    let foundGroup = false

    for (const [groupValue, group] of valueGroups.entries()) {
      // Check if this transaction is within 10% of the group value
      if (Math.abs(link.value - groupValue) / groupValue <= 0.1) {
        group.transactions.push(link)
        group.totalValue += link.value
        group.wallets.add(link.source)
        group.wallets.add(link.target)

        // Update timeframe
        const txTime = new Date(link.timestamp)
        if (txTime < group.startTime) group.startTime = txTime
        if (txTime > group.endTime) group.endTime = txTime

        foundGroup = true
        break
      }
    }

    if (!foundGroup) {
      // Create a new group
      valueGroups.set(link.value, {
        wallets: new Set<string>([link.source, link.target]),
        transactions: [link],
        totalValue: link.value,
        startTime: new Date(link.timestamp),
        endTime: new Date(link.timestamp),
      })
    }
  }

  // Convert groups to clusters (only if they have at least 3 transactions)
  for (const group of valueGroups.values()) {
    if (group.transactions.length >= 3) {
      clusters.push({
        wallets: Array.from(group.wallets),
        transactions: group.transactions,
        totalValue: group.totalValue,
        startTime: group.startTime,
        endTime: group.endTime,
      })
    }
  }

  return clusters
}

// Helper function to format timeframe string
function getTimeframeString(startTime: Date, endTime: Date): string {
  const startStr = startTime.toISOString().split("T")[0]
  const endStr = endTime.toISOString().split("T")[0]

  if (startStr === endStr) {
    return startStr
  }

  return `${startStr} to ${endStr}`
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
  const circularPatterns = findCircularPatternsOld(graph)

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
function findCircularPatternsOld(graph: Map<string, string[]>): string[][] {
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
