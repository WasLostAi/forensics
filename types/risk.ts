/**
 * Represents a risk factor contributing to a risk score
 */
export interface RiskFactor {
  name: string
  description: string
  impact: number // How much this factor contributes to the overall score (0-100)
  score: number // The raw score for this factor (0-100)
  details?: string[] // Optional additional details
  confidence?: number // AI confidence in this factor
}

/**
 * Represents a prediction of future risk
 */
export interface RiskPrediction {
  predictedTrend: "increasing" | "decreasing" | "stable"
  confidence: number // Confidence level of the prediction (0-1)
  description: string
  predictedFactors: RiskFactor[]
}

/**
 * Represents a comprehensive risk score for a wallet
 */
export interface RiskScore {
  address: string
  score: number // Overall risk score (0-100)
  level: "low" | "medium" | "high"
  factors: RiskFactor[]
  timestamp: string
  confidence?: number // Overall AI confidence
  prediction?: RiskPrediction // Optional prediction of future risk
  trend?: "increasing" | "decreasing" | "stable"
  trendDescription?: string
  trendPercentage?: string
  // AI/ML prediction fields
  predictedTrend?: "increasing" | "decreasing" | "stable"
  predictionConfidence?: number
  anomalyDescription?: string
  anomalyScore?: number
  predictedFactors?: RiskFactor[]
}

/**
 * Represents a risk score for a transaction
 */
export interface TransactionRiskScore {
  id: string
  score: number // Overall risk score (0-100)
  level: "low" | "medium" | "high"
  factors: RiskFactor[]
  timestamp: string
  confidence?: number // Overall confidence level (0-1)
}

/**
 * Represents a risk trend over time
 */
export interface RiskTrend {
  address: string
  periods: {
    timestamp: string
    score: number
  }[]
  trend: "increasing" | "decreasing" | "stable"
  percentChange: number
}

/**
 * Represents the result of anomaly detection
 */
export interface AnomalyDetectionResult {
  score: number // Anomaly score (0-100)
  count: number // Number of anomalies detected
  details: string[] // Details about detected anomalies
  confidence: number // Confidence level (0-1)
}

/**
 * Represents the result of transaction pattern classification
 */
export interface TransactionPatternResult {
  classification: string // Type of pattern detected
  anomalyScore: number // Anomaly score (0-100)
  confidence: number // Confidence level (0-1)
  details?: string[] // Optional details about the pattern
}

/**
 * Represents the result of entity classification
 */
export interface EntityClassificationResult {
  category: string // Entity category
  riskScore: number // Risk score (0-100)
  confidence: number // Confidence level (0-1)
  attributes: string[] // Entity attributes
}

export interface RiskMetrics {
  totalRiskScore: number
  highRiskFactors: number
  mediumRiskFactors: number
  lowRiskFactors: number
  riskTrend: "increasing" | "decreasing" | "stable"
  anomalyScore: number
  predictionAccuracy?: number
}

export interface AnomalyDetection {
  anomalies: Array<{
    type: string
    description: string
    severity: "low" | "medium" | "high"
    confidence: number
    relatedTransactions?: string[]
  }>
  anomalyScore: number
}
