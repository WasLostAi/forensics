import { createClient } from "@/lib/supabase"
import type { RiskScore, RiskFactor, RiskLevel, TransactionRiskScore } from "@/types/risk"
import type { Transaction, TransactionFlowData } from "@/types/transaction"

// Define risk types if they don't exist
// Fix: Use a safer approach to handle global variables
const RiskTypes = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  UNKNOWN: "unknown",
}

// RiskScoringService class
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

    // Transaction risk factors
    LARGE_AMOUNT: 20,
    UNUSUAL_HOUR: 10,
    ROUND_NUMBER: 15,
    KNOWN_PATTERN: 25,
    MULTI_HOP: 15,
    PRIVACY_TOOL: 15,
  }

  /**
   * Calculate a comprehensive risk score for a wallet
   */
  public static calculateWalletRiskScore(
    address: string,
    transactions: Transaction[],
    knownEntities: Map<string, { category: string; riskLevel: string }> = new Map(),
  ): RiskScore {
    // Initialize risk factors
    const riskFactors: RiskFactor[] = []

    // Base metrics
    const metrics = {
      totalTransactions: transactions.length,
      totalVolume: 0,
      avgTransactionSize: 0,
      mixerInteractions: 0,
      exchangeInteractions: 0,
      unknownInteractions: 0,
      highRiskInteractions: 0,
      age: 0,
      velocityScore: 0,
      patternScore: 0,
      clusterScore: 0,
    }

    // Skip calculation if no transactions
    if (transactions.length === 0) {
      return {
        address,
        score: 0,
        factors: [],
        level: "unknown",
        lastUpdated: new Date(),
      }
    }

    // Calculate total volume and identify transaction patterns
    let totalVolume = 0
    let mixerInteractions = 0
    let exchangeInteractions = 0
    let unknownInteractions = 0
    let highRiskInteractions = 0

    // Sort transactions by timestamp
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime(),
    )

    // Calculate age of wallet (days since first transaction)
    const firstTxDate = new Date(sortedTransactions[0].timestamp || 0)
    const now = new Date()
    const ageInDays = Math.floor((now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24))
    metrics.age = ageInDays

    // Analyze transactions
    for (const tx of transactions) {
      // Add to total volume
      totalVolume += tx.amount || 0

      // Check counterparties
      const counterparty = tx.from === address ? tx.to : tx.from

      // Check if counterparty is a known entity
      if (counterparty && knownEntities.has(counterparty)) {
        const entity = knownEntities.get(counterparty)!

        // Count interactions by category
        if (entity.category === "mixer") {
          mixerInteractions++
          riskFactors.push({
            name: "mixer_interaction",
            description: `Interaction with known mixer: ${counterparty}`,
            impact: 25,
          })
        } else if (entity.category === "exchange") {
          exchangeInteractions++
        }

        // Count high risk interactions
        if (entity.riskLevel === "high") {
          highRiskInteractions++
          riskFactors.push({
            name: "high_risk_entity",
            description: `Interaction with high-risk entity: ${counterparty}`,
            impact: 20,
          })
        }
      } else {
        // Unknown counterparty
        unknownInteractions++
      }

      // Check for large transactions
      if (tx.amount && tx.amount > 1000000) {
        // $1M threshold
        riskFactors.push({
          name: "large_transaction",
          description: `Large transaction of $${tx.amount.toLocaleString()}`,
          impact: 15,
        })
      }
    }

    // Update metrics
    metrics.totalVolume = totalVolume
    metrics.avgTransactionSize = transactions.length > 0 ? totalVolume / transactions.length : 0
    metrics.mixerInteractions = mixerInteractions
    metrics.exchangeInteractions = exchangeInteractions
    metrics.unknownInteractions = unknownInteractions
    metrics.highRiskInteractions = highRiskInteractions

    // Calculate velocity score (transaction frequency)
    if (ageInDays > 0) {
      const txPerDay = transactions.length / ageInDays
      metrics.velocityScore = Math.min(txPerDay * 10, 100) // Scale 0-100
    }

    // Calculate pattern score (based on transaction patterns)
    // This is a simplified version - in a real system this would be more sophisticated
    const patternScore = mixerInteractions * 30 + highRiskInteractions * 20 + unknownInteractions * 5
    metrics.patternScore = Math.min(patternScore, 100) // Scale 0-100

    // Calculate cluster score (based on relationship to known entities)
    // This is a simplified version - in a real system this would use graph analysis
    const clusterScore = mixerInteractions * 25 + highRiskInteractions * 15 + exchangeInteractions * 5
    metrics.clusterScore = Math.min(clusterScore, 100) // Scale 0-100

    // Calculate overall risk score (weighted average of component scores)
    const overallScore = metrics.velocityScore * 0.2 + metrics.patternScore * 0.4 + metrics.clusterScore * 0.4

    // Determine risk level
    let riskLevel: RiskLevel = "low"
    if (overallScore >= 75) {
      riskLevel = "high"
    } else if (overallScore >= 40) {
      riskLevel = "medium"
    }

    // Add age-based risk factor
    if (ageInDays < 7) {
      riskFactors.push({
        name: "new_wallet",
        description: `New wallet (${ageInDays} days old)`,
        impact: 5,
      })
    }

    // Return the complete risk score
    return {
      address,
      score: overallScore,
      factors: riskFactors,
      level: riskLevel,
      lastUpdated: new Date(),
    }
  }

  /**
   * Calculate risk score for a specific transaction
   */
  static calculateTransactionRiskScore(
    transactionId: string,
    transaction: Transaction,
    flowData: TransactionFlowData,
  ): TransactionRiskScore {
    // Initialize score and factors
    let totalScore = 0
    const factors: RiskFactor[] = []

    // Find the transaction in the flow data
    const tx = flowData.links.find((link: any) => link.id === transactionId)
    if (!tx) {
      return {
        id: transactionId,
        score: 0,
        level: "low",
        factors: [],
        timestamp: new Date().toISOString(),
      }
    }

    // 1. Large transaction amount
    const largeAmount = this.assessLargeAmount(tx.value)
    if (largeAmount > 0) {
      const amountImpact = Math.min(this.RISK_WEIGHTS.LARGE_AMOUNT, largeAmount)
      totalScore += amountImpact
      factors.push({
        name: "Large Amount",
        description: `Transaction amount (${tx.value} SOL) is unusually large`,
        impact: amountImpact,
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
      })
    }

    // 4. Part of known pattern
    const knownPattern = this.assessKnownPattern(transactionId, flowData)
    if (knownPattern.found) {
      totalScore += this.RISK_WEIGHTS.KNOWN_PATTERN
      factors.push({
        name: "Known Pattern",
        description: `Part of a known suspicious pattern: ${knownPattern.patternType}`,
        impact: this.RISK_WEIGHTS.KNOWN_PATTERN,
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
      })
    }

    // 6. Privacy tool usage
    const privacyTool = this.assessPrivacyToolUsage(tx.source, tx.target)
    if (privacyTool.used) {
      totalScore += this.RISK_WEIGHTS.PRIVACY_TOOL
      factors.push({
        name: "Privacy Tool",
        description: `Transaction involves a known privacy tool: ${privacyTool.toolName}`,
        impact: this.RISK_WEIGHTS.PRIVACY_TOOL,
      })
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
    }
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

    return false
  }

  /**
   * Assess if a transaction is part of a known suspicious pattern
   */
  private static assessKnownPattern(
    transactionId: string,
    flowData: TransactionFlowData,
  ): { found: boolean; patternType: string } {
    // In a real implementation, this would check against known patterns
    // For demo purposes, we'll use a mock implementation

    // For the demo, assume 20% of transactions are part of a known pattern
    const isSuspicious = transactionId.charCodeAt(0) % 5 === 0

    return {
      found: isSuspicious,
      patternType: isSuspicious ? "Layering" : "",
    }
  }

  /**
   * Assess if a transaction is part of a multi-hop chain
   */
  private static assessMultiHop(
    transactionId: string,
    flowData: TransactionFlowData,
  ): { isMultiHop: boolean; hopCount: number } {
    // In a real implementation, this would trace the transaction chain
    // For demo purposes, we'll use a mock implementation

    // For the demo, assume 30% of transactions are part of a multi-hop chain
    const isMultiHop = transactionId.charCodeAt(0) % 3 === 0

    return {
      isMultiHop,
      hopCount: isMultiHop ? 3 : 0,
    }
  }

  /**
   * Assess if a transaction involves a privacy tool
   */
  private static assessPrivacyToolUsage(source: string, target: string): { used: boolean; toolName: string } {
    // In a real implementation, this would check against known privacy tools
    // For demo purposes, we'll use a mock implementation

    // Mock privacy tool wallets (in a real implementation, these would come from a database)
    const mockPrivacyTools = [
      "wallet4", // From the mock data
    ]

    const usesPrivacyTool = mockPrivacyTools.includes(source) || mockPrivacyTools.includes(target)

    return {
      used: usesPrivacyTool,
      toolName: usesPrivacyTool ? "Solana Mixer" : "",
    }
  }
}

// Calculate risk score for a wallet address
export async function calculateWalletRiskScore(address: string): Promise<RiskScore> {
  try {
    const supabase = createClient()

    // First check if we have a cached risk score
    const { data: cachedScore } = await supabase.from("risk_scores").select("*").eq("address", address).single()

    if (cachedScore && Date.now() - new Date(cachedScore.updated_at).getTime() < 24 * 60 * 60 * 1000) {
      return {
        address,
        score: cachedScore.score,
        factors: JSON.parse(cachedScore.factors),
        level: cachedScore.level as RiskLevel,
        lastUpdated: new Date(cachedScore.updated_at),
      }
    }

    // Calculate new risk score
    const riskFactors: RiskFactor[] = []
    let totalScore = 0

    // Mock risk calculation for testing
    const mockRiskFactor: RiskFactor = {
      name: "Mock Risk Factor",
      description: "This is a mock risk factor for testing",
      impact: 25,
    }
    riskFactors.push(mockRiskFactor)
    totalScore += mockRiskFactor.impact

    // Determine risk level
    let riskLevel: RiskLevel = "low"
    if (totalScore > 50) {
      riskLevel = "high"
    } else if (totalScore > 20) {
      riskLevel = "medium"
    }

    // Cache the risk score
    try {
      await supabase.from("risk_scores").upsert({
        address,
        score: totalScore,
        factors: JSON.stringify(riskFactors),
        level: riskLevel,
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error caching risk score:", error)
      // Continue even if caching fails
    }

    return {
      address,
      score: totalScore,
      factors: riskFactors,
      level: riskLevel,
      lastUpdated: new Date(),
    }
  } catch (error) {
    console.error("Error calculating risk score:", error)
    return {
      address,
      score: 0,
      factors: [],
      level: "unknown",
      lastUpdated: new Date(),
    }
  }
}

// Calculate risk score for a transaction
export async function calculateTransactionRiskScore(transaction: Transaction): Promise<number> {
  try {
    // Mock implementation for testing
    let riskScore = 0

    // Check transaction amount
    if (transaction.amount && transaction.amount > 1000) {
      riskScore += 15
    }

    // Check transaction type
    if (transaction.type === "unknown") {
      riskScore += 10
    }

    return riskScore
  } catch (error) {
    console.error("Error calculating transaction risk score:", error)
    return 0
  }
}
