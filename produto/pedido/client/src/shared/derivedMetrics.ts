/**
 * derivedMetrics.ts — Métricas derivadas por cruzamento de campos
 *
 * Cada métrica derivada é definida por:
 * - inputFields: campos do catálogo usados no cálculo
 * - operation: tipo de operação ('RATIO' | 'DIFF' | 'CUSTOM')
 * - formula: função pura que recebe os valores e retorna o resultado
 * - fieldType: como formatar o resultado
 *
 * Novas métricas podem ser adicionadas pelo usuário via configurador.
 */

export type DerivedOperation = 'RATIO' | 'DIFF' | 'CUSTOM'

export interface DerivedMetric {
  id: string
  label: string
  description: string
  inputFields: string[]
  operation: DerivedOperation
  formula: (values: Record<string, number>) => number | null
  fieldType: 'percentage' | 'currency' | 'number'
  /** Se true, foi criada pelo usuário (não é built-in) */
  userDefined?: boolean
}

// ── Métricas built-in derivadas do catálogo do Pedido ────────────────────────

export const BUILT_IN_DERIVED: DerivedMetric[] = [
  {
    id: 'taxa_atraso',
    label: 'Taxa de Atraso',
    description: 'Percentual de pedidos atrasados em relação ao total',
    inputFields: ['pedidos_atrasados', 'total_pedidos'],
    operation: 'RATIO',
    formula: ({ pedidos_atrasados, total_pedidos }) =>
      total_pedidos > 0 ? (pedidos_atrasados / total_pedidos) * 100 : null,
    fieldType: 'percentage',
  },
  {
    id: 'ticket_medio',
    label: 'Ticket Médio',
    description: 'Valor médio por pedido no período',
    inputFields: ['valor_total', 'total_pedidos'],
    operation: 'RATIO',
    formula: ({ valor_total, total_pedidos }) =>
      total_pedidos > 0 ? valor_total / total_pedidos : null,
    fieldType: 'currency',
  },
  {
    id: 'taxa_conclusao_itens',
    label: 'Conclusão de Itens',
    description: 'Percentual de itens prontos em relação à quantidade inicial',
    inputFields: ['itens_prontos', 'qtd_inicial_total'],
    operation: 'RATIO',
    formula: ({ itens_prontos, qtd_inicial_total }) =>
      qtd_inicial_total > 0 ? (itens_prontos / qtd_inicial_total) * 100 : null,
    fieldType: 'percentage',
  },
  {
    id: 'exposicao_financeira',
    label: 'Exposição Financeira',
    description: 'Percentual da cobertura pendente sobre o valor total',
    inputFields: ['cobertura_pendente', 'valor_total'],
    operation: 'RATIO',
    formula: ({ cobertura_pendente, valor_total }) =>
      valor_total > 0 ? (cobertura_pendente / valor_total) * 100 : null,
    fieldType: 'percentage',
  },
  {
    id: 'taxa_transferencia',
    label: 'Progresso de Transferência',
    description: 'Percentual da quantidade transferida em relação à inicial',
    inputFields: ['qtd_transferida_total', 'qtd_inicial_total'],
    operation: 'RATIO',
    formula: ({ qtd_transferida_total, qtd_inicial_total }) =>
      qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : null,
    fieldType: 'percentage',
  },
]

// ── Compute: aplica a fórmula dado um record de valores ──────────────────────

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

// ── Storage de métricas user-defined (localStorage) ──────────────────────────

const LS_KEY = 'gravity:pedido:derived_metrics'

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
