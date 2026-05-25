/**
 * Cache L1 (memória) + L2 (Redis) para agregações do Dashboard Pedido.
 * Chaves com prefixo `organizacao:` — REGRA 4 lint tenant-safety.
 */

import type { AggregatedKpis } from './dashboard-kpis-aggregate.js'
import {
  redisGetDashboard,
  redisInvalidateDashboardPrefix,
  redisSetDashboard,
} from './dashboard-redis-cache.js'

export interface DashboardTrendBucket {
  month: string
  label: string
  total_pedidos: number
  valor_total: number
  cobertura_pendente: number
  valor_itens_total: number
}

export interface DashboardBundlePayload {
  period: string
  kpis: AggregatedKpis
  prev_kpis: AggregatedKpis | null
  trend: {
    period: string
    granularity: string
    value: DashboardTrendBucket[]
  }
  cached: boolean
  computed_at: string
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const TTL_MS = 5 * 60 * 1000
const MAX_ENTRIES = 500
const bundleCache = new Map<string, CacheEntry<DashboardBundlePayload>>()
const kpisCache = new Map<string, CacheEntry<AggregatedKpis>>()

function evictExpired<T>(store: Map<string, CacheEntry<T>>): void {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now >= entry.expiresAt) store.delete(key)
  }
}

function evictOldestIfNeeded<T>(store: Map<string, CacheEntry<T>>): void {
  if (store.size <= MAX_ENTRIES) return
  const excess = store.size - MAX_ENTRIES
  let removed = 0
  for (const key of store.keys()) {
    if (removed >= excess) break
    store.delete(key)
    removed++
  }
}

export function hashEscopoDashboard(req: {
  query: Record<string, unknown>
  headers: Record<string, string | string[] | undefined>
}): string {
  const raw = req.query.ids_workspaces as string | undefined
  if (raw?.trim()) {
    return raw.split(',').map(s => s.trim()).filter(Boolean).sort().join(',')
  }
  const header = req.headers['x-id-workspace']
  const ws = Array.isArray(header) ? header[0] : header
  return ws?.trim() ? `h:${ws.trim()}` : 'org'
}

export function chaveCacheDashboardKpis(
  idOrganizacao: string,
  escopoHash: string,
  period: string,
  sufixo = 'atual',
): string {
  return `organizacao:${idOrganizacao}:pedido:dashboard:kpis:${escopoHash}:${period}:${sufixo}`
}

export function chaveCacheDashboardBundle(
  idOrganizacao: string,
  escopoHash: string,
  period: string,
): string {
  return `organizacao:${idOrganizacao}:pedido:dashboard:bundle:${escopoHash}:${period}`
}

export async function getCachedDashboardKpis(key: string): Promise<AggregatedKpis | null> {
  evictExpired(kpisCache)
  const l1 = kpisCache.get(key)
  if (l1 && Date.now() < l1.expiresAt) return l1.data
  if (l1) kpisCache.delete(key)

  const l2 = await redisGetDashboard<AggregatedKpis>(key)
  if (l2) {
    kpisCache.set(key, { data: l2, expiresAt: Date.now() + TTL_MS })
    return l2
  }
  return null
}

export async function setCachedDashboardKpis(key: string, data: AggregatedKpis): Promise<void> {
  evictExpired(kpisCache)
  kpisCache.set(key, { data, expiresAt: Date.now() + TTL_MS })
  evictOldestIfNeeded(kpisCache)
  await redisSetDashboard(key, data)
}

export async function getCachedDashboardBundle(key: string): Promise<DashboardBundlePayload | null> {
  evictExpired(bundleCache)
  const l1 = bundleCache.get(key)
  if (l1 && Date.now() < l1.expiresAt) return { ...l1.data, cached: true }
  if (l1) bundleCache.delete(key)

  const l2 = await redisGetDashboard<DashboardBundlePayload>(key)
  if (l2) {
    bundleCache.set(key, { data: { ...l2, cached: false }, expiresAt: Date.now() + TTL_MS })
    return { ...l2, cached: true }
  }
  return null
}

export async function setCachedDashboardBundle(key: string, data: DashboardBundlePayload): Promise<void> {
  evictExpired(bundleCache)
  const payload = { ...data, cached: false }
  bundleCache.set(key, { data: payload, expiresAt: Date.now() + TTL_MS })
  evictOldestIfNeeded(bundleCache)
  await redisSetDashboard(key, payload)
}

export async function invalidateDashboardCachePedido(idOrganizacao: string): Promise<void> {
  const prefix = `organizacao:${idOrganizacao}:pedido:dashboard:`
  for (const key of bundleCache.keys()) {
    if (key.startsWith(prefix)) bundleCache.delete(key)
  }
  for (const key of kpisCache.keys()) {
    if (key.startsWith(prefix)) kpisCache.delete(key)
  }
  await redisInvalidateDashboardPrefix(prefix)
}

export function resetDashboardCachePedidoForTests(): void {
  bundleCache.clear()
  kpisCache.clear()
}
