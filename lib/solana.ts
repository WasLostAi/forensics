// Dynamic imports for Solana libraries to avoid build issues
import type { Connection, PublicKey as PublicKeyType, ParsedTransactionWithMeta } from "@solana/web3.js"
import type { Transaction } from "@/types/transaction"

// Initialize connection lazily to avoid SSR issues
let connection: Connection | null = null
let PublicKey: typeof PublicKeyType | null = null

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
    PublicKey = solanaWeb3.PublicKey

    // If a new RPC URL is provided or connection doesn't exist, create a new one
    if (rpcUrl || !connection) {
      const endpoint = rpcUrl || process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || "https://api.mainnet-beta.solana.com"

      console.log(`Connecting to Solana via: ${endpoint}`)

      // Create connection with proper fetch configuration
      connection = new Connection(endpoint, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000, // 60 seconds
        disableRetryOnRateLimit: false,
      })

      // Test the connection
      try {
        await connection.getRecentBlockhash()
        console.log("Successfully connected to RPC")
        return connection
      } catch (error) {
        console.error(`Failed to connect to RPC: ${error}`)
        connection = null
        throw error
      }
    }

    return connection
  } catch (error) {
    console.error("Error importing Solana web3.js or connecting:", error)
    throw error
  }
}

// Helper function to check connection status
export async function isConnected(rpcUrl?: string) {
  // If mock mode is enabled, pretend we're connected
  if (ENABLE_MOCK_MODE) {
    return true
  }

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn) return false

    // Try a simple request to check if the connection is working
    await conn.getRecentBlockhash()
    return true
  } catch (error) {
    console.error("Connection check failed:", error)
    return false
  }
}

export async function getWalletBalance(address: string, rpcUrl?: string): Promise<number> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return mockData.balance
  }

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn || !PublicKey) {
      throw new Error("No Solana connection available")
    }

    console.log(`Fetching balance for wallet: ${address}`)
    const publicKey = new PublicKey(address)
    const balance = await conn.getBalance(publicKey)
    console.log(`Balance for ${address}: ${balance / 10 ** 9} SOL`)
    return balance / 10 ** 9 // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    throw error
  }
}

export async function getTransactionCount(address: string, rpcUrl?: string): Promise<number> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return mockData.transactionCount
  }

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn || !PublicKey) {
      throw new Error("No Solana connection available")
    }

    console.log(`Fetching transaction count for wallet: ${address}`)
    const publicKey = new PublicKey(address)
    const signatures = await conn.getSignaturesForAddress(publicKey, { limit: 1000 })
    console.log(`Transaction count for ${address}: ${signatures.length}`)
    return signatures.length
  } catch (error) {
    console.error("Error fetching transaction count:", error)
    throw error
  }
}

export async function getWalletActivity(
  address: string,
  rpcUrl?: string,
): Promise<{
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

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn || !PublicKey) {
      throw new Error("No Solana connection available")
    }

    console.log(`Fetching wallet activity for: ${address}`)
    const publicKey = new PublicKey(address)
    const signatures = await conn.getSignaturesForAddress(publicKey, { limit: 1000 })

    if (signatures.length === 0) {
      return {
        first: new Date().toISOString(),
        last: new Date().toISOString(),
        incoming: 0,
        outgoing: 0,
      }
    }

    // Get first and last transaction timestamps
    const firstTx = signatures[signatures.length - 1]
    const lastTx = signatures[0]

    const first = firstTx.blockTime ? new Date(firstTx.blockTime * 1000).toISOString() : new Date().toISOString()
    const last = lastTx.blockTime ? new Date(lastTx.blockTime * 1000).toISOString() : new Date().toISOString()

    // Calculate incoming and outgoing volume
    let incoming = 0
    let outgoing = 0

    // Get the first 100 transactions to calculate volume
    const recentSignatures = signatures.slice(0, Math.min(100, signatures.length))
    const transactions = await Promise.all(
      recentSignatures.map(async (sig) => {
        try {
          return await conn.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
        } catch (e) {
          console.error(`Error fetching transaction ${sig.signature}:`, e)
          return null
        }
      }),
    )

    // Process transactions to calculate volume
    for (const tx of transactions) {
      if (!tx) continue

      // Process instructions to find transfers
      for (const instruction of tx.transaction.message.instructions) {
        if ("parsed" in instruction && instruction.parsed?.type === "transfer") {
          const info = instruction.parsed.info
          if (info.destination === address) {
            incoming += info.lamports / 10 ** 9
          } else if (info.source === address) {
            outgoing += info.lamports / 10 ** 9
          }
        }
      }
    }

    return {
      first,
      last,
      incoming,
      outgoing,
    }
  } catch (error) {
    console.error("Error fetching wallet activity:", error)
    throw error
  }
}

export async function getTransactionHistory(address: string, limit = 20, rpcUrl?: string): Promise<Transaction[]> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return mockData.transactions
  }

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn || !PublicKey) {
      throw new Error("No Solana connection available")
    }

    console.log(`Fetching transaction history for wallet: ${address}`)
    const publicKey = new PublicKey(address)

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
    throw error
  }
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

// Function to get transaction flow data
export async function getTransactionFlowData(
  walletAddress: string,
  date?: Date,
  minAmount = 0,
  rpcUrl?: string,
): Promise<any> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    // Replace the main wallet ID with the actual wallet address
    const mockFlowData = JSON.parse(JSON.stringify(mockData.flowData))
    mockFlowData.nodes[0].id = walletAddress
    mockFlowData.links = mockFlowData.links.map((link) => {
      if (link.source === "main-wallet") link.source = walletAddress
      if (link.target === "main-wallet") link.target = walletAddress
      return link
    })
    return mockFlowData
  }

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn || !PublicKey) {
      throw new Error("No Solana connection available")
    }

    // Get signatures for the wallet
    const publicKey = new PublicKey(walletAddress)
    const signatures = await conn.getSignaturesForAddress(publicKey, { limit: 100 })

    if (signatures.length === 0) {
      return { nodes: [], links: [] }
    }

    // Fetch transaction details
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          return await conn.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
        } catch (e) {
          console.error(`Error fetching transaction ${sig.signature}:`, e)
          return null
        }
      }),
    )

    // Process transactions to build flow data
    const nodes = new Map()
    const links = []

    // Add the main wallet as the first node
    nodes.set(walletAddress, {
      id: walletAddress,
      group: 1,
      label: "Main Wallet",
      value: 10,
    })

    // Process each transaction
    for (const tx of transactions) {
      if (!tx || !tx.meta) continue

      for (const ix of tx.transaction.message.instructions) {
        if ("parsed" in ix && ix.program === "system" && ix.parsed.type === "transfer") {
          const source = ix.parsed.info.source
          const target = ix.parsed.info.destination
          const value = ix.parsed.info.lamports / 10 ** 9

          // Skip if below minimum amount
          if (value < minAmount) continue

          // Skip if date filter is applied and transaction is outside the range
          if (date && tx.blockTime && new Date(tx.blockTime * 1000).toDateString() !== date.toDateString()) {
            continue
          }

          // Add nodes if they don't exist
          if (!nodes.has(source)) {
            nodes.set(source, {
              id: source,
              group: source === walletAddress ? 1 : 2,
              label: source === walletAddress ? "Main Wallet" : "Unknown Wallet",
              value: 5,
            })
          }

          if (!nodes.has(target)) {
            nodes.set(target, {
              id: target,
              group: target === walletAddress ? 1 : 3,
              label: target === walletAddress ? "Main Wallet" : "Unknown Wallet",
              value: 5,
            })
          }

          // Add link
          links.push({
            source,
            target,
            value,
            timestamp: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : new Date().toISOString(),
          })
        }
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      links,
    }
  } catch (error) {
    console.error("Error getting transaction flow data:", error)
    throw error
  }
}

// Token analysis functions
export async function getTokenHolders(tokenAddress: string, rpcUrl?: string): Promise<string[]> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return ["wallet1", "wallet2", "wallet3", "wallet4", "wallet5"]
  }

  try {
    const conn = await getConnection(rpcUrl)
    if (!conn || !PublicKey) {
      throw new Error("No Solana connection available")
    }

    // In a real implementation, you would fetch token holders from the blockchain
    // This is a complex operation requiring SPL token account lookups

    return [] // Return empty array instead of mock data
  } catch (error) {
    console.error("Error fetching token holders:", error)
    throw error
  }
}

export async function detectWalletClusters(tokenAddress: string, rpcUrl?: string): Promise<boolean> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return Math.random() > 0.5
  }

  // This would require complex analysis of transaction patterns
  // For now, return false instead of mock data
  return false
}

export async function detectBundledRug(tokenAddress: string, rpcUrl?: string): Promise<boolean> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return Math.random() > 0.7
  }

  // This would require complex analysis of token transactions
  // For now, return false instead of mock data
  return false
}

export async function checkLiquidityRemoval(poolAddress: string, rpcUrl?: string): Promise<boolean> {
  // If mock mode is enabled, return mock data
  if (ENABLE_MOCK_MODE) {
    return Math.random() > 0.8
  }

  // This would require analysis of liquidity pool transactions
  // For now, return false instead of mock data
  return false
}
