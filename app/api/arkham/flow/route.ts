import { NextResponse } from "next/server"
import { makeArkhamRequest } from "../route"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({
      success: false,
      error: "Address parameter is required",
    })
  }

  try {
    // Call Arkham API to get transaction flow data
    // This is a simplified example - the actual Arkham API endpoints may differ
    const result = await makeArkhamRequest(`/v1/address/${address}/transactions`, "GET")

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
      })
    }

    // Transform Arkham data to our TransactionFlowData format
    const transformedData = transformArkhamData(result, address)

    return NextResponse.json({
      success: true,
      data: transformedData,
    })
  } catch (error: any) {
    console.error("Error in transaction flow API route:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
    })
  }
}

// Transform Arkham API data to our TransactionFlowData format
function transformArkhamData(arkhamData: any, centralAddress: string) {
  // This is a placeholder implementation
  // You would need to adapt this to the actual Arkham API response structure

  const nodes = new Map()
  const links = []

  // Add the central address as the first node
  nodes.set(centralAddress, {
    id: centralAddress,
    group: 1,
    label: "Main Wallet",
    value: 20,
  })

  // Process transactions from Arkham data
  if (arkhamData.transactions && Array.isArray(arkhamData.transactions)) {
    for (const tx of arkhamData.transactions) {
      if (tx.from && tx.to && tx.value) {
        // Add nodes if they don't exist
        if (!nodes.has(tx.from)) {
          nodes.set(tx.from, {
            id: tx.from,
            group: tx.from === centralAddress ? 1 : 2,
            label: tx.fromLabel || "Unknown Wallet",
            value: 10,
          })
        }

        if (!nodes.has(tx.to)) {
          nodes.set(tx.to, {
            id: tx.to,
            group: tx.to === centralAddress ? 1 : 3,
            label: tx.toLabel || "Unknown Wallet",
            value: 10,
          })
        }

        // Add link
        links.push({
          source: tx.from,
          target: tx.to,
          value: Number.parseFloat(tx.value),
          timestamp: tx.timestamp || new Date().toISOString(),
        })
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    links,
  }
}
