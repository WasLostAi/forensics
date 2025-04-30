export interface MLPatternResult {
  type: string
  name: string
  description: string
  severity: "high" | "medium" | "low"
  transactions: string[]
  score: number
  confidence: number
  featureImportance: { name: string; importance: number }[]
  modelMetadata: {
    modelType: string
    version: string
    threshold?: number
    featureCount?: number
    patternType?: string
    sequenceLength?: number
  }
}

export interface MLModelMetadata {
  name: string
  type: string
  version: string
  featureCount: number
  lastUpdated: string
  description: string
  performance: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
  }
}

export interface FeatureVector {
  signature: string
  timestamp: string
  features: number[]
}
