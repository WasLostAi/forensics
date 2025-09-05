import { NextResponse } from "next/server"
import { makeArkhamRequest } from "../route"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    // Input validation
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Address parameter is required",
        },
        { status: 400 },
      )
    }

    // Basic address format validation (Solana addresses are typically 32-44 characters)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid address format",
        },
        { status: 400 },
      )
    }

    // Call Arkham API to get entity information
    const result = await makeArkhamRequest(`/v1/address/${address}/entity`, "GET")

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          networkError: result.networkError || false,
        },
        { status: result.networkError ? 503 : 400 },
      )
    }

    // Transform Arkham data to our entity format
    const entityData = {
      name: result.name || "Unknown Entity",
      category: mapArkhamCategory(result.category),
      tags: result.tags || [],
      riskScore: calculateRiskScore(result),
      description: result.description || "",
    }

    return NextResponse.json(
      {
        success: true,
        data: entityData,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error in entity API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Map Arkham categories to our categories
function mapArkhamCategory(arkhamCategory: string): string {
  const categoryMap: Record<string, string> = {
    exchange: "exchange",
    cex: "exchange",
    dex: "exchange",
    individual: "individual",
    person: "individual",
    contract: "contract",
    smart_contract: "contract",
    mixer: "mixer",
    tumbler: "mixer",
    scam: "scam",
    fraud: "scam",
    hack: "scam",
  }

  return categoryMap[arkhamCategory?.toLowerCase()] || "other"
}

// Calculate risk score based on Arkham data
function calculateRiskScore(entityData: any): number {
  // This is a placeholder implementation
  // You would need to adapt this to the actual Arkham API response structure

  let score = 50 // Default medium risk

  // Adjust score based on entity type
  if (entityData.category === "mixer" || entityData.category === "tumbler") {
    score += 30
  } else if (entityData.category === "scam" || entityData.category === "fraud" || entityData.category === "hack") {
    score += 40
  } else if (entityData.category === "exchange" || entityData.category === "cex" || entityData.category === "dex") {
    score -= 20
  }

  // Adjust score based on flags
  if (entityData.flags) {
    if (entityData.flags.includes("high_risk")) score += 20
    if (entityData.flags.includes("sanctioned")) score += 30
    if (entityData.flags.includes("verified")) score -= 20
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}
