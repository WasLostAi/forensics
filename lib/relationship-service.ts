import type { WalletNode, WalletLink } from "@/components/wallet-relationship-graph"
import { getEntityLabel } from "@/lib/entity-service"
import { calculateWalletRiskScore } from "@/lib/risk-scoring-service"

export async function getWalletRelationships(
  address: string,
  depth = 1,
): Promise<{
  nodes: WalletNode[]
  links: WalletLink[]
}> {
  try {
    // In a real implementation, this would fetch data from a database or blockchain
    // For now, we'll generate mock data based on the address

    // Start with the center wallet
    const centerWallet: WalletNode = {
      id: address,
      address: address,
      label: (await getEntityLabel(address)) || undefined,
      type: "ico",
      balance: 1000 + Math.random() * 5000,
      riskScore: await calculateWalletRiskScore(address),
      transactionCount: 120 + Math.floor(Math.random() * 200),
    }

    const nodes: WalletNode[] = [centerWallet]
    const links: WalletLink[] = []

    // Generate connected wallets
    const connectedWalletCount = 10 + Math.floor(Math.random() * 15)
    const walletTypes: Array<"investor" | "team" | "exchange" | "unknown" | "suspicious"> = [
      "investor",
      "investor",
      "investor",
      "team",
      "team",
      "exchange",
      "unknown",
      "suspicious",
    ]

    for (let i = 0; i < connectedWalletCount; i++) {
      // Generate a random wallet address
      const connectedAddress = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      // Determine wallet type
      const walletType = walletTypes[Math.floor(Math.random() * walletTypes.length)]

      // Create node
      const node: WalletNode = {
        id: connectedAddress,
        address: connectedAddress,
        label: Math.random() > 0.7 ? `Wallet ${i + 1}` : undefined,
        type: walletType,
        balance: 100 + Math.random() * 2000,
        riskScore: walletType === "suspicious" ? 75 + Math.random() * 25 : Math.random() * 60,
        transactionCount: 10 + Math.floor(Math.random() * 100),
      }

      nodes.push(node)

      // Create link
      const linkType: "funding" | "withdrawal" | "transfer" | "contract" | "other" = [
        "funding",
        "withdrawal",
        "transfer",
        "contract",
        "other",
      ][Math.floor(Math.random() * 5)]

      const link: WalletLink = {
        source: Math.random() > 0.5 ? address : connectedAddress,
        target: Math.random() > 0.5 ? address : connectedAddress,
        type: linkType,
        value: 10 + Math.random() * 500,
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random time in the last 30 days
        count: 1 + Math.floor(Math.random() * 20),
      }

      // Ensure we don't have self-links
      if (link.source === link.target) {
        link.target = link.source === address ? connectedAddress : address
      }

      links.push(link)

      // If depth > 1, add connections between non-center wallets
      if (depth > 1 && i > 0 && Math.random() > 0.7) {
        const otherWalletIndex = Math.floor(Math.random() * i)
        const otherWalletId = nodes[otherWalletIndex + 1].id

        const secondaryLink: WalletLink = {
          source: connectedAddress,
          target: otherWalletId,
          type: ["funding", "transfer", "other"][Math.floor(Math.random() * 3)],
          value: 5 + Math.random() * 100,
          timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          count: 1 + Math.floor(Math.random() * 5),
        }

        links.push(secondaryLink)
      }
    }

    return { nodes, links }
  } catch (error) {
    console.error("Error fetching wallet relationships:", error)
    return { nodes: [], links: [] }
  }
}

export async function getICORelationships(icoAddress: string): Promise<{
  nodes: WalletNode[]
  links: WalletLink[]
}> {
  // For ICOs, we might want to show more specific relationship types
  return getWalletRelationships(icoAddress, 2)
}
