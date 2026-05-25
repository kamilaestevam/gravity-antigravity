/**
 * Camada 2 Redis para cache do Dashboard Pedido (P1).
 * Degrada para L1-only quando REDIS_URL ausente — skill arquitetura/cache.
 */

import Redis from 'ioredis'

const TTL_SEC = 5 * 60

let _redis: Redis | null | undefined

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis
  const url = process.env.REDIS_URL?.trim()
  if (!url) {
    _redis = null
    return null
  }
  _redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  })
  _redis.on('error', (err) => {
    console.warn('[dashboard-redis-cache] redis erro', err.message)
  })
  return _redis
}

export async function redisGetDashboard<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    const raw = await redis.get(key)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    return null
  }
}

export async function redisSetDashboard(key: string, data: unknown): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.set(key, JSON.stringify(data), 'EX', TTL_SEC)
  } catch {
    // miss silencioso — L1 ainda protege instância local
  }
}

export async function redisInvalidateDashboardPrefix(prefix: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    let cursor = '0'
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 200)
      cursor = next
      if (keys.length > 0) await redis.unlink(...keys)
    } while (cursor !== '0')
  } catch {
    // invalidação best-effort
  }
}

/** Testes — reseta singleton. */
export function resetRedisDashboardForTests(): void {
  _redis = undefined
}
