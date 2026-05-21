/**
 * derivedMetrics.ts — Métricas derivadas por cruzamento de campos para o BID Frete
 */

export type { DerivedOperation, DerivedMetric } from '@nucleo/dashboard'
import type { DerivedMetric } from '@nucleo/dashboard'

export const BUILT_IN_DERIVED: DerivedMetric[] = [
  {
    id: 'saving_medio_por_cotacao',
    label: 'Saving Médio por Cotação',
    description: 'Valor médio economizado por cotação finalizada no período',
    inputFields: ['saving_total', 'cotacoes_passadas'],
    operation: 'RATIO',
    formula: ({ saving_total, cotacoes_passadas }) =>
      cotacoes_passadas > 0 ? saving_total / cotacoes_passadas : null,
    fieldType: 'currency',
  },
  {
    id: 'taxa_conclusao_cotacoes',
    label: 'Taxa de Conclusão de Cotações',
    description: 'Percentual de cotações passadas em relação ao total (andamento + passadas)',
    inputFields: ['cotacoes_passadas', 'cotacoes_andamento'],
    operation: 'CUSTOM',
    formula: ({ cotacoes_passadas, cotacoes_andamento }) => {
      const total = cotacoes_passadas + cotacoes_andamento
      return total > 0 ? (cotacoes_passadas / total) * 100 : null
    },
    fieldType: 'percentage',
  },
  {
    id: 'ticket_medio_aprovado',
    label: 'Ticket Médio Aprovado',
    description: 'Valor médio das propostas aprovadas',
    inputFields: ['valor_aprovado_usd', 'cotacoes_passadas'],
    operation: 'RATIO',
    formula: ({ valor_aprovado_usd, cotacoes_passadas }) =>
      cotacoes_passadas > 0 ? valor_aprovado_usd / cotacoes_passadas : null,
    fieldType: 'currency',
  },
]

export function computeDerived(
  metric: DerivedMetric,
  values: Record<string, number>,
): number | null {
  try {
    return metric.formula(values)
  } catch {
    return null
  }
}

const LS_KEY = 'gravity:bid-frete-internacional:derived_metrics'

export function loadUserDerivedMetrics(): DerivedMetric[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as DerivedMetric[]
  } catch {
    return []
  }
}

export function saveUserDerivedMetrics(metrics: DerivedMetric[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(metrics))
}

export function getAllDerivedMetrics(): DerivedMetric[] {
  return [...BUILT_IN_DERIVED, ...loadUserDerivedMetrics()]
}
