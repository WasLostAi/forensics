import type { TransactionFlowData } from "@/types/transaction"

// Function to check if Arkham API credentials are valid
export async function validateArkhamCredentials(): Promise<{
  success: boolean
  networkError?: boolean
  error?: string
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      const response = await fetch("/api/arkham/validate", {
        method: "GET", // Changed from POST to GET to match the route handler
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return {
          success: false,
          error: `Expected JSON response but got ${contentType || "unknown content type"}`,
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: `API returned status ${response.status}`,
        }
      }

      const data = await response.json()
      return {
        success: data.valid === true, // Changed from data.success to data.valid to match the route handler
        error: data.error,
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error("Network error when checking API:", fetchError)

      return {
        success: false,
        networkError: true,
        error: "Cannot connect to API. Network error occurred.",
      }
    }
  } catch (error) {
    console.error("Error validating Arkham credentials:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Function to fetch transaction flow data from Arkham Intelligence
export async function fetchArkhamTransactionFlow(
  walletAddress: string,
  useMockData = false,
): Promise<TransactionFlowData> {
  if (useMockData) {
    // Mock data for testing
    return generateMockTransactionFlowData(walletAddress)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    try {
      const response = await fetch(`/api/arkham?address=${encodeURIComponent(walletAddress)}`, {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType || "unknown content type"}`)
      }

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Unknown error")
      }

      return result.data
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error("Network error fetching transaction flow:", fetchError)

      // Fall back to mock data on network error
      console.log("Falling back to mock data due to network error")
      return generateMockTransactionFlowData(walletAddress)
    }
  } catch (error) {
    console.error("Error fetching transaction flow data:", error)

    // Fall back to mock data on any error
    console.log("Falling back to mock data due to error")
    return generateMockTransactionFlowData(walletAddress)
  }
}

// Generate mock transaction flow data for a given wallet address
function generateMockTransactionFlowData(walletAddress: string): TransactionFlowData {
  // Create some mock addresses that look like Solana addresses
  const mockAddresses = [
    "5xot8nBJKNHWgV6ZeBZH7yFknBQh4ucNiYZ3RVs2vQKn",
    "7ZvMBQvQJpA25NM9pMBUwT7JUQyqj3uZZbGxNvYLwwqF",
    "9qRe1SGGQBwrQVMEqVAHwsULkGVvfN7TChDf6JWsKzGz",
    "3XTuRMPtDqRUV9YKMQSMiRvP3aPzXmzBqTTGNiKwpCXN",
  ]

  // Create nodes
  const nodes = [
    { id: walletAddress, group: 1, label: "Main Wallet", value: 20 },
    ...mockAddresses.map((address, index) => ({
      id: address,
      group: (index % 3) + 2, // Assign different groups (2, 3, 4)
      label: `${["Exchange", "Unknown", "DeFi", "Mixer"][index % 4]} Wallet`,
      value: 10 + index * 2,
    })),
  ]

  // Create links (transactions)
  const now = new Date()
  const links = [
    {
      source: walletAddress,
      target: mockAddresses[0],
      value: 5.2,
      timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
      source: mockAddresses[0],
      target: mockAddresses[1],
      value: 3.1,
      timestamp: new Date(now.getTime() - 86400000).toISOString(), // 1 day ago
    },
    {
      source: mockAddresses[1],
      target: walletAddress,
      value: 1.5,
      timestamp: new Date(now.getTime() - 43200000).toISOString(), // 12 hours ago
    },
    {
      source: walletAddress,
      target: mockAddresses[2],
      value: 7.8,
      timestamp: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
    },
  ]

  return { nodes, links }
}
