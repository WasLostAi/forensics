import { NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"

export async function POST() {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL

    if (!rpcUrl) {
      return NextResponse.json({ success: false, error: "QuickNode RPC URL not configured" }, { status: 400 })
    }

    // Create a connection to the Solana cluster
    const connection = new Connection(rpcUrl)

    // Try to get the latest blockhash to test the connection
    const { blockhash } = await connection.getLatestBlockhash()

    if (!blockhash) {
      return NextResponse.json({ success: false, error: "Failed to get latest blockhash" }, { status: 500 })
    }

    return NextResponse.json({ success: true, blockhash })
  } catch (error) {
    console.error("Error checking RPC connection:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
