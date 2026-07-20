/**
 * cache-dashboard-estimativa-custo.ts — Cache em memória dos KPIs do Dashboard.
 * TTL: 5 minutos. Invalidado em toda mutação de EstimativaCusto.
 */

export interface KpisDashboardEstimativaCusto {
  total_estimativas: number
  em_criacao: number
  criadas: number
  arquivadas: number
  custo_nacionalizado_medio_brl: number | null
  custo_nacionalizado_maior_brl: number | null
  custo_nacionalizado_menor_brl: number | null
  total_tributos_acumulado_brl: number | null
}

export interface EstimativaCustoRecente {
  id_estimativa_custo: string
  numero_estimativa_custo: string
  ncm_estimativa_custo: string
  status_estimativa_custo: string
  valor_produto_estimativa_custo: number | null
  moeda_produto_estimativa_custo: string
  custo_nacionalizado_brl_estimativa_custo: number | null
  data_criacao_estimativa_custo: string
}

interface EntradaCache<T> {
  dados: T
  timestamp: number
}

const CACHE_TTL_MS = 5 * 60 * 1000
const cacheKpis = new Map<string, EntradaCache<KpisDashboardEstimativaCusto>>()
const cacheRecentes = new Map<string, EntradaCache<EstimativaCustoRecente[]>>()

export function obterKpisCache(tenantId: string): KpisDashboardEstimativaCusto | null {
  const entrada = cacheKpis.get(tenantId)
  if (entrada && Date.now() - entrada.timestamp < CACHE_TTL_MS) return entrada.dados
  return null
}

export function gravarKpisCache(tenantId: string, dados: KpisDashboardEstimativaCusto): void {
  cacheKpis.set(tenantId, { dados, timestamp: Date.now() })
}

export function obterRecentesCache(tenantId: string): EstimativaCustoRecente[] | null {
  const entrada = cacheRecentes.get(tenantId)
  if (entrada && Date.now() - entrada.timestamp < CACHE_TTL_MS) return entrada.dados
  return null
}

export function gravarRecentesCache(tenantId: string, dados: EstimativaCustoRecente[]): void {
  cacheRecentes.set(tenantId, { dados, timestamp: Date.now() })
}

export function invalidarCacheDashboardEstimativaCusto(tenantId: string): void {
  cacheKpis.delete(tenantId)
  cacheRecentes.delete(tenantId)
}
