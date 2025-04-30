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

export interface WalletMonitoringConfig {
  walletAddress: string
  isEnabled: boolean
  alertThreshold: number
  notificationChannels: string[]
  customRules: string[]
  tags: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface MixerAnalysisResult {
  usedMixer: boolean
  mixerAddresses: string[]
  volume: number
  riskScore: number
}

export interface SniperActivityResult {
  isSniper: boolean
  profit: number
  transactionCount: number
  successRate: number
  riskScore: number
}

export interface RugPullAnalysisResult {
  isRugPuller: boolean
  rugPullCount: number
  riskScore: number
}

export interface SocialMediaAnalysisResult {
  twitterMentions: number
  discordMentions: number
  telegramMentions: number
  recentPosts: {
    platform: string
    content: string
    url: string
    timestamp: string
  }[]
}
