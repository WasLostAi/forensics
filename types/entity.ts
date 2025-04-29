export interface EntityLabel {
  id: string
  address: string
  label: string
  category: "exchange" | "individual" | "contract" | "scam" | "other"
  confidence: number
  source: "user" | "community" | "algorithm"
  createdAt: string
  updatedAt: string
}
