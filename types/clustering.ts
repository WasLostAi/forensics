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

export interface EntityCluster {
  id: string
  name: string
  description: string
  entities: string[]
  entityCount: number
  dominantCategory: string
  behaviorPatterns: string[]
  similarityScore: number
  riskLevel: "low" | "medium" | "high"
  createdAt: string
  updatedAt?: string
  tags?: string[]
  notes?: string
}

export interface ClusteringMetrics {
  totalClusters: number
  averageSimilarity: number
  clusterSizes: number[]
  categoryDistribution: Record<string, number>
  riskDistribution: Record<string, number>
}

export interface BehaviorPattern {
  id: string
  name: string
  description: string
  frequency: number
  significance: number
  examples: string[]
}

export interface EntitySimilarity {
  entity1: string
  entity2: string
  similarityScore: number
  sharedPatterns: string[]
  sharedCounterparties: number
}
