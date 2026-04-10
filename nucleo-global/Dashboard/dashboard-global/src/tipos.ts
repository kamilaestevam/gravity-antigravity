/**
 * @nucleo/dashboard — tipos compartilhados
 * Definições de tipos para todos os componentes do Dashboard BI.
 * Sem estado de servidor. Sem API calls.
 *
 * v2 — 2026-04-03
 * - FieldQuerySpec: operação por campo (substituiu string[] em WidgetQuerySpec)
 * - WidgetSeriesPoint: dados multi-série para LINE/AREA/BAR
 * - WidgetDistributionSlice: dados para DISTRIBUTION widget
 * - DISTRIBUTION adicionado em ChartType
 */

export type ChartType =
  | 'KPI_CARD'
  | 'LINE'
  | 'AREA'
  | 'BAR'
  | 'BAR_HORIZONTAL'
  | 'DONUT'
  | 'DISTRIBUTION'
  | 'HISTOGRAM'
  | 'FUNNEL'
  | 'GAUGE'
  | 'MAP'
  | 'TABLE'
  | 'SECTION_LABEL'
  | 'GABI_INSIGHTS'

// ── Tipos de unidade ──────────────────────────────────────────────────────────

export type FieldUnitType = 'number' | 'currency' | 'percentage'

// ── Spec de campo individual (substitui string em fields[]) ──────────────────

export interface FieldQuerySpec {
  key: string        // chave do campo no catálogo
  operation: string  // operação deste campo: SUM, COUNT, AVG, MIN, MAX
}

// ── Dados multi-série (LINE / AREA / BAR) ────────────────────────────────────

/**
 * Ponto de uma série temporal multi-campo.
 * Cada entrada tem um eixo X (month) e N valores, um por campo selecionado.
 * Ex: { month: '2026-01', total_pedidos: 142, pedidos_atrasados: 18 }
 */
export interface WidgetSeriesPoint {
  month: string
  [fieldKey: string]: number | string
}

// ── Fatia de distribuição (DISTRIBUTION) ─────────────────────────────────────

export interface WidgetDistributionSlice {
  key: string
  label: string
  value: number
  unit: FieldUnitType
}

// ── Valores legados (compatibilidade) ────────────────────────────────────────

export type WidgetDataValue =
  | number
  | Record<string, number>
  | Array<{ label: string; value: number }>
  | Array<{ month: string; value: number }>

// ── Resultado de query de widget ─────────────────────────────────────────────

export interface WidgetResult {
  /** Dados no formato legado (KPI_CARD, DONUT mono-campo) */
  data: Record<string, WidgetDataValue>
  /** Dados multi-série normalizados (LINE / AREA / BAR multi-campo) */
  series?: WidgetSeriesPoint[]
  /** Dados de distribuição normalizados (DISTRIBUTION) */
  slices?: WidgetDistributionSlice[]
  chartType: ChartType
  partial: boolean
  cached: boolean
  computed_at: string
  /** Tipos de unidade presentes nos dados (para detecção de eixo duplo) */
  unitTypes?: FieldUnitType[]
  /** true quando há 2 tipos de unidade incompatíveis → eixo Y duplo ativo */
  dualAxis?: boolean
}

// ── Configuração de widget ────────────────────────────────────────────────────

export interface DashboardWidgetConfig {
  id: string
  title: string
  chart_type: ChartType
  query_spec: WidgetQuerySpec
  position: { x: number; y: number; w: number; h: number }
  config?: Record<string, unknown>
}

// ── Query spec ────────────────────────────────────────────────────────────────

export interface WidgetQuerySpec {
  /**
   * Campos selecionados com operação individual por campo.
   * Formato novo: FieldQuerySpec[]
   * Formato legado (migração): string[] — convertido por migrateQuerySpec na store.
   */
  fields: FieldQuerySpec[]
  filters: {
    period: string
    status?: string[]
  }
  chartType?: ChartType
}

// ── Catálogo de campos ────────────────────────────────────────────────────────

export interface CatalogField {
  key: string
  label: string
  productId: string
  type: FieldUnitType | 'date' | 'string'
  aggregations: string[]
  permission: string
  chartTypes: ChartType[]
  /**
   * Dimensão de agrupamento (opcional).
   * Quando presente, habilita futura rota de GROUP BY no QueryBuilder (Option B).
   * Ex: campos de status de pedido → dimension: 'status_pedido'
   */
  dimension?: string
  /**
   * Rótulo legível da dimensão — exibido no título da sugestão gerada.
   * Ex: dimensionLabel: 'Status dos Pedidos'
   * Se ausente, o motor usa dimension.replace(/_/g, ' ').
   */
  dimensionLabel?: string
}

// ── Catálogo enriquecido (para motor de sugestões) ────────────────────────────

/**
 * Tipo semântico do campo — usado pelo motor de sugestões para gerar
 * widgets automaticamente sem conhecer o produto.
 */
export type SemanticType = 'count' | 'sum_currency' | 'sum_qty' | 'ratio' | 'date'

/**
 * Domínio de origem do campo dentro do produto.
 * Cada produto define os seus próprios domínios (ex: 'pedido' | 'item').
 */
export type FieldDomain = string

/**
 * Extensão de CatalogField com metadados semânticos.
 * Qualquer produto que queira usar o motor de sugestões deve expor
 * seus campos neste formato.
 */
export interface EnrichedCatalogField extends CatalogField {
  semanticType: SemanticType
  domain: FieldDomain
  complementaryFields: string[]
  /**
   * Rótulo legível do domínio — usado pelo motor no título de widgets comparativos.
   * Ex: domainDisplayLabel: 'Itens'
   * Se ausente, o motor usa o valor bruto de domain.
   */
  domainDisplayLabel?: string
}

// ── Métricas derivadas ────────────────────────────────────────────────────────

export type DerivedOperation = 'RATIO' | 'DIFF' | 'CUSTOM'

/**
 * Métrica calculada por cruzamento de campos do catálogo.
 * O campo `formula` é uma função pura — não faz fetch nem acessa estado global.
 */
export interface DerivedMetric {
  id: string
  label: string
  description: string
  inputFields: string[]
  operation: DerivedOperation
  formula: (values: Record<string, number>) => number | null
  fieldType: 'percentage' | 'currency' | 'number'
  /** true quando criada pelo usuário (não é built-in) */
  userDefined?: boolean
}

// ── Filtros e slicers globais ─────────────────────────────────────────────────

export interface ActiveFilter {
  field: string
  value: string | number
  label: string
  sourceWidgetId: string
}

export interface GlobalSlicers {
  period: string
  status: string[]
  dateRange: { from: string; to: string } | null
}
