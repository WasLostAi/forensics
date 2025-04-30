export interface Transaction {
  signature: string
  blockTime: number
  slot: number
  from: string
  to?: string
  amount?: number
  fee?: number
  status: "success" | "failure"
  type: "transfer" | "swap" | "stake" | "unstake" | "create" | "close" | "unknown"
  programId?: string
  tokenAddress?: string
  memo?: string
  cluster?: string
}

export interface TransactionDetails extends Transaction {
  instructions: Instruction[]
  accounts: string[]
  recentBlockhash: string
  logs?: string[]
}

export interface Instruction {
  programId: string
  accounts: string[]
  data: string
}

export interface TransactionCluster {
  id: string
  transactions: Transaction[]
  addresses: string[]
  totalValue: number
  startTime: number
  endTime: number
  riskScore: number
  pattern: string
}

export interface TransactionFlow {
  nodes: FlowNode[]
  links: FlowLink[]
}

export interface FlowNode {
  id: string
  label: string
  type: "wallet" | "contract" | "exchange" | "mixer" | "unknown"
  value: number
  riskScore?: number
}

export interface FlowLink {
  source: string
  target: string
  value: number
  transactions: string[]
}

export interface TransactionFilters {
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
  types?: string[]
  status?: string[]
  addresses?: string[]
  programIds?: string[]
}

export interface TransactionStats {
  totalCount: number
  successCount: number
  failureCount: number
  totalVolume: number
  averageAmount: number
  typeDistribution: Record<string, number>
}

export interface TransactionFlowData {
  nodes: FlowNode[]
  links: FlowLink[]
}
