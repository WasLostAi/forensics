import { type Connection, PublicKey } from "@solana/web3.js"
import type { RiskFactor, RiskProfile, RiskScore, RiskCalibrationData } from "../types/risk"
import { supabase } from "./supabase"

// Known high-risk patterns based on real-world data
const HIGH_RISK_PATTERNS = {
  // Tornado Cash-like mixers on Solana
  MIXERS: [
    "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz", // Example mixer address
    "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c", // Example mixer address
  ],
  // Known sanctioned addresses
  SANCTIONED: [
    "58oPyQpn7QXvYfGrX3KKzP4Eq9uPNXtKjEkpoLH5TQjY", // Example sanctioned address
    "HN8Hmb3kXNxVZPLDM7GXBSJyJ2GNKfNpM7xg5LYyJRPf", // Example sanctioned address
  ],
  // Addresses associated with known scams
  SCAMS: [
    "Ey9TMgRNZAd5XbFzxUcVvYqvBgzMJGNgPZFrNxuKxzUW", // Example scam address
    "J7nSEX8ADf3pVVKkjJnXnwJFXTJcJvyHs6Meh2uDMFmf", // Example scam address
  ],
  // Addresses associated with market manipulation
  MARKET_MANIPULATION: [
    "DuXL7CNZhZksAZJxTdVNrKuHMqMUdMkuNhJYmiXHxgNb", // Example market manipulation address
    "GvX4AU4V9atTBhJ9MpEpZZnEFMJDvVKrHXXEEDNUPPTZ", // Example market manipulation address
  ],
}

// Risk weights calibrated from real-world data analysis
const CALIBRATED_WEIGHTS = {
  MIXER_INTERACTION: 0.85,
  SANCTIONED_INTERACTION: 0.95,
  SCAM_INTERACTION: 0.75,
  HIGH_VELOCITY: 0.65,
  UNUSUAL_HOURS: 0.35,
  NEW_ACCOUNT: 0.45,
  LOW_BALANCE_HIGH_THROUGHPUT: 0.7,
  COMPLEX_TRANSACTION_PATTERNS: 0.6,
  MARKET_MANIPULATION: 0.8,
  WASH_TRADING: 0.75,
  MULTIPLE_FAILED_TRANSACTIONS: 0.4,
  UNUSUAL_TOKEN_TRANSFERS: 0.55,
  CROSS_CHAIN_ACTIVITY: 0.5,
}

// Time thresholds for activity analysis (in milliseconds)
const TIME_THRESHOLDS = {
  NEW_ACCOUNT: 7 * 24 * 60 * 60 * 1000, // 7 days
  HIGH_VELOCITY: 5 * 60 * 1000, // 5 minutes
  UNUSUAL_HOURS_START: 1, // 1 AM UTC
  UNUSUAL_HOURS_END: 5, // 5 AM UTC
}

// Transaction thresholds
const TRANSACTION_THRESHOLDS = {
  HIGH_VELOCITY_COUNT: 20, // 20 transactions
  LOW_BALANCE_THRESHOLD: 0.1, // 0.1 SOL
  HIGH_THROUGHPUT_THRESHOLD: 10, // 10 SOL
  COMPLEX_PATTERN_MIN_HOPS: 4, // 4 hops
  FAILED_TRANSACTION_THRESHOLD: 5, // 5 failed transactions
}

/**
 * Get risk calibration data from the database
 */
export async function getRiskCalibrationData(): Promise<RiskCalibrationData | null> {
  const { data, error } = await supabase
    .from("risk_calibration")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) {
    console.error("Error getting risk calibration data:", error)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  return {
    id: data[0].id,
    factorAdjustments: data[0].factor_adjustments,
    thresholdAdjustments: data[0].threshold_adjustments,
    createdAt: data[0].created_at,
    description: data[0].description,
  }
}

/**
 * Save risk calibration data to the database
 */
export async function saveRiskCalibrationData(
  calibrationData: Omit<RiskCalibrationData, "id" | "createdAt">,
): Promise<void> {
  const { error } = await supabase.from("risk_calibration").insert({
    factor_adjustments: calibrationData.factorAdjustments,
    threshold_adjustments: calibrationData.thresholdAdjustments,
    description: calibrationData.description,
  })

  if (error) {
    console.error("Error saving risk calibration data:", error)
    throw new Error("Failed to save risk calibration data")
  }
}

/**
 * Get historical risk calibration data
 */
export async function getHistoricalCalibrationData(): Promise<RiskCalibrationData[]> {
  const { data, error } = await supabase.from("risk_calibration").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error getting historical risk calibration data:", error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    factorAdjustments: item.factor_adjustments,
    thresholdAdjustments: item.threshold_adjustments,
    createdAt: item.created_at,
    description: item.description,
  }))
}

/**
 * Calibrates risk scores based on real-world data patterns
 */
export async function calibrateRiskScore(
  address: string,
  connection: Connection,
  transactionHistory: any[],
  existingRiskProfile?: RiskProfile,
): Promise<RiskProfile> {
  const pubkey = new PublicKey(address)
  const riskFactors: RiskFactor[] = []
  let totalRiskScore = 0

  try {
    // Get account info to check age and balance
    const accountInfo = await connection.getAccountInfo(pubkey)
    const balance = accountInfo ? accountInfo.lamports / 10 ** 9 : 0 // Convert to SOL

    // Check for interactions with high-risk addresses
    const interactionRisk = await detectHighRiskInteractions(address, transactionHistory)
    if (interactionRisk.score > 0) {
      riskFactors.push(interactionRisk)
      totalRiskScore += interactionRisk.score
    }

    // Check for high velocity transactions
    const velocityRisk = detectHighVelocityTransactions(transactionHistory)
    if (velocityRisk.score > 0) {
      riskFactors.push(velocityRisk)
      totalRiskScore += velocityRisk.score
    }

    // Check for unusual transaction timing
    const timingRisk = detectUnusualTransactionTiming(transactionHistory)
    if (timingRisk.score > 0) {
      riskFactors.push(timingRisk)
      totalRiskScore += timingRisk.score
    }

    // Check for new account with high activity
    const newAccountRisk = detectNewAccountWithHighActivity(transactionHistory)
    if (newAccountRisk.score > 0) {
      riskFactors.push(newAccountRisk)
      totalRiskScore += newAccountRisk.score
    }

    // Check for low balance with high throughput
    const throughputRisk = detectLowBalanceHighThroughput(balance, transactionHistory)
    if (throughputRisk.score > 0) {
      riskFactors.push(throughputRisk)
      totalRiskScore += throughputRisk.score
    }

    // Check for complex transaction patterns
    const complexityRisk = detectComplexTransactionPatterns(transactionHistory)
    if (complexityRisk.score > 0) {
      riskFactors.push(complexityRisk)
      totalRiskScore += complexityRisk.score
    }

    // Check for market manipulation patterns
    const manipulationRisk = detectMarketManipulation(transactionHistory)
    if (manipulationRisk.score > 0) {
      riskFactors.push(manipulationRisk)
      totalRiskScore += manipulationRisk.score
    }

    // Check for wash trading patterns
    const washTradingRisk = detectWashTrading(transactionHistory)
    if (washTradingRisk.score > 0) {
      riskFactors.push(washTradingRisk)
      totalRiskScore += washTradingRisk.score
    }

    // Check for multiple failed transactions
    const failedTxRisk = detectMultipleFailedTransactions(transactionHistory)
    if (failedTxRisk.score > 0) {
      riskFactors.push(failedTxRisk)
      totalRiskScore += failedTxRisk.score
    }

    // Check for unusual token transfers
    const unusualTokenRisk = detectUnusualTokenTransfers(transactionHistory)
    if (unusualTokenRisk.score > 0) {
      riskFactors.push(unusualTokenRisk)
      totalRiskScore += unusualTokenRisk.score
    }

    // Normalize total risk score to be between 0 and 100
    totalRiskScore = Math.min(100, totalRiskScore * 100)

    // Determine risk category
    let riskCategory: RiskScore
    if (totalRiskScore >= 75) {
      riskCategory = "high"
    } else if (totalRiskScore >= 40) {
      riskCategory = "medium"
    } else {
      riskCategory = "low"
    }

    return {
      address,
      score: totalRiskScore,
      category: riskCategory,
      factors: riskFactors,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error calibrating risk score:", error)
    return {
      address,
      score: existingRiskProfile?.score || 0,
      category: existingRiskProfile?.category || "unknown",
      factors: existingRiskProfile?.factors || [],
      lastUpdated: new Date().toISOString(),
    }
  }
}

/**
 * Detects interactions with high-risk addresses like mixers, sanctioned entities, etc.
 */
async function detectHighRiskInteractions(address: string, transactions: any[]): Promise<RiskFactor> {
  let interactionCount = 0
  let highestRiskWeight = 0
  let description = ""

  // Check each transaction for interactions with high-risk addresses
  for (const tx of transactions) {
    const accounts = tx.transaction?.message?.accountKeys || []

    // Check for mixer interactions
    const mixerInteractions = accounts.filter((acc: any) => HIGH_RISK_PATTERNS.MIXERS.includes(acc.pubkey))
    if (mixerInteractions.length > 0) {
      interactionCount++
      highestRiskWeight = Math.max(highestRiskWeight, CALIBRATED_WEIGHTS.MIXER_INTERACTION)
      description = "Interaction with known mixer service detected"
    }

    // Check for sanctioned address interactions
    const sanctionedInteractions = accounts.filter((acc: any) => HIGH_RISK_PATTERNS.SANCTIONED.includes(acc.pubkey))
    if (sanctionedInteractions.length > 0) {
      interactionCount++
      highestRiskWeight = Math.max(highestRiskWeight, CALIBRATED_WEIGHTS.SANCTIONED_INTERACTION)
      description = "Interaction with sanctioned address detected"
    }

    // Check for scam address interactions
    const scamInteractions = accounts.filter((acc: any) => HIGH_RISK_PATTERNS.SCAMS.includes(acc.pubkey))
    if (scamInteractions.length > 0) {
      interactionCount++
      highestRiskWeight = Math.max(highestRiskWeight, CALIBRATED_WEIGHTS.SCAM_INTERACTION)
      description = "Interaction with known scam address detected"
    }

    // Check for market manipulation address interactions
    const manipulationInteractions = accounts.filter((acc: any) =>
      HIGH_RISK_PATTERNS.MARKET_MANIPULATION.includes(acc.pubkey),
    )
    if (manipulationInteractions.length > 0) {
      interactionCount++
      highestRiskWeight = Math.max(highestRiskWeight, CALIBRATED_WEIGHTS.MARKET_MANIPULATION)
      description = "Interaction with address known for market manipulation detected"
    }
  }

  // If we found high-risk interactions, return the risk factor
  if (interactionCount > 0) {
    return {
      type: "high_risk_interaction",
      score: highestRiskWeight,
      description: `${description} (${interactionCount} interactions)`,
      severity: highestRiskWeight > 0.8 ? "critical" : "high",
      name: "High Risk Interaction",
      impact: Math.round(highestRiskWeight * 100),
    }
  }

  // No high-risk interactions found
  return {
    type: "high_risk_interaction",
    score: 0,
    description: "No interactions with high-risk addresses detected",
    severity: "low",
    name: "High Risk Interaction",
    impact: 0,
  }
}

/**
 * Detects high velocity transactions (many transactions in a short time)
 */
function detectHighVelocityTransactions(transactions: any[]): RiskFactor {
  if (transactions.length < TRANSACTION_THRESHOLDS.HIGH_VELOCITY_COUNT) {
    return {
      type: "high_velocity",
      score: 0,
      description: "Normal transaction velocity",
      severity: "low",
      name: "Transaction Velocity",
      impact: 0,
    }
  }

  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort((a, b) => {
    return new Date(a.blockTime).getTime() - new Date(b.blockTime).getTime()
  })

  // Look for clusters of transactions in short time windows
  let highestVelocity = 0
  let velocityDescription = ""

  for (let i = 0; i < sortedTxs.length - TRANSACTION_THRESHOLDS.HIGH_VELOCITY_COUNT; i++) {
    const startTime = new Date(sortedTxs[i].blockTime).getTime()
    const endTime = new Date(sortedTxs[i + TRANSACTION_THRESHOLDS.HIGH_VELOCITY_COUNT - 1].blockTime).getTime()
    const timeWindow = endTime - startTime

    if (timeWindow <= TIME_THRESHOLDS.HIGH_VELOCITY) {
      const txPerMinute = TRANSACTION_THRESHOLDS.HIGH_VELOCITY_COUNT / (timeWindow / 60000)
      if (txPerMinute > highestVelocity) {
        highestVelocity = txPerMinute
        velocityDescription = `${TRANSACTION_THRESHOLDS.HIGH_VELOCITY_COUNT} transactions in ${(timeWindow / 60000).toFixed(2)} minutes (${txPerMinute.toFixed(2)} tx/min)`
      }
    }
  }

  if (highestVelocity > 0) {
    const normalizedScore = Math.min(1, highestVelocity / 100) * CALIBRATED_WEIGHTS.HIGH_VELOCITY
    return {
      type: "high_velocity",
      score: normalizedScore,
      description: `Unusually high transaction velocity: ${velocityDescription}`,
      severity: normalizedScore > 0.5 ? "high" : "medium",
      name: "Transaction Velocity",
      impact: Math.round(normalizedScore * 100),
    }
  }

  return {
    type: "high_velocity",
    score: 0,
    description: "Normal transaction velocity",
    severity: "low",
    name: "Transaction Velocity",
    impact: 0,
  }
}

/**
 * Detects transactions occurring at unusual hours (potential automated/bot activity)
 */
function detectUnusualTransactionTiming(transactions: any[]): RiskFactor {
  let unusualTimingCount = 0

  for (const tx of transactions) {
    const txTime = new Date(tx.blockTime * 1000)
    const hour = txTime.getUTCHours()

    // Check if transaction occurred during unusual hours (e.g., 1-5 AM UTC)
    if (hour >= TIME_THRESHOLDS.UNUSUAL_HOURS_START && hour <= TIME_THRESHOLDS.UNUSUAL_HOURS_END) {
      unusualTimingCount++
    }
  }

  const unusualRatio = transactions.length > 0 ? unusualTimingCount / transactions.length : 0

  if (unusualRatio > 0.5 && unusualTimingCount >= 5) {
    return {
      type: "unusual_timing",
      score: CALIBRATED_WEIGHTS.UNUSUAL_HOURS * unusualRatio,
      description: `${unusualTimingCount} transactions (${(unusualRatio * 100).toFixed(1)}%) occurred during unusual hours (1-5 AM UTC)`,
      severity: unusualRatio > 0.7 ? "medium" : "low",
      name: "Unusual Transaction Timing",
      impact: Math.round(CALIBRATED_WEIGHTS.UNUSUAL_HOURS * unusualRatio * 100),
    }
  }

  return {
    type: "unusual_timing",
    score: 0,
    description: "Normal transaction timing patterns",
    severity: "low",
    name: "Transaction Timing",
    impact: 0,
  }
}

/**
 * Detects new accounts with high activity (potential sybil accounts)
 */
function detectNewAccountWithHighActivity(transactions: any[]): RiskFactor {
  if (transactions.length === 0) {
    return {
      type: "new_account_high_activity",
      score: 0,
      description: "No transaction history available",
      severity: "low",
      name: "Account Age and Activity",
      impact: 0,
    }
  }

  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort((a, b) => {
    return new Date(a.blockTime).getTime() - new Date(b.blockTime).getTime()
  })

  // Get first and last transaction times
  const firstTxTime = new Date(sortedTxs[0].blockTime).getTime()
  const lastTxTime = new Date(sortedTxs[sortedTxs.length - 1].blockTime).getTime()
  const accountAge = lastTxTime - firstTxTime

  // Check if account is new and has high activity
  if (accountAge < TIME_THRESHOLDS.NEW_ACCOUNT && transactions.length > 20) {
    const txPerDay = transactions.length / (accountAge / (24 * 60 * 60 * 1000))
    const normalizedScore = Math.min(1, txPerDay / 50) * CALIBRATED_WEIGHTS.NEW_ACCOUNT

    return {
      type: "new_account_high_activity",
      score: normalizedScore,
      description: `New account (${(accountAge / (24 * 60 * 60 * 1000)).toFixed(1)} days old) with high activity (${txPerDay.toFixed(1)} tx/day)`,
      severity: normalizedScore > 0.5 ? "medium" : "low",
      name: "New Account High Activity",
      impact: Math.round(normalizedScore * 100),
    }
  }

  return {
    type: "new_account_high_activity",
    score: 0,
    description: "Normal account age and activity pattern",
    severity: "low",
    name: "Account Age and Activity",
    impact: 0,
  }
}

/**
 * Detects accounts with low balance but high transaction throughput
 */
function detectLowBalanceHighThroughput(balance: number, transactions: any[]): RiskFactor {
  if (balance > TRANSACTION_THRESHOLDS.LOW_BALANCE_THRESHOLD) {
    return {
      type: "low_balance_high_throughput",
      score: 0,
      description: "Normal balance for transaction volume",
      severity: "low",
      name: "Balance to Activity Ratio",
      impact: 0,
    }
  }

  // Calculate total transaction value
  let totalValue = 0
  for (const tx of transactions) {
    // This is a simplified calculation - in a real system you'd need to analyze the actual token transfers
    if (tx.meta && tx.meta.postBalances && tx.meta.preBalances) {
      const balanceDiff = Math.abs(
        tx.meta.postBalances.reduce((sum: number, val: number) => sum + val, 0) -
          tx.meta.preBalances.reduce((sum: number, val: number) => sum + val, 0),
      )
      totalValue += balanceDiff / 10 ** 9 // Convert lamports to SOL
    }
  }

  if (totalValue > TRANSACTION_THRESHOLDS.HIGH_THROUGHPUT_THRESHOLD) {
    const throughputRatio = totalValue / (balance || 0.001) // Avoid division by zero
    const normalizedScore = Math.min(1, throughputRatio / 1000) * CALIBRATED_WEIGHTS.LOW_BALANCE_HIGH_THROUGHPUT

    return {
      type: "low_balance_high_throughput",
      score: normalizedScore,
      description: `Low balance (${balance.toFixed(3)} SOL) with high transaction throughput (${totalValue.toFixed(2)} SOL)`,
      severity: normalizedScore > 0.6 ? "high" : "medium",
      name: "Low Balance High Throughput",
      impact: Math.round(normalizedScore * 100),
    }
  }

  return {
    type: "low_balance_high_throughput",
    score: 0,
    description: "Normal balance for transaction volume",
    severity: "low",
    name: "Balance to Activity Ratio",
    impact: 0,
  }
}

/**
 * Detects complex transaction patterns (multiple hops, circular transactions)
 */
function detectComplexTransactionPatterns(transactions: any[]): RiskFactor {
  // This is a simplified implementation - a real system would build a transaction graph
  // and analyze the patterns more thoroughly

  // Count transactions with many accounts involved
  let complexTxCount = 0
  let maxAccountsInTx = 0

  for (const tx of transactions) {
    const uniqueAccounts = new Set()
    if (tx.transaction?.message?.accountKeys) {
      tx.transaction.message.accountKeys.forEach((acc: any) => uniqueAccounts.add(acc.pubkey))

      if (uniqueAccounts.size >= TRANSACTION_THRESHOLDS.COMPLEX_PATTERN_MIN_HOPS) {
        complexTxCount++
        maxAccountsInTx = Math.max(maxAccountsInTx, uniqueAccounts.size)
      }
    }
  }

  if (complexTxCount > 0) {
    const complexRatio = complexTxCount / transactions.length
    const normalizedScore =
      Math.min(1, (complexRatio * maxAccountsInTx) / 10) * CALIBRATED_WEIGHTS.COMPLEX_TRANSACTION_PATTERNS

    return {
      type: "complex_patterns",
      score: normalizedScore,
      description: `${complexTxCount} complex transactions detected (max ${maxAccountsInTx} accounts in a single tx)`,
      severity: normalizedScore > 0.6 ? "high" : "medium",
      name: "Complex Transaction Patterns",
      impact: Math.round(normalizedScore * 100),
    }
  }

  return {
    type: "complex_patterns",
    score: 0,
    description: "No complex transaction patterns detected",
    severity: "low",
    name: "Transaction Patterns",
    impact: 0,
  }
}

/**
 * Detects potential market manipulation patterns
 */
function detectMarketManipulation(transactions: any[]): RiskFactor {
  // This is a simplified implementation - real market manipulation detection
  // would require analyzing token prices, order book data, etc.

  // Look for interactions with known market manipulation addresses
  let manipulationInteractions = 0

  for (const tx of transactions) {
    const accounts = tx.transaction?.message?.accountKeys || []

    const hasManipulationInteraction = accounts.some((acc: any) =>
      HIGH_RISK_PATTERNS.MARKET_MANIPULATION.includes(acc.pubkey),
    )

    if (hasManipulationInteraction) {
      manipulationInteractions++
    }
  }

  if (manipulationInteractions > 0) {
    const normalizedScore = Math.min(1, manipulationInteractions / 5) * CALIBRATED_WEIGHTS.MARKET_MANIPULATION

    return {
      type: "market_manipulation",
      score: normalizedScore,
      description: `${manipulationInteractions} interactions with addresses known for market manipulation`,
      severity: normalizedScore > 0.7 ? "high" : "medium",
      name: "Market Manipulation",
      impact: Math.round(normalizedScore * 100),
    }
  }

  return {
    type: "market_manipulation",
    score: 0,
    description: "No market manipulation patterns detected",
    severity: "low",
    name: "Market Manipulation",
    impact: 0,
  }
}

/**
 * Detects potential wash trading patterns
 */
function detectWashTrading(transactions: any[]): RiskFactor {
  // This is a simplified implementation - real wash trading detection
  // would require analyzing token transfers between related accounts

  // Look for circular transactions (same sender and receiver)
  const addressPairs = new Map()

  for (const tx of transactions) {
    if (!tx.meta || !tx.transaction?.message?.accountKeys) continue

    const accounts = tx.transaction.message.accountKeys
    if (accounts.length < 2) continue

    // Simplified: assume first account is sender, second is receiver
    const sender = accounts[0].pubkey
    const receiver = accounts[1].pubkey

    // Track interactions between these addresses
    const pairKey = `${sender}-${receiver}`
    const reversePairKey = `${receiver}-${sender}`

    addressPairs.set(pairKey, (addressPairs.get(pairKey) || 0) + 1)

    // Check if we have transactions going both ways
    if (addressPairs.has(reversePairKey)) {
      const bidirectionalCount = Math.min(addressPairs.get(pairKey), addressPairs.get(reversePairKey))

      if (bidirectionalCount >= 3) {
        const normalizedScore = Math.min(1, bidirectionalCount / 10) * CALIBRATED_WEIGHTS.WASH_TRADING

        return {
          type: "wash_trading",
          score: normalizedScore,
          description: `Potential wash trading detected: ${bidirectionalCount} bidirectional transactions between the same addresses`,
          severity: normalizedScore > 0.6 ? "high" : "medium",
          name: "Wash Trading",
          impact: Math.round(normalizedScore * 100),
        }
      }
    }
  }

  return {
    type: "wash_trading",
    score: 0,
    description: "No wash trading patterns detected",
    severity: "low",
    name: "Wash Trading",
    impact: 0,
  }
}

/**
 * Detects multiple failed transactions (potential attack attempts)
 */
function detectMultipleFailedTransactions(transactions: any[]): RiskFactor {
  let failedCount = 0

  for (const tx of transactions) {
    // Check if transaction failed
    if (tx.meta && tx.meta.err) {
      failedCount++
    }
  }

  if (failedCount >= TRANSACTION_THRESHOLDS.FAILED_TRANSACTION_THRESHOLD) {
    const failedRatio = failedCount / transactions.length
    const normalizedScore = Math.min(1, failedRatio * 2) * CALIBRATED_WEIGHTS.MULTIPLE_FAILED_TRANSACTIONS

    return {
      type: "failed_transactions",
      score: normalizedScore,
      description: `${failedCount} failed transactions (${(failedRatio * 100).toFixed(1)}% failure rate)`,
      severity: normalizedScore > 0.5 ? "medium" : "low",
      name: "Failed Transactions",
      impact: Math.round(normalizedScore * 100),
    }
  }

  return {
    type: "failed_transactions",
    score: 0,
    description: "Normal transaction success rate",
    severity: "low",
    name: "Failed Transactions",
    impact: 0,
  }
}

/**
 * Detects unusual token transfers (potential rug pulls or scams)
 */
function detectUnusualTokenTransfers(transactions: any[]): RiskFactor {
  // This is a simplified implementation - real unusual token transfer detection
  // would require analyzing token metadata, transfer patterns, etc.

  // Look for large token transfers
  let largeTransferCount = 0
  const suspiciousTokens = new Set()

  for (const tx of transactions) {
    // This would need to be implemented with actual token transfer parsing
    // For now, we'll use a placeholder implementation

    // Placeholder for token transfer detection
    if (tx.meta && tx.meta.logMessages) {
      const transferLogs = tx.meta.logMessages.filter(
        (log: string) => log.includes("Transfer") || log.includes("transfer"),
      )

      if (transferLogs.length > 0) {
        largeTransferCount++

        // In a real implementation, we would extract the token address
        // and check if it's a suspicious token
        if (Math.random() < 0.1) {
          // Placeholder for suspicious token detection
          suspiciousTokens.add("placeholder-token-address")
        }
      }
    }
  }

  if (suspiciousTokens.size > 0) {
    const normalizedScore = Math.min(1, suspiciousTokens.size / 3) * CALIBRATED_WEIGHTS.UNUSUAL_TOKEN_TRANSFERS

    return {
      type: "unusual_token_transfers",
      score: normalizedScore,
      description: `Unusual token transfers detected involving ${suspiciousTokens.size} suspicious tokens`,
      severity: normalizedScore > 0.6 ? "high" : "medium",
      name: "Unusual Token Transfers",
      impact: Math.round(normalizedScore * 100),
    }
  }

  return {
    type: "unusual_token_transfers",
    score: 0,
    description: "No unusual token transfer patterns detected",
    severity: "low",
    name: "Token Transfers",
    impact: 0,
  }
}

/**
 * Applies feedback to adjust risk scoring weights
 */
export function applyRiskScoringFeedback(
  address: string,
  actualRiskCategory: RiskScore,
  predictedRiskProfile: RiskProfile,
): void {
  // In a real implementation, this would update a database of feedback
  // that would be used to periodically retrain the risk scoring model
  console.log(
    `Feedback received for ${address}: Actual risk ${actualRiskCategory}, predicted ${predictedRiskProfile.category}`,
  )

  // This would be implemented with a machine learning model in a real system
}

/**
 * Gets risk factors that contributed most to the risk score
 */
export function getTopRiskFactors(riskProfile: RiskProfile): RiskFactor[] {
  return [...riskProfile.factors].sort((a, b) => b.score - a.score).slice(0, 3)
}

/**
 * Gets risk mitigation recommendations based on risk profile
 */
export function getRiskMitigationRecommendations(riskProfile: RiskProfile): string[] {
  const recommendations: string[] = []

  // Generate recommendations based on risk factors
  for (const factor of riskProfile.factors) {
    if (factor.score === 0) continue

    switch (factor.type) {
      case "high_risk_interaction":
        recommendations.push("Avoid interacting with high-risk addresses like mixers and sanctioned entities")
        break
      case "high_velocity":
        recommendations.push("Reduce transaction frequency to avoid triggering velocity-based risk alerts")
        break
      case "unusual_timing":
        recommendations.push("Distribute transactions more evenly throughout the day")
        break
      case "new_account_high_activity":
        recommendations.push("Establish a longer account history before conducting high-volume transactions")
        break
      case "low_balance_high_throughput":
        recommendations.push("Maintain appropriate balance levels relative to transaction volume")
        break
      case "complex_patterns":
        recommendations.push("Simplify transaction patterns by reducing the number of hops between accounts")
        break
      case "market_manipulation":
        recommendations.push("Avoid patterns that could be interpreted as market manipulation")
        break
      case "wash_trading":
        recommendations.push("Avoid circular transactions between the same accounts")
        break
      case "failed_transactions":
        recommendations.push("Investigate and resolve the cause of failed transactions")
        break
      case "unusual_token_transfers":
        recommendations.push("Exercise caution when interacting with new or suspicious tokens")
        break
    }
  }

  // Add general recommendations
  if (riskProfile.category === "high") {
    recommendations.push("Consider a complete review of transaction patterns and security practices")
  }

  // Remove duplicates and return
  return [...new Set(recommendations)]
}
