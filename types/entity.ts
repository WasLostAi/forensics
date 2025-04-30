// Entity type
export type EntityType =
  | "exchange"
  | "wallet"
  | "contract"
  | "mixer"
  | "scam"
  | "unknown"
  | "token"
  | "project"
  | "dapp"

// Entity label interface
export interface EntityLabel {
  id?: string
  address: string
  label?: string
  name?: string
  category?: string
  type?: EntityType
  confidence: number
  source: string
  createdAt: string
  updatedAt: string
  verified?: boolean
  riskScore?: number
  tags?: string[]
  notes?: string
}

// Entity info interface
export interface EntityInfo {
  address: string
  name: string
  category: string
  riskLevel: string
  tags?: string[]
}
