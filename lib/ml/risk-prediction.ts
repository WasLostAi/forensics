import type { Transaction } from "@/types/transaction"
import type { RiskScore, RiskFactor } from "@/types/risk"
import { detectAnomalies } from "./anomaly-detection"
import type { TransactionFlowData } from "@/types/transaction"
import type { RiskPrediction } from "@/types/risk"

/**
 * Predicts future risk based on current risk factors and transaction patterns
 */
export async function predictFutureRisk(
  walletAddress: string,
  flowData: TransactionFlowData,
  currentFactors: RiskFactor[],
): Promise<RiskPrediction> {
  // In a real implementation, this would use a trained ML model
  // For now, we'll use a simplified heuristic approach

  // Extract key metrics from current risk factors
  const currentRiskScore = currentFactors.reduce((sum, factor) => sum + factor.impact, 0)
  const hasHighRiskConnections = currentFactors.some((f) => f.name === "High-Risk Connections")
  const hasMixerConnections = currentFactors.some((f) => f.name === "Mixer Connections")
  const hasCircularTransactions = currentFactors.some((f) => f.name === "Circular Transactions")
  const hasAnomalousPatterns = currentFactors.some((f) => f.name === "Anomalous Patterns")

  // Extract transaction velocity metrics
  const velocityFactor = currentFactors.find((f) => f.name === "Transaction Velocity")
  const highVelocity = velocityFactor && velocityFactor.score > 50

  // Analyze transaction growth
  const timestamps = flowData.links
    .filter((link) => link.timestamp)
    .map((link) => new Date(link.timestamp).getTime())
    .sort()

  let transactionGrowth = "stable"
  if (timestamps.length >= 10) {
    const midpoint = Math.floor(timestamps.length / 2)
    const firstHalf = timestamps.slice(0, midpoint)
    const secondHalf = timestamps.slice(midpoint)

    const firstHalfAvgGap = (firstHalf[firstHalf.length - 1] - firstHalf[0]) / (firstHalf.length - 1)
    const secondHalfAvgGap = (secondHalf[secondHalf.length - 1] - secondHalf[0]) / (secondHalf.length - 1)

    if (secondHalfAvgGap < firstHalfAvgGap * 0.7) {
      transactionGrowth = "accelerating"
    } else if (secondHalfAvgGap > firstHalfAvgGap * 1.3) {
      transactionGrowth = "decelerating"
    }
  }

  // Predict future risk
  let predictedScore = currentRiskScore
  let trendDirection: "increasing" | "decreasing" | "stable" = "stable"
  let confidence = 0.7
  const factors: string[] = []

  // Adjust prediction based on risk factors
  if (hasHighRiskConnections) {
    predictedScore += 10
    trendDirection = "increasing"
    factors.push("Increasing connections to high-risk entities")
    confidence += 0.05
  }

  if (hasMixerConnections) {
    predictedScore += 15
    trendDirection = "increasing"
    factors.push("Use of mixer services indicates ongoing privacy concerns")
    confidence += 0.1
  }

  if (hasCircularTransactions) {
    predictedScore += 10
    trendDirection = "increasing"
    factors.push("Circular transaction patterns likely to continue")
    confidence += 0.05
  }

  if (hasAnomalousPatterns) {
    predictedScore += 15
    trendDirection = "increasing"
    factors.push("Anomalous behavior patterns detected by AI")
    confidence += 0.1
  }

  // Adjust based on transaction velocity
  if (highVelocity) {
    if (transactionGrowth === "accelerating") {
      predictedScore += 20
      trendDirection = "increasing"
      factors.push("Rapidly accelerating transaction velocity")
      confidence += 0.05
    } else if (transactionGrowth === "decelerating") {
      predictedScore -= 10
      trendDirection = trendDirection === "increasing" ? "stable" : "decreasing"
      factors.push("Decreasing transaction velocity")
    }
  }

  // Cap the predicted score and confidence
  predictedScore = Math.min(100, Math.max(0, predictedScore))
  confidence = Math.min(0.95, confidence)

  // If no significant factors, default to stable
  if (factors.length === 0) {
    factors.push("No significant risk change factors identified")
    trendDirection = "stable"
  }

  // If predicted score is significantly different, adjust trend
  if (predictedScore > currentRiskScore + 20) {
    trendDirection = "increasing"
  } else if (predictedScore < currentRiskScore - 20) {
    trendDirection = "decreasing"
  }

  return {
    trendDirection,
    predictedScore,
    timeframe: "30 days",
    confidence,
    factors,
  }
}

/**
 * Predicts future risk trends based on historical data and current patterns
 */
export async function predictRiskTrend(
  walletAddress: string,
  currentRiskScore: RiskScore,
  transactions: Transaction[],
): Promise<{
  predictedTrend: "increasing" | "decreasing" | "stable"
  confidence: number
  description: string
  predictedFactors: RiskFactor[]
}> {
  // In a real implementation, this would use a trained ML model
  // For now, we'll implement a simple heuristic approach

  // Detect anomalies in recent transactions
  const { anomalies, anomalyScore } = await detectAnomalies(walletAddress, transactions)

  // Analyze transaction recency
  const now = Date.now()
  const recentTransactions = transactions.filter((tx) => {
    const txTime = new Date(tx.timestamp || now).getTime()
    return now - txTime < 7 * 24 * 60 * 60 * 1000 // Within last 7 days
  })

  // Determine trend based on anomalies and recent activity
  let predictedTrend: "increasing" | "decreasing" | "stable" = "stable"
  let confidence = 0.7 // Default confidence
  let description = "Risk level is predicted to remain stable based on consistent transaction patterns."

  if (anomalyScore > 30 && recentTransactions.length > 0) {
    predictedTrend = "increasing"
    confidence = 0.65 + anomalyScore / 200 // Confidence increases with anomaly score
    description = "Risk level is predicted to increase due to recent unusual transaction patterns."
  } else if (recentTransactions.length === 0 && currentRiskScore.score > 30) {
    predictedTrend = "decreasing"
    confidence = 0.6
    description = "Risk level may decrease due to recent inactivity."
  }

  // Generate predicted risk factors
  const predictedFactors: RiskFactor[] = []

  // Convert anomalies to risk factors
  anomalies.forEach((anomaly) => {
    predictedFactors.push({
      name: `Predicted ${anomaly.type.replace("_", " ")}`,
      description: `${anomaly.description} may continue or increase`,
      impact: anomaly.severity === "high" ? 20 : anomaly.severity === "medium" ? 12 : 5,
      score: anomaly.severity === "high" ? 85 : anomaly.severity === "medium" ? 65 : 35,
      confidence: anomaly.confidence,
    })
  })

  // Add a trend-based factor
  if (predictedTrend === "increasing") {
    predictedFactors.push({
      name: "Increasing activity pattern",
      description: "Transaction frequency is predicted to increase",
      impact: 10,
      score: 60,
      confidence: confidence,
    })
  }

  return {
    predictedTrend,
    confidence,
    description,
    predictedFactors,
  }
}
