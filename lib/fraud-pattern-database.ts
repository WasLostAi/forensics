import { supabase } from "./supabase"
import type { FraudPattern, FraudPatternCategory, FraudPatternSeverity } from "@/types/fraud-patterns"

// Known fraud patterns database
const KNOWN_FRAUD_PATTERNS: FraudPattern[] = [
  {
    id: "wash-trading-basic",
    name: "Basic Wash Trading",
    description: "Trading between wallets controlled by the same entity to create artificial volume",
    category: "wash_trading",
    severity: "high",
    indicators: [
      {
        name: "circular_transfers",
        description: "Funds moving in a circular pattern between related wallets",
        weight: 80,
      },
      {
        name: "same_amounts",
        description: "Transfers of identical or very similar amounts",
        weight: 60,
      },
      {
        name: "high_frequency",
        description: "High frequency of trades between the same wallets",
        weight: 70,
      },
    ],
    detectionRules: [
      {
        type: "simple",
        condition: "At least 3 transfers between the same set of wallets within 24 hours",
        threshold: 3,
      },
    ],
    examples: [
      "5xq7LAaLTUBTUPQT3HRjMR3ghJL2aAHhW9SB8sTh3QQGBhjXuJ6VqPLzLtRzUUNEDgJT7XDEQVpTNnRBTcYwDnhQ",
      "2HjS4qTEZGLQwkGvTQtJbZrFBCuF5mKnGUPP8DKGi4HoRHzvMYjHywP5oDTAADTGLaxTaAkGV7jSJ6yPsQHkrxvp",
    ],
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z",
    source: "internal",
    tags: ["defi", "market_manipulation", "volume_inflation"],
  },
  {
    id: "layering-attack",
    name: "Layering Attack",
    description: "Creating multiple orders at different price levels to give the impression of market depth",
    category: "layering",
    severity: "high",
    indicators: [
      {
        name: "multiple_orders",
        description: "Multiple orders placed at different price levels",
        weight: 75,
      },
      {
        name: "quick_cancellation",
        description: "Orders quickly cancelled after market moves",
        weight: 85,
      },
      {
        name: "price_impact",
        description: "Significant price impact from the orders",
        weight: 65,
      },
    ],
    detectionRules: [
      {
        type: "complex",
        condition: "Multiple orders placed and cancelled within short time frames",
        threshold: 5,
        parameters: {
          timeWindow: 300, // 5 minutes
          minOrders: 5,
        },
      },
    ],
    createdAt: "2023-02-10T00:00:00Z",
    updatedAt: "2023-02-10T00:00:00Z",
    source: "regulatory",
    tags: ["market_manipulation", "order_book"],
  },
  {
    id: "pump-and-dump",
    name: "Pump and Dump Scheme",
    description: "Artificially inflating the price of an asset before selling large holdings",
    category: "pump_and_dump",
    severity: "critical",
    indicators: [
      {
        name: "price_spike",
        description: "Sudden significant price increase",
        weight: 70,
      },
      {
        name: "social_promotion",
        description: "Coordinated social media promotion",
        weight: 60,
      },
      {
        name: "large_sell_off",
        description: "Large sell-off shortly after price spike",
        weight: 90,
      },
    ],
    detectionRules: [
      {
        type: "complex",
        condition: "Price increase of >50% followed by large sell-offs within 48 hours",
        parameters: {
          priceIncreaseThreshold: 50,
          timeWindow: 172800, // 48 hours
          sellOffThreshold: 30, // 30% of holdings
        },
      },
    ],
    createdAt: "2023-03-05T00:00:00Z",
    updatedAt: "2023-03-05T00:00:00Z",
    source: "community",
    tags: ["market_manipulation", "social_coordination"],
  },
  {
    id: "rug-pull-basic",
    name: "Basic Rug Pull",
    description: "Project creators abandoning the project and withdrawing all liquidity",
    category: "rug_pull",
    severity: "critical",
    indicators: [
      {
        name: "liquidity_removal",
        description: "Sudden removal of a large percentage of liquidity",
        weight: 95,
      },
      {
        name: "dev_wallet_emptying",
        description: "Developer wallets emptied shortly after liquidity removal",
        weight: 90,
      },
      {
        name: "social_disappearance",
        description: "Disappearance from social media and communication channels",
        weight: 70,
      },
    ],
    detectionRules: [
      {
        type: "simple",
        condition: "Removal of >80% of liquidity within a short time period",
        threshold: 80,
      },
    ],
    createdAt: "2023-04-20T00:00:00Z",
    updatedAt: "2023-04-20T00:00:00Z",
    source: "internal",
    tags: ["defi", "liquidity", "exit_scam"],
  },
  {
    id: "mixer-usage",
    name: "Cryptocurrency Mixer Usage",
    description: "Using mixing services to obscure the source of funds",
    category: "mixer",
    severity: "high",
    indicators: [
      {
        name: "known_mixer_interaction",
        description: "Interaction with known mixing service addresses",
        weight: 85,
      },
      {
        name: "multiple_small_transfers",
        description: "Funds split into multiple small transfers",
        weight: 70,
      },
      {
        name: "timing_patterns",
        description: "Specific timing patterns associated with mixer services",
        weight: 60,
      },
    ],
    detectionRules: [
      {
        type: "simple",
        condition: "Direct interaction with known mixer addresses",
        implementation: "checkAddressAgainstMixerList",
      },
    ],
    examples: ["4GyLnKUCHGwTbzBbDkrVg4gfLAgTjLhU5MdPFXaAFMXQ7mHtQ6QqgqJGrKrPmzJAFrULxywCvzw3nS2Vkm8mGbFY"],
    createdAt: "2023-05-12T00:00:00Z",
    updatedAt: "2023-05-12T00:00:00Z",
    source: "regulatory",
    tags: ["aml", "privacy", "compliance"],
  },
  {
    id: "front-running",
    name: "Front-Running Attack",
    description: "Executing trades ahead of known future transactions to profit from price movements",
    category: "front_running",
    severity: "high",
    indicators: [
      {
        name: "transaction_timing",
        description: "Transactions executed just before large known transactions",
        weight: 85,
      },
      {
        name: "mev_bot_pattern",
        description: "Transaction patterns matching known MEV bot behavior",
        weight: 80,
      },
      {
        name: "profit_taking",
        description: "Quick profit-taking after price movement",
        weight: 75,
      },
    ],
    detectionRules: [
      {
        type: "complex",
        condition: "Transaction executed within 2 blocks before a large transaction affecting the same asset",
        parameters: {
          blockWindow: 2,
          minTransactionSize: 1000, // in SOL
        },
      },
    ],
    createdAt: "2023-06-08T00:00:00Z",
    updatedAt: "2023-06-08T00:00:00Z",
    source: "internal",
    tags: ["mev", "trading", "arbitrage"],
  },
  {
    id: "flash-loan-attack",
    name: "Flash Loan Attack",
    description: "Using flash loans to manipulate markets or exploit protocol vulnerabilities",
    category: "flash_loan_attack",
    severity: "critical",
    indicators: [
      {
        name: "large_flash_loan",
        description: "Taking out a large flash loan",
        weight: 70,
      },
      {
        name: "multiple_protocol_interaction",
        description: "Interacting with multiple protocols in a single transaction",
        weight: 80,
      },
      {
        name: "large_profit",
        description: "Generating large profit from the transaction",
        weight: 85,
      },
    ],
    detectionRules: [
      {
        type: "complex",
        condition: "Flash loan followed by multiple protocol interactions and large profit",
        parameters: {
          minLoanSize: 10000, // in SOL
          minProfitPercentage: 5,
        },
      },
    ],
    createdAt: "2023-07-15T00:00:00Z",
    updatedAt: "2023-07-15T00:00:00Z",
    source: "internal",
    tags: ["defi", "exploit", "vulnerability"],
  },
  {
    id: "dusting-attack",
    name: "Dusting Attack",
    description: "Sending tiny amounts of cryptocurrency to break privacy by tracking address movements",
    category: "dusting_attack",
    severity: "medium",
    indicators: [
      {
        name: "tiny_transfers",
        description: "Very small amounts sent to multiple addresses",
        weight: 75,
      },
      {
        name: "wide_distribution",
        description: "Distribution to many addresses in a short time",
        weight: 80,
      },
      {
        name: "unusual_token",
        description: "Using unusual or new tokens for dusting",
        weight: 65,
      },
    ],
    detectionRules: [
      {
        type: "simple",
        condition: "Multiple tiny transfers (<0.001 SOL) to different addresses from the same source",
        threshold: 20,
      },
    ],
    createdAt: "2023-08-22T00:00:00Z",
    updatedAt: "2023-08-22T00:00:00Z",
    source: "community",
    tags: ["privacy", "tracking", "analysis"],
  },
  {
    id: "smurfing-pattern",
    name: "Smurfing Pattern",
    description: "Breaking down large transactions into multiple smaller ones to avoid detection",
    category: "other",
    severity: "medium",
    indicators: [
      {
        name: "transaction_splitting",
        description: "Large amount split into multiple smaller transactions",
        weight: 70,
      },
      {
        name: "consistent_amounts",
        description: "Transactions of similar or consistent amounts",
        weight: 65,
      },
      {
        name: "timing_consistency",
        description: "Transactions executed at regular intervals",
        weight: 60,
      },
    ],
    detectionRules: [
      {
        type: "complex",
        condition: "Multiple transactions of similar amounts to the same destination within a short time period",
        parameters: {
          minTransactions: 5,
          timeWindow: 3600, // 1 hour
          amountVariance: 10, // 10% variance in amounts
        },
      },
    ],
    createdAt: "2023-09-10T00:00:00Z",
    updatedAt: "2023-09-10T00:00:00Z",
    source: "regulatory",
    tags: ["aml", "structuring", "compliance"],
  },
  {
    id: "ponzi-scheme",
    name: "Ponzi Scheme Pattern",
    description: "Using new investor funds to pay returns to existing investors",
    category: "ponzi",
    severity: "critical",
    indicators: [
      {
        name: "inflow_outflow_pattern",
        description: "New inflows immediately used for outflows to earlier participants",
        weight: 90,
      },
      {
        name: "consistent_returns",
        description: "Unusually consistent returns regardless of market conditions",
        weight: 75,
      },
      {
        name: "exponential_growth",
        description: "Exponential growth in participants and funds",
        weight: 80,
      },
    ],
    detectionRules: [
      {
        type: "complex",
        condition: "New inflows followed by proportional outflows to earlier participants",
        parameters: {
          timeWindow: 604800, // 7 days
          inflowOutflowRatio: 0.8, // 80% of inflows go to outflows
        },
      },
    ],
    createdAt: "2023-10-05T00:00:00Z",
    updatedAt: "2023-10-05T00:00:00Z",
    source: "regulatory",
    tags: ["scam", "investment_fraud", "compliance"],
  },
]

/**
 * Service for managing and querying the fraud pattern database
 */
export class FraudPatternService {
  private patterns: FraudPattern[] = []
  private initialized = false

  /**
   * Initialize the fraud pattern database
   */
  async initialize(): Promise<void> {
    try {
      // First try to load patterns from Supabase
      const { data, error } = await supabase.from("fraud_patterns").select("*")

      if (error) {
        console.error("Error loading fraud patterns from database:", error)
        // Fall back to built-in patterns
        this.patterns = [...KNOWN_FRAUD_PATTERNS]
      } else if (data && data.length > 0) {
        // Use patterns from database
        this.patterns = data.map((item) => ({
          ...item,
          indicators: JSON.parse(item.indicators || "[]"),
          detectionRules: JSON.parse(item.detection_rules || "[]"),
          tags: item.tags ? item.tags.split(",") : [],
          metadata: item.metadata ? JSON.parse(item.metadata) : {},
        }))
      } else {
        // No patterns in database, use built-in patterns
        this.patterns = [...KNOWN_FRAUD_PATTERNS]

        // Optionally seed the database with built-in patterns
        await this.seedDatabase()
      }

      this.initialized = true
    } catch (error) {
      console.error("Error initializing fraud pattern database:", error)
      // Fall back to built-in patterns
      this.patterns = [...KNOWN_FRAUD_PATTERNS]
      this.initialized = true
    }
  }

  /**
   * Seed the database with built-in patterns
   */
  private async seedDatabase(): Promise<void> {
    try {
      for (const pattern of KNOWN_FRAUD_PATTERNS) {
        const { error } = await supabase.from("fraud_patterns").insert({
          id: pattern.id,
          name: pattern.name,
          description: pattern.description,
          category: pattern.category,
          severity: pattern.severity,
          indicators: JSON.stringify(pattern.indicators),
          detection_rules: JSON.stringify(pattern.detectionRules),
          examples: pattern.examples,
          created_at: pattern.createdAt,
          updated_at: pattern.updatedAt,
          source: pattern.source,
          tags: pattern.tags?.join(","),
          metadata: pattern.metadata ? JSON.stringify(pattern.metadata) : null,
        })

        if (error) {
          console.error(`Error seeding pattern ${pattern.id}:`, error)
        }
      }
    } catch (error) {
      console.error("Error seeding fraud pattern database:", error)
    }
  }

  /**
   * Get all fraud patterns
   */
  async getAllPatterns(): Promise<FraudPattern[]> {
    if (!this.initialized) {
      await this.initialize()
    }
    return this.patterns
  }

  /**
   * Get a fraud pattern by ID
   */
  async getPatternById(id: string): Promise<FraudPattern | null> {
    if (!this.initialized) {
      await this.initialize()
    }
    return this.patterns.find((pattern) => pattern.id === id) || null
  }

  /**
   * Get fraud patterns by category
   */
  async getPatternsByCategory(category: FraudPatternCategory): Promise<FraudPattern[]> {
    if (!this.initialized) {
      await this.initialize()
    }
    return this.patterns.filter((pattern) => pattern.category === category)
  }

  /**
   * Get fraud patterns by severity
   */
  async getPatternsBySeverity(severity: FraudPatternSeverity): Promise<FraudPattern[]> {
    if (!this.initialized) {
      await this.initialize()
    }
    return this.patterns.filter((pattern) => pattern.severity === severity)
  }

  /**
   * Add a new fraud pattern
   */
  async addPattern(pattern: Omit<FraudPattern, "id" | "createdAt" | "updatedAt">): Promise<FraudPattern> {
    if (!this.initialized) {
      await this.initialize()
    }

    const now = new Date().toISOString()
    const newPattern: FraudPattern = {
      ...pattern,
      id: `pattern-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }

    try {
      const { error } = await supabase.from("fraud_patterns").insert({
        id: newPattern.id,
        name: newPattern.name,
        description: newPattern.description,
        category: newPattern.category,
        severity: newPattern.severity,
        indicators: JSON.stringify(newPattern.indicators),
        detection_rules: JSON.stringify(newPattern.detectionRules),
        examples: newPattern.examples,
        created_at: newPattern.createdAt,
        updated_at: newPattern.updatedAt,
        source: newPattern.source,
        tags: newPattern.tags?.join(","),
        metadata: newPattern.metadata ? JSON.stringify(newPattern.metadata) : null,
      })

      if (error) {
        console.error("Error adding fraud pattern to database:", error)
      } else {
        this.patterns.push(newPattern)
      }
    } catch (error) {
      console.error("Error adding fraud pattern:", error)
    }

    return newPattern
  }

  /**
   * Update an existing fraud pattern
   */
  async updatePattern(id: string, updates: Partial<FraudPattern>): Promise<FraudPattern | null> {
    if (!this.initialized) {
      await this.initialize()
    }

    const patternIndex = this.patterns.findIndex((pattern) => pattern.id === id)
    if (patternIndex === -1) {
      return null
    }

    const updatedPattern: FraudPattern = {
      ...this.patterns[patternIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    try {
      const { error } = await supabase
        .from("fraud_patterns")
        .update({
          name: updatedPattern.name,
          description: updatedPattern.description,
          category: updatedPattern.category,
          severity: updatedPattern.severity,
          indicators: JSON.stringify(updatedPattern.indicators),
          detection_rules: JSON.stringify(updatedPattern.detectionRules),
          examples: updatedPattern.examples,
          updated_at: updatedPattern.updatedAt,
          source: updatedPattern.source,
          tags: updatedPattern.tags?.join(","),
          metadata: updatedPattern.metadata ? JSON.stringify(updatedPattern.metadata) : null,
        })
        .eq("id", id)

      if (error) {
        console.error("Error updating fraud pattern in database:", error)
      } else {
        this.patterns[patternIndex] = updatedPattern
      }
    } catch (error) {
      console.error("Error updating fraud pattern:", error)
    }

    return updatedPattern
  }

  /**
   * Delete a fraud pattern
   */
  async deletePattern(id: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize()
    }

    const patternIndex = this.patterns.findIndex((pattern) => pattern.id === id)
    if (patternIndex === -1) {
      return false
    }

    try {
      const { error } = await supabase.from("fraud_patterns").delete().eq("id", id)

      if (error) {
        console.error("Error deleting fraud pattern from database:", error)
        return false
      } else {
        this.patterns.splice(patternIndex, 1)
        return true
      }
    } catch (error) {
      console.error("Error deleting fraud pattern:", error)
      return false
    }
  }

  /**
   * Search for patterns by keyword
   */
  async searchPatterns(keyword: string): Promise<FraudPattern[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    const lowerKeyword = keyword.toLowerCase()
    return this.patterns.filter(
      (pattern) =>
        pattern.name.toLowerCase().includes(lowerKeyword) ||
        pattern.description.toLowerCase().includes(lowerKeyword) ||
        pattern.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword)),
    )
  }

  /**
   * Export patterns to JSON
   */
  async exportPatterns(): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    return JSON.stringify(
      {
        patterns: this.patterns,
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        source: "Solana Forensic Toolkit",
      },
      null,
      2,
    )
  }

  /**
   * Import patterns from JSON
   */
  async importPatterns(json: string): Promise<number> {
    try {
      const data = JSON.parse(json)
      if (!data.patterns || !Array.isArray(data.patterns)) {
        throw new Error("Invalid pattern data format")
      }

      let importedCount = 0
      for (const pattern of data.patterns) {
        // Validate pattern
        if (!pattern.name || !pattern.description || !pattern.category || !pattern.severity) {
          console.warn("Skipping invalid pattern:", pattern)
          continue
        }

        // Check if pattern already exists
        const existingPattern = this.patterns.find((p) => p.id === pattern.id)
        if (existingPattern) {
          // Update existing pattern
          await this.updatePattern(pattern.id, pattern)
        } else {
          // Add new pattern
          await this.addPattern(pattern)
        }

        importedCount++
      }

      return importedCount
    } catch (error) {
      console.error("Error importing patterns:", error)
      throw new Error("Failed to import patterns")
    }
  }
}

// Create a singleton instance
export const fraudPatternService = new FraudPatternService()
