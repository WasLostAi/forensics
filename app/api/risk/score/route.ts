import { NextResponse } from "next/server"
import { RiskScoringService } from "@/lib/risk-scoring-service"
import { fetchWalletOverview, fetchTransactionFlowData } from "@/lib/api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
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
