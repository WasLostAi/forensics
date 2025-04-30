import type { EntityInfo } from "@/types/entity"

// Sample known entities database
// In a production environment, this would be stored in a database
export const KNOWN_ENTITIES: EntityInfo[] = [
  {
    address: "9epvFXmyphG2Vx3bQcKwhXaumSCQmcnUg1AKqrHxGTAD",
    name: "Binance",
    category: "exchange",
    riskLevel: "low",
    tags: ["cex", "major-exchange"],
    description: "Binance is one of the world's largest cryptocurrency exchanges.",
  },
  {
    address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5CE8nNkJgNG",
    name: "Solana Mixer",
    category: "mixer",
    riskLevel: "high",
    tags: ["privacy-tool", "mixer"],
    description: "A privacy tool used to obscure transaction trails.",
  },
  {
    address: "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH",
    name: "Phantom Wallet",
    category: "wallet",
    riskLevel: "low",
    tags: ["wallet", "popular"],
    description: "A popular Solana wallet provider.",
  },
  {
    address: "7YCnhkGzPFt7S4bHQXDfK8H3irvgQpZEZ1dzFYWR4fRe",
    name: "Scam Project",
    category: "scam",
    riskLevel: "high",
    tags: ["scam", "rugpull"],
    description: "Known scam project that conducted a rugpull.",
  },
  {
    address: "So11111111111111111111111111111111111111112",
    name: "Wrapped SOL",
    category: "token",
    riskLevel: "low",
    tags: ["token", "wrapped"],
    description: "Wrapped SOL token contract.",
  },
]

// Lookup an entity by address
export function lookupEntity(address: string): EntityInfo | null {
  return KNOWN_ENTITIES.find((entity) => entity.address === address) || null
}

// Search entities by name or tag
export function searchEntities(query: string): EntityInfo[] {
  const lowerQuery = query.toLowerCase()
  return KNOWN_ENTITIES.filter(
    (entity) =>
      entity.name.toLowerCase().includes(lowerQuery) ||
      entity.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

// Get entities by category
export function getEntitiesByCategory(category: string): EntityInfo[] {
  return KNOWN_ENTITIES.filter((entity) => entity.category === category)
}

// Get entities by risk level
export function getEntitiesByRiskLevel(riskLevel: string): EntityInfo[] {
  return KNOWN_ENTITIES.filter((entity) => entity.riskLevel === riskLevel)
}
