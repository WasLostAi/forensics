export interface EntityLabel {
  id: string
  address: string
  label: string
  category: string
  confidence: number
  source: string
  createdAt: string
  updatedAt: string
  verified?: boolean
  riskScore?: number
  tags?: string[]
  notes?: string
}
