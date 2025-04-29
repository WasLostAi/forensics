import { NextResponse } from "next/server"

// Helper function to make requests to the Arkham API
async function makeArkhamRequest(endpoint: string, method = "GET", body?: any) {
  const apiKey = process.env.ARKHAM_API_KEY
  const apiSecret = process.env.ARKHAM_API_SECRET

  if (!apiKey || !apiSecret) {
    return { error: "API credentials not configured" }
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
      const errorText = await response.text()
      return {
        error: `API returned ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    // Handle specific error types
    if (error.name === "AbortError") {
      return { error: "Request timed out" }
    }

    // For network errors, return a more specific message
    if (error.message === "fetch failed") {
      return {
        error: "Network connection error. Please check your internet connection and try again.",
        networkError: true,
      }
    }

    return {
      error: `Request failed: ${error.message || "Unknown error"}`,
      networkError: error.message === "fetch failed",
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
