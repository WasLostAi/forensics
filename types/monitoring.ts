export interface ICOProject {
  id: string
  name: string
  symbol: string
  address: string
  raisedAmount: number
  launchDate: string
  currentStatus: "active" | "inactive" | "rugpull" | "successful"
  socialLinks: {
    twitter?: string
    website?: string
    telegram?: string
  }
  description?: string
  tags: string[]
  riskScore: number
  fundFlow?: FundFlowData
  relationships?: WalletRelationship
}

export interface WalletRelationship {
  nodes: WalletNode[]
  edges: WalletEdge[]
}

export interface WalletNode {
  id: string
  label: string
  type: "ico" | "exchange" | "mixer" | "team" | "investor" | "unknown"
  riskScore: number
  volume: number
  isVerified?: boolean
}

export interface WalletEdge {
  id: string
  source: string
  target: string
  type: "inflow" | "outflow" | "bidirectional"
  value: number
  timestamp: string
  transactionCount: number
}

export interface FundFlowData {
  initialRaise: number
  currentBalance: number
  outflows: {
    exchanges: number
    mixers: number
    other: number
    unknown: number
  }
  topDestinations: {
    address: string
    amount: number
    label?: string
    category?: string
  }[]
}

export interface RugPullData {
  id: string
  tokenName: string
  tokenSymbol: string
  deployer: string
  deployerLabel?: string
  platform: "pump.fun" | "raydium" | "orca" | "other"
  deployDate: string
  rugDate?: string
  initialLiquidity: number
  liquidityRemoved: number
  victimCount: number
  relatedTokens: string[]
  relatedDeployers: string[]
  validatorAssociations?: string[]
  pattern: "fast_rug" | "slow_rug" | "honeypot" | "back_run" | "other"
  riskScore: number
}

export interface MixerData {
  id: string
  name: string
  type: "protocol" | "service" | "exchange" | "bridge"
  addresses: string[]
  volume24h: number
  volumeTotal: number
  activeUsers: number
  patternSignature: {
    hopCount: number
    timePattern: "fixed" | "random" | "batched"
    amountPattern: "fixed" | "percentage" | "random" | "fibonacci"
  }
  riskScore: number
  knownUsers?: string[]
}

export interface SniperData {
  id: string
  address: string
  label?: string
  targetPlatforms: string[]
  profitTotal: number
  profit24h: number
  transactionCount: number
  successRate: number
  mevType: "frontrun" | "backrun" | "sandwich" | "arbitrage" | "other"
  gasProfile: {
    average: number
    max: number
    strategy: "aggressive" | "moderate" | "efficient"
  }
  riskScore: number
  validatorAssociations?: string[]
}

export interface MonitoringAlert {
  id: string
  timestamp: string
  type: "ico" | "rugpull" | "mixer" | "sniper"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  address: string
  relatedAddresses?: string[]
  data: any
  read: boolean
  archived: boolean
}
