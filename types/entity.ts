export interface EntityLabel {
  id: string
  address: string
  label: string
  category: "exchange" | "individual" | "contract" | "scam" | "mixer" | "other"
  confidence: number
  source: "user" | "community" | "algorithm" | "database"
  createdAt: string
  updatedAt: string
  verified?: boolean
  riskScore?: number
  tags?: string[]
  notes?: string
}
