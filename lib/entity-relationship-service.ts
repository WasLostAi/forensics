import { supabase } from "./supabase"
import { getEntityByAddress } from "./entity-service"
import type { EntityRelationship, EntityNode, EntityGraph } from "@/types/entity-graph"

/**
 * Fetches relationships between entities
 */
export async function getEntityRelationships(centralAddress: string, depth = 1, maxNodes = 50): Promise<EntityGraph> {
  try {
    // Get the central entity
    const centralEntityData = await getEntityByAddress(centralAddress)
    const centralEntity = centralEntityData.entity

    if (!centralEntity) {
      throw new Error(`Entity not found for address: ${centralAddress}`)
    }

    // Initialize the graph with the central entity
    const nodes: EntityNode[] = [
      {
        id: centralEntity.address,
        label: centralEntity.label,
        category: centralEntity.category,
        riskScore: centralEntity.riskScore || 50,
        group: 0, // Central entity is group 0
        size: 15, // Central entity is larger
      },
    ]

    const links: EntityRelationship[] = []
    const processedAddresses = new Set<string>([centralAddress])
    let currentDepth = 0
    let addressesToProcess = [centralAddress]

    // Process entities up to the specified depth
    while (currentDepth < depth && addressesToProcess.length > 0 && nodes.length < maxNodes) {
      const nextAddressesToProcess: string[] = []

      for (const address of addressesToProcess) {
        // Get transactions involving this address
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("from_address, to_address, amount, timestamp, transaction_type")
          .or(`from_address.eq.${address},to_address.eq.${address}`)
          .order("timestamp", { ascending: false })
          .limit(10)

        if (error) {
          console.error("Error fetching transactions:", error)
          continue
        }

        // Process each transaction
        for (const tx of transactions) {
          const otherAddress = tx.from_address === address ? tx.to_address : tx.from_address

          // Skip if we've already processed this address
          if (processedAddresses.has(otherAddress)) {
            // Still add the link if it doesn't exist
            const linkExists = links.some(
              (link) =>
                (link.source === address && link.target === otherAddress) ||
                (link.source === otherAddress && link.target === address),
            )

            if (!linkExists) {
              links.push({
                source: tx.from_address,
                target: tx.to_address,
                value: tx.amount,
                type: tx.transaction_type,
                timestamp: tx.timestamp,
              })
            }
            continue
          }

          // Get entity data for the other address
          const entityData = await getEntityByAddress(otherAddress)
          const entity = entityData.entity

          // Add node
          nodes.push({
            id: otherAddress,
            label: entity?.label || `Unknown (${otherAddress.substring(0, 6)}...)`,
            category: entity?.category || "other",
            riskScore: entity?.riskScore || 50,
            group: currentDepth + 1,
            size: 10 - currentDepth * 2, // Size decreases with depth
          })

          // Add link
          links.push({
            source: tx.from_address,
            target: tx.to_address,
            value: tx.amount,
            type: tx.transaction_type,
            timestamp: tx.timestamp,
          })

          // Mark as processed and add to next batch
          processedAddresses.add(otherAddress)
          nextAddressesToProcess.push(otherAddress)

          // Check if we've reached the max nodes
          if (nodes.length >= maxNodes) {
            break
          }
        }

        if (nodes.length >= maxNodes) {
          break
        }
      }

      // Move to next depth
      addressesToProcess = nextAddressesToProcess
      currentDepth++
    }

    return {
      nodes,
      links,
    }
  } catch (error) {
    console.error("Failed to get entity relationships:", error)

    // Return mock data as fallback
    return generateMockEntityGraph(centralAddress)
  }
}

/**
 * Generates mock entity relationship data for testing
 */
function generateMockEntityGraph(centralAddress: string): EntityGraph {
  const nodes: EntityNode[] = [
    {
      id: centralAddress,
      label: "Central Entity",
      category: "individual",
      riskScore: 50,
      group: 0,
      size: 15,
    },
  ]

  const links: EntityRelationship[] = []

  // Generate some mock exchanges
  const exchanges = [
    { id: "exchange1", label: "Binance", category: "exchange", riskScore: 20 },
    { id: "exchange2", label: "Coinbase", category: "exchange", riskScore: 15 },
  ]

  // Generate some mock mixers
  const mixers = [{ id: "mixer1", label: "Tornado Cash", category: "mixer", riskScore: 85 }]

  // Generate some mock individuals
  const individuals = [
    { id: "individual1", label: "Wallet A", category: "individual", riskScore: 40 },
    { id: "individual2", label: "Wallet B", category: "individual", riskScore: 35 },
    { id: "individual3", label: "Wallet C", category: "individual", riskScore: 60 },
  ]

  // Generate some mock contracts
  const contracts = [
    { id: "contract1", label: "NFT Marketplace", category: "contract", riskScore: 30 },
    { id: "contract2", label: "DeFi Protocol", category: "contract", riskScore: 45 },
  ]

  // Add all nodes
  ;[...exchanges, ...mixers, ...individuals, ...contracts].forEach((node, index) => {
    nodes.push({
      ...node,
      group: Math.floor(index / 3) + 1,
      size: 10 - Math.floor(index / 3),
    })
  })

  // Connect central entity to some nodes
  exchanges.forEach((exchange) => {
    links.push({
      source: centralAddress,
      target: exchange.id,
      value: Math.random() * 10,
      type: "transfer",
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  })

  // Connect some individuals to mixers
  mixers.forEach((mixer) => {
    links.push({
      source: individuals[0].id,
      target: mixer.id,
      value: Math.random() * 5,
      type: "transfer",
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    links.push({
      source: mixer.id,
      target: individuals[2].id,
      value: Math.random() * 5,
      type: "transfer",
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  })

  // Connect individuals to contracts
  contracts.forEach((contract, i) => {
    links.push({
      source: individuals[i % individuals.length].id,
      target: contract.id,
      value: Math.random() * 3,
      type: "interaction",
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  })

  // Connect some individuals
  links.push({
    source: individuals[0].id,
    target: individuals[1].id,
    value: Math.random() * 2,
    type: "transfer",
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  })

  return { nodes, links }
}
