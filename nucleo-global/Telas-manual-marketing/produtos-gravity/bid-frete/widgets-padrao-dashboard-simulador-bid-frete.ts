/**
 * widgets-padrao-dashboard-simulador-bid-frete.ts — espelho de
 * dashboardStore.DEFAULT_WIDGETS do produto real BID Frete Internacional.
 */

import type { DashboardWidgetConfig } from '../../../Dashboard/dashboard-global/src/index'

export const WIDGETS_PADRAO_DASHBOARD_SIMULADOR_BID_FRETE: DashboardWidgetConfig[] = [
  // ── Linha 1 — KPIs Operacionais (largura total, 4 colunas iguais) ─────────
  {
    id: 'kpi_saving_total',
    title: 'Saving Total',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'saving_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 0, w: 3, h: 1.5 },
  },
  {
    id: 'kpi_valor_medio',
    title: 'Valor Médio Ganho',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_medio_ganho_bid_frete_internacional', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 3, y: 0, w: 3, h: 1.5 },
  },
  {
    id: 'kpi_transit_time',
    title: 'Transit Time Médio',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'transit_time', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 6, y: 0, w: 3, h: 1.5 },
  },
  {
    id: 'kpi_ganho_percentual',
    title: 'Ganho Percentual',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'ganho_percentual_ganho_bid_frete_internacional', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 9, y: 0, w: 3, h: 1.5 },
  },

  // ── Linha 2 — GABI AI Insights e Gráficos Principais ─────────────────────
  {
    id: 'gabi_insights',
    title: 'GABI AI · Insights',
    chart_type: 'GABI_INSIGHTS',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 1.5, w: 6, h: 4 },
  },
  {
    id: 'volume_mensal_chart',
    title: 'Volume Mensal de Cotações',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'volume_mensal', operation: 'COUNT' }],
      filters: { period: '12m' },
    },
    position: { x: 6, y: 1.5, w: 6, h: 4 },
  },

  // ── Divisor — Alertas Operacionais ───────────────────────────────────────
  {
    id: 'section_alertas',
    title: 'Alertas e Fluxos Operacionais',
    chart_type: 'SECTION_LABEL',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 5.5, w: 12, h: 1 },
  },

  // ── Linha 3 — Cotações Detalhadas ────────────────────────────────────────
  {
    id: 'kpi_cotacoes_andamento',
    title: 'Cotações em Andamento',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'cotacoes_andamento', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 6.5, w: 4, h: 2 },
  },
  {
    id: 'kpi_cotacoes_passadas',
    title: 'Cotações Passadas',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'cotacoes_passadas', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 4, y: 6.5, w: 4, h: 2 },
  },
  {
    id: 'kpi_valor_aprovado',
    title: 'Valor Total Aprovado',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_aprovado_usd', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 6.5, w: 4, h: 2 },
  },

  // Gráfico de distribuição
  {
    id: 'status_dist_chart',
    title: 'Cotações por Status',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [{ key: 'cotacoes_status', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 8.5, w: 12, h: 4 },
  },
]
