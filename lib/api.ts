import type { WalletData } from "@/types/wallet"

// Fetch wallet overview - MISSING EXPORT
export async function fetchWalletOverview(walletAddress: string): Promise<WalletData> {
  // Simulate API call
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
}

// Validate and sanitize URL
function sanitizeUrl(url: string): string {
  if (!url) return ""

  try {
    const parsedUrl = new URL(url)
    // Only allow http and https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Invalid protocol")
    }
    return parsedUrl.toString()
  } catch (error) {
    console.error("Invalid URL:", url)
    return ""
  }
}

// Make a GET request with proper error handling and timeout
export async function fetchData(url: string, options: RequestInit = {}) {
  const sanitizedUrl = sanitizeUrl(url)
  if (!sanitizedUrl) {
    throw new Error("Invalid URL")
  }

  try {
    // Set timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(sanitizedUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out")
    }
    throw error
  }
}

// Make a POST request with proper validation and error handling
export async function postData(url: string, data: any, options: RequestInit = {}) {
  const sanitizedUrl = sanitizeUrl(url)
  if (!sanitizedUrl) {
    throw new Error("Invalid URL")
  }

  try {
    // Set timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(sanitizedUrl, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out")
    }
    throw error
  }
}

// Validate API response to prevent JSON injection attacks
export function validateApiResponse(data: any): any {
  if (!data) return null

  // If data is a string, check for potential script injection
  if (typeof data === "string") {
    // Remove any script tags or potentially dangerous content
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
  }

  // If data is an object, recursively validate its properties
  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      return data.map((item) => validateApiResponse(item))
    } else {
      const result: Record<string, any> = {}
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = validateApiResponse(data[key])
        }
      }
      return result
    }
  }

  return data
}

// Rate limiting helper to prevent API abuse
const rateLimits: Record<string, { count: number; timestamp: number }> = {}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()

  if (!rateLimits[key]) {
    rateLimits[key] = { count: 1, timestamp: now }
    return true
  }

  const record = rateLimits[key]

  // Reset if outside window
  if (now - record.timestamp > windowMs) {
    record.count = 1
    record.timestamp = now
    return true
  }

  // Increment and check
  record.count++
  return record.count <= limit
}
