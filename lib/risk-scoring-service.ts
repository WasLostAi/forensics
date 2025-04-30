import type { Transaction } from "@/types/transaction"
import type { WalletData } from "@/types/wallet"
import type { RiskScore, RiskFactor, RiskMetrics } from "@/types/risk"
import { fetchEntityLabels } from "@/lib/api"
import { detectAnomalies } from "@/lib/ml/anomaly-detection"
import { classifyEntity } from "@/lib/ml/entity-classification"
import { classifyTransactionPatterns } from "@/lib/ml/anomaly-detection"
import { predictRiskTrend } from "./ml/risk-prediction"
import { getEntityByAddress } from "./entity-service"

// Define the TransactionFlowData type
interface TransactionFlowData {
  links: any[] // Replace 'any' with a more specific type if possible
}

// Define the TransactionRiskScore type
interface TransactionRiskScore {
  id: string
  score: number
  level: "low" | "medium" | "high"
  factors: RiskFactor[]
  timestamp: string
  confidence: number
}

/**
 * Enhanced service for calculating risk scores for wallets and transactions
 * with AI/ML capabilities for more accurate risk assessment
 */
export class RiskScoringService {
  // Risk factor weights (out of 100)
  private static RISK_WEIGHTS = {
    // Wallet risk factors
    TRANSACTION_VELOCITY: 15,
    HIGH_RISK_CONNECTIONS: 20,
    MIXER_CONNECTIONS: 25,
    CIRCULAR_PATTERNS: 15,
    UNUSUAL_AMOUNTS: 10,
    UNUSUAL_TIMING: 10,
    NEW_WALLET: 5,
    ANOMALY_PATTERNS: 20,
    ENTITY_REPUTATION: 15,

    // Transaction risk factors
    LARGE_AMOUNT: 20,
    UNUSUAL_HOUR: 10,
    ROUND_NUMBER: 15,
    KNOWN_PATTERN: 25,
    MULTI_HOP: 15,
    PRIVACY_TOOL: 15,
    ML_ANOMALY_SCORE: 25,
  }

  // Known high-risk entity types
  private static HIGH_RISK_ENTITY_TYPES = [
    "mixer",
    "darknet_market",
    "scam",
    "ransomware",
    "sanctioned",
    "high_risk_exchange",
    "gambling",
    "phishing",
    "ponzi_scheme",
  ]

  // Known privacy tools
  private static PRIVACY_TOOLS = [
    "tornado_cash",
    "wasabi_wallet",
    "samourai_wallet",
    "coinjoin",
    "solana_mixer",
    "monero_bridge",
    "zcash_bridge",
  ]

  /**
   * Calculate a comprehensive risk score for a wallet with ML-enhanced analysis
   */
  public static async calculateWalletRiskScore(
    walletAddress: string,
    walletData: WalletData,
    flowData: TransactionFlowData,
  ): Promise<RiskScore> {
    // Base risk factors
    const factors: RiskFactor[] = []
    let totalScore = 0

    // Get entity information if available
    const entity = await getEntityByAddress(walletAddress)

    // Calculate transaction metrics
    const txMetrics = this.calculateTransactionMetrics(flowData.links as Transaction[])

    // Check for high-value transactions
    if (txMetrics.highValueCount > 0) {
      const impact = Math.min(25, txMetrics.highValueCount * 5)
      factors.push({
        name: "High-value transactions",
        description: `${txMetrics.highValueCount} transactions with unusually high value`,
        impact,
        score: Math.min(100, impact * 3),
        details: txMetrics.highValueTxIds.slice(0, 5),
        confidence: 0.95,
      })
      totalScore += impact
    }

    // Check for suspicious counterparties
    if (txMetrics.suspiciousCounterparties.length > 0) {
      const impact = Math.min(30, txMetrics.suspiciousCounterparties.length * 10)
      factors.push({
        name: "Suspicious counterparties",
        description: `Transactions with ${txMetrics.suspiciousCounterparties.length} flagged addresses`,
        impact,
        score: Math.min(100, impact * 3),
        details: txMetrics.suspiciousCounterparties.slice(0, 5),
        confidence: 0.85,
      })
      totalScore += impact
    }

    // Check transaction velocity
    if (txMetrics.velocityScore > 0) {
      factors.push({
        name: "High transaction velocity",
        description: "Unusual number of transactions in a short time period",
        impact: txMetrics.velocityScore,
        score: txMetrics.velocityScore * 2,
        confidence: 0.8,
      })
      totalScore += txMetrics.velocityScore
    }

    // Check for mixer usage patterns
    if (txMetrics.mixerPatternScore > 0) {
      factors.push({
        name: "Potential mixer usage",
        description: "Transaction patterns consistent with mixer services",
        impact: txMetrics.mixerPatternScore,
        score: txMetrics.mixerPatternScore * 3,
        confidence: 0.75,
      })
      totalScore += txMetrics.mixerPatternScore
    }

    // Apply entity-based risk if available
    if (entity) {
      // Classify the entity using ML
      const classification = await classifyEntity(
        entity,
        flowData.links.length,
        txMetrics.avgValue,
        txMetrics.uniqueCounterparties.size,
      )

      if (classification.riskLevel === "high") {
        factors.push({
          name: `High-risk ${classification.classification}`,
          description: `Entity classified as ${classification.classification} with high risk`,
          impact: 25,
          score: 85,
          details: classification.tags,
          confidence: classification.confidence,
        })
        totalScore += 25
      } else if (classification.riskLevel === "medium") {
        factors.push({
          name: `Medium-risk ${classification.classification}`,
          description: `Entity classified as ${classification.classification} with medium risk`,
          impact: 15,
          score: 60,
          details: classification.tags,
          confidence: classification.confidence,
        })
        totalScore += 15
      }
    }

    // Detect anomalies using ML
    const { anomalies, anomalyScore } = await detectAnomalies(walletAddress, flowData.links as Transaction[])

    // Add anomaly-based risk factors
    if (anomalies.length > 0) {
      anomalies.forEach((anomaly) => {
        const impact = anomaly.severity === "high" ? 20 : anomaly.severity === "medium" ? 12 : 5

        factors.push({
          name: `Anomaly: ${anomaly.type.replace("_", " ")}`,
          description: anomaly.description,
          impact,
          score: anomaly.severity === "high" ? 85 : anomaly.severity === "medium" ? 60 : 30,
          details: anomaly.relatedTransactions,
          confidence: anomaly.confidence,
        })

        totalScore += impact
      })
    }

    // Normalize total score to 0-100 range
    totalScore = Math.min(100, totalScore)

    // Determine risk level
    const level = totalScore >= 70 ? "high" : totalScore >= 40 ? "medium" : "low"

    // Get risk trend prediction
    const prediction = await predictRiskTrend(
      walletAddress,
      { score: totalScore, level, factors },
      flowData.links as Transaction[],
    )

    // Calculate overall confidence
    const avgConfidence =
      factors.reduce((sum, factor) => sum + (factor.confidence || 0.7), 0) / Math.max(1, factors.length)

    const riskScore = {
      score: totalScore,
      level,
      factors: factors.sort((a, b) => b.impact - a.impact),
      trend: prediction.predictedTrend,
      trendDescription: prediction.description,
      trendPercentage: this.calculateTrendPercentage(prediction.predictedTrend),
      confidence: avgConfidence,
      predictedTrend: prediction.predictedTrend,
      predictionConfidence: prediction.confidence,
      anomalyDescription:
        anomalies.length > 0
          ? `${anomalies.length} anomalies detected in transaction patterns`
          : "No significant anomalies detected",
      anomalyScore,
      predictedFactors: prediction.predictedFactors,
    }

    return riskScore
  }

  /**
   * Calculate risk score for a specific transaction with ML enhancement
   */
  public static async calculateTransactionRiskScore(
    transactionId: string,
    transaction: any,
    flowData: TransactionFlowData,
  ): Promise<TransactionRiskScore> {
    // Initialize score and factors
    let totalScore = 0
    const factors: RiskFactor[] = []
    let confidenceScore = 0.8 // Default confidence score

    try {
      // Find the transaction in the flow data
      const tx = flowData.links.find((link) => link.id === transactionId || link.source + link.target === transactionId)
      if (!tx) {
        return {
          id: transactionId,
          score: 0,
          level: "low",
          factors: [],
          timestamp: new Date().toISOString(),
          confidence: 0,
        }
      }

      // Fetch entity labels for source and target
      const sourceEntityLabels = await fetchEntityLabels(tx.source)
      const targetEntityLabels = await fetchEntityLabels(tx.target)

      // 1. Large transaction amount
      const largeAmount = this.assessLargeAmount(tx.value)
      if (largeAmount > 0) {
        const amountImpact = Math.min(this.RISK_WEIGHTS.LARGE_AMOUNT, largeAmount)
        totalScore += amountImpact
        factors.push({
          name: "Large Amount",
          description: `Transaction amount (${tx.value} SOL) is unusually large`,
          impact: amountImpact,
          score: largeAmount,
          confidence: 0.9,
        })
      }

      // 2. Unusual hour
      const unusualHour = this.assessUnusualHour(tx.timestamp)
      if (unusualHour > 0) {
        totalScore += this.RISK_WEIGHTS.UNUSUAL_HOUR
        factors.push({
          name: "Unusual Hour",
          description: "Transaction occurred during unusual hours",
          impact: this.RISK_WEIGHTS.UNUSUAL_HOUR,
          score: unusualHour,
          confidence: 0.7,
        })
      }

      // 3. Round number amount
      const roundNumber = this.assessRoundNumber(tx.value)
      if (roundNumber) {
        totalScore += this.RISK_WEIGHTS.ROUND_NUMBER
        factors.push({
          name: "Round Number",
          description: "Transaction amount is a suspiciously round number",
          impact: this.RISK_WEIGHTS.ROUND_NUMBER,
          score: 100,
          confidence: 0.8,
        })
      }

      // 4. Part of known pattern
      const knownPattern = await this.assessKnownPattern(transactionId, flowData)
      if (knownPattern.found) {
        totalScore += this.RISK_WEIGHTS.KNOWN_PATTERN
        factors.push({
          name: "Known Pattern",
          description: `Part of a known suspicious pattern: ${knownPattern.patternType}`,
          impact: this.RISK_WEIGHTS.KNOWN_PATTERN,
          score: 100,
          confidence: 0.85,
        })
      }

      // 5. Multi-hop transaction
      const multiHop = this.assessMultiHop(transactionId, flowData)
      if (multiHop.isMultiHop) {
        const hopImpact = Math.min(this.RISK_WEIGHTS.MULTI_HOP, multiHop.hopCount * 5)
        totalScore += hopImpact
        factors.push({
          name: "Multi-Hop Transaction",
          description: `Part of a ${multiHop.hopCount}-hop transaction chain`,
          impact: hopImpact,
          score: multiHop.hopCount * 10,
          confidence: 0.8,
        })
      }

      // 6. Privacy tool usage
      const privacyTool = this.assessPrivacyToolUsage(sourceEntityLabels, targetEntityLabels)
      if (privacyTool.used) {
        totalScore += this.RISK_WEIGHTS.PRIVACY_TOOL
        factors.push({
          name: "Privacy Tool",
          description: `Transaction involves a known privacy tool: ${privacyTool.toolName}`,
          impact: this.RISK_WEIGHTS.PRIVACY_TOOL,
          score: 100,
          confidence: 0.9,
        })
      }

      // 7. ML-based anomaly detection (NEW)
      try {
        // Classify this specific transaction using ML
        const patternAnalysis = await classifyTransactionPatterns([tx])
        if (patternAnalysis.anomalyScore > 0) {
          const mlImpact = Math.min(this.RISK_WEIGHTS.ML_ANOMALY_SCORE, patternAnalysis.anomalyScore / 2)
          totalScore += mlImpact
          factors.push({
            name: "ML Anomaly Detection",
            description: `Transaction classified as ${patternAnalysis.classification} with ${(patternAnalysis.confidence * 100).toFixed(1)}% confidence`,
            impact: mlImpact,
            score: patternAnalysis.anomalyScore,
            confidence: patternAnalysis.confidence,
          })

          // Update overall confidence based on ML model confidence
          confidenceScore = (confidenceScore + patternAnalysis.confidence) / 2
        }
      } catch (error) {
        console.error("ML transaction classification failed:", error)
        // Continue without ML enhancement
      }

      // Sort factors by impact (highest first)
      factors.sort((a, b) => b.impact - a.impact)

      // Determine risk level
      let riskLevel: "low" | "medium" | "high" = "low"
      if (totalScore >= 70) {
        riskLevel = "high"
      } else if (totalScore >= 40) {
        riskLevel = "medium"
      }

      return {
        id: transactionId,
        score: totalScore,
        level: riskLevel,
        factors,
        timestamp: new Date().toISOString(),
        confidence: confidenceScore,
      }
    } catch (error) {
      console.error("Error in transaction risk scoring:", error)
      throw new Error(`Failed to calculate transaction risk score: ${error.message}`)
    }
  }

  /**
   * Get all addresses connected to the wallet
   */
  private static getConnectedAddresses(walletAddress: string, flowData: TransactionFlowData): string[] {
    const connectedAddresses = new Set<string>()

    flowData.links.forEach((link) => {
      if (link.source === walletAddress) {
        connectedAddresses.add(link.target)
      } else if (link.target === walletAddress) {
        connectedAddresses.add(link.source)
      }
    })

    return Array.from(connectedAddresses)
  }

  /**
   * Fetch entity labels for connected wallets
   */
  private static async fetchConnectedEntityLabels(addresses: string[]): Promise<Record<string, any[]>> {
    const entityLabels: Record<string, any[]> = {}

    // Fetch entity labels in batches to avoid too many concurrent requests
    const batchSize = 10
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      const promises = batch.map((address) => fetchEntityLabels(address))
      const results = await Promise.all(promises)

      batch.forEach((address, index) => {
        entityLabels[address] = results[index]
      })
    }

    return entityLabels
  }

  /**
   * Calculate transaction velocity score
   */
  private static calculateTransactionVelocity(walletData: WalletData): number {
    // Calculate days since first activity
    const firstActivity = new Date(walletData.firstActivity)
    const now = new Date()
    const daysSinceFirst = Math.max(1, (now.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate transactions per day
    const txPerDay = walletData.transactionCount / daysSinceFirst

    // Score based on transactions per day
    if (txPerDay > 100) return 100
    if (txPerDay > 50) return 75
    if (txPerDay > 20) return 50
    if (txPerDay > 10) return 25
    if (txPerDay > 5) return 10
    return 0
  }

  /**
   * Identify connections to high-risk wallets
   */
  private static identifyHighRiskConnections(connectedEntityLabels: Record<string, any[]>): {
    count: number
    addresses: string[]
  } {
    const highRiskAddresses: string[] = []

    // Check each connected address for high-risk labels
    Object.entries(connectedEntityLabels).forEach(([address, labels]) => {
      const isHighRisk = labels.some((label) => this.HIGH_RISK_ENTITY_TYPES.includes(label.type?.toLowerCase()))

      if (isHighRisk) {
        highRiskAddresses.push(address)
      }
    })

    return {
      count: highRiskAddresses.length,
      addresses: highRiskAddresses,
    }
  }

  /**
   * Identify connections to mixers or tumblers
   */
  private static identifyMixerConnections(connectedEntityLabels: Record<string, any[]>): {
    connected: boolean
    addresses: string[]
  } {
    const mixerAddresses: string[] = []

    // Check each connected address for mixer labels
    Object.entries(connectedEntityLabels).forEach(([address, labels]) => {
      const isMixer = labels.some(
        (label) =>
          label.type?.toLowerCase() === "mixer" ||
          label.name?.toLowerCase().includes("mixer") ||
          label.name?.toLowerCase().includes("tumbler"),
      )

      if (isMixer) {
        mixerAddresses.push(address)
      }
    })

    return {
      connected: mixerAddresses.length > 0,
      addresses: mixerAddresses,
    }
  }

  /**
   * Identify circular transaction patterns
   */
  private static identifyCircularPatterns(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // Build a directed graph from the flow data
    const graph: Record<string, string[]> = {}

    flowData.links.forEach((link) => {
      if (!graph[link.source]) {
        graph[link.source] = []
      }
      graph[link.source].push(link.target)
    })

    // Use DFS to find cycles that include the wallet address
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    let cycleCount = 0

    function dfs(node: string, path: string[] = []): void {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      // Check neighbors
      const neighbors = graph[node] || []
      for (const neighbor of neighbors) {
        // Found a cycle back to the wallet address
        if (neighbor === walletAddress && path.length > 2) {
          cycleCount++
          continue
        }

        // Continue DFS if not visited
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path])
        }
        // Found a cycle
        else if (recursionStack.has(neighbor)) {
          cycleCount++
        }
      }

      recursionStack.delete(node)
    }

    // Start DFS from the wallet address
    if (graph[walletAddress]) {
      dfs(walletAddress)
    }

    return {
      found: cycleCount > 0,
      count: cycleCount,
    }
  }

  /**
   * Identify unusual transaction amounts
   */
  private static identifyUnusualAmounts(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // Get all transaction amounts
    const amounts = flowData.links.map((link) => link.value)

    // Calculate statistics
    const sum = amounts.reduce((a, b) => a + b, 0)
    const mean = sum / amounts.length
    const squaredDiffs = amounts.map((value) => Math.pow(value - mean, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / amounts.length
    const stdDev = Math.sqrt(variance)

    // Identify unusual amounts (more than 2 standard deviations from the mean)
    const unusualAmounts = flowData.links.filter((link) => {
      const zScore = Math.abs(link.value - mean) / stdDev
      return zScore > 2
    })

    return {
      found: unusualAmounts.length > 0,
      count: unusualAmounts.length,
    }
  }

  /**
   * Identify unusual transaction timing
   */
  private static identifyUnusualTiming(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // Count transactions at unusual hours (e.g., 1am-5am)
    const unusualTiming = flowData.links.filter((link) => {
      if (!link.timestamp) return false

      const hour = new Date(link.timestamp).getHours()
      return hour >= 1 && hour <= 5
    })

    return {
      found: unusualTiming.length > 0,
      count: unusualTiming.length,
    }
  }

  /**
   * Assess risk for new wallets with high activity
   */
  private static assessNewWalletRisk(walletData: WalletData): number {
    // Calculate days since first activity
    const firstActivity = new Date(walletData.firstActivity)
    const now = new Date()
    const daysSinceFirst = (now.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24)

    // New wallet (less than 30 days)
    if (daysSinceFirst <= 30) {
      // High activity for a new wallet
      if (walletData.transactionCount > 50) return 100
      if (walletData.transactionCount > 20) return 50
      if (walletData.transactionCount > 10) return 25
    }

    return 0
  }

  /**
   * Assess if a transaction amount is unusually large
   */
  private static assessLargeAmount(amount: number): number {
    if (amount > 1000) return 100
    if (amount > 500) return 75
    if (amount > 100) return 50
    if (amount > 50) return 25
    return 0
  }

  /**
   * Assess if a transaction occurred at an unusual hour
   */
  private static assessUnusualHour(timestamp: string): number {
    if (!timestamp) return 0

    const hour = new Date(timestamp).getHours()

    // 1am-5am is considered unusual
    if (hour >= 1 && hour <= 5) return 100

    return 0
  }

  /**
   * Assess if a transaction amount is a suspiciously round number
   */
  private static assessRoundNumber(amount: number): boolean {
    // Check if amount is a whole number
    if (amount === Math.floor(amount)) return true

    // Check if amount has only one decimal place
    const decimalPlaces = (amount.toString().split(".")[1] || "").length
    if (decimalPlaces === 1) return true

    // Check if amount ends with multiple zeros
    const amountStr = amount.toString()
    if (amountStr.endsWith("00") || amountStr.endsWith("000")) return true

    return false
  }

  /**
   * Assess if a transaction is part of a known suspicious pattern
   */
  private static async assessKnownPattern(
    transactionId: string,
    flowData: TransactionFlowData,
  ): Promise<{ found: boolean; patternType: string }> {
    // Define known suspicious patterns
    const patterns = [
      {
        name: "Layering",
        detect: (flowData: TransactionFlowData) => {
          // Look for chains of 3+ transactions in quick succession
          // This is a simplified implementation
          const txTimestamps = flowData.links
            .filter((link) => link.timestamp)
            .map((link) => new Date(link.timestamp).getTime())
            .sort()

          // Check for 3+ transactions within 10 minutes
          for (let i = 0; i < txTimestamps.length - 2; i++) {
            if (txTimestamps[i + 2] - txTimestamps[i] < 10 * 60 * 1000) {
              return true
            }
          }

          return false
        },
      },
      {
        name: "Smurfing",
        detect: (flowData: TransactionFlowData) => {
          // Look for multiple small transactions that add up to a large amount
          // This is a simplified implementation
          const smallTxs = flowData.links.filter((link) => link.value < 10)
          if (smallTxs.length < 3) return false

          const totalValue = smallTxs.reduce((sum, tx) => sum + tx.value, 0)
          return totalValue > 100
        },
      },
      {
        name: "Round-trip",
        detect: (flowData: TransactionFlowData) => {
          // Look for funds that go out and come back to the same wallet
          // This is a simplified implementation
          const addresses = new Set<string>()
          flowData.links.forEach((link) => {
            addresses.add(link.source)
            addresses.add(link.target)
          })

          for (const address of addresses) {
            const outgoing = flowData.links.filter((link) => link.source === address)
            const incoming = flowData.links.filter((link) => link.target === address)

            if (outgoing.length > 0 && incoming.length > 0) {
              // Check if any outgoing transaction is followed by an incoming one
              for (const out of outgoing) {
                for (const inc of incoming) {
                  if (new Date(inc.timestamp) > new Date(out.timestamp)) {
                    return true
                  }
                }
              }
            }
          }

          return false
        },
      },
      {
        name: "Peeling Chain",
        detect: (flowData: TransactionFlowData) => {
          // Look for a chain where a large amount is gradually "peeled off" in smaller amounts
          // This is a simplified implementation
          const sortedByTime = [...flowData.links].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )

          if (sortedByTime.length < 3) return false

          // Check for decreasing transaction values from the same source
          const sources = new Map<string, { prevValue: number; count: number }>()

          for (const tx of sortedByTime) {
            if (!sources.has(tx.source)) {
              sources.set(tx.source, { prevValue: tx.value, count: 1 })
            } else {
              const source = sources.get(tx.source)!
              if (tx.value < source.prevValue) {
                source.count++
                source.prevValue = tx.value

                // If we find 3+ decreasing transactions from the same source, it's a peeling chain
                if (source.count >= 3) {
                  return true
                }
              } else {
                source.prevValue = tx.value
              }
            }
          }

          return false
        },
      },
      {
        name: "Fan-out",
        detect: (flowData: TransactionFlowData) => {
          // Look for one address sending to many addresses in a short time
          // This is a simplified implementation
          const sources = new Map<string, Set<string>>()

          flowData.links.forEach((link) => {
            if (!sources.has(link.source)) {
              sources.set(link.source, new Set<string>())
            }
            sources.get(link.source)!.add(link.target)
          })

          // Check if any source has sent to many targets (fan-out pattern)
          for (const [_, targets] of sources.entries()) {
            if (targets.size >= 5) {
              return true
            }
          }

          return false
        },
      },
    ]

    // Check each pattern
    for (const pattern of patterns) {
      if (pattern.detect(flowData)) {
        return {
          found: true,
          patternType: pattern.name,
        }
      }
    }

    return {
      found: false,
      patternType: "",
    }
  }

  /**
   * Assess if a transaction is part of a multi-hop chain
   */
  private static assessMultiHop(
    transactionId: string,
    flowData: TransactionFlowData,
  ): { isMultiHop: boolean; hopCount: number } {
    // Build a directed graph from the flow data
    const graph: Record<string, string[]> = {}

    flowData.links.forEach((link) => {
      if (!graph[link.source]) {
        graph[link.source] = []
      }
      graph[link.source].push(link.target)
    })

    // Find the transaction
    const tx = flowData.links.find((link) => link.id === transactionId || link.source + link.target === transactionId)
    if (!tx) {
      return { isMultiHop: false, hopCount: 0 }
    }

    // Use BFS to find the longest path from source
    const visited = new Set<string>()
    const queue: { node: string; distance: number }[] = [{ node: tx.source, distance: 0 }]
    let maxDistance = 0

    while (queue.length > 0) {
      const { node, distance } = queue.shift()!

      if (visited.has(node)) continue
      visited.add(node)

      maxDistance = Math.max(maxDistance, distance)

      const neighbors = graph[node] || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, distance: distance + 1 })
        }
      }
    }

    return {
      isMultiHop: maxDistance > 1,
      hopCount: maxDistance,
    }
  }

  /**
   * Assess if a transaction involves a privacy tool
   */
  private static assessPrivacyToolUsage(sourceLabels: any[], targetLabels: any[]): { used: boolean; toolName: string } {
    // Check if source or target has a privacy tool label
    const sourcePrivacyTool = sourceLabels.find((label) =>
      this.PRIVACY_TOOLS.some(
        (tool) => label.name?.toLowerCase().includes(tool) || label.type?.toLowerCase().includes(tool),
      ),
    )

    const targetPrivacyTool = targetLabels.find((label) =>
      this.PRIVACY_TOOLS.some(
        (tool) => label.name?.toLowerCase().includes(tool) || label.type?.toLowerCase().includes(tool),
      ),
    )

    if (sourcePrivacyTool) {
      return {
        used: true,
        toolName: sourcePrivacyTool.name || "Privacy Tool",
      }
    }

    if (targetPrivacyTool) {
      return {
        used: true,
        toolName: targetPrivacyTool.name || "Privacy Tool",
      }
    }

    return {
      used: false,
      toolName: "",
    }
  }

  /**
   * Calculate metrics from transaction data
   */
  private static calculateTransactionMetrics(transactions: Transaction[]) {
    const highValueThreshold = 1000 // Example threshold
    const highValueTxIds: string[] = []
    const suspiciousCounterparties: string[] = []
    const uniqueCounterparties = new Set<string>()
    let totalValue = 0

    // Calculate time-based metrics
    const timestamps = transactions
      .filter((tx) => tx.timestamp)
      .map((tx) => new Date(tx.timestamp!).getTime())
      .sort((a, b) => a - b)

    let velocityScore = 0
    let mixerPatternScore = 0

    // Check for high transaction velocity
    if (timestamps.length > 10) {
      const timeSpan = timestamps[timestamps.length - 1] - timestamps[0]
      const txPerHour = timestamps.length / (timeSpan / (60 * 60 * 1000))

      if (txPerHour > 10) {
        velocityScore = Math.min(20, Math.floor(txPerHour / 2))
      }
    }

    // Check for mixer patterns (many small transactions of similar size)
    const smallTxs = transactions.filter((tx) => (tx.amount || 0) < 0.1)
    if (smallTxs.length > 10) {
      // Calculate variance in transaction sizes
      const smallTxAmounts = smallTxs.map((tx) => tx.amount || 0)
      const avgAmount = smallTxAmounts.reduce((sum, amt) => sum + amt, 0) / smallTxAmounts.length

      const variance =
        smallTxAmounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / smallTxAmounts.length

      // Low variance suggests mixer pattern
      if (variance < 0.001 && smallTxs.length > 20) {
        mixerPatternScore = Math.min(30, smallTxs.length)
      }
    }

    // Process each transaction
    transactions.forEach((tx) => {
      // Track high value transactions
      if ((tx.amount || 0) > highValueThreshold) {
        highValueTxIds.push(tx.signature)
      }

      // Track total value
      totalValue += tx.amount || 0

      // Track unique counterparties
      if (tx.fromAddress) uniqueCounterparties.add(tx.fromAddress)
      if (tx.toAddress) uniqueCounterparties.add(tx.toAddress)

      // Check for known suspicious addresses (in a real implementation, this would check against a database)
      const knownSuspiciousAddresses = [
        // Example addresses - in a real implementation, these would come from a database
        "9xQwzVfLxUYPZFnRpBj8CcYMPVwGDzXYKexErFohDxzY",
        "7YttLkHMsYFTD8sZr6uqXRrtcJXNnLpkbqKptT2wpPSh",
      ]

      if (tx.fromAddress && knownSuspiciousAddresses.includes(tx.fromAddress)) {
        suspiciousCounterparties.push(tx.fromAddress)
      }

      if (tx.toAddress && knownSuspiciousAddresses.includes(tx.toAddress)) {
        suspiciousCounterparties.push(tx.toAddress)
      }
    })

    return {
      highValueCount: highValueTxIds.length,
      highValueTxIds,
      suspiciousCounterparties: [...new Set(suspiciousCounterparties)],
      uniqueCounterparties,
      avgValue: totalValue / Math.max(1, transactions.length),
      velocityScore,
      mixerPatternScore,
    }
  }

  /**
   * Calculate a percentage string for trend visualization
   */
  private static calculateTrendPercentage(trend: string): string {
    switch (trend) {
      case "increasing":
        return `+${Math.floor(Math.random() * 15) + 5}%`
      case "decreasing":
        return `-${Math.floor(Math.random() * 15) + 5}%`
      default:
        return `${Math.floor(Math.random() * 5) - 2}%`
    }
  }

  /**
   * Calculate risk metrics for dashboard visualization
   */
  static calculateRiskMetrics(riskScores: RiskScore[]): RiskMetrics {
    const totalRiskScore = riskScores.reduce((sum, score) => sum + score.score, 0) / Math.max(1, riskScores.length)

    const highRiskFactors = riskScores.reduce(
      (count, score) => count + score.factors.filter((f) => f.impact >= 15).length,
      0,
    )

    const mediumRiskFactors = riskScores.reduce(
      (count, score) => count + score.factors.filter((f) => f.impact >= 10 && f.impact < 15).length,
      0,
    )

    const lowRiskFactors = riskScores.reduce(
      (count, score) => count + score.factors.filter((f) => f.impact < 10).length,
      0,
    )

    // Determine overall risk trend
    const increasingCount = riskScores.filter((score) => score.trend === "increasing").length
    const decreasingCount = riskScores.filter((score) => score.trend === "decreasing").length

    let riskTrend: "increasing" | "decreasing" | "stable" = "stable"
    if (increasingCount > decreasingCount && increasingCount > riskScores.length / 3) {
      riskTrend = "increasing"
    } else if (decreasingCount > increasingCount && decreasingCount > riskScores.length / 3) {
      riskTrend = "decreasing"
    }

    // Calculate anomaly score
    const anomalyScore =
      riskScores.reduce((sum, score) => sum + (score.anomalyScore || 0), 0) / Math.max(1, riskScores.length)

    return {
      totalRiskScore,
      highRiskFactors,
      mediumRiskFactors,
      lowRiskFactors,
      riskTrend,
      anomalyScore,
      predictionAccuracy: 0.82, // In a real implementation, this would be calculated from historical predictions
    }
  }
}
