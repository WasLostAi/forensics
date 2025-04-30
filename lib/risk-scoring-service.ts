import type { TransactionFlowData } from "@/types/transaction"
import type { WalletData } from "@/types/wallet"
import type { RiskScore, RiskFactor, TransactionRiskScore } from "@/types/risk"
import { fetchEntityLabels } from "@/lib/api"

/**
 * Service for calculating risk scores for wallets and transactions
 */
export class RiskScoringService {
  // Risk factor weights (out of 100)
  private static RISK_WEIGHTS = {
    // Wallet risk factors
    TRANSACTION_VELOCITY: 15,
    HIGH_RISK_CONNECTIONS: 20,
    MIXER_CONNECTIONS: 25,
    CIRCULAR_PATTERNS: 15,
    UNUSUAL_AMOUNTS: 10,
    UNUSUAL_TIMING: 10,
    NEW_WALLET: 5,

    // Transaction risk factors
    LARGE_AMOUNT: 20,
    UNUSUAL_HOUR: 10,
    ROUND_NUMBER: 15,
    KNOWN_PATTERN: 25,
    MULTI_HOP: 15,
    PRIVACY_TOOL: 15,
  }

  // Known high-risk entity types
  private static HIGH_RISK_ENTITY_TYPES = [
    "mixer",
    "darknet_market",
    "scam",
    "ransomware",
    "sanctioned",
    "high_risk_exchange",
  ]

  // Known privacy tools
  private static PRIVACY_TOOLS = ["tornado_cash", "wasabi_wallet", "samourai_wallet", "coinjoin", "solana_mixer"]

  /**
   * Calculate a comprehensive risk score for a wallet
   */
  public static async calculateWalletRiskScore(
    walletAddress: string,
    walletData: WalletData,
    flowData: TransactionFlowData,
  ): Promise<RiskScore> {
    // Initialize score and factors
    let totalScore = 0
    const factors: RiskFactor[] = []

    // Fetch entity labels for connected wallets
    const connectedAddresses = this.getConnectedAddresses(walletAddress, flowData)
    const entityLabels = await fetchEntityLabels(walletAddress)
    const connectedEntityLabels = await this.fetchConnectedEntityLabels(connectedAddresses)

    // 1. Transaction velocity (high number of transactions in short time)
    const txVelocity = this.calculateTransactionVelocity(walletData)
    if (txVelocity > 0) {
      const velocityImpact = Math.min(this.RISK_WEIGHTS.TRANSACTION_VELOCITY, txVelocity)
      totalScore += velocityImpact
      factors.push({
        name: "Transaction Velocity",
        description: "High number of transactions in a short time period",
        impact: velocityImpact,
        score: txVelocity,
      })
    }

    // 2. Connections to high-risk wallets
    const highRiskConnections = this.identifyHighRiskConnections(connectedEntityLabels)
    if (highRiskConnections.count > 0) {
      const connectionImpact = Math.min(this.RISK_WEIGHTS.HIGH_RISK_CONNECTIONS, highRiskConnections.count * 5)
      totalScore += connectionImpact
      factors.push({
        name: "High-Risk Connections",
        description: `Connected to ${highRiskConnections.count} high-risk wallets`,
        impact: connectionImpact,
        score: highRiskConnections.count * 5,
        details: highRiskConnections.addresses,
      })
    }

    // 3. Connections to mixers or tumblers
    const mixerConnections = this.identifyMixerConnections(connectedEntityLabels)
    if (mixerConnections.connected) {
      totalScore += this.RISK_WEIGHTS.MIXER_CONNECTIONS
      factors.push({
        name: "Mixer Connections",
        description: "Connected to known mixer or tumbler services",
        impact: this.RISK_WEIGHTS.MIXER_CONNECTIONS,
        score: 100,
        details: mixerConnections.addresses,
      })
    }

    // 4. Circular transaction patterns
    const circularPatterns = this.identifyCircularPatterns(walletAddress, flowData)
    if (circularPatterns.found) {
      const patternImpact = Math.min(this.RISK_WEIGHTS.CIRCULAR_PATTERNS, circularPatterns.count * 5)
      totalScore += patternImpact
      factors.push({
        name: "Circular Transactions",
        description: `${circularPatterns.count} circular transaction patterns detected`,
        impact: patternImpact,
        score: circularPatterns.count * 20,
      })
    }

    // 5. Unusual transaction amounts
    const unusualAmounts = this.identifyUnusualAmounts(walletAddress, flowData)
    if (unusualAmounts.found) {
      const amountImpact = Math.min(this.RISK_WEIGHTS.UNUSUAL_AMOUNTS, unusualAmounts.count * 2)
      totalScore += amountImpact
      factors.push({
        name: "Unusual Amounts",
        description: `${unusualAmounts.count} transactions with unusual amounts`,
        impact: amountImpact,
        score: unusualAmounts.count * 10,
      })
    }

    // 6. Unusual transaction timing
    const unusualTiming = this.identifyUnusualTiming(walletAddress, flowData)
    if (unusualTiming.found) {
      const timingImpact = Math.min(this.RISK_WEIGHTS.UNUSUAL_TIMING, unusualTiming.count * 2)
      totalScore += timingImpact
      factors.push({
        name: "Unusual Timing",
        description: `${unusualTiming.count} transactions at unusual hours`,
        impact: timingImpact,
        score: unusualTiming.count * 10,
      })
    }

    // 7. New wallet with high activity
    const newWalletRisk = this.assessNewWalletRisk(walletData)
    if (newWalletRisk > 0) {
      const newWalletImpact = Math.min(this.RISK_WEIGHTS.NEW_WALLET, newWalletRisk)
      totalScore += newWalletImpact
      factors.push({
        name: "New Wallet",
        description: "Recently created wallet with high activity",
        impact: newWalletImpact,
        score: newWalletRisk,
      })
    }

    // Sort factors by impact (highest first)
    factors.sort((a, b) => b.impact - a.impact)

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" = "low"
    if (totalScore >= 70) {
      riskLevel = "high"
    } else if (totalScore >= 40) {
      riskLevel = "medium"
    }

    return {
      address: walletAddress,
      score: totalScore,
      level: riskLevel,
      factors,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Calculate risk score for a specific transaction
   */
  public static async calculateTransactionRiskScore(
    transactionId: string,
    transaction: any,
    flowData: TransactionFlowData,
  ): Promise<TransactionRiskScore> {
    // Initialize score and factors
    let totalScore = 0
    const factors: RiskFactor[] = []

    // Find the transaction in the flow data
    const tx = flowData.links.find((link) => link.id === transactionId || link.source + link.target === transactionId)
    if (!tx) {
      return {
        id: transactionId,
        score: 0,
        level: "low",
        factors: [],
        timestamp: new Date().toISOString(),
      }
    }

    // Fetch entity labels for source and target
    const sourceEntityLabels = await fetchEntityLabels(tx.source)
    const targetEntityLabels = await fetchEntityLabels(tx.target)

    // 1. Large transaction amount
    const largeAmount = this.assessLargeAmount(tx.value)
    if (largeAmount > 0) {
      const amountImpact = Math.min(this.RISK_WEIGHTS.LARGE_AMOUNT, largeAmount)
      totalScore += amountImpact
      factors.push({
        name: "Large Amount",
        description: `Transaction amount (${tx.value} SOL) is unusually large`,
        impact: amountImpact,
        score: largeAmount,
      })
    }

    // 2. Unusual hour
    const unusualHour = this.assessUnusualHour(tx.timestamp)
    if (unusualHour > 0) {
      totalScore += this.RISK_WEIGHTS.UNUSUAL_HOUR
      factors.push({
        name: "Unusual Hour",
        description: "Transaction occurred during unusual hours",
        impact: this.RISK_WEIGHTS.UNUSUAL_HOUR,
        score: unusualHour,
      })
    }

    // 3. Round number amount
    const roundNumber = this.assessRoundNumber(tx.value)
    if (roundNumber) {
      totalScore += this.RISK_WEIGHTS.ROUND_NUMBER
      factors.push({
        name: "Round Number",
        description: "Transaction amount is a suspiciously round number",
        impact: this.RISK_WEIGHTS.ROUND_NUMBER,
        score: 100,
      })
    }

    // 4. Part of known pattern
    const knownPattern = await this.assessKnownPattern(transactionId, flowData)
    if (knownPattern.found) {
      totalScore += this.RISK_WEIGHTS.KNOWN_PATTERN
      factors.push({
        name: "Known Pattern",
        description: `Part of a known suspicious pattern: ${knownPattern.patternType}`,
        impact: this.RISK_WEIGHTS.KNOWN_PATTERN,
        score: 100,
      })
    }

    // 5. Multi-hop transaction
    const multiHop = this.assessMultiHop(transactionId, flowData)
    if (multiHop.isMultiHop) {
      const hopImpact = Math.min(this.RISK_WEIGHTS.MULTI_HOP, multiHop.hopCount * 5)
      totalScore += hopImpact
      factors.push({
        name: "Multi-Hop Transaction",
        description: `Part of a ${multiHop.hopCount}-hop transaction chain`,
        impact: hopImpact,
        score: multiHop.hopCount * 10,
      })
    }

    // 6. Privacy tool usage
    const privacyTool = this.assessPrivacyToolUsage(sourceEntityLabels, targetEntityLabels)
    if (privacyTool.used) {
      totalScore += this.RISK_WEIGHTS.PRIVACY_TOOL
      factors.push({
        name: "Privacy Tool",
        description: `Transaction involves a known privacy tool: ${privacyTool.toolName}`,
        impact: this.RISK_WEIGHTS.PRIVACY_TOOL,
        score: 100,
      })
    }

    // Sort factors by impact (highest first)
    factors.sort((a, b) => b.impact - a.impact)

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" = "low"
    if (totalScore >= 70) {
      riskLevel = "high"
    } else if (totalScore >= 40) {
      riskLevel = "medium"
    }

    return {
      id: transactionId,
      score: totalScore,
      level: riskLevel,
      factors,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Get all addresses connected to the wallet
   */
  private static getConnectedAddresses(walletAddress: string, flowData: TransactionFlowData): string[] {
    const connectedAddresses = new Set<string>()

    flowData.links.forEach((link) => {
      if (link.source === walletAddress) {
        connectedAddresses.add(link.target)
      } else if (link.target === walletAddress) {
        connectedAddresses.add(link.source)
      }
    })

    return Array.from(connectedAddresses)
  }

  /**
   * Fetch entity labels for connected wallets
   */
  private static async fetchConnectedEntityLabels(addresses: string[]): Promise<Record<string, any[]>> {
    const entityLabels: Record<string, any[]> = {}

    // Fetch entity labels in batches to avoid too many concurrent requests
    const batchSize = 10
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      const promises = batch.map((address) => fetchEntityLabels(address))
      const results = await Promise.all(promises)

      batch.forEach((address, index) => {
        entityLabels[address] = results[index]
      })
    }

    return entityLabels
  }

  /**
   * Calculate transaction velocity score
   */
  private static calculateTransactionVelocity(walletData: WalletData): number {
    // Calculate days since first activity
    const firstActivity = new Date(walletData.firstActivity)
    const now = new Date()
    const daysSinceFirst = Math.max(1, (now.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate transactions per day
    const txPerDay = walletData.transactionCount / daysSinceFirst

    // Score based on transactions per day
    if (txPerDay > 100) return 100
    if (txPerDay > 50) return 75
    if (txPerDay > 20) return 50
    if (txPerDay > 10) return 25
    if (txPerDay > 5) return 10
    return 0
  }

  /**
   * Identify connections to high-risk wallets
   */
  private static identifyHighRiskConnections(connectedEntityLabels: Record<string, any[]>): {
    count: number
    addresses: string[]
  } {
    const highRiskAddresses: string[] = []

    // Check each connected address for high-risk labels
    Object.entries(connectedEntityLabels).forEach(([address, labels]) => {
      const isHighRisk = labels.some((label) => this.HIGH_RISK_ENTITY_TYPES.includes(label.type?.toLowerCase()))

      if (isHighRisk) {
        highRiskAddresses.push(address)
      }
    })

    return {
      count: highRiskAddresses.length,
      addresses: highRiskAddresses,
    }
  }

  /**
   * Identify connections to mixers or tumblers
   */
  private static identifyMixerConnections(connectedEntityLabels: Record<string, any[]>): {
    connected: boolean
    addresses: string[]
  } {
    const mixerAddresses: string[] = []

    // Check each connected address for mixer labels
    Object.entries(connectedEntityLabels).forEach(([address, labels]) => {
      const isMixer = labels.some(
        (label) =>
          label.type?.toLowerCase() === "mixer" ||
          label.name?.toLowerCase().includes("mixer") ||
          label.name?.toLowerCase().includes("tumbler"),
      )

      if (isMixer) {
        mixerAddresses.push(address)
      }
    })

    return {
      connected: mixerAddresses.length > 0,
      addresses: mixerAddresses,
    }
  }

  /**
   * Identify circular transaction patterns
   */
  private static identifyCircularPatterns(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // Build a directed graph from the flow data
    const graph: Record<string, string[]> = {}

    flowData.links.forEach((link) => {
      if (!graph[link.source]) {
        graph[link.source] = []
      }
      graph[link.source].push(link.target)
    })

    // Use DFS to find cycles that include the wallet address
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    let cycleCount = 0

    function dfs(node: string, path: string[] = []): void {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      // Check neighbors
      const neighbors = graph[node] || []
      for (const neighbor of neighbors) {
        // Found a cycle back to the wallet address
        if (neighbor === walletAddress && path.length > 2) {
          cycleCount++
          continue
        }

        // Continue DFS if not visited
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path])
        }
        // Found a cycle
        else if (recursionStack.has(neighbor)) {
          cycleCount++
        }
      }

      recursionStack.delete(node)
    }

    // Start DFS from the wallet address
    if (graph[walletAddress]) {
      dfs(walletAddress)
    }

    return {
      found: cycleCount > 0,
      count: cycleCount,
    }
  }

  /**
   * Identify unusual transaction amounts
   */
  private static identifyUnusualAmounts(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // Get all transaction amounts
    const amounts = flowData.links.map((link) => link.value)

    // Calculate statistics
    const sum = amounts.reduce((a, b) => a + b, 0)
    const mean = sum / amounts.length
    const squaredDiffs = amounts.map((value) => Math.pow(value - mean, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / amounts.length
    const stdDev = Math.sqrt(variance)

    // Identify unusual amounts (more than 2 standard deviations from the mean)
    const unusualAmounts = flowData.links.filter((link) => {
      const zScore = Math.abs(link.value - mean) / stdDev
      return zScore > 2
    })

    return {
      found: unusualAmounts.length > 0,
      count: unusualAmounts.length,
    }
  }

  /**
   * Identify unusual transaction timing
   */
  private static identifyUnusualTiming(
    walletAddress: string,
    flowData: TransactionFlowData,
  ): { found: boolean; count: number } {
    // Count transactions at unusual hours (e.g., 1am-5am)
    const unusualTiming = flowData.links.filter((link) => {
      if (!link.timestamp) return false

      const hour = new Date(link.timestamp).getHours()
      return hour >= 1 && hour <= 5
    })

    return {
      found: unusualTiming.length > 0,
      count: unusualTiming.length,
    }
  }

  /**
   * Assess risk for new wallets with high activity
   */
  private static assessNewWalletRisk(walletData: WalletData): number {
    // Calculate days since first activity
    const firstActivity = new Date(walletData.firstActivity)
    const now = new Date()
    const daysSinceFirst = (now.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24)

    // New wallet (less than 30 days)
    if (daysSinceFirst <= 30) {
      // High activity for a new wallet
      if (walletData.transactionCount > 50) return 100
      if (walletData.transactionCount > 20) return 50
      if (walletData.transactionCount > 10) return 25
    }

    return 0
  }

  /**
   * Assess if a transaction amount is unusually large
   */
  private static assessLargeAmount(amount: number): number {
    if (amount > 1000) return 100
    if (amount > 500) return 75
    if (amount > 100) return 50
    if (amount > 50) return 25
    return 0
  }

  /**
   * Assess if a transaction occurred at an unusual hour
   */
  private static assessUnusualHour(timestamp: string): number {
    if (!timestamp) return 0

    const hour = new Date(timestamp).getHours()

    // 1am-5am is considered unusual
    if (hour >= 1 && hour <= 5) return 100

    return 0
  }

  /**
   * Assess if a transaction amount is a suspiciously round number
   */
  private static assessRoundNumber(amount: number): boolean {
    // Check if amount is a whole number
    if (amount === Math.floor(amount)) return true

    // Check if amount has only one decimal place
    const decimalPlaces = (amount.toString().split(".")[1] || "").length
    if (decimalPlaces === 1) return true

    // Check if amount ends with multiple zeros
    const amountStr = amount.toString()
    if (amountStr.endsWith("00") || amountStr.endsWith("000")) return true

    return false
  }

  /**
   * Assess if a transaction is part of a known suspicious pattern
   */
  private static async assessKnownPattern(
    transactionId: string,
    flowData: TransactionFlowData,
  ): Promise<{ found: boolean; patternType: string }> {
    // Define known suspicious patterns
    const patterns = [
      {
        name: "Layering",
        detect: (flowData: TransactionFlowData) => {
          // Look for chains of 3+ transactions in quick succession
          // This is a simplified implementation
          const txTimestamps = flowData.links
            .filter((link) => link.timestamp)
            .map((link) => new Date(link.timestamp).getTime())
            .sort()

          // Check for 3+ transactions within 10 minutes
          for (let i = 0; i < txTimestamps.length - 2; i++) {
            if (txTimestamps[i + 2] - txTimestamps[i] < 10 * 60 * 1000) {
              return true
            }
          }

          return false
        },
      },
      {
        name: "Smurfing",
        detect: (flowData: TransactionFlowData) => {
          // Look for multiple small transactions that add up to a large amount
          // This is a simplified implementation
          const smallTxs = flowData.links.filter((link) => link.value < 10)
          if (smallTxs.length < 3) return false

          const totalValue = smallTxs.reduce((sum, tx) => sum + tx.value, 0)
          return totalValue > 100
        },
      },
      {
        name: "Round-trip",
        detect: (flowData: TransactionFlowData) => {
          // Look for funds that go out and come back to the same wallet
          // This is a simplified implementation
          const addresses = new Set<string>()
          flowData.links.forEach((link) => {
            addresses.add(link.source)
            addresses.add(link.target)
          })

          for (const address of addresses) {
            const outgoing = flowData.links.filter((link) => link.source === address)
            const incoming = flowData.links.filter((link) => link.target === address)

            if (outgoing.length > 0 && incoming.length > 0) {
              // Check if any outgoing transaction is followed by an incoming one
              for (const out of outgoing) {
                for (const inc of incoming) {
                  if (new Date(inc.timestamp) > new Date(out.timestamp)) {
                    return true
                  }
                }
              }
            }
          }

          return false
        },
      },
    ]

    // Check each pattern
    for (const pattern of patterns) {
      if (pattern.detect(flowData)) {
        return {
          found: true,
          patternType: pattern.name,
        }
      }
    }

    return {
      found: false,
      patternType: "",
    }
  }

  /**
   * Assess if a transaction is part of a multi-hop chain
   */
  private static assessMultiHop(
    transactionId: string,
    flowData: TransactionFlowData,
  ): { isMultiHop: boolean; hopCount: number } {
    // Build a directed graph from the flow data
    const graph: Record<string, string[]> = {}

    flowData.links.forEach((link) => {
      if (!graph[link.source]) {
        graph[link.source] = []
      }
      graph[link.source].push(link.target)
    })

    // Find the transaction
    const tx = flowData.links.find((link) => link.id === transactionId || link.source + link.target === transactionId)
    if (!tx) {
      return { isMultiHop: false, hopCount: 0 }
    }

    // Use BFS to find the longest path from source
    const visited = new Set<string>()
    const queue: { node: string; distance: number }[] = [{ node: tx.source, distance: 0 }]
    let maxDistance = 0

    while (queue.length > 0) {
      const { node, distance } = queue.shift()!

      if (visited.has(node)) continue
      visited.add(node)

      maxDistance = Math.max(maxDistance, distance)

      const neighbors = graph[node] || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, distance: distance + 1 })
        }
      }
    }

    return {
      isMultiHop: maxDistance > 1,
      hopCount: maxDistance,
    }
  }

  /**
   * Assess if a transaction involves a privacy tool
   */
  private static assessPrivacyToolUsage(sourceLabels: any[], targetLabels: any[]): { used: boolean; toolName: string } {
    // Check if source or target has a privacy tool label
    const sourcePrivacyTool = sourceLabels.find((label) =>
      this.PRIVACY_TOOLS.some(
        (tool) => label.name?.toLowerCase().includes(tool) || label.type?.toLowerCase().includes(tool),
      ),
    )

    const targetPrivacyTool = targetLabels.find((label) =>
      this.PRIVACY_TOOLS.some(
        (tool) => label.name?.toLowerCase().includes(tool) || label.type?.toLowerCase().includes(tool),
      ),
    )

    if (sourcePrivacyTool) {
      return {
        used: true,
        toolName: sourcePrivacyTool.name || "Privacy Tool",
      }
    }

    if (targetPrivacyTool) {
      return {
        used: true,
        toolName: targetPrivacyTool.name || "Privacy Tool",
      }
    }

    return {
      used: false,
      toolName: "",
    }
  }
}
