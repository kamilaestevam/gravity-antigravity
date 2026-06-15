/**
 * dashboard.tsx — View Dashboard do produto BID Frete Internacional
 *
 * Totalmente configurável e customizável com painéis, drag-and-drop,
 * Gabi AI insights, e construtor de consultas global.
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  resolverIdsWorkspacesParaApi,
  useEscopoWorkspacesBidFreteInternacional,
} from '../shared/useEscopoWorkspacesBidFreteInternacional'
import { useShellStore } from '@shell'
import {
  DashboardGrid,
  DashboardPainelContainer,
  DashboardWidgetLinha,
  DashboardWidgetBarras,
  DashboardWidgetDistribuicao,
  DashboardPainelEditarModal,
  DashboardPainelSugestoes,
  DashboardValorKPI,
} from '@nucleo/dashboard'
import type { PeriodOption } from '@nucleo/dashboard'
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
  Timer, TrendUp,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import './dashboard.css'
import '../shared/lista-bid-frete-internacional-layout.css'
import '../components/dashboard/BarraFerramentasDashboardBidFrete.css'
import { DashboardConstrutorConsulta } from '@nucleo/query-builder-global'
import { BarraFerramentasDashboardBidFrete } from '../components/dashboard/BarraFerramentasDashboardBidFrete'
import { BidFreteDashboardFaixaPaineis } from '../components/BidFreteDashboardFaixaPaineis'
import { useDashboardPainelBidFrete } from '../shared/useDashboardPainelBidFrete'
import { widgetEstaVisivel, ordenarWidgetsLista } from '../shared/dashboardWidgetVisibilidade'
import { rotuloPeriodoDashboard, widgetUsaPeriodoProprio } from '../shared/dashboardPeriodoUtil'

import { BUILT_IN_DERIVED, computeDerived } from '../shared/derivedMetrics'
import type { EnrichedCatalogField } from '@nucleo/dashboard'
import { useBidFreteDashboardVisao } from '../shared/bid-frete-dashboard-visao-context'
import type { DashboardKpis, DashboardTrendBucket, GabiInsightItem, DashboardPainel } from '../shared/api'
import type { StatusCotacao } from '../shared/types'

// ── Mock do useTrackBehavior para evitar dependência externa ───────────────────
const useTrackBehavior = () => {
  return {
    trackWidget: (id: string) => console.log('[Track] Widget visualizado:', id),
    trackInsight: (id: string) => console.log('[Track] Insight clicado:', id),
  }
}

interface WidgetBuildDeps {
  statusLabels: Record<string, string>
  catalogByKey: Record<string, EnrichedCatalogField>
}

// ── Converte resposta da API em WidgetResult ──────────────────────────────────
function buildWidgetResult(
  widget: DashboardWidgetConfig,
  kpis: DashboardKpis,
  trend: DashboardTrendBucket[],
  allDerived: DerivedMetric[],
  deps: WidgetBuildDeps,
): WidgetResult {
  const { statusLabels, catalogByKey } = deps
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
            label: statusLabels[statusKey] ?? statusKey,
            value: Number(val),
            unit: 'number' as FieldUnitType,
          }
        })
        .filter(s => s.value > 0)
      return { data: {}, slices, chartType: 'DISTRIBUTION', partial: false, cached: false, computed_at: now }
    }

    const slices: WidgetDistributionSlice[] = fields.map(f => {
      const catalog = catalogByKey[f.key]
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
        const cat = catalogByKey[f.key]
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

// ── Configuração visual por widget no BID Frete Internacional ────────────────
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
  gabi_insights:           { accentColor: VIOLET, icone: <RocketLaunch   size={15} weight="duotone" /> },
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

// ── Componente Principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation()
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const idsWorkspacesEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.idsWorkspacesEscopo)
  const escopoHidratado = useEscopoWorkspacesBidFreteInternacional(s => s.hidratado)
  const versaoEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.versaoEscopo)
  const idsWorkspacesFiltro = useMemo(
    () => resolverIdsWorkspacesParaApi(idsWorkspacesEscopo, idWorkspaceAtivo ?? ''),
    [idsWorkspacesEscopo, idWorkspaceAtivo],
  )

  const visao = useBidFreteDashboardVisao()
  const {
    catalog,
    catalogByKey,
    dashboardApi,
    paineisDashboardApi,
    generateSuggestions,
    buildClientInsights,
    widgetNavRoute,
    listaRoute,
  } = visao
  const useDashboardStoreHook = visao.useDashboardStore
  const widgetBuildDeps = useMemo(
    () => ({ statusLabels: visao.statusLabels, catalogByKey }),
    [visao.statusLabels, catalogByKey],
  )

  const {
    widgets, addWidget, removeWidget, updateWidget, updateLayout,
    toggleWidgetVisibilidade, reordenarWidgets,
    selecionarTodosWidgetsVisiveis, restaurarVisibilidadePadraoWidgets,
    slicers, setPeriod, setStatusFilter,
    activeFilters, clearFilters,
    widgetLayoutInteracao, setWidgetLayoutInteracao, clearWidgetLayoutInteracao,
    queryBuilderOpen, setQueryBuilderOpen,
    userDerivedMetrics,
    painelAtualId, setPaineis, setPainelAtual, salvarWidgetsPainelAtual,
  } = useDashboardStoreHook()

  const podeEditarDashboard = true // Hardcoded como true para o BID Frete Internacional

  const navigate = useNavigate()
  const { trackWidget, trackInsight } = useTrackBehavior()
  const { addNotification } = useShellStore()

  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [editingWidget,   setEditingWidget]   = useState<DashboardWidgetConfig | null>(null)
  const [editModalOpen,   setEditModalOpen]   = useState(false)

  const [kpisData,     setKpisData]     = useState<DashboardKpis | null>(null)
  const [prevKpisData, setPrevKpisData] = useState<DashboardKpis | null>(null)
  const [kpisPorPeriodo, setKpisPorPeriodo] = useState<Record<string, DashboardKpis>>({})

  const [trendData,    setTrendData]    = useState<DashboardTrendBucket[]>([])
  const [insightsData, setInsightsData] = useState<GabiInsightItem[]>([])
  const [loadingData,  setLoadingData]  = useState(true)

  const {
    paineis: paineisDashboard,
    painelAtualId: painelDashboardAtualId,
    carregando: carregandoPaineis,
    erroCarregar: erroCarregarPaineis,
    carregarPaineis: recarregarPaineisDashboard,
    setPaineis: setPaineisDashboard,
    setPainelAtualId: setPainelDashboardAtualId,
  } = useDashboardPainelBidFrete({
    paineisDashboardApi,
    setPaineisStore: setPaineis,
    setPainelAtualStore: setPainelAtual,
    painelAtualIdStore: painelAtualId,
  })

  const handleTrocarPainel = useCallback((novoId: string) => {
    if (novoId === painelDashboardAtualId) return
    if (painelDashboardAtualId) salvarWidgetsPainelAtual(painelDashboardAtualId, widgets)
    setPainelDashboardAtualId(novoId)
  }, [painelDashboardAtualId, widgets, salvarWidgetsPainelAtual, setPainelDashboardAtualId])

  const handleCriarPainelDashboard = useCallback(async (nome: string): Promise<boolean> => {
    try {
      if (painelDashboardAtualId) salvarWidgetsPainelAtual(painelDashboardAtualId, widgets)
      const { data } = await paineisDashboardApi.criar(nome)
      salvarWidgetsPainelAtual(data.id, [])
      setPaineisDashboard([...paineisDashboard, data])
      setPainelDashboardAtualId(data.id)
      addNotification({
        type: 'success',
        message: t('bid_frete_internacional.dashboard.painel_criado_sucesso', {
          defaultValue: 'Painel "{{nome}}" criado.',
          nome: data.nome,
        }),
      })
      return true
    } catch {
      addNotification({
        type: 'error',
        message: t('bid_frete_internacional.dashboard.painel_criado_erro', {
          defaultValue: 'Não foi possível salvar o painel.',
        }),
      })
      return false
    }
  }, [
    painelDashboardAtualId, widgets, paineisDashboard, salvarWidgetsPainelAtual,
    setPaineisDashboard, setPainelDashboardAtualId, addNotification, t, paineisDashboardApi,
  ])

  useEffect(() => {
    if (painelDashboardAtualId) salvarWidgetsPainelAtual(painelDashboardAtualId, widgets)
  }, [widgets, painelDashboardAtualId, salvarWidgetsPainelAtual])

  const periodosWidgets = useMemo(() => {
    const set = new Set<string>([slicers.period])
    for (const w of widgets) {
      if (w.config?.periodLocked === true && w.query_spec.filters.period) {
        set.add(w.query_spec.filters.period)
      } else if (w.query_spec.filters.period === '12m') {
        set.add('12m')
      }
    }
    return [...set]
  }, [widgets, slicers.period])

  const resolverCustomRange = useCallback((period: string) => {
    if (!period.startsWith('custom:')) return undefined
    const [, s, e] = period.split(':')
    return s && e ? { from: `${s}T00:00:00.000Z`, to: `${e}T23:59:59.999Z` } : undefined
  }, [])

  const handlePeriodChange = useCallback((period: string) => {
    setPeriod(period)
  }, [setPeriod])

  const handleClearWidgetPeriod = useCallback((widgetId: string) => {
    const alvo = widgets.find(w => w.id === widgetId)
    if (!alvo) return
    updateWidget(widgetId, {
      query_spec: {
        ...alvo.query_spec,
        filters: { ...alvo.query_spec.filters, period: slicers.period },
      },
      config: { ...alvo.config, periodLocked: false },
    })
  }, [updateWidget, widgets, slicers.period])

  const handleClearFiltersComPeriodo = useCallback(() => {
    clearFilters()
    handlePeriodChange('30d')
    setStatusFilter([])
    for (const w of widgets) {
      if (w.config?.periodLocked) handleClearWidgetPeriod(w.id)
    }
  }, [clearFilters, handlePeriodChange, setStatusFilter, widgets, handleClearWidgetPeriod])

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
    () => Object.fromEntries(catalog.map(f => [f.key, f.label])),
    [catalog],
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
    [widgets, allDerived, gridBottom, generateSuggestions],
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
    if (!escopoHidratado) return
    setLoadingData(true)
    setKpisData(null)
    setPrevKpisData(null)
    setTrendData([])
    setKpisPorPeriodo({})
    setInsightsData([])

    const prevRange = getPrevDateRange(slicers.period)
    const customRangeGlobal = resolverCustomRange(slicers.period)
    const extraPeriodos = periodosWidgets.filter(p => p !== slicers.period)

    Promise.all([
      dashboardApi.kpis(slicers.period, customRangeGlobal, idsWorkspacesFiltro),
      dashboardApi.kpis(slicers.period, prevRange, idsWorkspacesFiltro),
      dashboardApi.trend('12m', 'month', idsWorkspacesFiltro),
      dashboardApi.insights(slicers.period, customRangeGlobal).catch(() => ({ period: '', role: '', insights: [] as GabiInsightItem[] })),
      Promise.all(
        extraPeriodos.map(async (period) => {
          const kpis = await dashboardApi.kpis(period, resolverCustomRange(period), idsWorkspacesFiltro)
          return [period, kpis] as const
        }),
      ),
    ])
      .then(([kpis, prevKpis, trend, insightsRes, extras]) => {
        setKpisData(kpis)
        setPrevKpisData(prevKpis)
        setTrendData(trend.value)
        setInsightsData(insightsRes.insights)
        const mapa: Record<string, DashboardKpis> = { [slicers.period]: kpis }
        for (const [period, dados] of extras) mapa[period] = dados
        setKpisPorPeriodo(mapa)
      })
      .catch(err => console.error('[Dashboard] Erro ao carregar dados:', err))
      .finally(() => setLoadingData(false))
  }, [slicers.period, escopoHidratado, idsWorkspacesFiltro, versaoEscopo, dashboardApi, periodosWidgets, resolverCustomRange])

  const periodOptions = useMemo((): PeriodOption[] => [
    { value: 'tudo', label: t('nucleo.dashboard.periodo.tudo', { defaultValue: 'Tudo' }) },
    { value: '7d', label: t('nucleo.dashboard.periodo.ultimos_7_dias') },
    { value: '30d', label: t('nucleo.dashboard.periodo.ultimos_30_dias') },
    { value: '6m', label: t('nucleo.dashboard.periodo.ultimos_6_meses', { defaultValue: '6 meses' }) },
    { value: '1a', label: t('nucleo.dashboard.periodo.ultimo_ano', { defaultValue: '1 ano' }) },
    { value: '90d', label: t('nucleo.dashboard.periodo.ultimos_90_dias') },
    { value: '12m', label: t('nucleo.dashboard.periodo.ultimos_12_meses') },
    { value: 'current_month', label: t('nucleo.dashboard.periodo.mes_atual') },
    { value: 'current_year', label: t('nucleo.dashboard.periodo.ano_atual') },
    { value: 'custom', label: t('nucleo.dashboard.periodo.personalizado') },
  ], [t])

  const activeWidgets = useMemo(() =>
    ordenarWidgetsLista(widgets)
      .filter(widgetEstaVisivel)
      .map(w => {
        const locked = w.config?.periodLocked === true
        const filters = locked
          ? w.query_spec.filters
          : w.query_spec.filters.period === '12m'
            ? w.query_spec.filters
            : { ...w.query_spec.filters, period: slicers.period }
        return {
          ...w,
          query_spec: { ...w.query_spec, filters },
        }
      }), [widgets, slicers.period],
  )

  const buildPainelWidgetProps = useCallback((widget: DashboardWidgetConfig) => {
    const chartType = widget.chart_type
    const widgetPeriod = widget.query_spec.filters.period
    const locked = widget.config?.periodLocked === true
    const periodoProprio = widgetUsaPeriodoProprio(widgetPeriod, slicers.period, locked)
    const periodoRotuloWidget = periodoProprio
      ? rotuloPeriodoDashboard(widgetPeriod, periodOptions, t('nucleo.dashboard.periodo.personalizado'))
      : undefined

    const layoutModo = widgetLayoutInteracao?.widgetId === widget.id
      ? widgetLayoutInteracao.modo
      : null

    const periodoProps = chartType === 'SECTION_LABEL' || chartType === 'GABI_INSIGHTS'
      ? {}
      : periodoProprio
        ? {
            periodoFiltroRotulo: periodoRotuloWidget,
            onLimparPeriodoWidget: podeEditarDashboard
              ? () => handleClearWidgetPeriod(widget.id)
              : undefined,
          }
        : {}

    const menuProps = podeEditarDashboard
      ? {
          habilitarMenuOpcoes: true,
          layoutModo,
          onEdit: (w: DashboardWidgetConfig) => {
            const stored = widgets.find(x => x.id === w.id) ?? w
            setEditingWidget(stored)
            setEditModalOpen(true)
          },
          onRemove: removeWidget,
          onMover: () => setWidgetLayoutInteracao({ widgetId: widget.id, modo: 'moving' }),
          onRedimensionar: () => setWidgetLayoutInteracao({ widgetId: widget.id, modo: 'resizing' }),
          onConcluirLayout: clearWidgetLayoutInteracao,
        }
      : {}

    return { ...periodoProps, ...menuProps }
  }, [
    widgets,
    slicers.period,
    periodOptions,
    t,
    widgetLayoutInteracao,
    podeEditarDashboard,
    handleClearWidgetPeriod,
    removeWidget,
    setWidgetLayoutInteracao,
    clearWidgetLayoutInteracao,
  ])

  const renderWidget = useCallback((widget: DashboardWidgetConfig) => {
    const chartType = widget.chart_type
    const widgetPeriod = widget.query_spec.filters.period
    const kpisWidget = (kpisPorPeriodo[widgetPeriod] ?? kpisData) as DashboardKpis | null
    const painelProps = buildPainelWidgetProps(widget)
    const emInteracaoLayout = widgetLayoutInteracao?.widgetId === widget.id

    // ── GABI_INSIGHTS — menu ⋮ mover / tamanho / excluir (paridade Pedido) ──
    if (chartType === 'GABI_INSIGHTS') {
      const insights = insightsData.length > 0
        ? insightsData
        : kpisData
          ? buildClientInsights(kpisData, prevKpisData)
          : []
      const gabiVisual = WIDGET_VISUAL.gabi_insights ?? {}
      const gabiResult: WidgetResult = {
        data: {},
        chartType: 'GABI_INSIGHTS',
        partial: false,
        cached: false,
        computed_at: new Date().toISOString(),
      }
      const controlesCarrossel = (
        <div className="dp-gabi-header-right db-no-drag">
          <button
            className="dp-gabi-nav-btn"
            type="button"
            onClick={() => scrollGabi('left')}
            aria-label={t('bid_frete_internacional.dashboard.gabi_insight_anterior', { defaultValue: 'Insight anterior' })}
          >
            <CaretLeft size={12} weight="bold" />
          </button>
          <button
            className="dp-gabi-nav-btn"
            type="button"
            onClick={() => scrollGabi('right')}
            aria-label={t('bid_frete_internacional.dashboard.gabi_proximo_insight', { defaultValue: 'Próximo insight' })}
          >
            <CaretRight size={12} weight="bold" />
          </button>
          <span className="dp-gabi-live-badge">
            <span className="dp-gabi-live-dot" />
            {t('bid_frete_internacional.dashboard.gabi_ao_vivo', { defaultValue: 'ao vivo' })}
          </span>
        </div>
      )

      return (
        <div key={widget.id} className="dp-gabi-painel-host">
          <DashboardPainelContainer
            widget={widget}
            result={gabiResult}
            loading={loadingData}
            error={null}
            accentColor={gabiVisual.accentColor}
            icone={gabiVisual.icone}
            periodoControle={controlesCarrossel}
            {...painelProps}
          >
            <div
              className="dp-gabi-card dp-gabi-card--embedded"
              onMouseEnter={() => setGabiPaused(true)}
              onMouseLeave={() => setGabiPaused(false)}
            >
              <div className="dp-gabi-watermark" aria-hidden="true">
                <RocketLaunch size={120} weight="fill" />
              </div>
              <div className="dp-gabi-main">
                <div className="dp-gabi-track" ref={gabiCarouselRef}>
                  {loadingData
                    ? [0, 1, 2, 3].map(i => (
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
                      ))}
                </div>
              </div>
            </div>
          </DashboardPainelContainer>
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

    const result = kpisWidget
      ? buildWidgetResult(widget, kpisWidget, trendData, allDerived, widgetBuildDeps)
      : { data: {}, chartType: widget.chart_type, partial: true, cached: false, computed_at: new Date().toISOString() }
    const fields = widget.query_spec.fields
    const isDerived = !!widget.config?.derivedMetricId

    // ── Estado vazio ─────────────────────────────────────────────────────────
    if (!loadingData && kpisWidget && isResultEmpty(result, isDerived)) {
      return (
        <DashboardPainelContainer
          key={widget.id}
          widget={widget}
          result={result}
          loading={false}
          error={null}
          {...painelProps}
        >
          <WidgetEmptyGabi
            widget={widget}
            fieldNames={fields.map((f: { key: string }) => fieldLabels[f.key] ?? f.key)}
            currentPeriod={slicers.period}
            onExpandPeriod={handlePeriodChange}
            onEdit={() => {
              const stored = widgets.find(x => x.id === widget.id) ?? widget
              setEditingWidget(stored)
              setEditModalOpen(true)
            }}
            onRemove={() => removeWidget(widget.id)}
          />
        </DashboardPainelContainer>
      )
    }

    // ── DISTRIBUTION ────────────────────────────────────────────────────────
    if (chartType === 'DISTRIBUTION') {
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          {...painelProps}
        >
          <DashboardWidgetDistribuicao slices={result.slices ?? []} />
        </DashboardPainelContainer>
      )
    }

    // ── LINE / AREA ──────────────────────────────────────────────────────────
    if (chartType === 'LINE' || chartType === 'AREA') {
      const catalogFields = fields.map(f => catalogByKey[f.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: LineSeriesConfig[] = fields.map((f, i) => {
        const cat = catalogByKey[f.key]
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
          {...painelProps}
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
      const catalogFields = fields.map(f => catalogByKey[f.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: BarSeriesConfig[] = fields.map((f, i) => {
        const cat = catalogByKey[f.key]
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
          {...painelProps}
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
      const cat = catalogByKey[fieldKey]
      const dm = widget.config?.derivedMetricId
        ? allDerived.find(m => m.id === widget.config!.derivedMetricId)
        : undefined
      const fieldType: FieldUnitType = dm?.fieldType ?? (cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number')
      const visual   = WIDGET_VISUAL[widget.id] ?? {}
      const navRoute = widgetNavRoute[widget.id]
      const currentVal = Number(kpisWidget?.[fieldKey] ?? 0)
      const prevVal    = Number(prevKpisData?.[fieldKey] ?? 0)
      const deltaInfo  = computeDelta(currentVal, prevVal)
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          {...painelProps}
          accentColor={visual.accentColor}
          icone={visual.icone}
          clickable={!!navRoute}
          onClick={() => {
            trackWidget(widget.id)
            if (navRoute && !emInteracaoLayout) navigate(navRoute)
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
        {...painelProps}
      >
        <DashboardValorKPI data={result.data} fieldKey={fieldKey} fieldType="number" />
      </DashboardPainelContainer>
    )
  }, [
    buildPainelWidgetProps,
    widgetLayoutInteracao,
    kpisPorPeriodo,
    kpisData,
    prevKpisData,
    trendData,
    loadingData,
    insightsData,
    buildClientInsights,
    allDerived,
    widgetBuildDeps,
    catalogByKey,
    fieldLabels,
    widgets,
    slicers.period,
    handlePeriodChange,
    removeWidget,
    widgetNavRoute,
    navigate,
    trackWidget,
    trackInsight,
    scrollGabi,
    t,
  ])

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

  const getWidgetLabel = useCallback(
    (widget: DashboardWidgetConfig) => widget.title,
    [],
  )

  const temWidgets = widgets.length > 0

  return (
    <div className="bid-frete-page-shell bfd-dashboard" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '1rem' }}>

      <div className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada bfd-dashboard-toolbar-wrapper">
        <div className="lp-tabela-chrome bfd-dashboard-chrome">
          <BidFreteDashboardFaixaPaineis
            paineis={paineisDashboard}
            painelAtualId={painelDashboardAtualId}
            setPaineis={setPaineisDashboard}
            setPainelAtualId={setPainelDashboardAtualId}
            onTrocarPainel={handleTrocarPainel}
            onCriarPainel={handleCriarPainelDashboard}
            carregando={carregandoPaineis}
          />
          {erroCarregarPaineis && (
            <div
              role="alert"
              className="bfd-dashboard-paineis-erro"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                color: 'var(--gtv-text, #f1f5f9)',
                background: 'rgba(239,68,68,0.1)',
                borderTop: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <span>{erroCarregarPaineis}</span>
              <button
                type="button"
                className="gtv-btn"
                onClick={() => void recarregarPaineisDashboard()}
              >
                {t('comum.tentar_novamente', { defaultValue: 'Tentar novamente' })}
              </button>
            </div>
          )}

          <BarraFerramentasDashboardBidFrete
        temWidgets={temWidgets}
        onboarding={!temWidgets ? {
          onExplorarSugestoes: () => setSuggestionsOpen(true),
          onCriarDoZero: () => setQueryBuilderOpen(true),
        } : undefined}
        slicers={slicers}
        onPeriodChange={handlePeriodChange}
        periodOptions={periodOptions}
        onStatusChange={setStatusFilter}
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
        activeFilters={activeFilters}
        onClearFilters={handleClearFiltersComPeriodo}
        onAbrirSugestoes={podeEditarDashboard ? () => setSuggestionsOpen(true) : undefined}
        onCriarWidgetZero={podeEditarDashboard ? () => setQueryBuilderOpen(true) : undefined}
        widgetsSeletor={temWidgets ? {
          widgets,
          getWidgetLabel,
          onToggleVisibilidade: toggleWidgetVisibilidade,
          onReordenar: reordenarWidgets,
          onSelecionarTodos: selecionarTodosWidgetsVisiveis,
          onRestaurarPadrao: restaurarVisibilidadePadraoWidgets,
        } : undefined}
          />
        </div>
      </div>

      <DashboardGrid
        widgets={activeWidgets}
        renderWidget={renderWidget}
        layoutInteracao={widgetLayoutInteracao}
        onLayoutChange={(layouts) => {
          if (!useDashboardStoreHook.getState().widgetLayoutInteracao) return
          const lg = layouts.lg ?? []
          updateLayout(lg.map((item) => ({
            id: item.i,
            position: { x: item.x, y: item.y, w: item.w, h: item.h },
          })))
        }}
      />

      <DashboardConstrutorConsulta
        aberto={queryBuilderOpen}
        availableFields={catalog}
        periodOptions={periodOptions}
        periodoInicial={slicers.period}
        onSave={handleQueryBuilderSave}
        onCancel={() => setQueryBuilderOpen(false)}
      />

      <DashboardPainelEditarModal
        widget={editingWidget}
        aberto={editModalOpen}
        onFechar={() => { setEditModalOpen(false); setEditingWidget(null) }}
        onSalvar={(patch) => { if (editingWidget) updateWidget(editingWidget.id, patch) }}
        fieldLabels={fieldLabels}
        periodOptions={periodOptions}
      />

      {suggestionsOpen && (
        <DashboardPainelSugestoes
          suggestions={suggestions}
          derivedMetrics={allDerived}
          onAdd={handleAddWidgetFromSuggestions}
          onClose={() => setSuggestionsOpen(false)}
          onCreateCustom={() => setQueryBuilderOpen(true)}
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
