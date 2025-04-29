export interface TransactionCluster {
  id: string
  name: string
  description: string
  walletCount: number
  transactionCount: number
  totalValue: number
  riskLevel: "low" | "medium" | "high"
  patternType: string
  wallets: string[]
  transactions: string[]
}

export interface WalletCluster {
  id: string
  name: string
  description: string
  walletCount: number
  riskLevel: "low" | "medium" | "high"
  wallets: string[]
  commonTraits: string[]
}

export interface SuspiciousPattern {
  id: string
  type: string
  description: string
  severity: "low" | "medium" | "high"
  involvedWallets: string[]
  involvedTransactions: string[]
  detectionTime: string
}

export interface RiskFactor {
  factor: string
  impact: number
  description: string
}

export interface WalletRiskScore {
  score: number
  level: "low" | "medium" | "high"
  factors: RiskFactor[]
}
