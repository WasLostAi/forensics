export type FraudPatternSeverity = "critical" | "high" | "medium" | "low"

export type FraudPatternCategory =
  | "wash_trading"
  | "layering"
  | "spoofing"
  | "pump_and_dump"
  | "rug_pull"
  | "phishing"
  | "ponzi"
  | "mixer"
  | "market_manipulation"
  | "front_running"
  | "flash_loan_attack"
  | "exit_scam"
  | "dusting_attack"
  | "other"

export interface FraudPattern {
  id: string
  name: string
  description: string
  category: FraudPatternCategory
  severity: FraudPatternSeverity
  indicators: FraudPatternIndicator[]
  detectionRules: FraudPatternDetectionRule[]
  examples?: string[] // Example transaction signatures
  createdAt: string
  updatedAt: string
  source?: string // Source of the pattern (e.g., "internal", "community", "regulatory")
  tags?: string[]
  metadata?: Record<string, any>
}

export interface FraudPatternIndicator {
  name: string
  description: string
  weight: number // 0-100
}

export interface FraudPatternDetectionRule {
  type: "simple" | "complex" | "ml"
  condition: string // For simple rules, a human-readable condition
  implementation?: string // For complex rules, the actual implementation logic
  threshold?: number // Threshold for triggering the rule
  parameters?: Record<string, any> // Additional parameters for the rule
}

export interface PatternMatchResult {
  patternId: string
  patternName: string
  matchScore: number // 0-100
  matchedIndicators: {
    name: string
    weight: number
    evidence: string
  }[]
  transactionSignatures: string[]
  confidence: number // 0-100
  timestamp: string
}

export interface FraudPatternDatabase {
  patterns: FraudPattern[]
  version: string
  lastUpdated: string
  source: string
}
