import type { WalletData } from "@/types/wallet"
import type { Transaction, TransactionFlowData } from "@/types/transaction"
import type { EntityLabel } from "@/types/entity"
import type { RiskScore } from "@/types/risk"
import { fetchArkhamTransactionFlow } from "./arkham-api"
import { RiskScoringService } from "./risk-scoring-service"
import { cachedFetch } from "./cache-service"

// Cache TTL constants
const CACHE_TTL = {
  WALLET_OVERVIEW: 5 * 60 * 1000, // 5 minutes
  TRANSACTION_FLOW: 10 * 60 * 1000, // 10 minutes
  ENTITY_LABELS: 30 * 60 * 1000, // 30 minutes
  RISK_SCORE: 15 * 60 * 1000, // 15 minutes
}

// In a real implementation, these functions would make API calls to a backend service
// that interacts with the Solana blockchain and a database

// Mock function for fetching transaction flow data from Solana
async function getTransactionFlowData(walletAddress: string, date?: Date, minAmount = 0): Promise<TransactionFlowData> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  return {
    nodes: [
      { id: walletAddress, group: 1, label: "Main Wallet", value: 20 },
      { id: "wallet1", group: 2, label: "Exchange Wallet", value: 15 },
      { id: "wallet2", group: 3, label: "Unknown Wallet", value: 10 },
      { id: "wallet3", group: 2, label: "Exchange Wallet", value: 12 },
      { id: "wallet4", group: 4, label: "Mixer", value: 8 },
    ],
    links: [
      { source: walletAddress, target: "wallet1", value: 5.2, timestamp: "2023-10-15T14:23:45Z" },
      { source: "wallet1", target: "wallet2", value: 3.1, timestamp: "2023-10-16T09:12:33Z" },
      { source: "wallet2", target: walletAddress, value: 1.5, timestamp: "2023-10-17T18:45:12Z" },
      { source: walletAddress, target: "wallet3", value: 7.8, timestamp: "2023-10-18T11:34:56Z" },
    ],
  }
}

export async function fetchWalletOverview(walletAddress: string): Promise<WalletData> {
  return cachedFetch(
    `wallet-overview-${walletAddress}`,
    async () => {
      // Actual API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data
      return {
        address: walletAddress,
        balance: 145.72,
        transactionCount: 287,
        firstActivity: "2022-03-15T14:23:45Z",
        lastActivity: "2023-11-28T09:12:33Z",
        riskScore: 12,
        labels: ["Exchange", "High Volume"],
        incomingVolume: 1245.32,
        outgoingVolume: 1099.6,
      }
    },
    CACHE_TTL.WALLET_OVERVIEW,
  )
}

export async function fetchTransactions(walletAddress: string, page = 1, pageSize = 20): Promise<Transaction[]> {
  // Don't cache paginated results to ensure fresh data
  // In a real app, you might want to cache this with a short TTL

  // Actual API call would go here
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real implementation, this would fetch from the Solana blockchain
  return []
}

export async function fetchTransactionFlowData(
  walletAddress: string,
  date?: Date,
  minAmount = 0,
): Promise<TransactionFlowData> {
  return cachedFetch(
    `transaction-flow-${walletAddress}-${date?.toISOString() || "all"}-${minAmount}`,
    async () => {
      try {
        // Try to use the Arkham Exchange API first
        const data = await fetchArkhamTransactionFlow(walletAddress)
        return data
      } catch (error) {
        console.error("Failed to fetch transaction flow data from Arkham:", error)

        // Try to use the actual Solana data as fallback
        try {
          const data = await getTransactionFlowData(walletAddress, date, minAmount)
          return data
        } catch (fallbackError) {
          console.error("Failed to fetch transaction flow data from Solana:", fallbackError)
          throw new Error("Failed to fetch transaction flow data from all sources")
        }
      }
    },
    CACHE_TTL.TRANSACTION_FLOW,
  )
}

export async function fetchEntityLabels(walletAddress: string): Promise<EntityLabel[]> {
  return cachedFetch(
    `entity-labels-${walletAddress}`,
    async () => {
      // Try to fetch from API
      try {
        const response = await fetch(`/api/arkham/entity?address=${walletAddress}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch entity labels: ${response.status}`)
        }
        const data = await response.json()
        return data.labels || []
      } catch (error) {
        console.error("Failed to fetch entity labels:", error)
        // Return empty array as fallback
        return []
      }
    },
    CACHE_TTL.ENTITY_LABELS,
  )
}

export async function fetchWalletRiskScore(walletAddress: string): Promise<RiskScore> {
  return cachedFetch(
    `risk-score-${walletAddress}`,
    async () => {
      try {
        // Get wallet data and transaction flow data
        const walletData = await fetchWalletOverview(walletAddress)
        const flowData = await fetchTransactionFlowData(walletAddress)

        // Calculate risk score using real transaction data
        return await RiskScoringService.calculateWalletRiskScore(walletAddress, walletData, flowData)
      } catch (error) {
        console.error("Failed to calculate risk score:", error)
        throw error
      }
    },
    CACHE_TTL.RISK_SCORE,
  )
}
