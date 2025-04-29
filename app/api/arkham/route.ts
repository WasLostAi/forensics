import { type NextRequest, NextResponse } from "next/server"
import type { TransactionFlowData } from "@/types/transaction"

const ARKHAM_API_BASE_URL = "https://api.arkham.com/v1"

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

// Helper function to make authenticated requests to Arkham API
async function makeArkhamRequest(endpoint: string, method = "GET", body?: any) {
  // Use environment variables for API credentials - these are now server-side only
  const apiKey = process.env.ARKHAM_API_KEY
  const apiSecret = process.env.ARKHAM_API_SECRET

  if (!apiKey || !apiSecret) {
    console.error("Arkham API credentials not found in environment variables")
    throw new Error("API credentials not configured")
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
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000), // 15 second timeout
    }

    // Log the request (without sensitive data)
    console.log(`Making request to ${ARKHAM_API_BASE_URL}${endpoint}`)

    try {
      const response = await fetch(`${ARKHAM_API_BASE_URL}${endpoint}`, requestOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Arkham API error (${response.status}): ${errorText}`)
      }

      return await response.json()
    } catch (fetchError) {
      // Handle specific fetch errors
      if (fetchError instanceof TypeError && fetchError.message.includes("fetch failed")) {
        console.error("Network error when connecting to Arkham API:", fetchError)
        throw new Error("Network error: Unable to connect to Arkham API. Please check your internet connection.")
      }
      throw fetchError
    }
  } catch (error) {
    console.error("Arkham API request failed:", error)
    throw error
  }
}

// Route handler for wallet data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const walletAddress = searchParams.get("address")
  const useMock = searchParams.get("mock") === "true"

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  try {
    // If mock data is requested or API credentials are missing, return mock data
    if (useMock || !process.env.ARKHAM_API_KEY || !process.env.ARKHAM_API_SECRET) {
      const mockData = generateMockTransactionFlowData(walletAddress)
      return NextResponse.json({ success: true, data: mockData })
    }

    // Otherwise, make a real API call
    try {
      const walletData = await makeArkhamRequest(`/wallet/${walletAddress}`)

      // Convert to our application format
      const nodes = [
        {
          id: walletData.address,
          group: 1,
          label: walletData.label || "Main Wallet",
          value: 20,
        },
      ]

      const links: TransactionFlowData["links"] = []

      // Add connected addresses as nodes
      if (walletData.connected_addresses) {
        walletData.connected_addresses.forEach((address: string, index: number) => {
          nodes.push({
            id: address,
            group: 2,
            label: `Connected Wallet ${index + 1}`,
            value: 10,
          })
        })
      }

      // Add transactions as links
      if (walletData.transactions) {
        walletData.transactions.forEach((tx: any) => {
          links.push({
            source: tx.from,
            target: tx.to,
            value: tx.value,
            timestamp: tx.timestamp,
          })
        })
      }

      return NextResponse.json({
        success: true,
        data: { nodes, links },
      })
    } catch (apiError) {
      console.error("Error with Arkham API call:", apiError)
      // Return mock data as fallback with a warning
      const mockData = generateMockTransactionFlowData(walletAddress)
      return NextResponse.json({
        success: true,
        data: mockData,
        warning: "Using mock data due to API error",
        error: apiError instanceof Error ? apiError.message : "Unknown API error",
      })
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        data: generateMockTransactionFlowData(walletAddress), // Fallback to mock data on error
      },
      { status: 500 },
    )
  }
}

// Route handler for API status check
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "check-credentials") {
      // Check if credentials exist
      const hasCredentials = Boolean(process.env.ARKHAM_API_KEY && process.env.ARKHAM_API_SECRET)

      if (!hasCredentials) {
        return NextResponse.json({ valid: false, reason: "missing_credentials" })
      }

      try {
        // Instead of making a full API call, just check if we can connect to the API
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        try {
          const response = await fetch(`${ARKHAM_API_BASE_URL}/status`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.ARKHAM_API_KEY!,
              "X-API-Secret": process.env.ARKHAM_API_SECRET!,
            },
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            return NextResponse.json({ valid: true })
          } else {
            return NextResponse.json({
              valid: false,
              reason: "invalid_credentials",
              status: response.status,
            })
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          console.error("Network error when checking API:", fetchError)

          // If we can't connect, assume the API is down and default to mock data
          return NextResponse.json({
            valid: false,
            reason: "network_error",
            error: fetchError instanceof Error ? fetchError.message : "Unknown network error",
          })
        }
      } catch (error) {
        console.error("Error checking API credentials:", error)
        return NextResponse.json({
          valid: false,
          reason: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in POST handler:", error)
    return NextResponse.json(
      {
        error: "Request processing error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}
