import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Rate limiting to prevent abuse
const MAX_REQUESTS_PER_MINUTE = 10
const rateLimits: Record<string, { count: number; timestamp: number }> = {}

export async function GET(request: Request) {
  try {
    // Check rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()

    if (!rateLimits[ip]) {
      rateLimits[ip] = { count: 1, timestamp: now }
    } else {
      const record = rateLimits[ip]

      // Reset if outside window
      if (now - record.timestamp > 60000) {
        // 1 minute
        record.count = 1
        record.timestamp = now
      } else {
        record.count++
        if (record.count > MAX_REQUESTS_PER_MINUTE) {
          return NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 })
        }
      }
    }

    // Validate API key
    const apiKey = process.env.ARKHAM_API_KEY
    const apiSecret = process.env.ARKHAM_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    // In a real implementation, this would call the Arkham API
    // For now, return mock data
    return NextResponse.json({
      address,
      entity: {
        name: address.startsWith("B") ? "Binance" : "Unknown Wallet",
        category: address.startsWith("B") ? "exchange" : "wallet",
        confidence: 0.85,
      },
      transactions: {
        count: 287,
        volume: 145.72,
      },
    })
  } catch (error) {
    console.error("Error in Arkham API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()

    if (!rateLimits[ip]) {
      rateLimits[ip] = { count: 1, timestamp: now }
    } else {
      const record = rateLimits[ip]

      // Reset if outside window
      if (now - record.timestamp > 60000) {
        // 1 minute
        record.count = 1
        record.timestamp = now
      } else {
        record.count++
        if (record.count > MAX_REQUESTS_PER_MINUTE) {
          return NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 })
        }
      }
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { address } = body

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Save to database
    const supabase = await createServerClient()

    const { error } = await supabase.from("arkham_queries").insert({
      address,
      queried_at: new Date().toISOString(),
      ip: ip,
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in Arkham API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
