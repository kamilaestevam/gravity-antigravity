/**
 * dashboard.tsx — View Dashboard do produto BID Frete Internacional
 *
 * Totalmente configurável e customizável com painéis, drag-and-drop,
 * Gabi AI insights, e construtor de consultas global.
 */

import React, { useMemo, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, horizontalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { useShellStore } from '@shell'
import {
  DashboardGrid,
  DashboardPainelContainer,
  DashboardWidgetLinha,
  DashboardWidgetBarras,
  DashboardWidgetDistribuicao,
  DashboardBarraFerramentas,
  DashboardPainelEditarModal,
  DashboardPainelSugestoes,
  DashboardValorKPI,
} from '@nucleo/dashboard'
import type {
  DashboardWidgetConfig,
  WidgetResult,
  WidgetSeriesPoint,
  WidgetDistributionSlice,
  WidgetQuerySpec,
  ChartType,
  FieldUnitType,
  LineSeriesConfig,
  BarSeriesConfig,
  DerivedMetric,
} from '@nucleo/dashboard'
import { resolveAxisAssignment, SERIES_COLORS } from '@nucleo/dashboard'
import {
  Package, ClipboardText, Scales, CurrencyDollar,
  Warning, UserCircleMinus, CheckCircle,
  ListNumbers, ArrowsLeftRight, Tag,
  CaretLeft, CaretRight, RocketLaunch,
  DotsThree, PencilSimple, Trash, X, Timer, TrendUp,
} from '@phosphor-icons/react'
import './dashboard.css'
import { DashboardConstrutorConsulta } from '@nucleo/query-builder-global'

import { useDashboardStore } from '../stores/dashboardStore'
import { DASHBOARD_CATALOG, CATALOG_BY_KEY } from '../shared/dashboardCatalog'
import { generateSuggestions } from '../shared/dashboardSuggestions'
import { BUILT_IN_DERIVED, computeDerived } from '../shared/derivedMetrics'
import { dashboardApi, paineisDashboardApi } from '../shared/api'
import type { DashboardKpis, DashboardTrendBucket, GabiInsightItem, DashboardPainel } from '../shared/api'
import type { StatusCotacao } from '../shared/types'

// ── Mock do useTrackBehavior para evitar dependência externa ───────────────────
const useTrackBehavior = () => {
  return {
    trackWidget: (id: string) => console.log('[Track] Widget visualizado:', id),
    trackInsight: (id: string) => console.log('[Track] Insight clicado:', id),
  }
}

// ── Mapeamento de status para exibir labels e cores amigáveis ────────────────
const STATUS_LABELS: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA_FORNECEDORES: 'Enviada ao fornecedor',
  EM_COTACAO: 'Em cotação',
  AGUARDANDO_APROVACAO: 'Aprovação pendente',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
  FALTA_INFORMACAO: 'Falta de informação',
  EXPIRADA: 'Expirada',
}

// ── Converte resposta da API em WidgetResult ──────────────────────────────────
function buildWidgetResult(
  widget: DashboardWidgetConfig,
  kpis: DashboardKpis,
  trend: DashboardTrendBucket[],
  allDerived: DerivedMetric[],
): WidgetResult {
  const now = new Date().toISOString()
  const fields = widget.query_spec.fields
  const chartType = widget.chart_type

  // ── DISTRIBUTION ──────────────────────────────────────────────────────────
  if (chartType === 'DISTRIBUTION') {
    const fqs = fields[0]
    if (fqs && fqs.key === 'cotacoes_status') {
      const statusCounts = kpis.cotacoes_status ?? {}
      const slices: WidgetDistributionSlice[] = Object.entries(statusCounts)
        .map(([statusKey, val]) => {
          return {
            key: statusKey,
            label: STATUS_LABELS[statusKey] ?? statusKey,
            value: Number(val),
            unit: 'number' as FieldUnitType,
          }
        })
        .filter(s => s.value > 0)
      return { data: {}, slices, chartType: 'DISTRIBUTION', partial: false, cached: false, computed_at: now }
    }

    const slices: WidgetDistributionSlice[] = fields.map(f => {
      const catalog = CATALOG_BY_KEY[f.key]
      const unit: FieldUnitType = catalog?.type === 'currency' ? 'currency'
        : catalog?.type === 'percentage' ? 'percentage' : 'number'
      return {
        key: f.key,
        label: catalog?.label ?? f.key,
        value: Number(kpis[f.key] ?? 0),
        unit,
      }
    }).filter(s => s.value > 0)

    return { data: {}, slices, chartType: 'DISTRIBUTION', partial: false, cached: false, computed_at: now }
  }

  // ── LINE / AREA / BAR / BAR_HORIZONTAL — multi-série ─────────────────────
  if (['LINE', 'AREA', 'BAR', 'BAR_HORIZONTAL'].includes(chartType)) {
    const series: WidgetSeriesPoint[] = trend.map(bucket => {
      const point: WidgetSeriesPoint = { month: bucket.month }
      for (const f of fields) {
        point[f.key] = Number(bucket[f.key] ?? 0)
      }
      return point
    })

    const unitTypes = [...new Set(
      fields.map(f => {
        const cat = CATALOG_BY_KEY[f.key]
        return (cat?.type === 'currency' ? 'currency' : 'number') as FieldUnitType
      }),
    )]
    const dualAxis = unitTypes.length > 1

    return { data: {}, series, chartType, partial: false, cached: false, computed_at: now, unitTypes, dualAxis }
  }

  // ── KPI_CARD com métrica derivada ─────────────────────────────────────────
  if (widget.config?.derivedMetricId) {
    const dm = allDerived.find(m => m.id === widget.config!.derivedMetricId)
    if (dm) {
      const value = computeDerived(dm, kpis as Record<string, number>)
      const fieldKey = fields[0]?.key ?? 'value'
      return { data: { [fieldKey]: value ?? 0 }, chartType: 'KPI_CARD', partial: false, cached: false, computed_at: now }
    }
  }

  // ── KPI_CARD / DONUT / outros — mono-campo ────────────────────────────────
  const fieldKey = fields[0]?.key ?? 'value'
  const value = Number(kpis[fieldKey] ?? 0)
  return { data: { [fieldKey]: value }, chartType, partial: false, cached: false, computed_at: now }
}

// ── Período anterior para comparação de tendência ────────────────────────────
function getPrevDateRange(period: string): { from: string; to: string } {
  const now = new Date()
  const prevTo   = new Date(now)
  const prevFrom = new Date(now)

  switch (period) {
    case '7d':
      prevTo.setDate(now.getDate() - 7)
      prevFrom.setDate(now.getDate() - 14)
      break
    case '30d':
      prevTo.setDate(now.getDate() - 30)
      prevFrom.setDate(now.getDate() - 60)
      break
    case '90d':
      prevTo.setDate(now.getDate() - 90)
      prevFrom.setDate(now.getDate() - 180)
      break
    case '6m':
      prevTo.setMonth(now.getMonth() - 6)
      prevFrom.setMonth(now.getMonth() - 12)
      break
    case '12m':
    case 'current_year':
    case 'ytd':
      prevTo.setFullYear(now.getFullYear() - 1)
      prevFrom.setFullYear(now.getFullYear() - 2)
      break
    default:
      prevTo.setDate(now.getDate() - 30)
      prevFrom.setDate(now.getDate() - 60)
  }

  return { from: prevFrom.toISOString(), to: prevTo.toISOString() }
}

function computeDelta(current: number, prev: number): {
  delta: number
  percent: number
  direction: 'up' | 'down' | 'neutral'
} {
  const delta = current - prev
  const percent = prev === 0
    ? (current > 0 ? 100 : 0)
    : (delta / prev) * 100
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'
  return { delta, percent, direction }
}

// ── Gerador de insights client-side com dados reais do BID Frete ───────────────
const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtUSD = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

function buildClientInsights(kpis: DashboardKpis, prev?: DashboardKpis | null): GabiInsightItem[] {
  const items: GabiInsightItem[] = []

  // 1. Alerta de rascunhos ativos
  const rascunhosCount = Number(kpis.cotacoes_status?.['RASCUNHO'] ?? 0)
  if (rascunhosCount > 0) {
    items.push({
      id: 'rascunhos_ativos',
      variante: 'warn',
      tag: 'Atenção · Rascunhos Pendentes',
      texto: `${rascunhosCount} cotação${rascunhosCount > 1 ? 's' : ''} em rascunho. Finalize e envie para negociação de frete.`,
      stat: { label: 'Em rascunho', valor: fmtNum(rascunhosCount) },
      textoLink: 'Ver cotações',
      rota: '/bid-frete-internacional/cotacoes',
    })
  }

  // 2. Operacional em cotação
  if (kpis.cotacoes_andamento > 0) {
    items.push({
      id: 'cotacoes_andamento',
      variante: 'default',
      tag: 'Operacional · Em Cotação',
      texto: `${kpis.cotacoes_andamento} rodada${kpis.cotacoes_andamento > 1 ? 's' : ''} de cotação de frete ativa${kpis.cotacoes_andamento > 1 ? 's' : ''} no mercado.`,
      stat: kpis.valor_andamento_usd > 0
        ? { label: 'Valor em cotação', valor: fmtUSD(kpis.valor_andamento_usd) }
        : { label: 'Cotações ativas', valor: fmtNum(kpis.cotacoes_andamento) },
      textoLink: 'Acompanhar BIDs',
      rota: '/bid-frete-internacional/cotacoes',
    })
  }

  // 3. Economia de frete
  if (kpis.saving_total > 0) {
    items.push({
      id: 'saving_total',
      variante: 'default',
      tag: 'Financeiro · Saving Acumulado',
      texto: `Economia gerada (saving) nas negociações de frete acumulada em ${fmtUSD(kpis.saving_total)}.`,
      stat: kpis.ganho_percentual_ganho_bid_frete_internacional > 0
        ? { label: 'Redução média', valor: fmtPct(kpis.ganho_percentual_ganho_bid_frete_internacional) }
        : { label: 'Total economizado', valor: fmtUSD(kpis.saving_total) },
      textoLink: 'Ver comparativos',
    })
  }

  // 4. Valor total aprovado
  if (kpis.valor_aprovado_usd > 0) {
    items.push({
      id: 'valor_aprovado',
      variante: 'default',
      tag: 'Financeiro · Adjudicado',
      texto: `Adjudicação de frete internacional totaliza ${fmtUSD(kpis.valor_aprovado_usd)} em propostas aprovadas.`,
      stat: kpis.valor_medio_ganho_bid_frete_internacional > 0
        ? { label: 'Ticket médio ganho', valor: fmtUSD(kpis.valor_medio_ganho_bid_frete_internacional) }
        : undefined,
      textoLink: 'Ver adjudicadas',
    })
  }

  // 5. Comparativos
  if (prev && prev.cotacoes_passadas > 0 && kpis.cotacoes_passadas > 0) {
    const delta = kpis.cotacoes_passadas - prev.cotacoes_passadas
    const pct = Math.abs((delta / prev.cotacoes_passadas) * 100)
    if (Math.abs(delta) > 0) {
      const crescendo = delta > 0
      items.push({
        id: 'tendencia_volume',
        variante: 'default',
        tag: `Tendência · BIDs Fechados`,
        texto: `Volume de cotações adjudicadas ${crescendo ? 'cresceu' : 'caiu'} ${fmtPct(pct)} em relação ao período anterior.`,
        stat: { label: 'Período anterior', valor: fmtNum(prev.cotacoes_passadas) },
        textoLink: 'Explorar dados',
      })
    }
  }

  // Fallback
  if (items.length === 0) {
    items.push({
      id: 'status_ok',
      variante: 'default',
      tag: 'Gabi AI · Tudo em dia',
      texto: 'Nenhuma pendência crítica ou anomalia operacional identificada no período selecionado.',
      stat: { label: 'Período', valor: kpis.period ?? '30d' },
      textoLink: 'Ver cotações',
      rota: '/bid-frete-internacional/cotacoes',
    })
  }

  return items
}

// ── Configuração visual por widget no BID Frete ──────────────────────────────
const AMBER  = '#f59e0b'
const DANGER = '#ef4444'
const GREEN  = '#10b981'
const BLUE   = '#3b82f6'
const VIOLET = '#8b5cf6'

const WIDGET_VISUAL: Record<string, { accentColor?: string; icone?: ReactNode }> = {
  kpi_saving_total:        { accentColor: GREEN,  icone: <CurrencyDollar size={15} weight="duotone" /> },
  kpi_valor_medio:         { accentColor: VIOLET, icone: <Tag            size={15} weight="duotone" /> },
  kpi_transit_time:        { accentColor: AMBER,  icone: <Timer          size={15} weight="duotone" /> },
  kpi_ganho_percentual:    { accentColor: BLUE,   icone: <TrendUp        size={15} weight="duotone" /> },
  kpi_cotacoes_andamento:  { accentColor: BLUE,   icone: <ClipboardText  size={15} weight="duotone" /> },
  kpi_cotacoes_passadas:   { accentColor: GREEN,  icone: <CheckCircle    size={15} weight="duotone" /> },
  kpi_valor_aprovado:      { accentColor: VIOLET, icone: <Scales         size={15} weight="duotone" /> },
}

const WIDGET_NAV_ROUTE: Record<string, string> = {
  kpi_cotacoes_andamento:  '/bid-frete-internacional/cotacoes',
  kpi_cotacoes_passadas:   '/bid-frete-internacional/cotacoes',
}

const PERIOD_SEQUENCE = ['7d', '30d', '90d', '12m', 'current_year'] as const
type PeriodKey = typeof PERIOD_SEQUENCE[number]

const PERIOD_LABEL: Record<string, string> = {
  '7d':           'Últimos 7 dias',
  '30d':          'Últimos 30 dias',
  '90d':          'Últimos 90 dias',
  '12m':          'Últimos 12 meses',
  'current_year': 'Ano atual',
}

function getNextPeriods(current: string): string[] {
  const idx = PERIOD_SEQUENCE.indexOf(current as PeriodKey)
  if (idx === -1) return ['30d', '12m']
  return Array.from(PERIOD_SEQUENCE.slice(idx + 1, idx + 3))
}

function buildEmptyText(chartType: string, fieldNames: string[]): string {
  const fieldStr = fieldNames.length === 0
    ? 'este campo'
    : fieldNames.length === 1
      ? `"${fieldNames[0]}"`
      : fieldNames.slice(0, 2).map(f => `"${f}"`).join(' e ')

  switch (chartType) {
    case 'DISTRIBUTION':
      return `Nenhum registro encontrado para distribuir ${fieldStr} no período selecionado. Ajuste os filtros para prosseguir.`
    case 'LINE':
    case 'AREA':
      return `Sem dados de tendência para ${fieldStr} neste intervalo. Experimente ampliar o período.`
    case 'BAR':
    case 'BAR_HORIZONTAL':
      return `Nenhuma movimentação registrada para comparar ${fieldStr} no período atual.`
    default:
      return `Não há dados disponíveis para este widget no período selecionado. Amplie o intervalo ou ajuste os campos.`
  }
}

function isResultEmpty(result: WidgetResult, isDerived: boolean): boolean {
  if (isDerived) return false
  const ct = result.chartType

  if (ct === 'DISTRIBUTION') {
    return !result.slices || result.slices.length === 0
  }

  if (['LINE', 'AREA', 'BAR', 'BAR_HORIZONTAL'].includes(ct)) {
    if (!result.series || result.series.length === 0) return true
    return result.series.every((pt: WidgetSeriesPoint) =>
      Object.entries(pt)
        .filter(([k]) => k !== 'month')
        .every(([, v]) => !v || Number(v) === 0),
    )
  }

  return false
}

// ── WidgetEmptyGabi — card exibido quando widget retorna dados zerados ─────────
interface WidgetEmptyGabiProps {
  widget: DashboardWidgetConfig
  fieldNames: string[]
  currentPeriod: string
  onExpandPeriod: (p: string) => void
  onEdit: () => void
  onRemove: () => void
}

function WidgetEmptyGabi({ widget, fieldNames, currentPeriod, onExpandPeriod, onEdit, onRemove }: WidgetEmptyGabiProps) {
  const nextPeriods = getNextPeriods(currentPeriod)
  const emptyText   = buildEmptyText(widget.chart_type, fieldNames)

  return (
    <div style={gabiEmptyStyles.wrap} className="dp-gabi-empty-pulse">
      <div style={gabiEmptyStyles.watermark} aria-hidden="true">
        <RocketLaunch size={80} weight="fill" />
      </div>

      <div style={gabiEmptyStyles.inner}>
        <div style={gabiEmptyStyles.avatarRow}>
          <div style={gabiEmptyStyles.avatar}>
            <RocketLaunch size={13} weight="fill" color="#doc" />
          </div>
          <span style={gabiEmptyStyles.tag}>GABI · Sem dados no período</span>
        </div>

        <p style={gabiEmptyStyles.text}>{emptyText}</p>

        <div style={gabiEmptyStyles.actions}>
          {nextPeriods.length > 0 ? (
            <div style={gabiEmptyStyles.periodGroup}>
              <span style={gabiEmptyStyles.actionLabel}>Ampliar para:</span>
              {nextPeriods.map(p => (
                <button key={p} type="button" style={gabiEmptyStyles.periodBtn} onClick={() => onExpandPeriod(p)}>
                  {PERIOD_LABEL[p] ?? p}
                </button>
              ))}
            </div>
          ) : (
            <div style={gabiEmptyStyles.periodGroup}>
              <span style={gabiEmptyStyles.actionLabel}>Experimente:</span>
              <button type="button" style={gabiEmptyStyles.periodBtn} onClick={() => onExpandPeriod('30d')}>
                Últimos 30 dias
              </button>
              <button type="button" style={gabiEmptyStyles.periodBtn} onClick={() => onExpandPeriod('12m')}>
                Últimos 12 meses
              </button>
            </div>
          )}

          <div style={gabiEmptyStyles.rowActions}>
            <button type="button" style={gabiEmptyStyles.editBtn} onClick={onEdit}>
              Editar campos
            </button>
            <button type="button" style={gabiEmptyStyles.removeBtn} onClick={onRemove}>
              Remover widget
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const gabiEmptyStyles = {
  wrap: {
    position: 'relative' as const,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  watermark: {
    position: 'absolute' as const,
    top: '50%',
    right: '-20px',
    transform: 'translateY(-50%) rotate(15deg)',
    color: 'rgba(255, 255, 255, 0.06)',
    pointerEvents: 'none' as const,
    zIndex: 0,
    lineHeight: 0,
  },
  inner: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.625rem',
    padding: '0.875rem 1rem',
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  avatar: {
    width: '22px',
    height: '22px',
    borderRadius: '7px',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  tag: {
    fontSize: '0.6rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#a5f3fc',
  },
  text: {
    fontSize: '0.75rem',
    lineHeight: 1.55,
    color: 'rgba(255, 255, 255, 0.85)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginTop: '0.125rem',
  },
  periodGroup: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '0.375rem',
  },
  actionLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '0.05em',
  },
  periodBtn: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '999px',
    padding: '2px 10px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  rowActions: {
    display: 'flex',
    gap: '1rem',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.75)',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
    textDecoration: 'underline',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#fca5a5',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
    textDecoration: 'underline',
  },

  // Painéis
  painelBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    margin: '0.75rem 0 0.5rem',
    padding: '0 0.25rem',
    flexWrap: 'wrap' as const,
  },
  painelTab: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '6px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
    transition: 'background 0.15s, color 0.15s',
  },
  painelTabAtivo: {
    background: 'rgba(139,92,246,0.18)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#c4b5fd',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  painelAddBtn: {
    background: 'none',
    border: '1px dashed rgba(255,255,255,0.2)',
    borderRadius: '6px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.9rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.35)',
    cursor: 'pointer',
    lineHeight: 1,
    fontFamily: 'var(--font, inherit)',
  },
  painelNovoForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  painelNovoInput: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.28rem 0.5rem',
    fontSize: '0.75rem',
    color: '#fff',
    outline: 'none',
    fontFamily: 'var(--font, inherit)',
    width: '140px',
  },
  painelNovoBtnOk: {
    background: 'rgba(139,92,246,0.7)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.28rem 0.6rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  painelNovoBtnCancel: {
    background: 'none',
    border: 'none',
    padding: '0.28rem 0.4rem',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  painelTabWrap: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  painelTabInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  painelMenuBtn: {
    background: 'none',
    border: 'none',
    padding: '0 1px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: 1,
    fontFamily: 'var(--font, inherit)',
    borderRadius: '3px',
  },
  painelMenuDropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    left: 0,
    background: '#1e1b2e',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    zIndex: 200,
    minWidth: '140px',
    overflow: 'hidden' as const,
    padding: '0.25rem 0',
  },
  painelMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '0.45rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontFamily: 'var(--font, inherit)',
  },
  painelMenuItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '0.45rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#fca5a5',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontFamily: 'var(--font, inherit)',
  },
  painelRenameInput: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.28rem 0.5rem',
    fontSize: '0.75rem',
    color: '#fff',
    outline: 'none',
    fontFamily: 'var(--font, inherit)',
    width: '120px',
  },
} as const

const sty = gabiEmptyStyles

function SortableTabWrapper({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        ...sty.painelTabWrap,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  const {
    widgets, addWidget, removeWidget, updateWidget, updateLayout,
    slicers, setPeriod, setStatusFilter,
    activeFilters, clearFilters,
    editMode, setEditMode,
    queryBuilderOpen, setQueryBuilderOpen,
    userDerivedMetrics,
    paineis, painelAtualId, setPaineis, setPainelAtual, salvarWidgetsPainelAtual,
  } = useDashboardStore()

  const podeEditarDashboard = true // Hardcoded como true para o BID Frete

  const navigate = useNavigate()
  const { trackWidget, trackInsight } = useTrackBehavior()
  const { addNotification } = useShellStore()

  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [editingWidget,   setEditingWidget]   = useState<DashboardWidgetConfig | null>(null)
  const [editModalOpen,   setEditModalOpen]   = useState(false)

  const [kpisData,     setKpisData]     = useState<DashboardKpis | null>(null)
  const [prevKpisData, setPrevKpisData] = useState<DashboardKpis | null>(null)

  const [compactStatus, setCompactStatus] = useState(() => window.innerWidth < 1200)
  useEffect(() => {
    function handleResize() { setCompactStatus(window.innerWidth < 1200) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [trendData,    setTrendData]    = useState<DashboardTrendBucket[]>([])
  const [insightsData, setInsightsData] = useState<GabiInsightItem[]>([])
  const [loadingData,  setLoadingData]  = useState(true)

  const [novoNomePainel, setNovoNomePainel] = useState('')
  const [criandoPainel,  setCriandoPainel]  = useState(false)
  const [renamingId,     setRenamingId]     = useState<string | null>(null)
  const [renameValue,    setRenameValue]    = useState('')
  const [menuPainelId,   setMenuPainelId]   = useState<string | null>(null)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)
  const renameInFlightRef = useRef<string | null>(null)

  const painelSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Fecha menu ao clicar fora
  useEffect(() => {
    if (!menuPainelId) return
    const close = () => { setMenuPainelId(null); setDeletingId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuPainelId])

  // Salva widgets do painel atual e troca de aba
  const handleTrocarPainel = (novoId: string) => {
    if (novoId === painelAtualId) return
    if (painelAtualId) salvarWidgetsPainelAtual(painelAtualId, widgets)
    setPainelAtual(novoId)
  }

  // Renomeia painel
  const handleRenomearPainel = (id: string, nome: string) => {
    if (renameInFlightRef.current === id) return
    renameInFlightRef.current = id
    setRenamingId(null)
    const trimmed = nome.trim()
    if (!trimmed) { renameInFlightRef.current = null; return }
    paineisDashboardApi.atualizar(id, { nome: trimmed })
      .then(() => {
        const fresh = useDashboardStore.getState().paineis
        setPaineis(fresh.map(p => p.id === id ? { ...p, nome: trimmed } : p))
      })
      .catch(() => {})
      .finally(() => { renameInFlightRef.current = null })
  }

  // Deleta painel
  const handleDeletarPainel = (id: string) => {
    if (paineis.length <= 1) return
    paineisDashboardApi.deletar(id)
      .then(() => {
        const fresh = useDashboardStore.getState().paineis
        const atualizados = fresh.filter(p => p.id !== id)
        setPaineis(atualizados)
        if (painelAtualId === id) {
          const proximo = atualizados.find(p => p.is_visivel)
          if (proximo) setPainelAtual(proximo.id)
        }
      })
      .catch(() => {})
    setMenuPainelId(null)
    setDeletingId(null)
  }

  // Reordena painéis
  const handlePainelDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = paineis.findIndex(p => p.id === active.id)
    const newIndex = paineis.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(paineis, oldIndex, newIndex)
    setPaineis(reordered)
    paineisDashboardApi.reordenar(reordered.map(p => p.id)).catch(() => {})
  }

  // Carrega painéis ao montar
  useEffect(() => {
    paineisDashboardApi.listar().then(({ data }) => setPaineis(data)).catch(() => {})
  }, [setPaineis])

  // Carrossel GABI
  const gabiCarouselRef = useRef<HTMLDivElement>(null)
  const [gabiPaused, setGabiPaused] = useState(false)

  const scrollGabi = useCallback((dir: 'left' | 'right') => {
    const el = gabiCarouselRef.current
    if (!el) return
    if (dir === 'right') {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 340, behavior: 'smooth' })
      }
    } else {
      el.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }, [])

  const allDerived: DerivedMetric[] = useMemo(
    () => [...BUILT_IN_DERIVED, ...userDerivedMetrics],
    [userDerivedMetrics],
  )

  const fieldLabels = useMemo(
    () => Object.fromEntries(DASHBOARD_CATALOG.map(f => [f.key, f.label])),
    [],
  )

  const gridBottom = useMemo(
    () => widgets.reduce((max, w) => Math.max(max, w.position.y + w.position.h), 0),
    [widgets],
  )

  const suggestions = useMemo(
    () => generateSuggestions(
      widgets.map(w => w.id),
      allDerived,
      gridBottom,
      widgets.flatMap(w => w.query_spec.fields.map((f: { key: string }) => f.key)),
    ),
    [widgets, allDerived, gridBottom],
  )

  const triggerWidgetAddedFX = useCallback((widgetId: string, title: string) => {
    try { addNotification({ type: 'success', message: `Widget "${title}" adicionado com sucesso ao seu dashboard.`, duration: 4000 }) } catch { /* ignorar */ }
    setTimeout(() => {
      const wrapper = document.querySelector(`[data-widget-id="${widgetId}"]`)
      wrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        if (!wrapper) return
        wrapper.classList.add('wc-highlighted')
        setTimeout(() => wrapper.classList.remove('wc-highlighted'), 4500)
      }, 700)
    }, 300)
  }, [addNotification])

  const handleAddWidgetFromSuggestions = useCallback((widgetConfig: DashboardWidgetConfig) => {
    addWidget(widgetConfig)
    triggerWidgetAddedFX(widgetConfig.id, widgetConfig.title)
  }, [addWidget, triggerWidgetAddedFX])

  useEffect(() => {
    if (gabiPaused || loadingData) return
    const timer = setInterval(() => scrollGabi('right'), 5000)
    return () => clearInterval(timer)
  }, [gabiPaused, loadingData, scrollGabi])

  useEffect(() => {
    setLoadingData(true)
    const prevRange = getPrevDateRange(slicers.period)

    const customRange = slicers.period.startsWith('custom:')
      ? (() => {
          const [, s, e] = slicers.period.split(':')
          return s && e ? { from: `${s}T00:00:00.000Z`, to: `${e}T23:59:59.999Z` } : undefined
        })()
      : undefined

    Promise.all([
      dashboardApi.kpis(slicers.period, customRange),
      dashboardApi.kpis(slicers.period, prevRange),
      dashboardApi.trend('12m', 'month'),
      dashboardApi.insights(slicers.period, customRange).catch(() => ({ period: '', role: '', insights: [] as GabiInsightItem[] })),
    ])
      .then(([kpis, prevKpis, trend, insightsRes]) => {
        setKpisData(kpis)
        setPrevKpisData(prevKpis)
        setTrendData(trend.value)
        setInsightsData(insightsRes.insights)
      })
      .catch(err => console.error('[Dashboard] Erro ao carregar dados:', err))
      .finally(() => setLoadingData(false))
  }, [slicers.period])

  const activeWidgets = useMemo(() =>
    widgets.map(w => ({
      ...w,
      query_spec: {
        ...w.query_spec,
        filters: w.query_spec.filters.period === '12m'
          ? w.query_spec.filters
          : { ...w.query_spec.filters, period: slicers.period },
      },
    })), [widgets, slicers.period],
  )

  const renderWidget = useCallback((widget: DashboardWidgetConfig) => {
    const chartType = widget.chart_type

    // ── GABI_INSIGHTS ────────────────────────────────────────────────────────
    if (chartType === 'GABI_INSIGHTS') {
      const insights = insightsData.length > 0
        ? insightsData
        : kpisData
          ? buildClientInsights(kpisData, prevKpisData)
          : []

      return (
        <div
          key={widget.id}
          className="dp-gabi-card"
          onMouseEnter={() => setGabiPaused(true)}
          onMouseLeave={() => setGabiPaused(false)}
        >
          <div className="dp-gabi-watermark" aria-hidden="true">
            <RocketLaunch size={120} weight="fill" />
          </div>
          <div className="dp-gabi-main">
            <div className="dp-gabi-top-row">
              <div className="dp-gabi-header">
                <div className="dp-gabi-avatar">
                  <RocketLaunch weight="fill" size={13} color="#fff" />
                </div>
                <span className="dp-gabi-label">Gabi AI · Insights</span>
              </div>
              <div className="dp-gabi-header-right">
                <button
                  className="dp-gabi-nav-btn"
                  type="button"
                  onClick={() => scrollGabi('left')}
                  aria-label="Insight anterior"
                >
                  <CaretLeft size={12} weight="bold" />
                </button>
                <button
                  className="dp-gabi-nav-btn"
                  type="button"
                  onClick={() => scrollGabi('right')}
                  aria-label="Próximo insight"
                >
                  <CaretRight size={12} weight="bold" />
                </button>
                <span className="dp-gabi-live-badge">
                  <span className="dp-gabi-live-dot" />
                  ao vivo
                </span>
              </div>
            </div>

            <div className="dp-gabi-track" ref={gabiCarouselRef}>
              {loadingData
                ? [0, 1, 2].map(i => (
                    <div key={i} className="dp-gabi-insight-card dp-gabi-insight-card--skeleton">
                      <div className="dp-gabi-skeleton-line dp-gabi-skeleton-line--short" />
                      <div className="dp-gabi-skeleton-line" />
                      <div className="dp-gabi-skeleton-line" />
                    </div>
                  ))
                : insights.map(ins => (
                    <div
                      key={ins.id}
                      className={`dp-gabi-insight-card${ins.variante === 'warn' ? ' dp-gabi-insight-card--warn' : ''}`}
                    >
                      <div className={`dp-gabi-insight-tag${ins.variante === 'warn' ? ' dp-gabi-insight-tag--warn' : ''}`}>
                        {ins.variante === 'warn'
                          ? <Warning size={10} weight="fill" />
                          : <RocketLaunch size={10} weight="fill" />}
                        {ins.tag}
                      </div>
                      <p className="dp-gabi-insight-text">{ins.texto}</p>
                      {(ins.stat || ins.textoLink) && (
                        <div className="dp-gabi-insight-bottom">
                          {ins.stat && (
                            <div className="dp-gabi-insight-stat">
                              <span className="dp-gabi-insight-stat-label">{ins.stat.label}</span>
                              <span className="dp-gabi-insight-stat-value">{ins.stat.valor}</span>
                            </div>
                          )}
                          {ins.textoLink && (
                            <button
                              className="dp-gabi-insight-link"
                              type="button"
                              onClick={() => {
                                trackInsight(ins.id)
                                if (ins.rota) window.location.href = ins.rota
                              }}
                            >
                              {ins.textoLink} <CaretRight size={10} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      )
    }

    // ── SECTION_LABEL ────────────────────────────────────────────────────────
    if (chartType === 'SECTION_LABEL') {
      return (
        <div key={widget.id} style={sectionLabelStyle}>
          <span style={sectionLabelTextStyle}>{widget.title}</span>
          <div style={sectionLabelLineStyle} />
        </div>
      )
    }

    const result = kpisData
      ? buildWidgetResult(widget, kpisData, trendData, allDerived)
      : { data: {}, chartType: widget.chart_type, partial: true, cached: false, computed_at: new Date().toISOString() }
    const fields = widget.query_spec.fields
    const isDerived = !!widget.config?.derivedMetricId

    // ── Estado vazio ─────────────────────────────────────────────────────────
    if (!loadingData && kpisData && isResultEmpty(result, isDerived)) {
      return (
        <DashboardPainelContainer
          key={widget.id}
          widget={widget}
          result={result}
          loading={false}
          error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
        >
          <WidgetEmptyGabi
            widget={widget}
            fieldNames={fields.map((f: { key: string }) => fieldLabels[f.key] ?? f.key)}
            currentPeriod={slicers.period}
            onExpandPeriod={setPeriod}
            onEdit={() => { setEditingWidget(widget); setEditModalOpen(true) }}
            onRemove={() => removeWidget(widget.id)}
          />
        </DashboardPainelContainer>
      )
    }

    // ── DISTRIBUTION ────────────────────────────────────────────────────────
    if (chartType === 'DISTRIBUTION') {
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
        >
          <DashboardWidgetDistribuicao slices={result.slices ?? []} />
        </DashboardPainelContainer>
      )
    }

    // ── LINE / AREA ──────────────────────────────────────────────────────────
    if (chartType === 'LINE' || chartType === 'AREA') {
      const catalogFields = fields.map(f => CATALOG_BY_KEY[f.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: LineSeriesConfig[] = fields.map((f, i) => {
        const cat = CATALOG_BY_KEY[f.key]
        const unit: FieldUnitType = cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number'
        const seriesPoints = result.series ?? []
        return {
          fieldKey: f.key,
          label: cat?.label ?? f.key,
          color: SERIES_COLORS[i % SERIES_COLORS.length] as string,
          data: seriesPoints.map(pt => ({ month: pt.month as string, value: (pt[f.key] as number) ?? 0 })),
          yAxisId: assignments[f.key] ?? 'left',
          unit,
        }
      })

      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
        >
          <DashboardWidgetLinha
            series={series}
            dualAxis={dualAxis}
            leftUnit={leftUnit ?? 'number'}
            rightUnit={rightUnit ?? undefined}
            showArea={chartType === 'AREA'}
          />
        </DashboardPainelContainer>
      )
    }

    // ── BAR / BAR_HORIZONTAL ─────────────────────────────────────────────────
    if (chartType === 'BAR' || chartType === 'BAR_HORIZONTAL') {
      const catalogFields = fields.map(f => CATALOG_BY_KEY[f.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: BarSeriesConfig[] = fields.map((f, i) => {
        const cat = CATALOG_BY_KEY[f.key]
        const unit: FieldUnitType = cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number'
        const seriesPoints = result.series ?? []
        return {
          fieldKey: f.key,
          label: cat?.label ?? f.key,
          color: SERIES_COLORS[i % SERIES_COLORS.length] as string,
          data: seriesPoints.map(pt => ({ month: pt.month as string, value: (pt[f.key] as number) ?? 0 })),
          yAxisId: assignments[f.key] ?? 'left',
          unit,
        }
      })

      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
        >
          <DashboardWidgetBarras
            series={series}
            dualAxis={dualAxis}
            leftUnit={leftUnit ?? 'number'}
            rightUnit={rightUnit ?? undefined}
            horizontal={chartType === 'BAR_HORIZONTAL'}
          />
        </DashboardPainelContainer>
      )
    }

    // ── KPI_CARD ─────────────────────────────────────────────────────────────
    if (chartType === 'KPI_CARD') {
      const fieldKey = fields[0]?.key ?? 'value'
      const cat = CATALOG_BY_KEY[fieldKey]
      const dm = widget.config?.derivedMetricId
        ? allDerived.find(m => m.id === widget.config!.derivedMetricId)
        : undefined
      const fieldType: FieldUnitType = dm?.fieldType ?? (cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number')
      const visual   = WIDGET_VISUAL[widget.id] ?? {}
      const navRoute = WIDGET_NAV_ROUTE[widget.id]
      const currentVal = Number(kpisData?.[fieldKey] ?? 0)
      const prevVal    = Number(prevKpisData?.[fieldKey] ?? 0)
      const deltaInfo  = computeDelta(currentVal, prevVal)
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
          accentColor={visual.accentColor}
          icone={visual.icone}
          clickable={!!navRoute}
          onClick={() => {
            trackWidget(widget.id)
            if (navRoute && !editMode) navigate(navRoute)
          }}
        >
          <DashboardValorKPI
            data={result.data}
            fieldKey={fieldKey}
            fieldType={fieldType}
            delta={deltaInfo.delta}
            deltaPercent={deltaInfo.percent}
            deltaDirection={deltaInfo.direction}
          />
        </DashboardPainelContainer>
      )
    }

    // ── Fallback ─────────────────────────────────────────────────────────────
    const fieldKey = fields[0]?.key ?? 'value'
    return (
      <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
        editMode={editMode}
        onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
        onRemove={removeWidget}
      >
        <DashboardValorKPI data={result.data} fieldKey={fieldKey} fieldType="number" />
      </DashboardPainelContainer>
    )
  }, [editMode, removeWidget, allDerived, kpisData, prevKpisData, trendData, loadingData, slicers, setPeriod, fieldLabels])

  function handleQueryBuilderSave(spec: WidgetQuerySpec, title: string, chartType: ChartType) {
    const id = `custom_${Date.now()}`
    addWidget({
      id,
      title,
      chart_type: chartType,
      query_spec: spec,
      position: { x: 0, y: gridBottom, w: chartType === 'KPI_CARD' ? 3 : 6, h: chartType === 'KPI_CARD' ? 2 : 3 },
    })
    setQueryBuilderOpen(false)
    triggerWidgetAddedFX(id, title)
  }

  const STATUS_OPTIONS = ['rascunho', 'em_cotacao', 'aguardando_aprovacao', 'aprovada']

  const STATUS_LABELS_TOOLBAR: Record<string, string> = {
    rascunho: 'Rascunho',
    em_cotacao: 'Em Cotação',
    aguardando_aprovacao: 'Pendente Aprovação',
    aprovada: 'Aprovadas',
  }

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  const STATUS_COLORS_HEX: Record<string, string> = {
    rascunho: '#94a3b8',
    em_cotacao: '#818cf8',
    aguardando_aprovacao: '#fbbf24',
    aprovada: '#22c55e',
  }

  const STATUS_ACTIVE_COLORS = Object.fromEntries(
    STATUS_OPTIONS.map(opt => {
      const cor = STATUS_COLORS_HEX[opt] ?? '#94a3b8'
      return [opt, { bg: hexToRgba(cor, 0.15), border: cor, text: cor }]
    })
  )

  return (
    <div className="bid-frete-page-shell" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '1rem' }}>

      {/* ── Onboarding Banner ── */}
      <div style={onboardingBannerStyle}>
        <div style={onboardingBannerContent}>
          <span style={onboardingBannerTitle}>Este dashboard é seu.</span>
          <span style={onboardingBannerText}>
            Adicione KPIs de frete, monitore adjudicações, mova seções e crie widgets customizados.
          </span>
          <div style={onboardingBannerActions}>
            <button
              type="button"
              style={onboardingBtnAccent}
              onClick={() => setSuggestionsOpen(true)}
            >
              <RocketLaunch size={13} weight="fill" />
              Explorar sugestões
            </button>
            <button
              type="button"
              style={onboardingBtnGhost}
              onClick={() => { setEditMode(true); setQueryBuilderOpen(true) }}
            >
              Criar Dashboard →
            </button>
          </div>
        </div>
      </div>

      <DashboardBarraFerramentas
        slicers={slicers}
        onPeriodChange={setPeriod}
        onStatusChange={setStatusFilter}
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
        editMode={editMode}
        onEditModeChange={setEditMode}
        statusOptions={STATUS_OPTIONS}
        statusLabels={STATUS_LABELS_TOOLBAR}
        statusActiveColors={STATUS_ACTIVE_COLORS}
        statusCounts={kpisData ? {
          todos: (kpisData.cotacoes_status['RASCUNHO'] ?? 0) +
                 (kpisData.cotacoes_status['ENVIADA_FORNECEDORES'] ?? 0) +
                 (kpisData.cotacoes_status['EM_COTACAO'] ?? 0) +
                 (kpisData.cotacoes_status['AGUARDANDO_APROVACAO'] ?? 0) +
                 (kpisData.cotacoes_status['APROVADA'] ?? 0) +
                 (kpisData.cotacoes_status['REPROVADA'] ?? 0) +
                 (kpisData.cotacoes_status['CANCELADA'] ?? 0) +
                 (kpisData.cotacoes_status['FALTA_INFORMACAO'] ?? 0) +
                 (kpisData.cotacoes_status['EXPIRADA'] ?? 0),
          rascunho:             kpisData.cotacoes_status['RASCUNHO'] ?? 0,
          em_cotacao:           (kpisData.cotacoes_status['EM_COTACAO'] ?? 0) + (kpisData.cotacoes_status['ENVIADA_FORNECEDORES'] ?? 0),
          aguardando_aprovacao: kpisData.cotacoes_status['AGUARDANDO_APROVACAO'] ?? 0,
          aprovada:             kpisData.cotacoes_status['APROVADA'] ?? 0,
        } : undefined}
        compactStatus={compactStatus}
        onAddWidget={undefined}
      />

      {/* Seletor de Painéis */}
      {paineis.length > 0 && (
        <div style={sty.painelBar}>
          <DndContext sensors={painelSensors} collisionDetection={closestCenter} onDragEnd={handlePainelDragEnd}>
            <SortableContext
              items={paineis.filter(p => p.is_visivel).map(p => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              {paineis.filter(p => p.is_visivel).map(p => (
                <SortableTabWrapper key={p.id} id={p.id}>
                  {renamingId === p.id ? (
                    <form
                      style={sty.painelNovoForm}
                      onSubmit={(e) => { e.preventDefault(); handleRenomearPainel(p.id, renameValue) }}
                      onPointerDown={e => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => handleRenomearPainel(p.id, renameValue)}
                        onKeyDown={e => { if (e.key === 'Escape') { setRenamingId(null); renameInFlightRef.current = null } }}
                        style={sty.painelRenameInput}
                        maxLength={60}
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      style={p.id === painelAtualId ? sty.painelTabAtivo : sty.painelTab}
                      onClick={() => handleTrocarPainel(p.id)}
                      onDoubleClick={() => { renameInFlightRef.current = null; setRenamingId(p.id); setRenameValue(p.nome) }}
                      onPointerDown={e => e.stopPropagation()}
                    >
                      <span style={sty.painelTabInner}>
                        {p.nome}
                        <span
                          role="button"
                          aria-label="Opções do painel"
                          style={sty.painelMenuBtn}
                          onPointerDown={e => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); setMenuPainelId(prev => prev === p.id ? null : p.id); setDeletingId(null) }}
                        >
                          <DotsThree size={14} weight="bold" />
                        </span>
                      </span>
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {menuPainelId === p.id && (
                    <div style={sty.painelMenuDropdown} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                      {deletingId === p.id ? (
                        <div style={{ padding: '0.5rem 0.75rem' }}>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 0.5rem' }}>
                            Excluir <strong style={{ color: '#fff' }}>{p.nome}</strong>?
                          </p>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button type="button" style={sty.painelNovoBtnOk} onClick={() => handleDeletarPainel(p.id)}>
                              Confirmar
                            </button>
                            <button type="button" style={sty.painelNovoBtnCancel} onClick={() => setDeletingId(null)}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            style={sty.painelMenuItem}
                            onClick={() => { renameInFlightRef.current = null; setRenamingId(p.id); setRenameValue(p.nome); setMenuPainelId(null) }}
                          >
                            <PencilSimple size={13} />
                            Renomear
                          </button>
                          <button
                            type="button"
                            style={paineis.length <= 1 ? { ...sty.painelMenuItemDanger, opacity: 0.35, cursor: 'default' } : sty.painelMenuItemDanger}
                            onClick={() => paineis.length > 1 && setDeletingId(p.id)}
                            disabled={paineis.length <= 1}
                            title={paineis.length <= 1 ? 'Não é possível excluir o único painel' : ''}
                          >
                            <Trash size={13} />
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </SortableTabWrapper>
              ))}
            </SortableContext>
          </DndContext>

          {/* Criar Novo Painel */}
          {criandoPainel ? (
            <form
              style={sty.painelNovoForm}
              onSubmit={(e) => {
                e.preventDefault()
                const nome = novoNomePainel.trim()
                if (!nome) return
                if (painelAtualId) salvarWidgetsPainelAtual(painelAtualId, widgets)
                paineisDashboardApi.criar(nome).then(({ data }) => {
                  salvarWidgetsPainelAtual(data.id, [])
                  setPaineis([...paineis, data])
                  setPainelAtual(data.id)
                  setNovoNomePainel('')
                  setCriandoPainel(false)
                }).catch(() => {})
              }}
            >
              <input
                autoFocus
                type="text"
                placeholder="Nome do painel"
                value={novoNomePainel}
                onChange={(e) => setNovoNomePainel(e.target.value)}
                style={sty.painelNovoInput}
                maxLength={60}
              />
              <button type="submit" style={sty.painelNovoBtnOk}>Criar</button>
              <button type="button" style={sty.painelNovoBtnCancel} onClick={() => { setCriandoPainel(false); setNovoNomePainel('') }}>
                <X size={11} />
              </button>
            </form>
          ) : (
            <button type="button" style={sty.painelAddBtn} onClick={() => setCriandoPainel(true)} title="Novo painel">
              +
            </button>
          )}
        </div>
      )}

      <DashboardGrid
        widgets={activeWidgets}
        renderWidget={renderWidget}
        editMode={editMode}
        onLayoutChange={(layouts) => {
          if (!editMode) return
          const lg = layouts.lg ?? []
          updateLayout(lg.map((item) => ({
            id: item.i,
            position: { x: item.x, y: item.y, w: item.w, h: item.h },
          })))
        }}
      />

      <DashboardConstrutorConsulta
        aberto={queryBuilderOpen}
        availableFields={DASHBOARD_CATALOG}
        onSave={handleQueryBuilderSave}
        onCancel={() => setQueryBuilderOpen(false)}
      />

      <DashboardPainelEditarModal
        widget={editingWidget}
        aberto={editModalOpen}
        onFechar={() => { setEditModalOpen(false); setEditingWidget(null) }}
        onSalvar={(patch) => { if (editingWidget) updateWidget(editingWidget.id, patch) }}
        fieldLabels={fieldLabels}
      />

      {suggestionsOpen && (
        <DashboardPainelSugestoes
          suggestions={suggestions}
          derivedMetrics={allDerived}
          onAdd={handleAddWidgetFromSuggestions}
          onClose={() => setSuggestionsOpen(false)}
          onCreateCustom={() => { setEditMode(true); setQueryBuilderOpen(true) }}
        />
      )}
    </div>
  )
}

// ── Estilos onboarding banner ─────────────────────────────────────────────────
const onboardingBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '14px 20px',
  marginBottom: '1rem',
  background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
  border: '1px solid rgba(99,102,241,0.25)',
  borderRadius: 'var(--radius-lg)',
}

const onboardingBannerContent: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem 1rem',
}

const onboardingBannerTitle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--text-primary)',
}

const onboardingBannerText: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
}

const onboardingBannerActions: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
}

const onboardingBtnAccent: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.875rem',
  fontWeight: 600,
  padding: '6px 14px',
  borderRadius: '9999px',
  background: 'var(--accent)',
  border: '1px solid var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 0 14px rgba(99,102,241,0.45)',
}

const onboardingBtnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.875rem',
  fontWeight: 600,
  padding: '6px 14px',
  borderRadius: '9999px',
  background: 'transparent',
  border: '1px solid rgba(99,102,241,0.4)',
  color: 'var(--accent)',
  cursor: 'pointer',
}

// ── Estilos section label ─────────────────────────────────────────────────────
const sectionLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  height: '100%',
  padding: '0 4px',
}

const sectionLabelTextStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  whiteSpace: 'nowrap',
}

const sectionLabelLineStyle: React.CSSProperties = {
  flex: 1,
  height: '1px',
  background: 'var(--border-default)',
}
