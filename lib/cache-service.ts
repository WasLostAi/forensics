// Simple in-memory cache service
// In a production app, you might want to use IndexedDB or another persistent storage

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number // Time in milliseconds when this entry expires
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

  // Get an item from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    // If entry doesn't exist or has expired, return null
    if (!entry || Date.now() > entry.expiry) {
      if (entry) {
        // Clean up expired entry
        this.cache.delete(key)
      }
      return null
    }

    return entry.data
  }

  // Set an item in cache
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now()
    const expiry = timestamp + ttl

    this.cache.set(key, {
      data,
      timestamp,
      expiry,
    })
  }

  // Remove an item from cache
  remove(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all items from cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache stats
  getStats() {
    const now = Date.now()
    let activeEntries = 0
    let expiredEntries = 0

    this.cache.forEach((entry) => {
      if (now > entry.expiry) {
        expiredEntries++
      } else {
        activeEntries++
      }
    })

    return {
      totalEntries: this.cache.size,
      activeEntries,
      expiredEntries,
    }
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now()
    let removedCount = 0

    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        this.cache.delete(key)
        removedCount++
      }
    })

    return removedCount
  }
}

// Create singleton instance
export const cacheService = new CacheService()

// Helper function to wrap API calls with caching
export async function cachedFetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
  // Try to get from cache first
  const cachedData = cacheService.get<T>(key)
  if (cachedData) {
    return cachedData
  }

  // If not in cache, fetch fresh data
  const data = await fetchFn()

  // Store in cache
  cacheService.set(key, data, ttl)

  return data
}
