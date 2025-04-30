/**
 * Represents a risk factor contributing to a risk score
 */
export interface RiskFactor {
  name: string
  description: string
  impact: number // How much this factor contributes to the overall score (0-100)
  score: number // The raw score for this factor (0-100)
  details?: string[] // Optional additional details
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

export interface RiskMetrics {
  totalTransactions: number
  totalVolume: number
  avgTransactionSize: number
  mixerInteractions: number
  exchangeInteractions: number
  unknownInteractions: number
  highRiskInteractions: number
  age: number
  velocityScore: number
  patternScore: number
  clusterScore: number
}

export interface WalletRiskScore {
  address: string
  overallScore: number
  riskLevel: "low" | "medium" | "high" | "unknown"
  riskFactors: any[]
  metrics: RiskMetrics
  timestamp: string
}
