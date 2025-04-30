import type { Transaction } from "@/types/transaction"
import type { PatternResult, PatternType, TransactionPattern } from "@/types/risk"

/**
 * Advanced pattern detection for Solana transactions
 * Implements sophisticated algorithms to identify suspicious patterns
 */

// Pattern detection thresholds
const THRESHOLDS = {
  // Time-based patterns
  RAPID_SUCCESSION_SECONDS: 30,
  RAPID_SUCCESSION_MIN_COUNT: 3,
  TIME_PATTERN_VARIANCE_THRESHOLD: 0.2, // 20% variance allowed for time patterns

  // Amount-based patterns
  ROUND_AMOUNT_THRESHOLD: 0.001, // Difference from round number in SOL
  STRUCTURED_AMOUNT_THRESHOLD: 0.01, // 1% variance for structured amounts
  SPLITTING_MIN_OUTPUTS: 3,

  // Flow-based patterns
  CIRCULAR_MIN_HOPS: 3,
  LAYERING_MIN_HOPS: 4,
  FUNNEL_MIN_INPUTS: 3,
  FAN_OUT_MIN_OUTPUTS: 3,

  // Behavioral patterns
  WASH_TRADING_MIN_CYCLES: 2,
  UNUSUAL_HOUR_START: 1, // 1 AM UTC
  UNUSUAL_HOUR_END: 5, // 5 AM UTC
  UNUSUAL_HOUR_THRESHOLD: 0.4, // 40% of transactions
}

/**
 * Detect time-based patterns in transaction history
 */
export function detectTimePatterns(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 3) return patterns

  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // 1. Detect rapid succession transactions
  const rapidSuccessionPatterns = detectRapidSuccessionTransactions(sortedTxs)
  patterns.push(...rapidSuccessionPatterns)

  // 2. Detect periodic transactions (transactions occurring at regular intervals)
  const periodicPatterns = detectPeriodicTransactions(sortedTxs)
  patterns.push(...periodicPatterns)

  // 3. Detect unusual hour transactions
  const unusualHourPatterns = detectUnusualHourTransactions(sortedTxs)
  patterns.push(...unusualHourPatterns)

  // 4. Detect burst patterns (clusters of activity followed by inactivity)
  const burstPatterns = detectBurstPatterns(sortedTxs)
  patterns.push(...burstPatterns)

  return patterns
}

/**
 * Detect amount-based patterns in transaction history
 */
export function detectAmountPatterns(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 3) return patterns

  // 1. Detect round amount transactions
  const roundAmountPatterns = detectRoundAmountTransactions(transactions)
  patterns.push(...roundAmountPatterns)

  // 2. Detect structured amounts (just below thresholds)
  const structuredAmountPatterns = detectStructuredAmounts(transactions)
  patterns.push(...structuredAmountPatterns)

  // 3. Detect repeating amount patterns
  const repeatingAmountPatterns = detectRepeatingAmounts(transactions)
  patterns.push(...repeatingAmountPatterns)

  // 4. Detect splitting patterns (one large amount split into multiple smaller ones)
  const splittingPatterns = detectSplittingPatterns(transactions)
  patterns.push(...splittingPatterns)

  return patterns
}

/**
 * Detect flow-based patterns in transaction history
 */
export function detectFlowPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 3) return patterns

  // 1. Detect circular transaction patterns
  const circularPatterns = detectCircularTransactionPatterns(transactions, address)
  patterns.push(...circularPatterns)

  // 2. Detect layering patterns (multiple hops to obscure source)
  const layeringPatterns = detectLayeringPatterns(transactions, address)
  patterns.push(...layeringPatterns)

  // 3. Detect funnel patterns (multiple sources to one destination)
  const funnelPatterns = detectFunnelPatterns(transactions, address)
  patterns.push(...funnelPatterns)

  // 4. Detect fan-out patterns (one source to multiple destinations)
  const fanOutPatterns = detectFanOutPatterns(transactions, address)
  patterns.push(...fanOutPatterns)

  return patterns
}

/**
 * Detect behavioral patterns in transaction history
 */
export function detectBehavioralPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 5) return patterns

  // 1. Detect wash trading patterns
  const washTradingPatterns = detectWashTradingPatterns(transactions, address)
  patterns.push(...washTradingPatterns)

  // 2. Detect smurfing patterns (breaking large amounts into smaller ones)
  const smurfingPatterns = detectSmurfingPatterns(transactions, address)
  patterns.push(...smurfingPatterns)

  // 3. Detect automated transaction patterns
  const automatedPatterns = detectAutomatedPatterns(transactions)
  patterns.push(...automatedPatterns)

  // 4. Detect abnormal activity spikes
  const abnormalActivityPatterns = detectAbnormalActivitySpikes(transactions)
  patterns.push(...abnormalActivityPatterns)

  return patterns
}

/**
 * Detect transactions occurring in rapid succession
 */
export function detectRapidSuccessionTransactions(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  for (let i = 0; i < transactions.length - THRESHOLDS.RAPID_SUCCESSION_MIN_COUNT + 1; i++) {
    const cluster = [transactions[i]]
    const startTime = new Date(transactions[i].timestamp).getTime()

    for (let j = i + 1; j < transactions.length; j++) {
      const currentTime = new Date(transactions[j].timestamp).getTime()
      const timeDiff = (currentTime - startTime) / 1000 // in seconds

      if (timeDiff <= THRESHOLDS.RAPID_SUCCESSION_SECONDS) {
        cluster.push(transactions[j])
      } else {
        break
      }
    }

    if (cluster.length >= THRESHOLDS.RAPID_SUCCESSION_MIN_COUNT) {
      patterns.push({
        type: "rapid_succession",
        name: "Rapid Succession Transactions",
        description: `${cluster.length} transactions within ${THRESHOLDS.RAPID_SUCCESSION_SECONDS} seconds`,
        severity: cluster.length > 5 ? "high" : "medium",
        transactions: cluster.map((tx) => tx.signature),
        score: Math.min(100, cluster.length * 10),
        metadata: {
          timespan: THRESHOLDS.RAPID_SUCCESSION_SECONDS,
          count: cluster.length,
        },
      })

      // Skip ahead to avoid overlapping patterns
      i += cluster.length - 1
    }
  }

  return patterns
}

/**
 * Detect transactions occurring at regular intervals
 */
export function detectPeriodicTransactions(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 5) return patterns

  // Calculate time differences between consecutive transactions
  const timeDiffs: number[] = []
  for (let i = 1; i < transactions.length; i++) {
    const prevTime = new Date(transactions[i - 1].timestamp).getTime()
    const currTime = new Date(transactions[i].timestamp).getTime()
    timeDiffs.push(currTime - prevTime)
  }

  // Calculate average and standard deviation
  const avgTimeDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length
  const variance = timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgTimeDiff, 2), 0) / timeDiffs.length
  const stdDev = Math.sqrt(variance)

  // Check if time differences are consistent (low standard deviation relative to average)
  const varianceRatio = stdDev / avgTimeDiff

  if (varianceRatio <= THRESHOLDS.TIME_PATTERN_VARIANCE_THRESHOLD && transactions.length >= 5) {
    patterns.push({
      type: "periodic_transactions",
      name: "Periodic Transactions",
      description: `${transactions.length} transactions at regular intervals of ~${Math.round(avgTimeDiff / 60000)} minutes`,
      severity: "medium",
      transactions: transactions.map((tx) => tx.signature),
      score: Math.min(100, 50 + (1 - varianceRatio) * 50),
      metadata: {
        averageInterval: avgTimeDiff,
        varianceRatio: varianceRatio,
      },
    })
  }

  return patterns
}

/**
 * Detect transactions occurring during unusual hours
 */
export function detectUnusualHourTransactions(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 5) return patterns

  let unusualHourCount = 0
  const unusualTransactions: Transaction[] = []

  transactions.forEach((tx) => {
    const txHour = new Date(tx.timestamp).getUTCHours()

    if (txHour >= THRESHOLDS.UNUSUAL_HOUR_START && txHour <= THRESHOLDS.UNUSUAL_HOUR_END) {
      unusualHourCount++
      unusualTransactions.push(tx)
    }
  })

  const unusualRatio = unusualHourCount / transactions.length

  if (unusualRatio >= THRESHOLDS.UNUSUAL_HOUR_THRESHOLD && unusualHourCount >= 3) {
    patterns.push({
      type: "unusual_hours",
      name: "Unusual Hour Transactions",
      description: `${unusualHourCount} transactions (${Math.round(unusualRatio * 100)}%) during unusual hours (1-5 AM UTC)`,
      severity: unusualRatio > 0.7 ? "high" : "medium",
      transactions: unusualTransactions.map((tx) => tx.signature),
      score: Math.min(100, unusualRatio * 100),
      metadata: {
        unusualHourCount,
        totalCount: transactions.length,
        ratio: unusualRatio,
      },
    })
  }

  return patterns
}

/**
 * Detect burst patterns (clusters of activity followed by inactivity)
 */
export function detectBurstPatterns(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 10) return patterns

  // Group transactions by day
  const txByDay: Record<string, Transaction[]> = {}

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp)
    const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`

    if (!txByDay[dayKey]) {
      txByDay[dayKey] = []
    }

    txByDay[dayKey].push(tx)
  })

  // Convert to array of daily counts
  const dailyCounts = Object.entries(txByDay)
    .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
    .map(([day, txs]) => ({ day, count: txs.length }))

  // Calculate average and standard deviation of daily counts
  const counts = dailyCounts.map((d) => d.count)
  const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / counts.length
  const stdDev = Math.sqrt(variance)

  // Identify burst days (days with activity > avg + 2*stdDev)
  const burstDays = dailyCounts.filter((d) => d.count > avgCount + 2 * stdDev)

  if (burstDays.length > 0) {
    // Collect all transactions from burst days
    const burstTransactions: Transaction[] = []
    burstDays.forEach((burstDay) => {
      const dayTxs = txByDay[burstDay.day]
      burstTransactions.push(...dayTxs)
    })

    patterns.push({
      type: "activity_bursts",
      name: "Activity Burst Pattern",
      description: `${burstDays.length} days with abnormally high transaction activity`,
      severity: burstDays.length > 2 ? "high" : "medium",
      transactions: burstTransactions.map((tx) => tx.signature),
      score: Math.min(100, 50 + burstDays.length * 10),
      metadata: {
        burstDays: burstDays.map((d) => d.day),
        averageDailyCount: avgCount,
        standardDeviation: stdDev,
      },
    })
  }

  return patterns
}

/**
 * Detect transactions with round amounts
 */
export function detectRoundAmountTransactions(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  const roundAmountTxs = transactions.filter((tx) => {
    // Check if amount is a whole number or ends with .0, .00, .000, etc.
    const amount = tx.amount
    const isWholeNumber = Math.abs(amount - Math.round(amount)) < THRESHOLDS.ROUND_AMOUNT_THRESHOLD

    // Check if amount is a "round" number like 10, 50, 100, 500, 1000, etc.
    const roundNumbers = [1, 5, 10, 50, 100, 500, 1000, 5000, 10000]
    const isRoundNumber = roundNumbers.some(
      (n) =>
        Math.abs(amount - n) < THRESHOLDS.ROUND_AMOUNT_THRESHOLD ||
        Math.abs(amount - n * 0.1) < THRESHOLDS.ROUND_AMOUNT_THRESHOLD ||
        Math.abs(amount - n * 0.01) < THRESHOLDS.ROUND_AMOUNT_THRESHOLD,
    )

    return isWholeNumber || isRoundNumber
  })

  if (roundAmountTxs.length >= 3) {
    const ratio = roundAmountTxs.length / transactions.length

    patterns.push({
      type: "round_amounts",
      name: "Round Amount Transactions",
      description: `${roundAmountTxs.length} transactions (${Math.round(ratio * 100)}%) with round amounts`,
      severity: ratio > 0.7 ? "high" : "medium",
      transactions: roundAmountTxs.map((tx) => tx.signature),
      score: Math.min(100, 40 + roundAmountTxs.length * 5),
      metadata: {
        roundAmountCount: roundAmountTxs.length,
        totalCount: transactions.length,
        ratio: ratio,
      },
    })
  }

  return patterns
}

/**
 * Detect structured amounts (just below thresholds)
 */
export function detectStructuredAmounts(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  // Common reporting thresholds in SOL (approximate USD equivalents)
  const thresholds = [1000, 3000, 5000, 10000]

  const structuredTxs = transactions.filter((tx) => {
    const amount = tx.amount

    // Check if amount is just below a threshold (within 5%)
    return thresholds.some((threshold) => {
      const diff = threshold - amount
      return diff > 0 && diff < threshold * 0.05
    })
  })

  if (structuredTxs.length >= 2) {
    patterns.push({
      type: "structured_amounts",
      name: "Structured Amounts",
      description: `${structuredTxs.length} transactions with amounts just below reporting thresholds`,
      severity: structuredTxs.length > 4 ? "high" : "medium",
      transactions: structuredTxs.map((tx) => tx.signature),
      score: Math.min(100, 60 + structuredTxs.length * 10),
      metadata: {
        structuredCount: structuredTxs.length,
        totalCount: transactions.length,
      },
    })
  }

  return patterns
}

/**
 * Detect repeating amount patterns
 */
export function detectRepeatingAmounts(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  // Group transactions by amount
  const txsByAmount: Record<number, Transaction[]> = {}

  transactions.forEach((tx) => {
    // Round to 4 decimal places to account for small variations
    const roundedAmount = Math.round(tx.amount * 10000) / 10000

    if (!txsByAmount[roundedAmount]) {
      txsByAmount[roundedAmount] = []
    }

    txsByAmount[roundedAmount].push(tx)
  })

  // Find amounts that repeat frequently
  const repeatingAmounts = Object.entries(txsByAmount)
    .filter(([_, txs]) => txs.length >= 3)
    .sort(([_, txsA], [__, txsB]) => txsB.length - txsA.length)

  if (repeatingAmounts.length > 0) {
    // Get the most frequently repeated amount
    const [amount, txs] = repeatingAmounts[0]
    const ratio = txs.length / transactions.length

    patterns.push({
      type: "repeating_amounts",
      name: "Repeating Amount Pattern",
      description: `${txs.length} transactions with identical amount of ${amount} SOL`,
      severity: ratio > 0.5 ? "high" : "medium",
      transactions: txs.map((tx) => tx.signature),
      score: Math.min(100, 40 + txs.length * 5),
      metadata: {
        amount: Number.parseFloat(amount),
        count: txs.length,
        totalCount: transactions.length,
        ratio: ratio,
      },
    })
  }

  return patterns
}

/**
 * Detect splitting patterns (one large amount split into multiple smaller ones)
 */
export function detectSplittingPatterns(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Look for large incoming transactions followed by multiple smaller outgoing ones
  for (let i = 0; i < sortedTxs.length; i++) {
    const tx = sortedTxs[i]

    // Skip if not a large transaction
    if (tx.amount < 100) continue

    // Look for subsequent smaller transactions within 24 hours
    const largeTime = new Date(tx.timestamp).getTime()
    const subsequentTxs = sortedTxs.slice(i + 1).filter((subTx) => {
      const subTime = new Date(subTx.timestamp).getTime()
      const timeDiff = (subTime - largeTime) / (60 * 60 * 1000) // in hours

      return timeDiff <= 24 && subTx.amount < tx.amount * 0.5
    })

    // Check if the sum of subsequent transactions is close to the large transaction
    if (subsequentTxs.length >= THRESHOLDS.SPLITTING_MIN_OUTPUTS) {
      const subsequentSum = subsequentTxs.reduce((sum, subTx) => sum + subTx.amount, 0)
      const ratio = subsequentSum / tx.amount

      if (ratio > 0.8 && ratio < 1.2) {
        patterns.push({
          type: "splitting_pattern",
          name: "Transaction Splitting",
          description: `Large transaction of ${tx.amount} SOL split into ${subsequentTxs.length} smaller transactions`,
          severity: "high",
          transactions: [tx.signature, ...subsequentTxs.map((t) => t.signature)],
          score: Math.min(100, 70 + subsequentTxs.length * 2),
          metadata: {
            largeAmount: tx.amount,
            splitCount: subsequentTxs.length,
            splitSum: subsequentSum,
            ratio: ratio,
          },
        })

        // Skip ahead
        i += subsequentTxs.length
      }
    }
  }

  return patterns
}

/**
 * Detect circular transaction patterns
 */
export function detectCircularTransactionPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  // Build a directed graph of transactions
  const graph: Record<string, string[]> = {}

  transactions.forEach((tx) => {
    if (!graph[tx.from]) {
      graph[tx.from] = []
    }

    graph[tx.from].push(tx.to)
  })

  // Find circular paths in the graph
  const visited = new Set<string>()
  const path: string[] = []
  const circularPaths: string[][] = []

  function dfs(current: string, start: string, depth: number) {
    // Limit search depth to prevent stack overflow
    if (depth > 10) return

    path.push(current)
    visited.add(current)

    const neighbors = graph[current] || []

    for (const neighbor of neighbors) {
      if (neighbor === start && path.length >= THRESHOLDS.CIRCULAR_MIN_HOPS) {
        // Found a cycle
        circularPaths.push([...path, start])
      } else if (!visited.has(neighbor)) {
        dfs(neighbor, start, depth + 1)
      }
    }

    path.pop()
    visited.delete(current)
  }

  // Start DFS from the main address
  if (graph[address]) {
    dfs(address, address, 0)
  }

  // Create patterns from circular paths
  circularPaths.forEach((path) => {
    // Find transactions that form this path
    const pathTransactions: Transaction[] = []

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i]
      const to = path[i + 1]

      const tx = transactions.find((t) => t.from === from && t.to === to)
      if (tx) {
        pathTransactions.push(tx)
      }
    }

    if (pathTransactions.length >= THRESHOLDS.CIRCULAR_MIN_HOPS) {
      patterns.push({
        type: "circular_transactions",
        name: "Circular Transaction Pattern",
        description: `Circular flow of funds through ${path.length} addresses`,
        severity: "high",
        transactions: pathTransactions.map((tx) => tx.signature),
        score: Math.min(100, 70 + path.length * 5),
        metadata: {
          path: path,
          hopCount: path.length,
        },
      })
    }
  })

  return patterns
}

/**
 * Detect layering patterns (multiple hops to obscure source)
 */
export function detectLayeringPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  // Build a directed graph of transactions
  const graph: Record<string, string[]> = {}
  const txMap: Record<string, Record<string, Transaction>> = {}

  transactions.forEach((tx) => {
    if (!graph[tx.from]) {
      graph[tx.from] = []
      txMap[tx.from] = {}
    }

    graph[tx.from].push(tx.to)
    txMap[tx.from][tx.to] = tx
  })

  // Find long paths in the graph
  const visited = new Set<string>()
  const path: string[] = []
  const longPaths: string[][] = []

  function dfs(current: string, depth: number) {
    // Limit search depth to prevent stack overflow
    if (depth > 10) return

    path.push(current)
    visited.add(current)

    const neighbors = graph[current] || []

    if (neighbors.length === 0 && path.length >= THRESHOLDS.LAYERING_MIN_HOPS) {
      // Found a long path
      longPaths.push([...path])
    } else {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, depth + 1)
        }
      }
    }

    path.pop()
    visited.delete(current)
  }

  // Start DFS from the main address
  if (graph[address]) {
    dfs(address, 0)
  }

  // Create patterns from long paths
  longPaths.forEach((path) => {
    // Find transactions that form this path
    const pathTransactions: Transaction[] = []

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i]
      const to = path[i + 1]

      if (txMap[from] && txMap[from][to]) {
        pathTransactions.push(txMap[from][to])
      }
    }

    if (pathTransactions.length >= THRESHOLDS.LAYERING_MIN_HOPS - 1) {
      patterns.push({
        type: "layering_pattern",
        name: "Transaction Layering",
        description: `Funds moved through ${path.length} addresses in sequence`,
        severity: path.length > 6 ? "high" : "medium",
        transactions: pathTransactions.map((tx) => tx.signature),
        score: Math.min(100, 60 + path.length * 5),
        metadata: {
          path: path,
          hopCount: path.length,
        },
      })
    }
  })

  return patterns
}

/**
 * Detect funnel patterns (multiple sources to one destination)
 */
export function detectFunnelPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  // Group transactions by destination
  const txsByDestination: Record<string, Transaction[]> = {}

  transactions.forEach((tx) => {
    if (!txsByDestination[tx.to]) {
      txsByDestination[tx.to] = []
    }

    txsByDestination[tx.to].push(tx)
  })

  // Find destinations with multiple sources
  Object.entries(txsByDestination).forEach(([destination, txs]) => {
    if (txs.length >= THRESHOLDS.FUNNEL_MIN_INPUTS) {
      // Check if transactions occurred within a reasonable timeframe (7 days)
      const timestamps = txs.map((tx) => new Date(tx.timestamp).getTime())
      const minTime = Math.min(...timestamps)
      const maxTime = Math.max(...timestamps)
      const timespan = (maxTime - minTime) / (24 * 60 * 60 * 1000) // in days

      if (timespan <= 7) {
        // Calculate total amount
        const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0)

        patterns.push({
          type: "funnel_pattern",
          name: "Transaction Funnel",
          description: `${txs.length} transactions from different sources to the same destination`,
          severity: txs.length > 10 ? "high" : "medium",
          transactions: txs.map((tx) => tx.signature),
          score: Math.min(100, 50 + txs.length * 5),
          metadata: {
            destination,
            sourceCount: txs.length,
            totalAmount,
            timespan,
          },
        })
      }
    }
  })

  return patterns
}

/**
 * Detect fan-out patterns (one source to multiple destinations)
 */
export function detectFanOutPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  // Group transactions by source
  const txsBySource: Record<string, Transaction[]> = {}

  transactions.forEach((tx) => {
    if (!txsBySource[tx.from]) {
      txsBySource[tx.from] = []
    }

    txsBySource[tx.from].push(tx)
  })

  // Find sources with multiple destinations
  Object.entries(txsBySource).forEach(([source, txs]) => {
    if (txs.length >= THRESHOLDS.FAN_OUT_MIN_OUTPUTS) {
      // Check if transactions occurred within a reasonable timeframe (1 day)
      const timestamps = txs.map((tx) => new Date(tx.timestamp).getTime())
      const minTime = Math.min(...timestamps)
      const maxTime = Math.max(...timestamps)
      const timespan = (maxTime - minTime) / (60 * 60 * 1000) // in hours

      if (timespan <= 24) {
        // Calculate total amount
        const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0)

        // Check if destinations are unique
        const uniqueDestinations = new Set(txs.map((tx) => tx.to))

        if (uniqueDestinations.size >= THRESHOLDS.FAN_OUT_MIN_OUTPUTS) {
          patterns.push({
            type: "fan_out_pattern",
            name: "Transaction Fan-Out",
            description: `${txs.length} transactions from the same source to ${uniqueDestinations.size} different destinations`,
            severity: uniqueDestinations.size > 10 ? "high" : "medium",
            transactions: txs.map((tx) => tx.signature),
            score: Math.min(100, 50 + uniqueDestinations.size * 5),
            metadata: {
              source,
              destinationCount: uniqueDestinations.size,
              totalAmount,
              timespan,
            },
          })
        }
      }
    }
  })

  return patterns
}

/**
 * Detect wash trading patterns
 */
export function detectWashTradingPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  // Build a map of bidirectional transactions between addresses
  const bidirectionalTxs: Record<string, { to: Transaction[]; from: Transaction[] }> = {}

  transactions.forEach((tx) => {
    const counterparty = tx.from === address ? tx.to : tx.from
    const direction = tx.from === address ? "from" : "to"

    if (!bidirectionalTxs[counterparty]) {
      bidirectionalTxs[counterparty] = { to: [], from: [] }
    }

    bidirectionalTxs[counterparty][direction].push(tx)
  })

  // Find addresses with both incoming and outgoing transactions
  Object.entries(bidirectionalTxs).forEach(([counterparty, { to, from }]) => {
    if (to.length > 0 && from.length > 0) {
      // Check if there are multiple cycles
      const cycleCount = Math.min(to.length, from.length)

      if (cycleCount >= THRESHOLDS.WASH_TRADING_MIN_CYCLES) {
        // Calculate total amounts in both directions
        const toAmount = to.reduce((sum, tx) => sum + tx.amount, 0)
        const fromAmount = from.reduce((sum, tx) => sum + tx.amount, 0)

        // Check if amounts are similar (within 20%)
        const ratio = Math.min(toAmount, fromAmount) / Math.max(toAmount, fromAmount)

        if (ratio > 0.8) {
          const allTxs = [...to, ...from].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )

          patterns.push({
            type: "wash_trading",
            name: "Wash Trading Pattern",
            description: `${cycleCount} cycles of funds between the same two addresses`,
            severity: cycleCount > 5 ? "high" : "medium",
            transactions: allTxs.map((tx) => tx.signature),
            score: Math.min(100, 70 + cycleCount * 5),
            metadata: {
              counterparty,
              cycleCount,
              toAmount,
              fromAmount,
              ratio,
            },
          })
        }
      }
    }
  })

  return patterns
}

/**
 * Detect smurfing patterns (breaking large amounts into smaller ones)
 */
export function detectSmurfingPatterns(transactions: Transaction[], address: string): PatternResult[] {
  const patterns: PatternResult[] = []

  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Group outgoing transactions by day
  const txsByDay: Record<string, Transaction[]> = {}

  sortedTxs.forEach((tx) => {
    if (tx.from !== address) return // Only consider outgoing transactions

    const date = new Date(tx.timestamp)
    const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`

    if (!txsByDay[dayKey]) {
      txsByDay[dayKey] = []
    }

    txsByDay[dayKey].push(tx)
  })

  // Look for days with multiple similar small transactions
  Object.entries(txsByDay).forEach(([day, txs]) => {
    if (txs.length < 5) return

    // Calculate average and standard deviation of amounts
    const amounts = txs.map((tx) => tx.amount)
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length
    const stdDev = Math.sqrt(variance)

    // Check if amounts are similar (low standard deviation relative to average)
    const varianceRatio = stdDev / avgAmount

    if (varianceRatio < 0.3 && avgAmount < 100) {
      patterns.push({
        type: "smurfing_pattern",
        name: "Smurfing Pattern",
        description: `${txs.length} similar small transactions on ${day}`,
        severity: txs.length > 10 ? "high" : "medium",
        transactions: txs.map((tx) => tx.signature),
        score: Math.min(100, 60 + txs.length * 3),
        metadata: {
          day,
          transactionCount: txs.length,
          averageAmount: avgAmount,
          standardDeviation: stdDev,
          varianceRatio,
        },
      })
    }
  })

  return patterns
}

/**
 * Detect automated transaction patterns
 */
export function detectAutomatedPatterns(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 5) return patterns

  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Calculate time differences between consecutive transactions
  const timeDiffs: number[] = []
  for (let i = 1; i < sortedTxs.length; i++) {
    const prevTime = new Date(sortedTxs[i - 1].timestamp).getTime()
    const currTime = new Date(sortedTxs[i].timestamp).getTime()
    timeDiffs.push(currTime - prevTime)
  }

  // Check for exact or near-exact time intervals
  const exactIntervals = timeDiffs.filter((diff) => {
    // Check if any other time difference is very close to this one (within 1%)
    return timeDiffs.filter((otherDiff) => Math.abs(diff - otherDiff) < diff * 0.01).length >= 3
  })

  if (exactIntervals.length >= 3) {
    // Calculate the most common interval
    const intervalCounts: Record<number, number> = {}
    exactIntervals.forEach((interval) => {
      // Round to the nearest second
      const roundedInterval = Math.round(interval / 1000) * 1000
      intervalCounts[roundedInterval] = (intervalCounts[roundedInterval] || 0) + 1
    })

    const mostCommonInterval = Object.entries(intervalCounts).sort(([_, countA], [__, countB]) => countB - countA)[0][0]

    patterns.push({
      type: "automated_transactions",
      name: "Automated Transaction Pattern",
      description: `${exactIntervals.length} transactions with precise time intervals`,
      severity: exactIntervals.length > 10 ? "high" : "medium",
      transactions: sortedTxs.map((tx) => tx.signature),
      score: Math.min(100, 50 + exactIntervals.length * 5),
      metadata: {
        interval: Number.parseInt(mostCommonInterval),
        intervalCount: exactIntervals.length,
        totalCount: transactions.length,
      },
    })
  }

  return patterns
}

/**
 * Detect abnormal activity spikes
 */
export function detectAbnormalActivitySpikes(transactions: Transaction[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (transactions.length < 10) return patterns

  // Group transactions by hour
  const txsByHour: Record<string, Transaction[]> = {}

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp)
    const hourKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}-${date.getUTCHours()}`

    if (!txsByHour[hourKey]) {
      txsByHour[hourKey] = []
    }

    txsByHour[hourKey].push(tx)
  })

  // Convert to array of hourly counts
  const hourlyCounts = Object.entries(txsByHour)
    .sort(([hourA], [hourB]) => hourA.localeCompare(hourB))
    .map(([hour, txs]) => ({ hour, count: txs.length }))

  // Calculate average and standard deviation of hourly counts
  const counts = hourlyCounts.map((h) => h.count)
  const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / counts.length
  const stdDev = Math.sqrt(variance)

  // Identify spike hours (hours with activity > avg + 3*stdDev)
  const spikeHours = hourlyCounts.filter((h) => h.count > avgCount + 3 * stdDev)

  if (spikeHours.length > 0) {
    // Collect all transactions from spike hours
    const spikeTransactions: Transaction[] = []
    spikeHours.forEach((spikeHour) => {
      const hourTxs = txsByHour[spikeHour.hour]
      spikeTransactions.push(...hourTxs)
    })

    patterns.push({
      type: "activity_spike",
      name: "Abnormal Activity Spike",
      description: `${spikeHours.length} hours with abnormally high transaction activity`,
      severity: spikeHours.length > 1 ? "high" : "medium",
      transactions: spikeTransactions.map((tx) => tx.signature),
      score: Math.min(100, 60 + spikeHours.length * 10),
      metadata: {
        spikeHours: spikeHours.map((h) => h.hour),
        averageHourlyCount: avgCount,
        standardDeviation: stdDev,
      },
    })
  }

  return patterns
}

/**
 * Analyze all patterns in a transaction history
 */
export function analyzeTransactionPatterns(transactions: Transaction[], address: string): TransactionPattern[] {
  // Collect all patterns
  const timePatterns = detectTimePatterns(transactions)
  const amountPatterns = detectAmountPatterns(transactions)
  const flowPatterns = detectFlowPatterns(transactions, address)
  const behavioralPatterns = detectBehavioralPatterns(transactions, address)

  // Combine all patterns
  const allPatterns = [...timePatterns, ...amountPatterns, ...flowPatterns, ...behavioralPatterns]

  // Group patterns by type
  const patternsByType: Record<PatternType, PatternResult[]> = {
    time_based: timePatterns,
    amount_based: amountPatterns,
    flow_based: flowPatterns,
    behavioral: behavioralPatterns,
  }

  // Create transaction pattern objects
  return Object.entries(patternsByType).map(([type, patterns]) => ({
    type: type as PatternType,
    patternCount: patterns.length,
    totalRiskScore: patterns.reduce((sum, pattern) => sum + pattern.score, 0) / (patterns.length || 1),
    patterns: patterns,
    affectedTransactions: [...new Set(patterns.flatMap((p) => p.transactions))].length,
    highSeverityCount: patterns.filter((p) => p.severity === "high").length,
  }))
}
