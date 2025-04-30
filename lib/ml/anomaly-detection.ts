import type { Transaction } from "@/types/transaction"
import type { WalletData } from "@/types/wallet"

/**
 * Detects anomalies in transaction patterns using statistical methods
 */
export async function detectAnomalies(
  walletAddress: string,
  transactions: Transaction[],
  historicalData?: WalletData,
): Promise<{
  anomalies: Array<{
    type: string
    description: string
    severity: "low" | "medium" | "high"
    confidence: number
    relatedTransactions?: string[]
  }>
  anomalyScore: number
}> {
  // In a real implementation, this would use statistical methods or ML models
  // to detect anomalies in transaction patterns

  // For now, we'll implement a simple rule-based detection
  const anomalies = []
  let anomalyScore = 0

  // Check for unusually large transactions
  const amounts = transactions.map((tx) => tx.amount || 0)
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
  const largeThreshold = avgAmount * 5

  const largeTransactions = transactions.filter((tx) => (tx.amount || 0) > largeThreshold)

  if (largeTransactions.length > 0) {
    anomalies.push({
      type: "large_transaction",
      description: `${largeTransactions.length} unusually large transactions detected`,
      severity: largeTransactions.length > 3 ? "high" : "medium",
      confidence: 0.85,
      relatedTransactions: largeTransactions.map((tx) => tx.signature),
    })

    anomalyScore += largeTransactions.length * 5
  }

  // Check for unusual transaction frequency
  if (transactions.length > 0) {
    const timeSpan =
      Math.max(...transactions.map((tx) => new Date(tx.timestamp || Date.now()).getTime())) -
      Math.min(...transactions.map((tx) => new Date(tx.timestamp || Date.now()).getTime()))

    const txPerDay = transactions.length / (timeSpan / (24 * 60 * 60 * 1000)) || 0

    // If historical data is available, compare with average
    if (historicalData?.averageTransactionsPerDay && txPerDay > historicalData.averageTransactionsPerDay * 3) {
      anomalies.push({
        type: "high_frequency",
        description: "Unusually high transaction frequency",
        severity: "medium",
        confidence: 0.75,
      })

      anomalyScore += 15
    }
  }

  // Normalize anomaly score to 0-100 range
  anomalyScore = Math.min(100, anomalyScore)

  return {
    anomalies,
    anomalyScore,
  }
}

/**
 * Classifies transaction patterns into different categories based on behavior analysis
 */
export async function classifyTransactionPatterns(
  transactions: Transaction[],
  walletData?: WalletData,
): Promise<{
  patterns: Array<{
    type: string
    description: string
    frequency: number
    confidence: number
    examples: string[]
  }>
  dominantPattern: string
}> {
  // Initialize patterns array
  const patterns: Array<{
    type: string
    description: string
    frequency: number
    confidence: number
    examples: string[]
  }> = []

  // Skip if no transactions
  if (!transactions || transactions.length === 0) {
    return {
      patterns: [],
      dominantPattern: "unknown",
    }
  }

  // Analyze transaction timing patterns
  const timestamps = transactions
    .filter((tx) => tx.timestamp)
    .map((tx) => new Date(tx.timestamp || Date.now()).getTime())

  // Sort timestamps
  timestamps.sort((a, b) => a - b)

  // Calculate time differences between consecutive transactions
  const timeDiffs: number[] = []
  for (let i = 1; i < timestamps.length; i++) {
    timeDiffs.push(timestamps[i] - timestamps[i - 1])
  }

  // Check for regular intervals (potential automated transactions)
  if (timeDiffs.length >= 3) {
    const avgDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length
    const stdDev = Math.sqrt(timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / timeDiffs.length)

    const regularityCoefficient = stdDev / avgDiff

    if (regularityCoefficient < 0.2 && timeDiffs.length >= 5) {
      patterns.push({
        type: "automated_regular",
        description: "Regular automated transactions at fixed intervals",
        frequency: timeDiffs.length / transactions.length,
        confidence: 0.9,
        examples: transactions.slice(0, 3).map((tx) => tx.signature || ""),
      })
    }
  }

  // Check for trading patterns
  const tradingTransactions = transactions.filter(
    (tx) =>
      tx.type === "swap" || tx.type === "trade" || (tx.description && /swap|trade|exchange/i.test(tx.description)),
  )

  if (tradingTransactions.length > transactions.length * 0.4) {
    patterns.push({
      type: "trading",
      description: "Frequent trading activity",
      frequency: tradingTransactions.length / transactions.length,
      confidence: 0.85,
      examples: tradingTransactions.slice(0, 3).map((tx) => tx.signature || ""),
    })
  }

  // Check for large transfers
  const amounts = transactions.filter((tx) => tx.amount !== undefined && tx.amount !== null).map((tx) => tx.amount || 0)

  if (amounts.length > 0) {
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const largeTransfers = transactions.filter((tx) => (tx.amount || 0) > avgAmount * 3)

    if (largeTransfers.length > 0) {
      patterns.push({
        type: "large_transfers",
        description: "Pattern of large value transfers",
        frequency: largeTransfers.length / transactions.length,
        confidence: 0.8,
        examples: largeTransfers.slice(0, 3).map((tx) => tx.signature || ""),
      })
    }
  }

  // Check for multi-hop transactions (potential mixing)
  const multiHopTxs = transactions.filter(
    (tx) => (tx.hops && tx.hops > 2) || (tx.description && /multi|hop|mixing/i.test(tx.description)),
  )

  if (multiHopTxs.length > 0) {
    patterns.push({
      type: "multi_hop",
      description: "Multi-hop transactions potentially indicating mixing activity",
      frequency: multiHopTxs.length / transactions.length,
      confidence: 0.75,
      examples: multiHopTxs.slice(0, 3).map((tx) => tx.signature || ""),
    })
  }

  // Determine dominant pattern
  let dominantPattern = "normal"
  if (patterns.length > 0) {
    // Sort by frequency * confidence
    patterns.sort((a, b) => b.frequency * b.confidence - a.frequency * a.confidence)
    dominantPattern = patterns[0].type
  }

  return {
    patterns,
    dominantPattern,
  }
}
