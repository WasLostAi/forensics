import type { Transaction } from "@/types/transaction"
import { supabase } from "./supabase"

export interface FraudPattern {
  id: string
  name: string
  description: string
  category: string
  severity: "high" | "medium" | "low"
  indicators: string[]
  detectionRules: {
    type: string
    parameters: Record<string, any>
  }[]
  createdAt: string
  updatedAt: string
  source: string
  references: string[]
  examples: string[]
}

/**
 * Service for managing known fraud patterns
 */
export class FraudPatternsDatabase {
  /**
   * Get all known fraud patterns
   */
  static async getAllPatterns(): Promise<FraudPattern[]> {
    try {
      const { data, error } = await supabase.from("fraud_patterns").select("*")

      if (error) {
        console.error("Error fetching fraud patterns:", error)
        return this.getDefaultPatterns()
      }

      return (data as FraudPattern[]) || this.getDefaultPatterns()
    } catch (error) {
      console.error("Error in getAllPatterns:", error)
      return this.getDefaultPatterns()
    }
  }

  /**
   * Get a specific fraud pattern by ID
   */
  static async getPatternById(id: string): Promise<FraudPattern | null> {
    try {
      const { data, error } = await supabase.from("fraud_patterns").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching fraud pattern:", error)
        return null
      }

      return data as FraudPattern
    } catch (error) {
      console.error("Error in getPatternById:", error)
      return null
    }
  }

  /**
   * Add a new fraud pattern
   */
  static async addPattern(pattern: Omit<FraudPattern, "id" | "createdAt" | "updatedAt">): Promise<FraudPattern | null> {
    try {
      const newPattern = {
        ...pattern,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("fraud_patterns").insert([newPattern]).select()

      if (error) {
        console.error("Error adding fraud pattern:", error)
        return null
      }

      return data[0] as FraudPattern
    } catch (error) {
      console.error("Error in addPattern:", error)
      return null
    }
  }

  /**
   * Update an existing fraud pattern
   */
  static async updatePattern(id: string, updates: Partial<FraudPattern>): Promise<FraudPattern | null> {
    try {
      const { data, error } = await supabase
        .from("fraud_patterns")
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) {
        console.error("Error updating fraud pattern:", error)
        return null
      }

      return data[0] as FraudPattern
    } catch (error) {
      console.error("Error in updatePattern:", error)
      return null
    }
  }

  /**
   * Delete a fraud pattern
   */
  static async deletePattern(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("fraud_patterns").delete().eq("id", id)

      if (error) {
        console.error("Error deleting fraud pattern:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in deletePattern:", error)
      return false
    }
  }

  /**
   * Match transactions against known fraud patterns
   */
  static async matchTransactionsToPatterns(
    transactions: Transaction[],
    address: string,
  ): Promise<{
    matches: Array<{
      transaction: Transaction
      pattern: FraudPattern
      confidence: number
    }>
  }> {
    try {
      // Get all patterns
      const patterns = await this.getAllPatterns()
      const matches = []

      // For each transaction, check against each pattern
      for (const tx of transactions) {
        for (const pattern of patterns) {
          const confidence = this.evaluatePatternMatch(tx, pattern)

          if (confidence > 0.7) {
            matches.push({
              transaction: tx,
              pattern,
              confidence,
            })
          }
        }
      }

      return { matches }
    } catch (error) {
      console.error("Error in matchTransactionsToPatterns:", error)
      return { matches: [] }
    }
  }

  /**
   * Evaluate how well a transaction matches a fraud pattern
   */
  private static evaluatePatternMatch(tx: Transaction, pattern: FraudPattern): number {
    // This would be a sophisticated matching algorithm in a real implementation
    // For now, we'll use a simple placeholder implementation

    let matchScore = 0

    // Check each detection rule
    for (const rule of pattern.detectionRules) {
      switch (rule.type) {
        case "amount_threshold":
          if (tx.amount > rule.parameters.threshold) {
            matchScore += 0.3
          }
          break
        case "round_amount":
          if (Math.abs(tx.amount - Math.round(tx.amount)) < 0.001) {
            matchScore += 0.4
          }
          break
        case "unusual_hour":
          const hour = new Date(tx.timestamp).getUTCHours()
          if (hour >= 1 && hour <= 5) {
            matchScore += 0.5
          }
          break
        // Add more rule types as needed
      }
    }

    return Math.min(matchScore, 1)
  }

  /**
   * Get default patterns if database is not available
   */
  private static getDefaultPatterns(): FraudPattern[] {
    return [
      {
        id: "pattern-1",
        name: "Wash Trading",
        description: "Artificial trading activity between related accounts to create the illusion of market activity",
        category: "market_manipulation",
        severity: "high",
        indicators: [
          "Frequent back-and-forth transactions between the same accounts",
          "Similar transaction amounts",
          "Transactions occurring in rapid succession",
        ],
        detectionRules: [
          {
            type: "bidirectional_flow",
            parameters: {
              minCycles: 3,
              maxTimeBetweenCycles: 86400, // 24 hours in seconds
              similarAmountThreshold: 0.1, // 10% difference
            },
          },
        ],
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        source: "internal",
        references: ["https://www.example.com/wash-trading"],
        examples: ["0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"],
      },
      {
        id: "pattern-2",
        name: "Layering",
        description: "Moving funds through multiple accounts to obscure the source",
        category: "money_laundering",
        severity: "high",
        indicators: [
          "Funds moving through 4+ accounts in sequence",
          "Each hop occurs within a short time frame",
          "Similar amounts transferred in each hop",
        ],
        detectionRules: [
          {
            type: "sequential_transfers",
            parameters: {
              minHops: 4,
              maxTimeBetweenHops: 3600, // 1 hour in seconds
              similarAmountThreshold: 0.05, // 5% difference
            },
          },
        ],
        createdAt: "2023-01-02T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
        source: "internal",
        references: ["https://www.example.com/layering"],
        examples: ["0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"],
      },
      {
        id: "pattern-3",
        name: "Smurfing",
        description: "Breaking large amounts into multiple smaller transactions to avoid detection",
        category: "money_laundering",
        severity: "medium",
        indicators: [
          "Multiple small transactions from the same source",
          "Transactions occur within a short time frame",
          "Similar transaction amounts",
        ],
        detectionRules: [
          {
            type: "multiple_small_transfers",
            parameters: {
              minTransactions: 5,
              maxTimeFrame: 86400, // 24 hours in seconds
              maxAmount: 1000, // Maximum amount per transaction
              similarAmountThreshold: 0.1, // 10% difference
            },
          },
        ],
        createdAt: "2023-01-03T00:00:00Z",
        updatedAt: "2023-01-03T00:00:00Z",
        source: "internal",
        references: ["https://www.example.com/smurfing"],
        examples: ["0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456"],
      },
      {
        id: "pattern-4",
        name: "Round Amount Transactions",
        description: "Suspicious transactions with suspiciously round amounts",
        category: "suspicious_activity",
        severity: "medium",
        indicators: [
          "Transaction amounts are whole numbers",
          "Transaction amounts end in multiple zeros",
          "Multiple round amount transactions in sequence",
        ],
        detectionRules: [
          {
            type: "round_amount",
            parameters: {
              threshold: 0.001, // Maximum difference from a whole number
            },
          },
        ],
        createdAt: "2023-01-04T00:00:00Z",
        updatedAt: "2023-01-04T00:00:00Z",
        source: "internal",
        references: ["https://www.example.com/round-amounts"],
        examples: ["0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234"],
      },
      {
        id: "pattern-5",
        name: "Mixer Interaction",
        description: "Transactions involving known cryptocurrency mixers or tumblers",
        category: "money_laundering",
        severity: "high",
        indicators: [
          "Transactions to/from known mixer addresses",
          "Multiple small withdrawals following a deposit",
          "Time delays between deposit and withdrawals",
        ],
        detectionRules: [
          {
            type: "known_entity_interaction",
            parameters: {
              entityType: "mixer",
              interactionType: "any", // "send", "receive", or "any"
            },
          },
        ],
        createdAt: "2023-01-05T00:00:00Z",
        updatedAt: "2023-01-05T00:00:00Z",
        source: "internal",
        references: ["https://www.example.com/mixers"],
        examples: ["0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12"],
      },
    ]
  }
}

// Create the database table if it doesn't exist
export async function initializeFraudPatternsDatabase(): Promise<void> {
  try {
    // Check if the table exists
    const { error: checkError } = await supabase.from("fraud_patterns").select("id").limit(1)

    if (checkError) {
      console.log("Fraud patterns table doesn't exist, creating it...")

      // Create the table
      const { error: createError } = await supabase.rpc("create_fraud_patterns_table")

      if (createError) {
        console.error("Error creating fraud patterns table:", createError)
        return
      }

      // Seed with default patterns
      const defaultPatterns = FraudPatternsDatabase.getDefaultPatterns()

      for (const pattern of defaultPatterns) {
        await FraudPatternsDatabase.addPattern({
          name: pattern.name,
          description: pattern.description,
          category: pattern.category,
          severity: pattern.severity,
          indicators: pattern.indicators,
          detectionRules: pattern.detectionRules,
          source: pattern.source,
          references: pattern.references,
          examples: pattern.examples,
        })
      }

      console.log("Fraud patterns database initialized with default patterns")
    } else {
      console.log("Fraud patterns table already exists")
    }
  } catch (error) {
    console.error("Error initializing fraud patterns database:", error)
  }
}
