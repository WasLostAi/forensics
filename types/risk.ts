export type TransactionPattern = {
  type: PatternType
  patternCount: number
  totalRiskScore: number
  patterns: PatternResult[]
  affectedTransactions: number
  highSeverityCount: number
}

export interface PatternResult {
  type: string
  name: string
  description: string
  severity: PatternSeverity
  transactions: string[]
  score: number
  metadata: Record<string, any>
}

export type PatternType = "time_based" | "amount_based" | "flow_based" | "behavioral"

export type RiskScore = "high" | "medium" | "low" | "minimal" | "unknown"

export type PatternSeverity = "high" | "medium" | "low" | "critical" | "none"

export interface RiskThresholdConfig {
  highRiskThreshold: number
  mediumRiskThreshold: number
  largeTransactionThreshold: number
  unusualVelocityThreshold: number
  mixerInteractionWeight: number
  circularPatternWeight: number
}

export interface TransactionRiskScore {
  id: string
  score: number
  level: "low" | "medium" | "high"
  factors: {
    name: string
    description: string
    impact: number
  }[]
  timestamp: string
}

export interface WalletRiskProfile {
  address: string
  overallScore: number
  riskLevel: RiskLevel
  riskFactors: RiskFactor[]
  metrics: RiskMetrics
  timestamp: string
  detectedPatterns?: TransactionPattern[]
  mlPatterns?: any[]
  modelMetadata?: any
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
  mlPatterns?: any[]
  detectedPatterns?: any[]
}

export interface RiskFactor {
  name: string
  description: string
  impact: number // How much this factor contributes to the overall score (0-100)
  score: number // The raw score for this factor (0-100)
  details?: string // Optional additional details
  type?: string // Type of risk factor (for internal use)
  severity?: "high" | "medium" | "low" | "critical" | "none" // Severity level
  relatedTx?: string // Related transaction ID
}

export interface RiskProfile {
  address: string
  score: number
  category: RiskScore
  factors: RiskFactor[]
  lastUpdated: string
}

export interface RiskCalibrationData {
  id: string
  factorAdjustments: Record<string, number>
  thresholdAdjustments: Record<string, number>
  createdAt: string
  description: string
}

export type RiskLevel = "high" | "medium" | "low" | "minimal" | "unknown"

export interface MLPatternResult {
  type: string
  name: string
  description: string
  severity: "high" | "medium" | "low"
  transactions: string[]
  score: number
  confidence: number
  featureImportance: { name: string; importance: number }[]
  modelMetadata: {
    modelType: string
    version: string
    threshold?: number
    featureCount?: number
    patternType?: string
    sequenceLength?: number
  }
}
