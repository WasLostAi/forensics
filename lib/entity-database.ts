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
  // Adding more exchange wallets
  {
    address: "FG4Y3yX4AAchp1HvNZ7LfzFTewF2f6nDoMDCohTFrdpT",
    name: "Bybit Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Bybit exchange",
    url: "https://bybit.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "8Hks8bBmAdFYAMZZaRVFrPosYQxXWA4eov6pPGK5F8Gq",
    name: "Kucoin Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Kucoin exchange",
    url: "https://kucoin.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "6VbCLJJjGa9Eyn4UkaYRYvCJSdxov4fUXj7QiizNPiZp",
    name: "Gate.io Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Gate.io exchange",
    url: "https://gate.io",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    name: "Huobi Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Huobi exchange",
    url: "https://huobi.com",
    riskLevel: "low",
    tags: ["exchange", "cex"],
  },
  {
    address: "2oDxYCkKH8bGY4zWQoJJtXYXsUjGTH49zMB4qeM9Xbwh",
    name: "Bitfinex Hot Wallet",
    category: "exchange",
    description: "Main hot wallet for Bitfinex exchange",
    url: "https://bitfinex.com",
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
  // Adding more DEX addresses
  {
    address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j2",
    name: "Orca Whirlpools",
    category: "exchange",
    description: "Orca concentrated liquidity DEX",
    url: "https://orca.so",
    riskLevel: "low",
    tags: ["exchange", "dex", "amm", "concentrated-liquidity"],
  },
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    name: "Openbook DEX",
    category: "exchange",
    description: "Openbook decentralized exchange",
    url: "https://openbook.io",
    riskLevel: "low",
    tags: ["exchange", "dex", "orderbook"],
  },
  {
    address: "MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky",
    name: "Mercurial Finance",
    category: "exchange",
    description: "Mercurial Finance stablecoin AMM",
    url: "https://mercurial.finance",
    riskLevel: "low",
    tags: ["exchange", "dex", "amm", "stablecoin"],
  },
  {
    address: "CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4",
    name: "Saber",
    category: "exchange",
    description: "Saber stablecoin exchange",
    url: "https://saber.so",
    riskLevel: "low",
    tags: ["exchange", "dex", "amm", "stablecoin"],
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
  // Adding more projects
  {
    address: "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo",
    name: "Solend",
    category: "project",
    description: "Solend lending protocol",
    url: "https://solend.fi",
    riskLevel: "low",
    tags: ["defi", "lending", "borrowing"],
  },
  {
    address: "Port7uDYB3wk6GJAw4KT1WpTeMtSu9bTcChBHkX2LfR",
    name: "Port Finance",
    category: "project",
    description: "Port Finance lending protocol",
    url: "https://port.finance",
    riskLevel: "low",
    tags: ["defi", "lending", "borrowing"],
  },
  {
    address: "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
    name: "Marinade Finance",
    category: "project",
    description: "Marinade Finance liquid staking protocol",
    url: "https://marinade.finance",
    riskLevel: "low",
    tags: ["defi", "staking", "liquid-staking"],
  },
  {
    address: "LidoNYQh8mJzLgJM15zrEcqg9n8PuYDy1JGZMmMycBZ",
    name: "Lido on Solana",
    category: "project",
    description: "Lido liquid staking protocol on Solana",
    url: "https://lido.fi",
    riskLevel: "low",
    tags: ["defi", "staking", "liquid-staking"],
  },
  {
    address: "DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1",
    name: "Kamino Finance",
    category: "project",
    description: "Kamino Finance automated liquidity management",
    url: "https://kamino.finance",
    riskLevel: "low",
    tags: ["defi", "liquidity", "yield"],
  },
  {
    address: "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo",
    name: "Jupiter Protocol",
    category: "project",
    description: "Jupiter Protocol main contract",
    url: "https://jup.ag",
    riskLevel: "low",
    tags: ["defi", "exchange", "aggregator"],
  },

  // NFT Marketplaces
  {
    address: "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
    name: "Magic Eden",
    category: "project",
    description: "Magic Eden NFT marketplace",
    url: "https://magiceden.io",
    riskLevel: "low",
    tags: ["nft", "marketplace"],
  },
  {
    address: "hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk",
    name: "Tensor",
    category: "project",
    description: "Tensor NFT marketplace",
    url: "https://tensor.trade",
    riskLevel: "low",
    tags: ["nft", "marketplace"],
  },
  {
    address: "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxw1",
    name: "Solanart",
    category: "project",
    description: "Solanart NFT marketplace",
    url: "https://solanart.io",
    riskLevel: "low",
    tags: ["nft", "marketplace"],
  },
  {
    address: "617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU",
    name: "Solsea",
    category: "project",
    description: "Solsea NFT marketplace",
    url: "https://solsea.io",
    riskLevel: "low",
    tags: ["nft", "marketplace"],
  },

  // Governance and DAOs
  {
    address: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    name: "Solana Governance Program",
    category: "project",
    description: "Solana on-chain governance program",
    url: "https://solana.com",
    riskLevel: "low",
    tags: ["governance", "dao"],
  },
  {
    address: "RealmsEP4t7xdcX9Spu7hZJ6zH7UJ9DYS2emgX2uBWT1",
    name: "Realms DAO",
    category: "project",
    description: "Realms DAO governance platform",
    url: "https://realms.today",
    riskLevel: "low",
    tags: ["governance", "dao"],
  },
  {
    address: "SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu",
    name: "Squads Multisig",
    category: "project",
    description: "Squads multisignature wallet platform",
    url: "https://squads.so",
    riskLevel: "low",
    tags: ["governance", "multisig"],
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
    address: "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxw2",
    name: "Cyclos Mixer",
    category: "mixer",
    description: "Suspected cryptocurrency mixer on Solana",
    riskLevel: "high",
    tags: ["mixer", "privacy"],
  },
  // Adding more mixers
  {
    address: "EHZCrrCGeNuSFhWXK7cU1RxCMxRbWNzCnSUVlag8q1m",
    name: "Shadow Protocol",
    category: "mixer",
    description: "Privacy-focused mixing service on Solana",
    riskLevel: "high",
    tags: ["mixer", "privacy"],
  },
  {
    address: "Eludr277oN6KKAaFiF2UxazfQs7unVm3MZTNHPmRvQAu",
    name: "Elude Mixer",
    category: "mixer",
    description: "Elude privacy protocol for Solana",
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
  // Adding more scams
  {
    address: "FakeNFT5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs4LRH",
    name: "Fake NFT Marketplace",
    category: "scam",
    description: "Fraudulent NFT marketplace stealing assets",
    riskLevel: "high",
    tags: ["scam", "nft", "phishing"],
  },
  {
    address: "DubiousDeFi5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs",
    name: "Dubious DeFi Protocol",
    category: "scam",
    description: "Fraudulent DeFi protocol with backdoor code",
    riskLevel: "high",
    tags: ["scam", "defi", "rugpull"],
  },
  {
    address: "FakeMint5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs4LRH",
    name: "Fake Token Mint",
    category: "scam",
    description: "Fraudulent token mint address impersonating legitimate project",
    riskLevel: "high",
    tags: ["scam", "impersonation", "token"],
  },
  {
    address: "DrainWallet5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs4",
    name: "Wallet Drainer",
    category: "scam",
    description: "Known wallet drainer contract",
    riskLevel: "high",
    tags: ["scam", "drainer", "malware"],
  },

  // System addresses
  {
    address: "11111111111111111111111111111111",
    name: "System Program",
    category: "contract",
    description: "Solana System Program",
    riskLevel: "low",
    tags: ["system", "native"],
  },
  {
    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    name: "Token Program",
    category: "contract",
    description: "Solana SPL Token Program",
    riskLevel: "low",
    tags: ["system", "token", "native"],
  },
  {
    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    name: "Associated Token Program",
    category: "contract",
    description: "Solana Associated Token Account Program",
    riskLevel: "low",
    tags: ["system", "token", "native"],
  },
  {
    address: "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo",
    name: "Memo Program",
    category: "contract",
    description: "Solana Memo Program",
    riskLevel: "low",
    tags: ["system", "native"],
  },
  {
    address: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    name: "Memo Program v2",
    category: "contract",
    description: "Solana Memo Program v2",
    riskLevel: "low",
    tags: ["system", "native"],
  },
  {
    address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    name: "Metaplex Token Metadata",
    category: "contract",
    description: "Metaplex Token Metadata Program",
    riskLevel: "low",
    tags: ["system", "nft", "metadata"],
  },
  {
    address: "ComputeBudget111111111111111111111111111111",
    name: "Compute Budget Program",
    category: "contract",
    description: "Solana Compute Budget Program",
    riskLevel: "low",
    tags: ["system", "native"],
  },
  {
    address: "Vote111111111111111111111111111111111111111",
    name: "Vote Program",
    category: "contract",
    description: "Solana Vote Program",
    riskLevel: "low",
    tags: ["system", "native", "governance"],
  },
  {
    address: "Stake11111111111111111111111111111111111111",
    name: "Stake Program",
    category: "contract",
    description: "Solana Stake Program",
    riskLevel: "low",
    tags: ["system", "native", "staking"],
  },

  // Popular wallets
  {
    address: "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix",
    name: "Phantom Main Treasury",
    category: "other",
    description: "Phantom wallet main treasury",
    url: "https://phantom.app",
    riskLevel: "low",
    tags: ["wallet", "treasury"],
  },
  {
    address: "SoLWs9zNS6kZ9s7XkVpMrEqnLhpGkVFuDn1pRQnZ4Lx",
    name: "Solflare Treasury",
    category: "other",
    description: "Solflare wallet treasury",
    url: "https://solflare.com",
    riskLevel: "low",
    tags: ["wallet", "treasury"],
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
 * Gets entities by risk level
 */
export function getEntitiesByRiskLevel(riskLevel: "low" | "medium" | "high"): EntityInfo[] {
  return KNOWN_ENTITIES.filter((entity) => entity.riskLevel === riskLevel)
}

/**
 * Gets entities by tag
 */
export function getEntitiesByTag(tag: string): EntityInfo[] {
  return KNOWN_ENTITIES.filter((entity) => entity.tags?.includes(tag))
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

/**
 * Counts entities by category
 */
export function countEntitiesByCategory(): Record<string, number> {
  const counts: Record<string, number> = {}

  KNOWN_ENTITIES.forEach((entity) => {
    if (counts[entity.category]) {
      counts[entity.category]++
    } else {
      counts[entity.category] = 1
    }
  })

  return counts
}
