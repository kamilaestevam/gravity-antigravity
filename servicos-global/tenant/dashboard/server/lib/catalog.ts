export type ChartType =
  | 'KPI_CARD' | 'LINE' | 'BAR' | 'BAR_HORIZONTAL'
  | 'DONUT' | 'HISTOGRAM' | 'FUNNEL' | 'GAUGE'
  | 'MAP' | 'TABLE' | 'AREA'

export type AggregationType =
  | 'sum' | 'avg' | 'count' | 'min' | 'max'
  | 'diff_days' | 'distribution' | 'trend'

export type FieldType = 'number' | 'currency' | 'date' | 'string' | 'percentage'

export interface CatalogField {
  key: string
  label: string
  productId: string
  productPort: number
  type: FieldType
  aggregations: AggregationType[]
  permission: string
  chartTypes: ChartType[]
}

export interface QueryFilters {
  period: '7d' | '30d' | '90d' | '12m' | 'mtd' | 'ytd'
  workspace_id?: string
}

export interface WidgetQuerySpec {
  fields: string[]
  operation: AggregationType
  filters: QueryFilters
  chartType?: ChartType
}

export type WidgetDataValue =
  | number
  | Record<string, number>
  | Array<{ label: string; value: number }>
  | Array<{ month: string; value: number }>

export type WidgetData = Record<string, WidgetDataValue>

export interface WidgetResult {
  data: WidgetData
  chartType: ChartType
  partial: boolean
  cached: boolean
  computed_at: string
}

export interface CatalogWidget {
  id: string
  title: string
  description: string
  productId: string
  chartType: ChartType
  querySpec: Omit<WidgetQuerySpec, 'chartType'>
  size: 'sm' | 'md' | 'lg'
  category: string
}

export const DATA_CATALOG: CatalogField[] = [
  // ─── BID CÂMBIO (port 8025) ───────────────────────────────────────
  { key: 'bid-cambio.saving_total',       label: 'Saving Total (R$)',         productId: 'bid-cambio',      productPort: 8025, type: 'currency',    aggregations: ['sum', 'avg'],               permission: 'bid-cambio:read',       chartTypes: ['KPI_CARD', 'LINE', 'BAR'] },
  { key: 'bid-cambio.valor_operado',      label: 'Valor Operado (R$)',        productId: 'bid-cambio',      productPort: 8025, type: 'currency',    aggregations: ['sum'],                      permission: 'bid-cambio:read',       chartTypes: ['KPI_CARD', 'LINE'] },
  { key: 'bid-cambio.cotacoes_status',    label: 'Cotações por Status',       productId: 'bid-cambio',      productPort: 8025, type: 'string',      aggregations: ['distribution'],             permission: 'bid-cambio:read',       chartTypes: ['DONUT', 'BAR'] },
  { key: 'bid-cambio.taxa_resposta',      label: 'Taxa de Resposta (%)',      productId: 'bid-cambio',      productPort: 8025, type: 'percentage',  aggregations: ['avg'],                      permission: 'bid-cambio:read',       chartTypes: ['KPI_CARD', 'GAUGE'] },
  { key: 'bid-cambio.economia_percentual',label: 'Economia Média (%)',        productId: 'bid-cambio',      productPort: 8025, type: 'percentage',  aggregations: ['avg'],                      permission: 'bid-cambio:read',       chartTypes: ['KPI_CARD', 'GAUGE'] },
  { key: 'bid-cambio.volume_mensal',      label: 'Volume Mensal',             productId: 'bid-cambio',      productPort: 8025, type: 'number',      aggregations: ['count', 'trend'],           permission: 'bid-cambio:read',       chartTypes: ['LINE', 'BAR'] },

  // ─── BID FRETE (port 8023) ────────────────────────────────────────
  { key: 'bid-frete.saving_total',        label: 'Saving Total (R$)',         productId: 'bid-frete',       productPort: 8023, type: 'currency',    aggregations: ['sum', 'avg'],               permission: 'bid-frete:read',        chartTypes: ['KPI_CARD', 'LINE', 'BAR'] },
  { key: 'bid-frete.valor_medio',         label: 'Valor Médio de Frete',      productId: 'bid-frete',       productPort: 8023, type: 'currency',    aggregations: ['avg'],                      permission: 'bid-frete:read',        chartTypes: ['KPI_CARD', 'LINE'] },
  { key: 'bid-frete.cotacoes_status',     label: 'Cotações por Status',       productId: 'bid-frete',       productPort: 8023, type: 'string',      aggregations: ['distribution'],             permission: 'bid-frete:read',        chartTypes: ['DONUT', 'BAR'] },
  { key: 'bid-frete.saving_percentual',   label: 'Saving Médio (%)',          productId: 'bid-frete',       productPort: 8023, type: 'percentage',  aggregations: ['avg'],                      permission: 'bid-frete:read',        chartTypes: ['KPI_CARD', 'GAUGE'] },
  { key: 'bid-frete.transit_time',        label: 'Prazo Médio (dias)',        productId: 'bid-frete',       productPort: 8023, type: 'number',      aggregations: ['avg', 'min', 'max'],        permission: 'bid-frete:read',        chartTypes: ['KPI_CARD', 'HISTOGRAM', 'BAR'] },
  { key: 'bid-frete.volume_mensal',       label: 'Volume Mensal',             productId: 'bid-frete',       productPort: 8023, type: 'number',      aggregations: ['count', 'trend'],           permission: 'bid-frete:read',        chartTypes: ['LINE', 'BAR'] },

  // ─── FINANCEIRO COMEX (port 8029) ────────────────────────────────
  { key: 'fin-comex.total_brl',           label: 'Total (R$)',                productId: 'financeiro-comex',productPort: 8029, type: 'currency',    aggregations: ['sum'],                      permission: 'fin-comex:read',        chartTypes: ['KPI_CARD', 'LINE', 'BAR'] },
  { key: 'fin-comex.pendente',            label: 'Pendente (R$)',             productId: 'financeiro-comex',productPort: 8029, type: 'currency',    aggregations: ['sum'],                      permission: 'fin-comex:read',        chartTypes: ['KPI_CARD', 'GAUGE'] },
  { key: 'fin-comex.pagos',              label: 'Pago (R$)',                 productId: 'financeiro-comex',productPort: 8029, type: 'currency',    aggregations: ['sum'],                      permission: 'fin-comex:read',        chartTypes: ['KPI_CARD', 'LINE'] },
  { key: 'fin-comex.agendados',          label: 'Agendado (R$)',             productId: 'financeiro-comex',productPort: 8029, type: 'currency',    aggregations: ['sum'],                      permission: 'fin-comex:read',        chartTypes: ['KPI_CARD'] },
  { key: 'fin-comex.por_moeda',          label: 'Por Moeda',                 productId: 'financeiro-comex',productPort: 8029, type: 'string',      aggregations: ['distribution'],             permission: 'fin-comex:read',        chartTypes: ['DONUT', 'BAR'] },
  { key: 'fin-comex.vencimentos_proximos',label: 'Vencimentos Próximos',     productId: 'financeiro-comex',productPort: 8029, type: 'number',      aggregations: ['count'],                    permission: 'fin-comex:read',        chartTypes: ['KPI_CARD', 'TABLE'] },

  // ─── PROCESSO (port 8026) ────────────────────────────────────────
  { key: 'processo.total_ativos',         label: 'Processos Ativos',          productId: 'processo',        productPort: 8026, type: 'number',      aggregations: ['count'],                    permission: 'processo:read',         chartTypes: ['KPI_CARD'] },
  { key: 'processo.atraso_chegada',       label: 'Atraso Médio (dias)',       productId: 'processo',        productPort: 8026, type: 'number',      aggregations: ['avg', 'diff_days'],         permission: 'processo:read',         chartTypes: ['KPI_CARD', 'HISTOGRAM', 'LINE'] },
  { key: 'processo.etapas_atrasadas',     label: 'Etapas Atrasadas',          productId: 'processo',        productPort: 8026, type: 'number',      aggregations: ['count'],                    permission: 'processo:read',         chartTypes: ['KPI_CARD', 'TABLE'] },
  { key: 'processo.por_status',           label: 'Por Status',                productId: 'processo',        productPort: 8026, type: 'string',      aggregations: ['distribution'],             permission: 'processo:read',         chartTypes: ['DONUT', 'FUNNEL', 'BAR'] },
  { key: 'processo.chegadas_7d',          label: 'Chegando em 7 dias',        productId: 'processo',        productPort: 8026, type: 'number',      aggregations: ['count'],                    permission: 'processo:read',         chartTypes: ['KPI_CARD'] },
  { key: 'processo.volume_mensal',        label: 'Volume Mensal',             productId: 'processo',        productPort: 8026, type: 'number',      aggregations: ['count', 'trend'],           permission: 'processo:read',         chartTypes: ['LINE', 'BAR'] },

  // ─── PEDIDO (port 8026 — mesmo servidor que Processo) ───────────
  { key: 'pedido.total_abertos',          label: 'Pedidos Abertos',           productId: 'pedido',          productPort: 8026, type: 'number',      aggregations: ['count'],                    permission: 'pedido:read',           chartTypes: ['KPI_CARD'] },
  { key: 'pedido.valor_fob_total',        label: 'Valor FOB Total',           productId: 'pedido',          productPort: 8026, type: 'currency',    aggregations: ['sum', 'avg'],               permission: 'pedido:read',           chartTypes: ['KPI_CARD', 'LINE', 'BAR'] },
  { key: 'pedido.por_status',             label: 'Por Status',                productId: 'pedido',          productPort: 8026, type: 'string',      aggregations: ['distribution'],             permission: 'pedido:read',           chartTypes: ['DONUT', 'BAR'] },
  { key: 'pedido.volume_mensal',          label: 'Volume Mensal',             productId: 'pedido',          productPort: 8026, type: 'number',      aggregations: ['count', 'trend'],           permission: 'pedido:read',           chartTypes: ['LINE', 'BAR'] },
  { key: 'pedido.itens_ncm',              label: 'Itens por NCM',             productId: 'pedido',          productPort: 8026, type: 'string',      aggregations: ['distribution'],             permission: 'pedido:read',           chartTypes: ['BAR', 'TABLE'] },
  { key: 'pedido.valor_por_fornecedor',   label: 'Valor por Fornecedor',      productId: 'pedido',          productPort: 8026, type: 'string',      aggregations: ['distribution'],             permission: 'pedido:read',           chartTypes: ['BAR_HORIZONTAL', 'TABLE'] },

  // ─── NF IMPORTAÇÃO (port 8028) ───────────────────────────────────
  { key: 'nf-imp.total_fob',              label: 'Total FOB (R$)',            productId: 'nf-importacao',   productPort: 8028, type: 'currency',    aggregations: ['sum', 'avg'],               permission: 'nf-importacao:read',    chartTypes: ['KPI_CARD', 'LINE', 'BAR'] },
  { key: 'nf-imp.total_cif',              label: 'Total CIF (R$)',            productId: 'nf-importacao',   productPort: 8028, type: 'currency',    aggregations: ['sum', 'avg'],               permission: 'nf-importacao:read',    chartTypes: ['KPI_CARD', 'LINE'] },
  { key: 'nf-imp.total_tributos',         label: 'Total Tributos (R$)',       productId: 'nf-importacao',   productPort: 8028, type: 'currency',    aggregations: ['sum'],                      permission: 'nf-importacao:read',    chartTypes: ['KPI_CARD', 'BAR', 'DONUT'] },
  { key: 'nf-imp.nfs_por_status',         label: 'NFs por Status',            productId: 'nf-importacao',   productPort: 8028, type: 'string',      aggregations: ['distribution'],             permission: 'nf-importacao:read',    chartTypes: ['DONUT', 'BAR'] },
  { key: 'nf-imp.tributos_breakdown',     label: 'Breakdown de Tributos',     productId: 'nf-importacao',   productPort: 8028, type: 'string',      aggregations: ['distribution'],             permission: 'nf-importacao:read',    chartTypes: ['BAR_HORIZONTAL', 'DONUT'] },
  { key: 'nf-imp.volume_mensal',          label: 'Volume Mensal',             productId: 'nf-importacao',   productPort: 8028, type: 'number',      aggregations: ['count', 'trend'],           permission: 'nf-importacao:read',    chartTypes: ['LINE', 'BAR'] },

  // ─── SIMULA CUSTO (port 8020) ────────────────────────────────────
  { key: 'simula-custo.landed_cost_medio',label: 'Landed Cost Médio (R$)',    productId: 'simula-custo',    productPort: 8020, type: 'currency',    aggregations: ['avg'],                      permission: 'simula-custo:read',     chartTypes: ['KPI_CARD', 'LINE', 'BAR'] },
  { key: 'simula-custo.estimativas_ativas',label: 'Estimativas Ativas',       productId: 'simula-custo',    productPort: 8020, type: 'number',      aggregations: ['count'],                    permission: 'simula-custo:read',     chartTypes: ['KPI_CARD'] },
  { key: 'simula-custo.total_tributos_medio',label: 'Tributos Médios (R$)',   productId: 'simula-custo',    productPort: 8020, type: 'currency',    aggregations: ['avg'],                      permission: 'simula-custo:read',     chartTypes: ['KPI_CARD'] },
  { key: 'simula-custo.tributos_breakdown',label: 'Breakdown de Tributos',    productId: 'simula-custo',    productPort: 8020, type: 'string',      aggregations: ['distribution'],             permission: 'simula-custo:read',     chartTypes: ['DONUT', 'BAR_HORIZONTAL'] },
  { key: 'simula-custo.ptax_media',       label: 'PTAX Média',               productId: 'simula-custo',    productPort: 8020, type: 'number',      aggregations: ['avg'],                      permission: 'simula-custo:read',     chartTypes: ['KPI_CARD', 'LINE'] },
  { key: 'simula-custo.volume_mensal',    label: 'Volume Mensal',             productId: 'simula-custo',    productPort: 8020, type: 'number',      aggregations: ['count', 'trend'],           permission: 'simula-custo:read',     chartTypes: ['LINE', 'BAR'] },

  // ─── LPCO (port 8027) ────────────────────────────────────────────
  { key: 'lpco.total_ativo',              label: 'LPCOs Ativos',             productId: 'lpco',            productPort: 8027, type: 'number',      aggregations: ['count'],                    permission: 'lpco:read',             chartTypes: ['KPI_CARD'] },
  { key: 'lpco.vencendo_30d',             label: 'Vencendo em 30 dias',      productId: 'lpco',            productPort: 8027, type: 'number',      aggregations: ['count'],                    permission: 'lpco:read',             chartTypes: ['KPI_CARD', 'TABLE'] },
  { key: 'lpco.exigencias_pendentes',     label: 'Exigências Pendentes',     productId: 'lpco',            productPort: 8027, type: 'number',      aggregations: ['count'],                    permission: 'lpco:read',             chartTypes: ['KPI_CARD', 'TABLE'] },
  { key: 'lpco.por_orgao',                label: 'Por Órgão Anuente',        productId: 'lpco',            productPort: 8027, type: 'string',      aggregations: ['distribution'],             permission: 'lpco:read',             chartTypes: ['DONUT', 'BAR'] },
  { key: 'lpco.por_status',               label: 'Por Status',               productId: 'lpco',            productPort: 8027, type: 'string',      aggregations: ['distribution'],             permission: 'lpco:read',             chartTypes: ['DONUT', 'BAR'] },
  { key: 'lpco.taxa_deferimento',         label: 'Taxa de Deferimento (%)',  productId: 'lpco',            productPort: 8027, type: 'percentage',  aggregations: ['avg'],                      permission: 'lpco:read',             chartTypes: ['KPI_CARD', 'GAUGE'] },
]

/** Retorna campos do catálogo filtrados pelas permissões do usuário */
export function getCatalogForUser(userPermissions: string[]): CatalogField[] {
  return DATA_CATALOG.filter(f => userPermissions.includes(f.permission))
}

/** Retorna campos de um produto específico */
export function getCatalogByProduct(productId: string): CatalogField[] {
  return DATA_CATALOG.filter(f => f.productId === productId)
}

/** Resolve uma chave de campo para seu CatalogField */
export function resolveCatalogField(key: string): CatalogField | undefined {
  return DATA_CATALOG.find(f => f.key === key)
}
