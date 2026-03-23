import { MetricaSnapshot } from '@prisma/client';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map<string, CacheEntry>();

export function getCachedKpis(tenantId: string, productId?: string): any | null {
  const key = `${tenantId}:${productId || 'global'}`;
  const entry = cache.get(key);

  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }

  return null;
}

export function setCachedKpis(tenantId: string, productId: string | undefined, data: any): void {
  const key = `${tenantId}:${productId || 'global'}`;
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
