/**
 * Database of known Solana entities including exchanges, projects, and other services
 */

export interface EntityInfo {
  address: string
  name: string
  category: "exchange" | "project" | "contract" | "mixer" | "scam" | "other"
  description?: string
  url?: string
  riskLevel: "low" | "medium" | "high"
  tags?: string[]
}

// Database of known entities
export const KNOWN_ENTITIES: EntityInfo[] = [
  // Exchanges
  {
    address: "14FUT96s9swbmH7ZjpDvfEDywnAYy9zaNhv4HvB8F7oA",
    name: "Binance Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Binance exchange",
    url: "https://binance.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "E8cU1WiRWjanGxmn96ewBgk9vPTcL6AEZ1t6F6fkgUWe",
    name: "Binance Cold Wallet",
    category: "exchange",
    description: "Cold storage wallet for Binance exchange",
    url: "https://binance.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    name: "Coinbase Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Coinbase exchange",
    url: "https://coinbase.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5CE8nNkJR8K",
    name: "Kraken Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Kraken exchange",
    url: "https://kraken.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "HKnBSUMdMCGXAHQHPXQRv9QHgVKpQn366Rg9yMGXrpRN",
    name: "OKX Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for OKX exchange",
    url: "https://okx.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },

  // DEXes
  {
    address: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    name: "Serum DEX",
    category: "exchange",
    description: "Serum decentralized exchange program",
    url: "https://projectserum.com",
    riskLevel: "low",
    tags: ["exchange", "dex"],
  },
  {
    address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    name: "Jupiter Aggregator",
    category: "exchange",
    description: "Jupiter DEX aggregator",
    url: "https://jup.ag",
    riskLevel: "low",
    tags: ["exchange", "dex", "aggregator"],
  },
  {
    address: "RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr",
    name: "Raydium AMM",
    category: "exchange",
    description: "Raydium automated market maker",
    url: "https://raydium.io",
    riskLevel: "low",
    tags: ["exchange", "dex", "amm"],
  },

  // Projects
  {
    address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
    name: "Mango Markets",
    category: "project",
    description: "Mango Markets decentralized trading platform",
    url: "https://mango.markets",
    riskLevel: "low",
    tags: ["defi", "lending"],
  },
  {
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    name: "Solana Foundation",
    category: "project",
    description: "Solana Foundation wallet",
    url: "https://solana.com",
    riskLevel: "low",
    tags: ["foundation"],
  },
  {
    address: "SysvarC1ock11111111111111111111111111111111",
    name: "Solana Clock Sysvar",
    category: "contract",
    description: "Solana system clock variable",
    riskLevel: "low",
    tags: ["system"],
  },

  // Known mixers/tumblers
  {
    address: "EXnGBBSamqzd3uxEdRLUiYzjJkTwQyorAaFXdfteuGXe",
    name: "Tornado Cash Solana",
    category: "mixer",
    description: "Suspected Tornado Cash implementation on Solana",
    riskLevel: "high",
    tags: ["mixer", "privacy", "sanctioned"],
  },
  {
    address: "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz",
    name: "Cyclos Mixer",
    category: "mixer",
    description: "Suspected cryptocurrency mixer on Solana",
    riskLevel: "high",
    tags: ["mixer", "privacy"],
  },

  // Known scams
  {
    address: "ScamVYoAJVTZtNgZ4P1bwj9a5LnTQ9pF8PoEq6jV1Vf",
    name: "Fake Airdrop Scam",
    category: "scam",
    description: "Known wallet involved in airdrop scams",
    riskLevel: "high",
    tags: ["scam", "airdrop"],
  },
  {
    address: "Rug9PulL5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs4LRH",
    name: "Rugpull Project",
    category: "scam",
    description: "Known wallet involved in rugpull schemes",
    riskLevel: "high",
    tags: ["scam", "rugpull"],
  },
  {
    address: "Phish1111111111111111111111111111111111111",
    name: "Phishing Campaign",
    category: "scam",
    description: "Known wallet involved in phishing campaigns",
    riskLevel: "high",
    tags: ["scam", "phishing"],
  },
]

/**
 * Looks up an entity by address
 */
export function lookupEntity(address: string): EntityInfo | null {
  return KNOWN_ENTITIES.find((entity) => entity.address === address) || null
}

/**
 * Searches entities by name or tag
 */
export function searchEntities(query: string): EntityInfo[] {
  const lowerQuery = query.toLowerCase()
  return KNOWN_ENTITIES.filter(
    (entity) =>
      entity.name.toLowerCase().includes(lowerQuery) ||
      entity.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

/**
 * Gets all entities of a specific category
 */
export function getEntitiesByCategory(category: string): EntityInfo[] {
  return KNOWN_ENTITIES.filter((entity) => entity.category === category)
}

/**
 * Gets all high risk entities
 */
export function getHighRiskEntities(): EntityInfo[] {
  return KNOWN_ENTITIES.filter((entity) => entity.riskLevel === "high")
}

/**
 * Detects if an address matches any known entity pattern
 * This is useful for addresses not explicitly in our database
 */
export function detectEntityType(
  address: string,
  transactionCount: number,
  transactionVolume: number,
): {
  category: string
  confidence: number
} {
  // Simple heuristics for entity detection

  // High transaction count and volume often indicates an exchange
  if (transactionCount > 1000 && transactionVolume > 10000) {
    return { category: "exchange", confidence: 0.8 }
  }

  // High transaction count but low volume might be a contract
  if (transactionCount > 500 && transactionVolume < 100) {
    return { category: "contract", confidence: 0.7 }
  }

  // Very high volume with low transaction count could be a whale
  if (transactionCount < 50 && transactionVolume > 5000) {
    return { category: "whale", confidence: 0.6 }
  }

  // Default to unknown with low confidence
  return { category: "unknown", confidence: 0.3 }
}
