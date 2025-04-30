import type { TransactionFlowData } from "@/types/transaction"
import type { RiskFactor, TransactionRiskScore, RiskMetrics, WalletRiskScore } from "@/types/risk"
import type { Transaction } from "@/types/transaction"
import type { WalletRiskProfile, RiskLevel, RiskCalibrationData } from "../types/risk"
import type { MLPatternResult } from "../types/ml"
import { getEntityLabel } from "./entity-service"
import { supabase } from "./supabase"
import { getRiskCalibrationData } from "./risk-calibration"
import { analyzeTransactionPatterns } from "./pattern-detection"
import { analyzeTransactionsWithML, getModelMetadata } from "./ml-pattern-detection"

// Risk scoring weights based on real-world data analysis
const RISK_WEIGHTS = {
  KNOWN_SCAMMER: 0.95,
  MIXER_INTERACTION: 0.85,
  SANCTIONED_ENTITY: 0.9,
  HIGH_VELOCITY: 0.7,
  UNUSUAL_PATTERN: 0.65,
  NEW_WALLET: 0.4,
  EXCHANGE_INTERACTION: 0.2,
  DEFI_INTERACTION: 0.25,
  GAMING_INTERACTION: 0.15,
  NFT_INTERACTION: 0.3,
  WASH_TRADING: 0.75,
  LARGE_TRANSFER: 0.6,
  MULTIPLE_HOPS: 0.55,
  TORNADO_CASH_LIKE: 0.8,
  RUGPULL_ASSOCIATION: 0.85,
  PHISHING_ASSOCIATION: 0.8,
  DARK_MARKET_ASSOCIATION: 0.9,

  // Pattern-based weights
  TIME_PATTERN: 0.6,
  AMOUNT_PATTERN: 0.7,
  FLOW_PATTERN: 0.8,
  BEHAVIORAL_PATTERN: 0.75,

  // ML-based pattern weights
  ML_ANOMALY: 0.85,
  ML_PATTERN: 0.8,
}

// Thresholds calibrated from real-world data
const RISK_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.4,
  LOW: 0.2,
}

// Time periods for velocity calculations (in milliseconds)
const TIME_PERIODS = {
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
}

// Transaction velocity thresholds based on real-world data
const VELOCITY_THRESHOLDS = {
  HIGH: {
    HOUR: 20,
    DAY: 100,
    WEEK: 500,
  },
  MEDIUM: {
    HOUR: 10,
    DAY: 50,
    WEEK: 200,
  },
  LOW: {
    HOUR: 5,
    DAY: 20,
    WEEK: 100,
  },
}

// Amount thresholds in SOL
const AMOUNT_THRESHOLDS = {
  LARGE: 1000,
  MEDIUM: 100,
  SMALL: 10,
}

/**
 * Calculate risk score for a wallet based on its transaction history and known entities
 * This is the named export function that's required by the application
 */
export async function calculateWalletRiskScore(address: string, transactions: any[]): Promise<WalletRiskProfile> {
  // Get calibration data if available
  const calibrationData = await getRiskCalibrationData()
  const adjustedWeights = calibrationData ? applyCalibrationToWeights(RISK_WEIGHTS, calibrationData) : RISK_WEIGHTS

  // Initialize risk factors
  const riskFactors: RiskFactor[] = []
  let totalRiskScore = 0

  // Check if wallet is a known entity
  const entityLabel = await getEntityLabel(address)
  if (entityLabel) {
    if (entityLabel.category === "scammer" || entityLabel.category === "fraudster") {
      riskFactors.push({
        name: "Known Scammer",
        description: "Wallet is labeled as a known scammer",
        impact: 25,
        score: 100,
        type: "KNOWN_SCAMMER",
        severity: "high",
      })
      totalRiskScore += adjustedWeights.KNOWN_SCAMMER
    } else if (entityLabel.category === "mixer" || entityLabel.category === "tumbler") {
      riskFactors.push({
        name: "Cryptocurrency Mixer",
        description: "Wallet is labeled as a cryptocurrency mixer",
        impact: 25,
        score: 100,
        type: "MIXER_INTERACTION",
        severity: "high",
      })
      totalRiskScore += adjustedWeights.MIXER_INTERACTION
    } else if (entityLabel.category === "sanctioned") {
      riskFactors.push({
        name: "Sanctioned Entity",
        description: "Wallet is labeled as a sanctioned entity",
        impact: 25,
        score: 100,
        type: "SANCTIONED_ENTITY",
        severity: "high",
      })
      totalRiskScore += adjustedWeights.SANCTIONED_ENTITY
    }
  }

  // Check wallet age
  const walletAge = calculateWalletAge(transactions)
  if (walletAge < TIME_PERIODS.DAY) {
    riskFactors.push({
      name: "New Wallet",
      description: "Wallet was created less than 24 hours ago",
      impact: 10,
      score: 80,
      type: "NEW_WALLET",
      severity: "medium",
    })
    totalRiskScore += adjustedWeights.NEW_WALLET
  }

  // Check transaction velocity
  const velocity = calculateTransactionVelocity(transactions)
  if (velocity.hourly > VELOCITY_THRESHOLDS.HIGH.HOUR) {
    riskFactors.push({
      name: "High Transaction Velocity",
      description: `High transaction velocity: ${velocity.hourly} tx/hour`,
      impact: 15,
      score: 90,
      type: "HIGH_VELOCITY",
      severity: "high",
    })
    totalRiskScore += adjustedWeights.HIGH_VELOCITY
  } else if (velocity.hourly > VELOCITY_THRESHOLDS.MEDIUM.HOUR) {
    riskFactors.push({
      name: "Medium Transaction Velocity",
      description: `Medium transaction velocity: ${velocity.hourly} tx/hour`,
      impact: 10,
      score: 70,
      type: "HIGH_VELOCITY",
      severity: "medium",
    })
    totalRiskScore += adjustedWeights.HIGH_VELOCITY * 0.7
  }

  // Detect sophisticated patterns
  const transactionPatterns = analyzeTransactionPatterns(transactions, address)

  // Add pattern-based risk factors
  transactionPatterns.forEach((patternGroup) => {
    if (patternGroup.patternCount > 0) {
      // Get the highest severity pattern in this group
      const highestSeverityPattern = patternGroup.patterns.sort((a, b) => {
        const severityScore = { high: 3, medium: 2, low: 1 }
        return severityScore[b.severity] - severityScore[a.severity]
      })[0]

      // Add a risk factor based on the pattern group
      const patternWeight = getPatternWeight(patternGroup.type, adjustedWeights)
      const patternImpact = Math.round(patternWeight * 25)

      riskFactors.push({
        name: `${formatPatternType(patternGroup.type)} Pattern`,
        description: `${patternGroup.patternCount} suspicious patterns detected, including ${highestSeverityPattern.name}`,
        impact: patternImpact,
        score: patternGroup.totalRiskScore,
        type: `${patternGroup.type.toUpperCase()}_PATTERN`,
        severity: patternGroup.highSeverityCount > 0 ? "high" : "medium",
        details: patternGroup.patterns.map((p) => p.description),
      })

      totalRiskScore += patternWeight * (patternGroup.totalRiskScore / 100)
    }
  })

  // Detect ML-based patterns
  let mlPatterns = []
  try {
    mlPatterns = await analyzeTransactionsWithML(transactions, address)

    // Only add ML-based risk factors if patterns were detected
    if (mlPatterns && mlPatterns.length > 0) {
      mlPatterns.forEach((pattern) => {
        const mlWeight = pattern.type === "anomaly" ? adjustedWeights.ML_ANOMALY : adjustedWeights.ML_PATTERN
        const mlImpact = Math.round(mlWeight * 25)

        riskFactors.push({
          name: pattern.name,
          description: `${pattern.description} (${pattern.confidence.toFixed(2)} confidence)`,
          impact: mlImpact,
          score: pattern.score,
          type: pattern.type.toUpperCase(),
          severity: pattern.severity,
          details: pattern.featureImportance.slice(0, 3).map((f) => `${f.name}: ${(f.importance * 100).toFixed(1)}%`),
        })

        totalRiskScore += mlWeight * (pattern.score / 100)
      })
    }
  } catch (error) {
    console.error("Error in ML pattern detection:", error)
    mlPatterns = []
  }

  // Normalize risk score to be between 0 and 1
  const normalizedRiskScore = Math.min(totalRiskScore, 1)
  const finalScore = Math.round(normalizedRiskScore * 100)

  // Determine overall risk level
  let riskLevel: RiskLevel
  if (normalizedRiskScore >= RISK_THRESHOLDS.HIGH) {
    riskLevel = "high"
  } else if (normalizedRiskScore >= RISK_THRESHOLDS.MEDIUM) {
    riskLevel = "medium"
  } else if (normalizedRiskScore >= RISK_THRESHOLDS.LOW) {
    riskLevel = "low"
  } else {
    riskLevel = "minimal"
  }

  return {
    address,
    riskScore: finalScore,
    riskLevel,
    riskFactors,
    lastUpdated: new Date().toISOString(),
    detectedPatterns: transactionPatterns,
    mlPatterns: mlPatterns,
    modelMetadata: getModelMetadata(),
  }
}

/**
 * Get the weight for a specific pattern type
 */
function getPatternWeight(patternType: string, weights: Record<string, number>): number {
  switch (patternType) {
    case "time_based":
      return weights.TIME_PATTERN
    case "amount_based":
      return weights.AMOUNT_PATTERN
    case "flow_based":
      return weights.FLOW_PATTERN
    case "behavioral":
      return weights.BEHAVIORAL_PATTERN
    default:
      return 0.5
  }
}

/**
 * Format pattern type for display
 */
function formatPatternType(patternType: string): string {
  switch (patternType) {
    case "time_based":
      return "Time-Based"
    case "amount_based":
      return "Amount-Based"
    case "flow_based":
      return "Flow-Based"
    case "behavioral":
      return "Behavioral"
    default:
      return patternType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

/**
 * Calculate risk score for a specific transaction
 */
export function calculateTransactionRiskScore(transaction: any): TransactionRiskScore {
  // Get transaction details
  const { signature, blockTime, meta } = transaction

  // Initialize risk factors
  const riskFactors: RiskFactor[] = []
  let totalRiskScore = 0

  // Check for large amount
  const amount = getTransactionAmount(transaction)
  if (amount > AMOUNT_THRESHOLDS.LARGE) {
    riskFactors.push({
      name: "Large Transfer",
      description: `Large transfer: ${amount} SOL`,
      impact: 20,
      score: 80,
      type: "LARGE_TRANSFER",
      severity: "medium",
    })
    totalRiskScore += RISK_WEIGHTS.LARGE_TRANSFER
  }

  // Check for unusual instructions
  const unusualInstructions = detectUnusualInstructions(transaction)
  if (unusualInstructions) {
    riskFactors.push({
      name: "Unusual Instructions",
      description: "Unusual transaction instructions detected",
      impact: 15,
      score: 70,
      type: "UNUSUAL_PATTERN",
      severity: "medium",
    })
    totalRiskScore += RISK_WEIGHTS.UNUSUAL_PATTERN
  }

  // Normalize risk score to be between 0 and 1
  const normalizedRiskScore = Math.min(totalRiskScore, 1)
  const finalScore = Math.round(normalizedRiskScore * 100)

  // Determine overall risk level
  let riskLevel: RiskLevel
  if (normalizedRiskScore >= RISK_THRESHOLDS.HIGH) {
    riskLevel = "high"
  } else if (normalizedRiskScore >= RISK_THRESHOLDS.MEDIUM) {
    riskLevel = "medium"
  } else if (normalizedRiskScore >= RISK_THRESHOLDS.LOW) {
    riskLevel = "low"
  } else {
    riskLevel = "minimal"
  }

  return {
    id: signature,
    score: finalScore,
    level: riskLevel,
    factors: riskFactors,
    timestamp: blockTime ? new Date(blockTime * 1000).toISOString() : new Date().toISOString(),
  }
}

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

    // Pattern weights
    TIME_PATTERN: 20,
    AMOUNT_PATTERN: 25,
    FLOW_PATTERN: 30,
    BEHAVIORAL_PATTERN: 25,

    // ML pattern weights
    ML_ANOMALY: 30,
    ML_PATTERN: 25,
  }

  /**
   * Calculate a comprehensive risk score for a wallet
   */
  public static async calculateWalletRiskScore(
    address: string,
    transactions: Transaction[],
    knownEntities: Map<string, { category: string; riskLevel: string }> = new Map(),
  ): Promise<WalletRiskScore> {
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
            name: "Mixer Interaction",
            description: `Interaction with known mixer: ${counterparty}`,
            impact: this.RISK_WEIGHTS.MIXER_CONNECTIONS,
            score: 90,
            type: "mixer_interaction",
            severity: "high",
            relatedTx: tx.signature,
          })
        } else if (entity.category === "exchange") {
          exchangeInteractions++
        }

        // Count high risk interactions
        if (entity.riskLevel === "high") {
          highRiskInteractions++
          riskFactors.push({
            name: "High-Risk Entity Interaction",
            description: `Interaction with high-risk entity: ${counterparty}`,
            impact: this.RISK_WEIGHTS.HIGH_RISK_CONNECTIONS,
            score: 85,
            type: "high_risk_entity",
            severity: "high",
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
          name: "Large Transaction",
          description: `Large transaction of $${tx.amount.toLocaleString()}`,
          impact: this.RISK_WEIGHTS.LARGE_AMOUNT,
          score: 80,
          type: "large_transaction",
          severity: "medium",
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

    // Detect sophisticated patterns
    const transactionPatterns = analyzeTransactionPatterns(transactions, address)
    metrics.detectedPatterns = transactionPatterns

    // Add pattern-based risk factors
    let patternScore = 0
    transactionPatterns.forEach((patternGroup) => {
      if (patternGroup.patternCount > 0) {
        // Get the highest severity pattern in this group
        const highestSeverityPattern = patternGroup.patterns.sort((a, b) => {
          const severityScore = { high: 3, medium: 2, low: 1 }
          return severityScore[b.severity] - severityScore[a.severity]
        })[0]

        // Add a risk factor based on the pattern group
        const patternWeight = this.getPatternWeight(patternGroup.type)
        const patternImpact = Math.round(patternWeight)

        riskFactors.push({
          name: `${this.formatPatternType(patternGroup.type)} Pattern`,
          description: `${patternGroup.patternCount} suspicious patterns detected, including ${highestSeverityPattern.name}`,
          impact: patternImpact,
          score: patternGroup.totalRiskScore,
          type: `${patternGroup.type}_pattern`,
          severity: patternGroup.highSeverityCount > 0 ? "high" : "medium",
          details: patternGroup.patterns.map((p) => p.description),
        })

        patternScore += patternGroup.totalRiskScore * (patternWeight / 100)
      }
    })

    // Detect ML-based patterns
    let mlPatterns: MLPatternResult[] = []
    try {
      mlPatterns = await analyzeTransactionsWithML(transactions, address)

      // Add ML-based risk factors
      if (mlPatterns && mlPatterns.length > 0) {
        mlPatterns.forEach((pattern) => {
          const mlWeight = pattern.type === "anomaly" ? this.RISK_WEIGHTS.ML_ANOMALY : this.RISK_WEIGHTS.ML_PATTERN
          const mlImpact = Math.round(mlWeight)

          riskFactors.push({
            name: pattern.name,
            description: `${pattern.description} (${pattern.confidence.toFixed(2)} confidence)`,
            impact: mlImpact,
            score: pattern.score,
            type: `ml_${pattern.type}`,
            severity: pattern.severity,
            details: pattern.featureImportance.slice(0, 3).map((f) => `${f.name}: ${(f.importance * 100).toFixed(1)}%`),
          })

          patternScore += pattern.score * (mlWeight / 100)
        })
      }
    } catch (error) {
      console.error("Error in ML pattern detection:", error)
    }

    metrics.patternScore = Math.min(patternScore, 100)

    // Calculate cluster score (based on relationship to known entities)
    // This is a simplified version - in a real system this would use graph analysis
    const clusterScore = mixerInteractions * 25 + highRiskInteractions * 15 + exchangeInteractions * 5
    metrics.clusterScore = Math.min(clusterScore, 100) // Scale 0-100

    // Calculate overall risk score (weighted average of component scores)
    const overallScore = metrics.velocityScore * 0.2 + metrics.patternScore * 0.5 + metrics.clusterScore * 0.3

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
        name: "New Wallet",
        description: `New wallet (${ageInDays} days old)`,
        impact: this.RISK_WEIGHTS.NEW_WALLET,
        score: 70,
        type: "new_wallet",
        severity: "medium",
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
      modelMetadata: getModelMetadata(),
    }
  }

  /**
   * Get the weight for a specific pattern type
   */
  private static getPatternWeight(patternType: string): number {
    switch (patternType) {
      case "time_based":
        return this.RISK_WEIGHTS.TIME_PATTERN
      case "amount_based":
        return this.RISK_WEIGHTS.AMOUNT_PATTERN
      case "flow_based":
        return this.RISK_WEIGHTS.FLOW_PATTERN
      case "behavioral":
        return this.RISK_WEIGHTS.BEHAVIORAL_PATTERN
      default:
        return 15
    }
  }

  /**
   * Format pattern type for display
   */
  private static formatPatternType(patternType: string): string {
    switch (patternType) {
      case "time_based":
        return "Time-Based"
      case "amount_based":
        return "Amount-Based"
      case "flow_based":
        return "Flow-Based"
      case "behavioral":
        return "Behavioral"
      default:
        return patternType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
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

/**
 * Apply calibration data to risk weights
 */
function applyCalibrationToWeights(
  weights: Record<string, number>,
  calibrationData: RiskCalibrationData,
): Record<string, number> {
  const adjustedWeights = { ...weights }

  // Apply calibration adjustments to each weight
  Object.keys(weights).forEach((key) => {
    if (calibrationData.factorAdjustments[key]) {
      adjustedWeights[key] = weights[key] * calibrationData.factorAdjustments[key]
    }
  })

  return adjustedWeights
}

/**
 * Calculate the age of a wallet based on its transaction history
 */
function calculateWalletAge(transactions: any[]): number {
  if (transactions.length === 0) {
    return 0
  }

  // Sort transactions by blockTime
  const sortedTransactions = [...transactions].sort((a, b) => {
    return (a.blockTime || 0) - (b.blockTime || 0)
  })

  // Get the earliest transaction time
  const earliestTime = sortedTransactions[0].blockTime || 0
  const currentTime = Math.floor(Date.now() / 1000)

  // Calculate age in milliseconds
  return (currentTime - earliestTime) * 1000
}

/**
 * Calculate transaction velocity (transactions per hour/day/week)
 */
function calculateTransactionVelocity(transactions: any[]): { hourly: number; daily: number; weekly: number } {
  if (transactions.length === 0) {
    return { hourly: 0, daily: 0, weekly: 0 }
  }

  const now = Date.now()
  const hourAgo = now - TIME_PERIODS.HOUR
  const dayAgo = now - TIME_PERIODS.DAY
  const weekAgo = now - TIME_PERIODS.WEEK

  let hourlyCount = 0
  let dailyCount = 0
  let weeklyCount = 0

  transactions.forEach((tx) => {
    if (!tx.blockTime) return

    const txTime = tx.blockTime * 1000

    if (txTime >= hourAgo) {
      hourlyCount++
    }

    if (txTime >= dayAgo) {
      dailyCount++
    }

    if (txTime >= weekAgo) {
      weeklyCount++
    }
  })

  return {
    hourly: hourlyCount,
    daily: dailyCount,
    weekly: weeklyCount,
  }
}

/**
 * Detect unusual instructions in a transaction
 */
function detectUnusualInstructions(transaction: any): boolean {
  // This would analyze the transaction instructions for unusual patterns
  // Simplified placeholder implementation
  return false
}

/**
 * Get the amount of a transaction in SOL
 */
function getTransactionAmount(transaction: any): number {
  if (!transaction.meta || !transaction.meta.postBalances || !transaction.meta.preBalances) {
    return 0
  }

  // Calculate the absolute sum of all balance changes
  let totalChange = 0

  for (let i = 0; i < transaction.meta.postBalances.length; i++) {
    const preBalance = transaction.meta.preBalances[i] || 0
    const postBalance = transaction.meta.postBalances[i] || 0

    totalChange += Math.abs(postBalance - preBalance)
  }

  // Convert from lamports to SOL
  return totalChange / 1_000_000_000
}

/**
 * Get the counterparty of a transaction
 */
function getCounterparty(transaction: any): string | null {
  // This would extract the counterparty address from the transaction
  // Simplified placeholder implementation
  return null
}

/**
 * Check if a transaction is incoming
 */
function isIncomingTransaction(transaction: any): boolean {
  // This would determine if a transaction is incoming to the wallet
  // Simplified placeholder implementation
  return false
}

/**
 * Save risk profile to database
 */
export async function saveRiskProfile(profile: WalletRiskProfile): Promise<void> {
  const { error } = await supabase.from("wallet_risk_profiles").upsert({
    address: profile.address,
    risk_score: profile.riskScore,
    risk_level: profile.riskLevel,
    risk_factors: profile.riskFactors,
    detected_patterns: profile.detectedPatterns,
    ml_patterns: profile.mlPatterns,
    model_metadata: profile.modelMetadata,
    last_updated: profile.lastUpdated,
  })

  if (error) {
    console.error("Error saving risk profile:", error)
    throw new Error("Failed to save risk profile")
  }
}

/**
 * Get risk profile from database
 */
export async function getRiskProfile(address: string): Promise<WalletRiskProfile | null> {
  const { data, error } = await supabase.from("wallet_risk_profiles").select("*").eq("address", address).limit(1)

  if (error) {
    console.error("Error getting risk profile:", error)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  const profile = data[0]

  return {
    address: profile.address,
    riskScore: profile.risk_score,
    riskLevel: profile.risk_level as RiskLevel,
    riskFactors: profile.risk_factors,
    detectedPatterns: profile.detected_patterns,
    mlPatterns: profile.ml_patterns,
    modelMetadata: profile.model_metadata,
    lastUpdated: profile.last_updated,
  }
}
