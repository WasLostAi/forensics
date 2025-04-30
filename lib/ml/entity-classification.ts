import type { Entity } from "@/types/entity"

/**
 * Classifies entities based on their transaction patterns and characteristics
 */
export async function classifyEntity(
  entity: Entity,
  transactionCount: number,
  avgTransactionValue: number,
  uniqueCounterparties: number,
): Promise<{
  classification: string
  confidence: number
  tags: string[]
  riskLevel: "low" | "medium" | "high"
}> {
  // In a real implementation, this would use a trained classifier
  // For now, we'll implement a simple rule-based classification

  let classification = "unknown"
  let confidence = 0.5
  const tags: string[] = []
  let riskLevel: "low" | "medium" | "high" = "low"

  // Check for exchange patterns
  if (transactionCount > 1000 && uniqueCounterparties > 500) {
    classification = "exchange"
    confidence = 0.85
    tags.push("high-volume", "many-counterparties")
    riskLevel = "low"
  }
  // Check for mixer patterns
  else if (transactionCount > 100 && avgTransactionValue < 0.1 && uniqueCounterparties > 50) {
    classification = "mixer"
    confidence = 0.75
    tags.push("small-transactions", "many-counterparties")
    riskLevel = "high"
  }
  // Check for personal wallet patterns
  else if (transactionCount < 100 && uniqueCounterparties < 20) {
    classification = "personal"
    confidence = 0.7
    tags.push("low-volume")
    riskLevel = "low"
  }
  // Check for smart contract patterns
  else if (entity.type === "contract") {
    classification = "smart-contract"
    confidence = 0.9
    tags.push("contract")
    riskLevel = "medium"
  }

  // Add entity-specific tags if available
  if (entity.tags) {
    tags.push(...entity.tags)
  }

  return {
    classification,
    confidence,
    tags,
    riskLevel,
  }
}
