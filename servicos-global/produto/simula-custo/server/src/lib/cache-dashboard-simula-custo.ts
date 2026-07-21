/**
 * cache-dashboard-simula-custo.ts — Cache em memória dos KPIs do Dashboard.
 * TTL: 5 minutos. Invalidado em toda mutação de SimulaCusto.
 */

export interface KpisDashboardSimulaCusto {
  total_simulas: number
  em_criacao: number
  criadas: number
  arquivadas: number
  custo_nacionalizado_medio_brl: number | null
  custo_nacionalizado_maior_brl: number | null
  custo_nacionalizado_menor_brl: number | null
  total_tributos_acumulado_brl: number | null
}

export interface SimulaCustoRecente {
  id_simula_custo: string
  numero_simula_custo: string
  ncm_simula_custo: string
  status_simula_custo: string
  valor_produto_simula_custo: number | null
  moeda_produto_simula_custo: string
  custo_nacionalizado_brl_simula_custo: number | null
  data_criacao_simula_custo: string
}

interface EntradaCache<T> {
  dados: T
  timestamp: number
}

const CACHE_TTL_MS = 5 * 60 * 1000
const cacheKpis = new Map<string, EntradaCache<KpisDashboardSimulaCusto>>()
const cacheRecentes = new Map<string, EntradaCache<SimulaCustoRecente[]>>()

export function obterKpisCache(tenantId: string): KpisDashboardSimulaCusto | null {
  const entrada = cacheKpis.get(tenantId)
  if (entrada && Date.now() - entrada.timestamp < CACHE_TTL_MS) return entrada.dados
  return null
}

export function gravarKpisCache(tenantId: string, dados: KpisDashboardSimulaCusto): void {
  cacheKpis.set(tenantId, { dados, timestamp: Date.now() })
}

export function obterRecentesCache(tenantId: string): SimulaCustoRecente[] | null {
  const entrada = cacheRecentes.get(tenantId)
  if (entrada && Date.now() - entrada.timestamp < CACHE_TTL_MS) return entrada.dados
  return null
}

export function gravarRecentesCache(tenantId: string, dados: SimulaCustoRecente[]): void {
  cacheRecentes.set(tenantId, { dados, timestamp: Date.now() })
}

export function invalidarCacheDashboardSimulaCusto(tenantId: string): void {
  cacheKpis.delete(tenantId)
  cacheRecentes.delete(tenantId)
}
