export interface Transaction {
  signature: string
  blockTime: number
  status: "confirmed" | "failed"
  fee: number
  amount: number
  type: "transfer" | "swap" | "other"
  source: string
  destination: string
  program: string
  cluster: "mainnet" | "testnet" | "devnet"
}

export interface TransactionFlowData {
  nodes: {
    id: string
    group?: number
    label?: string
    value?: number
    color?: string
  }[]
  links: {
    source: string
    target: string
    value: number
    timestamp: string
  }[]
}
