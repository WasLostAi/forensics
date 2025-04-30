// Transaction types for the application

export interface Transaction {
  signature: string
  timestamp?: string
  blockTime?: number
  from?: string
  to?: string
  source?: string
  destination?: string
  amount?: number
  status: string
  type: string
  programId?: string
  instructions?: string[]
  fee?: number
  slot?: number
  program?: string
  cluster?: string
}

export interface TransactionFlowNode {
  id: string
  address?: string
  label?: string
  type?: string
  value?: number
  group?: number
}

export interface TransactionFlowLink {
  id?: string
  source: string
  target: string
  value?: number
  timestamp?: string
}

export interface TransactionFlowData {
  nodes: TransactionFlowNode[]
  links: TransactionFlowLink[]
}

export interface TransactionFilter {
  dateRange?: {
    start: Date | null
    end: Date | null
  }
  types?: string[]
  minAmount?: number
  maxAmount?: number
  status?: string[]
}

export interface TransactionCluster {
  id: string
  transactions: Transaction[]
  pattern: string
  riskScore: number
  wallets: string[]
  totalValue: number
  timestamp: string
}

export interface TransactionTimeline {
  date: string
  transactions: Transaction[]
  totalValue: number
}

export interface TransactionStats {
  totalCount: number
  totalVolume: number
  avgTransactionSize: number
  largestTransaction: number
  mostActiveDay: string
  mostCommonType: string
}

export interface TransactionSearchResult {
  transaction: Transaction
  relevanceScore: number
  matchedFields: string[]
}

export interface TransactionExport {
  format: "csv" | "json" | "pdf"
  data: Transaction[]
  filters?: TransactionFilter
  timestamp: string
  filename: string
}
