import { NextResponse } from "next/server"
import { RiskScoringService } from "@/lib/risk-scoring-service"
import { fetchWalletOverview, fetchTransactionFlowData } from "@/lib/api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  // Input validation
  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  // Basic address format validation (Solana addresses are typically 32-44 characters)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
  }

  try {
    // Get wallet data and transaction flow data
    const walletData = await fetchWalletOverview(address)
    const flowData = await fetchTransactionFlowData(address)

    // Calculate risk score
    const riskScore = await RiskScoringService.calculateWalletRiskScore(address, walletData, flowData)

    return NextResponse.json(riskScore)
  } catch (error) {
    console.error("Error calculating risk score:", error)
    return NextResponse.json({ error: "Failed to calculate risk score" }, { status: 500 })
  }
}
