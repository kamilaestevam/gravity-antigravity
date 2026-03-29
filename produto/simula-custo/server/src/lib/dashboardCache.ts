/**
 * dashboardCache.ts — Cache em memória para KPIs do Dashboard SimulaCusto
 * Adaptado do padrão: servicos-global/tenant/dashboard/server/lib/cache.ts
 * TTL: 5 minutos (sincronizado com Journey)
 */

export interface DashboardKPIs {
  totalSimulacoes: number
  finalizadas: number
  rascunhos: number
  mediaLandedCostBrl: number | null
  maiorLandedCostBrl: number | null
  menorLandedCostBrl: number | null
  totalCifUsd: number | null
  viavel: number
  atencao: number
  inviavel: number
}

export interface SimulacaoRecente {
  id: string
  ncm: string
  pais_origem: string
  valor_fob_usd: number | null  // valor_produto convertido
  landed_cost_brl: number
  status: string
  data_simulacao: string
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutos
const kpisCache = new Map<string, CacheEntry<DashboardKPIs>>()
const recentesCache = new Map<string, CacheEntry<SimulacaoRecente[]>>()

export function getCachedKPIs(tenantId: string): DashboardKPIs | null {
  const entry = kpisCache.get(tenantId)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data
  return null
}

export function setCachedKPIs(tenantId: string, data: DashboardKPIs): void {
  kpisCache.set(tenantId, { data, timestamp: Date.now() })
}

export function getCachedRecentes(tenantId: string): SimulacaoRecente[] | null {
  const entry = recentesCache.get(tenantId)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data
  return null
}

export function setCachedRecentes(tenantId: string, data: SimulacaoRecente[]): void {
  recentesCache.set(tenantId, { data, timestamp: Date.now() })
}

export function invalidateDashboardCache(tenantId: string): void {
  kpisCache.delete(tenantId)
  recentesCache.delete(tenantId)
}
