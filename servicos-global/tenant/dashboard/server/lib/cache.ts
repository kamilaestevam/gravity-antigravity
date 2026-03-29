import { MetricaSnapshot } from '@prisma/client';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_MAX_SIZE = 1000;
const cache = new Map<string, CacheEntry>();

/** Remove all expired entries from the cache */
function evictExpired(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp >= CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/** If cache exceeds max size, evict oldest entries until within limit */
function evictOldest(): void {
  if (cache.size <= CACHE_MAX_SIZE) return;

  // Map preserves insertion order; delete from the front (oldest)
  const excess = cache.size - CACHE_MAX_SIZE;
  let deleted = 0;
  for (const key of cache.keys()) {
    if (deleted >= excess) break;
    cache.delete(key);
    deleted++;
  }
}

export function getCachedKpis(tenantId: string, productId?: string): any | null {
  evictExpired();

  const key = `${tenantId}:${productId || 'global'}`;
  const entry = cache.get(key);

  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }

  // Entry exists but is expired — clean it up
  if (entry) {
    cache.delete(key);
  }

  return null;
}

export function setCachedKpis(tenantId: string, productId: string | undefined, data: any): void {
  evictExpired();

  const key = `${tenantId}:${productId || 'global'}`;
  cache.set(key, {
    data,
    timestamp: Date.now()
  });

  evictOldest();
}
