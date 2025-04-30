import type { TransactionFlowData } from "@/types/transaction"
import type { WalletData } from "@/types/wallet"
import type { RiskFactor, TransactionRiskScore } from "@/types/risk"
import type { Transaction } from "@/types/transaction"
import type { WalletRiskScore, RiskMetrics } from "@/types/risk"

/**
 * Service for calculating risk scores for wallets and transactions
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
  ): WalletRiskScore {
    // Initialize risk factors
    const riskFactors: RiskFactor[] = []

    // Base metrics
    const metrics: RiskMetrics = {
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
        overallScore: 0,
        riskLevel: "unknown",
        riskFactors: [],
        metrics,
        timestamp: new Date().toISOString(),
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
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    // Calculate age of wallet (days since first transaction)
    const firstTxDate = new Date(sortedTransactions[0].timestamp)
    const now = new Date()
    const ageInDays = Math.floor((now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24))
    metrics.age = ageInDays

    // Analyze transactions
    for (const tx of transactions) {
      // Add to total volume
      totalVolume += tx.amount

      // Check counterparties
      const counterparty = tx.from === address ? tx.to : tx.from

      // Check if counterparty is a known entity
      if (knownEntities.has(counterparty)) {
        const entity = knownEntities.get(counterparty)!

        // Count interactions by category
        if (entity.category === "mixer") {
          mixerInteractions++
          riskFactors.push({
            type: "mixer_interaction",
            severity: "high",
            description: `Interaction with known mixer: ${counterparty}`,
            relatedTx: tx.signature,
          })
        } else if (entity.category === "exchange") {
          exchangeInteractions++
        }

        // Count high risk interactions
        if (entity.riskLevel === "high") {
          highRiskInteractions++
          riskFactors.push({
            type: "high_risk_entity",
            severity: "high",
            description: `Interaction with high-risk entity: ${counterparty}`,
            relatedTx: tx.signature,
          })
        }
      } else {
        // Unknown counterparty
        unknownInteractions++
      }

      // Check for large transactions
      if (tx.amount > 1000000) {
        // $1M threshold
        riskFactors.push({
          type: "large_transaction",
          severity: "medium",
          description: `Large transaction of $${tx.amount.toLocaleString()}`,
          relatedTx: tx.signature,
        })
      }
    }

    // Update metrics
    metrics.totalVolume = totalVolume
    metrics.avgTransactionSize = totalVolume / transactions.length
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
    let riskLevel = "low"
    if (overallScore >= 75) {
      riskLevel = "high"
    } else if (overallScore >= 40) {
      riskLevel = "medium"
    }

    // Add age-based risk factor
    if (ageInDays < 7) {
      riskFactors.push({
        type: "new_wallet",
        severity: "medium",
        description: `New wallet (${ageInDays} days old)`,
      })
    }

    // Return the complete risk score
    return {
      address,
      overallScore,
      riskLevel,
      riskFactors,
      metrics,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Calculate risk score for a specific transaction
   */
  static calculateTransactionRisk(
    tx: Transaction,
    knownEntities: Map<string, { category: string; riskLevel: string }> = new Map(),
  ): number {
    let riskScore = 0

    // Check amount
    if (tx.amount > 1000000) {
      // $1M
      riskScore += 30
    } else if (tx.amount > 100000) {
      // $100K
      riskScore += 15
    }

    // Check counterparties
    if (knownEntities.has(tx.from)) {
      const fromEntity = knownEntities.get(tx.from)!
      if (fromEntity.category === "mixer") riskScore += 50
      if (fromEntity.riskLevel === "high") riskScore += 30
      if (fromEntity.riskLevel === "medium") riskScore += 15
    }

    if (knownEntities.has(tx.to)) {
      const toEntity = knownEntities.get(tx.to)!
      if (toEntity.category === "mixer") riskScore += 50
      if (toEntity.riskLevel === "high") riskScore += 30
      if (toEntity.riskLevel === "medium") riskScore += 15
    }

    // Cap the risk score at 100
    return Math.min(riskScore, 100)
  }

  // Calculate risk metrics for a set of transactions
  static calculateRiskMetrics(transactions: Transaction[]): RiskMetrics {
    // Skip calculation if no transactions
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
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
    }

    // Calculate basic metrics
    const totalTransactions = transactions.length
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const avgTransactionSize = totalVolume / totalTransactions

    return {
      totalTransactions,
      totalVolume,
      avgTransactionSize,
      mixerInteractions: 0, // Would be calculated with entity data
      exchangeInteractions: 0, // Would be calculated with entity data
      unknownInteractions: 0, // Would be calculated with entity data
      highRiskInteractions: 0, // Would be calculated with entity data
      age: 0, // Would be calculated from transaction timestamps
      velocityScore: 0, // Would be calculated from transaction frequency
      patternScore: 0, // Would be calculated from transaction patterns
      clusterScore: 0, // Would be calculated from entity relationships
    }
  }

  /**
   * Calculate risk score for a specific transaction
   */
  public static calculateTransactionRiskScore(
    transactionId: string,
    transaction: any,
    flowData: TransactionFlowData,
  ): TransactionRiskScore {
    // Initialize score and factors
    let totalScore = 0
    const factors: RiskFactor[] = []

    // Find the transaction in the flow data
    const tx = flowData.links.find((link) => link.id === transactionId)
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
        score: largeAmount,
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
        score: 100,
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
        score: 100,
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
  private static identifyHighRiskConnections(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { count: number; addresses: string[] } {
    // In a real implementation, this would check against a database of known high-risk wallets
    // For demo purposes, we'll use a mock implementation

    // Mock high-risk wallets (in a real implementation, these would come from a database)
    const mockHighRiskWallets = [
      "wallet4", // From the mock data
      "wallet7",
      "wallet9",
    ]

    // Find connections to high-risk wallets
    const connections = flowData.links
      .filter(
        (link) =>
          (link.source === walletAddress && mockHighRiskWallets.includes(link.target)) ||
          (link.target === walletAddress && mockHighRiskWallets.includes(link.source)),
      )
      .map((link) => (link.source === walletAddress ? link.target : link.source))

    // Remove duplicates
    const uniqueConnections = [...new Set(connections)]

    return {
      count: uniqueConnections.length,
      addresses: uniqueConnections,
    }
  }

  /**
   * Identify connections to mixers or tumblers
   */
  private static identifyMixerConnections(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { connected: boolean; addresses: string[] } {
    // In a real implementation, this would check against a database of known mixer services
    // For demo purposes, we'll use a mock implementation

    // Mock mixer wallets (in a real implementation, these would come from a database)
    const mockMixerWallets = [
      "wallet4", // From the mock data
    ]

    // Find connections to mixer wallets
    const connections = flowData.links
      .filter(
        (link) =>
          (link.source === walletAddress && mockMixerWallets.includes(link.target)) ||
          (link.target === walletAddress && mockMixerWallets.includes(link.source)),
      )
      .map((link) => (link.source === walletAddress ? link.target : link.source))

    // Remove duplicates
    const uniqueConnections = [...new Set(connections)]

    return {
      connected: uniqueConnections.length > 0,
      addresses: uniqueConnections,
    }
  }

  /**
   * Identify circular transaction patterns
   */
  private static identifyCircularPatterns(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // In a real implementation, this would use graph analysis to find cycles
    // For demo purposes, we'll use a mock implementation

    // For the demo, assume we found 1 circular pattern if there are enough transactions
    const hasEnoughTransactions = flowData.links.length >= 4

    return {
      found: hasEnoughTransactions,
      count: hasEnoughTransactions ? 1 : 0,
    }
  }

  /**
   * Identify unusual transaction amounts
   */
  private static identifyUnusualAmounts(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // In a real implementation, this would analyze the distribution of transaction amounts
    // For demo purposes, we'll use a mock implementation

    // Count transactions with unusual amounts (e.g., very large or very precise amounts)
    const unusualAmounts = flowData.links.filter((link) => {
      // Very large amounts (> 100 SOL)
      if (link.value > 100) return true

      // Very precise amounts (more than 4 decimal places)
      const decimalPlaces = (link.value.toString().split(".")[1] || "").length
      if (decimalPlaces > 4) return true

      return false
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
    // In a real implementation, this would analyze the timing of transactions
    // For demo purposes, we'll use a mock implementation

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

// Export the static method as a standalone function for convenience
export const calculateWalletRiskScore = RiskScoringService.calculateWalletRiskScore
