// Dynamic imports for Solana libraries to avoid build issues
import type { ParsedTransactionWithMeta } from "@solana/web3.js"
import type { Transaction } from "@/types/transaction"
import { Connection, PublicKey, type VersionedTransactionResponse } from "@solana/web3.js"
import { createClient } from "@/lib/supabase"

// Initialize connection with environment variable
const connection = new Connection(
  process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || "https://api.mainnet-beta.solana.com",
  "confirmed",
)

// Initialize connection lazily to avoid SSR issues
let PublicKeyType: typeof PublicKey | null = null
let connectionOld: Connection | null = null

// Enable mock mode for development/preview environments
const ENABLE_MOCK_MODE = true // Set to false in production

// Mock data for development/preview
const mockData = {
  balance: 145.72,
  transactionCount: 287,
  firstActivity: "2022-03-15T14:23:45Z",
  lastActivity: "2023-11-28T09:12:33Z",
  incomingVolume: 1245.32,
  outgoingVolume: 1099.6,
  transactions: [] as Transaction[],
  flowData: {
    nodes: [
      { id: "main-wallet", group: 1, label: "Main Wallet", value: 20 },
      { id: "wallet1", group: 2, label: "Exchange Wallet", value: 15 },
      { id: "wallet2", group: 3, label: "Unknown Wallet", value: 10 },
      { id: "wallet3", group: 2, label: "Exchange Wallet", value: 12 },
      { id: "wallet4", group: 4, label: "Mixer", value: 8 },
    ],
    links: [
      { source: "main-wallet", target: "wallet1", value: 5.2, timestamp: "2023-10-15T14:23:45Z" },
      { source: "wallet1", target: "wallet2", value: 3.1, timestamp: "2023-10-16T09:12:33Z" },
      { source: "wallet2", target: "main-wallet", value: 1.5, timestamp: "2023-10-17T18:45:12Z" },
      { source: "main-wallet", target: "wallet3", value: 7.8, timestamp: "2023-10-18T11:34:56Z" },
    ],
  },
}

// Validate Solana address format
export function isValidSolanaAddress(address: string): boolean {
  // Simple validation for testing
  return address && address.length >= 32 && address.length <= 44
}

// Initialize Solana connection with the provided RPC URL
export async function getConnection(rpcUrl?: string) {
  // If mock mode is enabled, don't attempt to connect to an RPC
  if (ENABLE_MOCK_MODE) {
    console.log("Mock mode enabled - not connecting to RPC")
    return null
  }

  try {
    // Dynamically import Solana web3.js to avoid SSR issues
    const solanaWeb3 = await import("@solana/web3.js")
    const Connection = solanaWeb3.Connection
    PublicKeyType = solanaWeb3.PublicKey

    // If a new RPC URL is provided or connection doesn't exist, create a new one
    if (rpcUrl || !connectionOld) {
      const endpoint = rpcUrl || process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || "https://api.mainnet-beta.solana.com"

      console.log(`Connecting to Solana via: ${endpoint}`)

      // Create connection with proper fetch configuration
      connectionOld = new Connection(endpoint, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000, // 60 seconds
        disableRetryOnRateLimit: false,
      })

      // Test the connection
      try {
        await connectionOld.getRecentBlockhash()
        console.log("Successfully connected to RPC")
        return connectionOld
      } catch (error) {
        console.error(`Failed to connect to RPC: ${error}`)
        connectionOld = null
        throw error
      }
    }

    return connectionOld
  } catch (error) {
    console.error("Error importing Solana web3.js or connecting:", error)
    throw error
  }
}

// Helper function to check connection status
export async function isConnected(): Promise<boolean> {
  // If mock mode is enabled, pretend we're connected
  if (ENABLE_MOCK_MODE) {
    return true
  }

  return false
}

export async function getWalletBalance(address: string): Promise<number> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return mockData.balance
  }

  return 0
}

export async function getTransactionCount(address: string): Promise<number> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return mockData.transactionCount
  }

  return 0
}

export async function getWalletActivity(address: string): Promise<{
  first: string
  last: string
  incoming: number
  outgoing: number
}> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return {
      first: mockData.firstActivity,
      last: mockData.lastActivity,
      incoming: mockData.incomingVolume,
      outgoing: mockData.outgoingVolume,
    }
  }

  return {
    first: new Date().toISOString(),
    last: new Date().toISOString(),
    incoming: 0,
    outgoing: 0,
  }
}

// Get transaction history - MISSING EXPORT
export async function getTransactionHistory(address: string, limit = 20, rpcUrl?: string): Promise<Transaction[]> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return getMockTransactions(address, limit)
  }

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn || !PublicKeyType) {
      throw new Error("No Solana connection available")
    }

    console.log(`Fetching transaction history for wallet: ${address}`)
    const publicKey = new PublicKeyType(address)

    // Get signatures
    const signatures = await conn.getSignaturesForAddress(publicKey, { limit })

    if (signatures.length === 0) {
      return []
    }

    // Fetch transaction details
    const transactions: Transaction[] = []

    for (const sig of signatures) {
      try {
        const tx = await conn.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
        if (!tx) continue

        // Process transaction to extract relevant details
        const transaction = processTransaction(tx, address)
        if (transaction) {
          transactions.push(transaction)
        }
      } catch (e) {
        console.error(`Error processing transaction ${sig.signature}:`, e)
      }
    }

    return transactions
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    return getMockTransactions(address, limit)
  }
}

// Fetch wallet transactions with proper error handling
export async function getWalletTransactions(address: string, limit = 20) {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana address format")
  }

  try {
    // Use mock data in development or when RPC URL is not available
    if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL) {
      return getMockTransactions(address, limit)
    }

    const pubKey = new PublicKey(address)
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit })

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          })
          return formatTransaction(tx, sig)
        } catch (err) {
          console.error(`Error fetching transaction ${sig.signature}:`, err)
          return null
        }
      }),
    )

    return transactions.filter(Boolean)
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)
    // Fallback to mock data on error
    return getMockTransactions(address, limit)
  }
}

// Format transaction data safely
function formatTransaction(tx: VersionedTransactionResponse | null, sig: any) {
  if (!tx) return null

  try {
    // Extract transaction data safely with null checks
    const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : new Date().toISOString()
    const instructions = tx.meta?.logMessages || []
    const fee = tx.meta?.fee || 0

    // Safely extract from/to addresses
    let from = ""
    let to = ""
    const amount = 0

    if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys) {
      from = tx.transaction.message.accountKeys[0]?.toString() || ""
      to = tx.transaction.message.accountKeys[1]?.toString() || ""
    }

    // Determine transaction type based on program ID
    const programId = tx.transaction?.message?.instructions?.[0]?.programId?.toString() || ""
    const type = determineTxType(programId, instructions)

    return {
      signature: sig.signature,
      timestamp: blockTime,
      from,
      to,
      amount,
      status: tx.meta?.err ? "failed" : "success",
      type,
      programId,
      instructions,
      fee,
      slot: tx.slot,
      blockTime: tx.blockTime,
    }
  } catch (error) {
    console.error("Error formatting transaction:", error)
    return null
  }
}

// Determine transaction type based on program ID and instructions
function determineTxType(programId: string, instructions: string[]): string {
  if (programId === "11111111111111111111111111111111") {
    return "transfer"
  } else if (programId.includes("Swap") || instructions.some((i) => i.includes("swap"))) {
    return "swap"
  } else if (instructions.some((i) => i.includes("NFT") || i.includes("token"))) {
    return "token"
  } else {
    return "other"
  }
}

// Mock data for development and testing
function getMockTransactions(address: string, limit: number) {
  const mockTransactions = []
  const currentTime = Date.now()

  for (let i = 0; i < limit; i++) {
    const isIncoming = Math.random() > 0.5
    mockTransactions.push({
      signature: `mock-signature-${i}-${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date(currentTime - i * 3600000).toISOString(),
      from: isIncoming ? `mock-address-${i}` : address,
      to: isIncoming ? address : `mock-address-${i}`,
      amount: Number.parseFloat((Math.random() * 10).toFixed(4)),
      status: Math.random() > 0.1 ? "success" : "failed",
      type: ["transfer", "swap", "token", "other"][Math.floor(Math.random() * 4)],
      programId: "11111111111111111111111111111111",
      fee: Number.parseFloat((Math.random() * 0.001).toFixed(6)),
      slot: 1000000 + i,
      blockTime: Math.floor(currentTime / 1000) - i * 3600,
    })
  }

  return mockTransactions
}

// Process a transaction to extract relevant details
function processTransaction(tx: ParsedTransactionWithMeta, walletAddress: string): Transaction | null {
  try {
    // Extract basic transaction info
    const signature = tx.transaction.signatures[0]
    const blockTime = tx.blockTime || 0
    const status = tx.meta?.err ? "failed" : "confirmed"
    const fee = (tx.meta?.fee || 0) / 10 ** 9

    // Default values
    let amount = 0
    let type = "other"
    let source = ""
    let destination = ""
    let program = "unknown"

    // Try to determine transaction type and details
    if (tx.meta && tx.transaction.message.instructions.length > 0) {
      const instructions = tx.transaction.message.instructions

      // Check for system program transfers
      for (const ix of instructions) {
        if ("parsed" in ix && ix.program === "system" && ix.parsed.type === "transfer") {
          type = "transfer"
          source = ix.parsed.info.source
          destination = ix.parsed.info.destination
          amount = ix.parsed.info.lamports / 10 ** 9
          program = "system"
          break
        }
      }

      // If no transfer found but there are token program instructions, mark as swap
      if (type === "other") {
        for (const ix of instructions) {
          if ("program" in ix && ix.program === "spl-token") {
            type = "swap"
            program = "spl-token"
            break
          }
        }
      }

      // If still no specific type found, use the first instruction's program
      if (program === "unknown" && instructions.length > 0) {
        const firstIx = instructions[0]
        if ("program" in firstIx) {
          program = firstIx.program
        }
      }
    }

    return {
      signature,
      blockTime,
      status,
      fee,
      amount,
      type,
      source,
      destination,
      program,
      cluster: "mainnet",
    }
  } catch (error) {
    console.error("Error processing transaction:", error)
    return null
  }
}

// Get transaction flow data with proper validation
export async function getTransactionFlowData(address: string) {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana address format")
  }

  // Return mock data
  const mockFlowData = JSON.parse(JSON.stringify(mockData.flowData))
  mockFlowData.nodes[0].id = address
  mockFlowData.links = mockFlowData.links.map((link: any) => {
    if (link.source === "main-wallet") link.source = address
    if (link.target === "main-wallet") link.target = address
    return link
  })

  return mockFlowData
}

// Mock transaction flow data
function getMockTransactionFlowData(address: string) {
  const nodes = [{ id: address, address, label: "Main Wallet", type: "wallet", value: 100 }]

  const links = []

  // Generate mock connected wallets
  for (let i = 0; i < 5; i++) {
    const connectedAddress = `wallet-${i}-${Math.random().toString(36).substring(2, 6)}`
    const isExchange = i === 0
    const isMixer = i === 1

    nodes.push({
      id: connectedAddress,
      address: connectedAddress,
      label: isExchange ? "Exchange Wallet" : isMixer ? "Mixer" : `Wallet ${i}`,
      type: isExchange ? "exchange" : isMixer ? "mixer" : "wallet",
      value: 50 - i * 10,
    })

    // Add incoming transaction
    links.push({
      id: `link-in-${i}`,
      source: connectedAddress,
      target: address,
      value: Number.parseFloat((Math.random() * 20).toFixed(2)),
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    })

    // Add outgoing transaction
    links.push({
      id: `link-out-${i}`,
      source: address,
      target: connectedAddress,
      value: Number.parseFloat((Math.random() * 15).toFixed(2)),
      timestamp: new Date(Date.now() - (i + 0.5) * 86400000).toISOString(),
    })

    // Add some connections between other wallets
    if (i > 0) {
      links.push({
        id: `link-between-${i}`,
        source: `wallet-${i - 1}-${Math.random().toString(36).substring(2, 6)}`,
        target: connectedAddress,
        value: Number.parseFloat((Math.random() * 5).toFixed(2)),
        timestamp: new Date(Date.now() - (i + 0.2) * 86400000).toISOString(),
      })
    }
  }

  return { nodes, links }
}

// Token analysis functions
// Token-related functions with proper validation
export async function detectWalletClusters(tokenAddress: string): Promise<boolean> {
  if (!isValidSolanaAddress(tokenAddress)) {
    throw new Error("Invalid token address")
  }

  // Mock implementation
  return Math.random() > 0.7
}

export async function detectBundledRug(tokenAddress: string): Promise<boolean> {
  if (!isValidSolanaAddress(tokenAddress)) {
    throw new Error("Invalid token address")
  }

  // Mock implementation
  return Math.random() > 0.8
}

export async function checkLiquidityRemoval(tokenAddress: string): Promise<boolean> {
  if (!isValidSolanaAddress(tokenAddress)) {
    throw new Error("Invalid token address")
  }

  // Mock implementation
  return Math.random() > 0.75
}

export async function getTokenHolders(tokenAddress: string): Promise<string[]> {
  if (!isValidSolanaAddress(tokenAddress)) {
    throw new Error("Invalid token address")
  }

  // Mock implementation
  return Array(5)
    .fill(0)
    .map((_, i) => `holder-${i}-${Math.random().toString(36).substring(2, 10)}`)
}

// Save transaction data to database with proper sanitization
export async function saveTransactionData(data: any) {
  try {
    const supabase = createClient()

    // Sanitize input data
    const sanitizedData = {
      signature: typeof data.signature === "string" ? data.signature : "",
      timestamp: new Date().toISOString(),
      from_address: typeof data.from === "string" ? data.from : "",
      to_address: typeof data.to === "string" ? data.to : "",
      amount: typeof data.amount === "number" ? data.amount : 0,
      status: ["success", "failed"].includes(data.status) ? data.status : "unknown",
      type: typeof data.type === "string" ? data.type : "unknown",
      program_id: typeof data.programId === "string" ? data.programId : "",
      fee: typeof data.fee === "number" ? data.fee : 0,
      slot: typeof data.slot === "number" ? data.slot : 0,
      block_time: typeof data.blockTime === "number" ? data.blockTime : Math.floor(Date.now() / 1000),
    }

    const { error } = await supabase.from("transactions").insert(sanitizedData)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error saving transaction data:", error)
    return false
  }
}
