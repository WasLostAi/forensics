export interface WalletData {
  address: string
  balance: number
  transactionCount: number
  firstActivity: string
  lastActivity: string
  riskScore: number
  labels: string[]
  incomingVolume: number
  outgoingVolume: number
}
