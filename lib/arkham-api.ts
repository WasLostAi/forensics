// Arkham Exchange API client

import type { TransactionFlowData } from "@/types/transaction"

const ARKHAM_API_BASE_URL = "https://api.arkham.com/v1"

// Interface for API responses
interface ArkhamApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface ArkhamWalletData {
  address: string
  label?: string
  category?: string
  risk_score?: number
  connected_addresses?: string[]
  transactions?: ArkhamTransaction[]
}

interface ArkhamTransaction {
  hash: string
  from: string
  to: string
  value: number
  timestamp: string
}

// Helper function to make authenticated requests to Arkham API
async function makeArkhamRequest<T>(endpoint: string, method = "GET", body?: any): Promise<ArkhamApiResponse<T>> {
  // Use environment variables for API credentials
  const apiKey = process.env.ARKHAM_API_KEY
  const apiSecret = process.env.ARKHAM_API_SECRET

  if (!apiKey || !apiSecret) {
    console.error("Arkham API credentials not found in environment variables")
    return {
      success: false,
      error: "API credentials not configured. Please add them in your project settings.",
    }
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-API-Secret": apiSecret,
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }

    const response = await fetch(`${ARKHAM_API_BASE_URL}${endpoint}`, requestOptions)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Arkham API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Arkham API request failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Function to get wallet data and transaction flow from Arkham
export async function getArkhamWalletData(walletAddress: string): Promise<ArkhamApiResponse<ArkhamWalletData>> {
  return makeArkhamRequest<ArkhamWalletData>(`/wallet/${walletAddress}`)
}

// Convert Arkham data to our application's TransactionFlowData format
export function convertToTransactionFlowData(arkhamData: ArkhamWalletData): TransactionFlowData {
  const nodes = [
    {
      id: arkhamData.address,
      group: 1,
      label: arkhamData.label || "Main Wallet",
      value: 20,
    },
  ]

  const links: TransactionFlowData["links"] = []

  // Add connected addresses as nodes
  if (arkhamData.connected_addresses) {
    arkhamData.connected_addresses.forEach((address, index) => {
      nodes.push({
        id: address,
        group: 2,
        label: `Connected Wallet ${index + 1}`,
        value: 10,
      })
    })
  }

  // Add transactions as links
  if (arkhamData.transactions) {
    arkhamData.transactions.forEach((tx) => {
      links.push({
        source: tx.from,
        target: tx.to,
        value: tx.value,
        timestamp: tx.timestamp,
      })
    })
  }

  return { nodes, links }
}

// Main function to fetch transaction flow data from Arkham
export async function fetchArkhamTransactionFlow(walletAddress: string): Promise<TransactionFlowData> {
  try {
    const response = await getArkhamWalletData(walletAddress)

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch data from Arkham")
    }

    return convertToTransactionFlowData(response.data)
  } catch (error) {
    console.error("Error fetching Arkham transaction flow:", error)

    // Return minimal fallback data
    return {
      nodes: [{ id: walletAddress, group: 1, label: "Main Wallet", value: 20 }],
      links: [],
    }
  }
}
