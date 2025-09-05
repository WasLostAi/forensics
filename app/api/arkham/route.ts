import { NextResponse } from "next/server"

// Helper function to make requests to the Arkham API
async function makeArkhamRequest(endpoint: string, method = "GET", body?: any) {
  const apiKey = process.env.ARKHAM_API_KEY
  const apiSecret = process.env.ARKHAM_API_SECRET

  if (!apiKey || !apiSecret) {
    return { error: "API service temporarily unavailable" }
  }

  const baseUrl = "https://api.arkhamintelligence.com"
  const url = `${baseUrl}${endpoint}`

  try {
    // Create an AbortController to handle timeouts
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "X-API-Secret": apiSecret,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Don't expose detailed API errors to client
      const status = response.status
      if (status === 401 || status === 403) {
        return { error: "API authentication failed" }
      } else if (status === 429) {
        return { error: "API rate limit exceeded. Please try again later." }
      } else if (status >= 500) {
        return { error: "External API service error" }
      } else {
        return { error: "Invalid request parameters" }
      }
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    // Handle specific error types without exposing internal details
    if (error.name === "AbortError") {
      return { error: "Request timed out" }
    }

    // For network errors, return a generic message
    if (error.message === "fetch failed") {
      return {
        error: "Network connection error. Please check your internet connection and try again.",
        networkError: true,
      }
    }

    // Generic error for any other cases
    return {
      error: "Service temporarily unavailable",
      networkError: false,
    }
  }
}

// Status check endpoint
export async function POST(request: Request) {
  try {
    // Simple endpoint to check if API credentials are valid
    const result = await makeArkhamRequest("/v1/entities/search", "POST", { query: "Binance" })

    if (result.error) {
      // Return a 200 status with the error message to handle it on the client
      return NextResponse.json({
        success: false,
        error: result.error,
        networkError: result.networkError || false,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in API route:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      networkError: error.message === "fetch failed",
    })
  }
}

// Export the makeArkhamRequest function for use in other API routes
export { makeArkhamRequest }
