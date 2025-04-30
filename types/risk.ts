// Risk level type
export type RiskLevel = "low" | "medium" | "high" | "unknown"

// Risk factor interface
export interface RiskFactor {
  name: string
  description: string
  impact: number
  details?: any
}

// Risk score interface
export interface RiskScore {
  address: string
  score: number
  factors: RiskFactor[]
  level: RiskLevel
  lastUpdated: Date
}

// Risk metrics interface
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

// Wallet risk score interface
export interface WalletRiskScore {
  address: string
  overallScore: number
  riskLevel: "low" | "medium" | "high" | "unknown"
  riskFactors: any[]
  metrics: RiskMetrics
  timestamp: string
}

// Transaction risk score interface
export interface TransactionRiskScore {
  id: string
  score: number
  level: "low" | "medium" | "high"
  factors: RiskFactor[]
  timestamp: string
}
