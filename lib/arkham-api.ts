// Arkham Exchange API client - Client-side safe version
import type { TransactionFlowData } from "@/types/transaction"

// Interface for API responses
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  warning?: string
}

// Function to check if Arkham API credentials are valid
export async function validateArkhamCredentials(): Promise<{
  valid: boolean
  reason?: string
  error?: string
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const response = await fetch("/api/arkham", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "check-credentials" }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error("API validation response not OK:", response.status)
      return { valid: false, reason: "api_error", error: `HTTP error ${response.status}` }
    }

    const data = await response.json()
    return {
      valid: data.valid === true,
      reason: data.reason,
      error: data.error,
    }
  } catch (error) {
    console.error("Failed to validate Arkham credentials:", error)

    // Handle abort errors specifically
    if (error instanceof DOMException && error.name === "AbortError") {
      return { valid: false, reason: "timeout", error: "Request timed out" }
    }

    return {
      valid: false,
      reason: "fetch_error",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Main function to fetch transaction flow data from Arkham
export async function fetchArkhamTransactionFlow(
  walletAddress: string,
  useMockData = false,
): Promise<TransactionFlowData> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`/api/arkham?address=${encodeURIComponent(walletAddress)}&mock=${useMockData}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error("API response not OK:", response.status)
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      console.error("Failed to fetch data:", result.error)
      throw new Error(result.error || "Unknown error")
    }

    if (result.warning) {
      console.warn("API warning:", result.warning)
    }

    return result.data
  } catch (error) {
    console.error("Error fetching transaction flow:", error)

    // Handle abort errors specifically
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again later.")
    }

    throw error
  }
}
