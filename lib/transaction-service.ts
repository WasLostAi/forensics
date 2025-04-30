import { createClient } from "@/lib/supabase"
import type { TransactionFlowData } from "@/types/transaction"

// Function to fetch transaction flows for a specific address from Supabase
export async function fetchTransactionFlowsForAddress(address: string): Promise<TransactionFlowData> {
  const supabase = createClient()

  try {
    // Get all transactions where this address is either source or destination
    const { data: transactions, error } = await supabase
      .from("transaction_flows")
      .select("*")
      .or(`source_address.eq.${address},destination_address.eq.${address}`)

    if (error) throw error

    if (!transactions || transactions.length === 0) {
      return { nodes: [], links: [] }
    }

    // Build nodes and links from transactions
    const nodeMap = new Map()
    nodeMap.set(address, { id: address, group: 1, label: "Main Wallet", value: 20 })

    // Add all unique addresses as nodes
    transactions.forEach((tx) => {
      if (!nodeMap.has(tx.source_address)) {
        nodeMap.set(tx.source_address, {
          id: tx.source_address,
          group: tx.source_address === address ? 1 : 2,
          label: tx.source_address === address ? "Main Wallet" : "Connected Wallet",
          value: 10,
        })
      }

      if (!nodeMap.has(tx.destination_address)) {
        nodeMap.set(tx.destination_address, {
          id: tx.destination_address,
          group: tx.destination_address === address ? 1 : 2,
          label: tx.destination_address === address ? "Main Wallet" : "Connected Wallet",
          value: 10,
        })
      }
    })

    // Create links from transactions
    const links = transactions.map((tx) => ({
      source: tx.source_address,
      target: tx.destination_address,
      value: tx.amount,
      timestamp: tx.timestamp,
    }))

    return {
      nodes: Array.from(nodeMap.values()),
      links,
    }
  } catch (error) {
    console.error("Error fetching transaction flows:", error)
    throw error
  }
}

// Function to save transaction flow data to Supabase
export async function saveTransactionFlowData(data: TransactionFlowData, mainAddress: string): Promise<void> {
  const supabase = createClient()

  try {
    // Convert links to transaction_flows format
    const transactions = data.links.map((link) => ({
      source_address: link.source.toString(),
      destination_address: link.target.toString(),
      amount: link.value,
      timestamp: new Date(link.timestamp).toISOString(),
      transaction_hash: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`, // In a real app, use actual tx hash
      token: "SOL", // Default to SOL
    }))

    // Insert transactions
    const { error } = await supabase.from("transaction_flows").insert(transactions)

    if (error) throw error
  } catch (error) {
    console.error("Error saving transaction flow data:", error)
    throw error
  }
}
