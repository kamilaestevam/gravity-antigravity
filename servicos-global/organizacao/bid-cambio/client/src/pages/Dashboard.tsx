/**
 * Dashboard.tsx — Visão Geral do BID Câmbio (Buyer-side)
 *
 * Estrutura:
 *  1. KPIs de resumo fixos no topo (saving, valor operado, taxa de resposta)
 *  2. Grid dinâmico de widgets configuráveis (DashboardGrid + DashboardPainelContainer)
 *  3. Modo de edição com drag & drop via react-grid-layout
 *  4. DashboardConstrutorConsulta inline para adicionar novos widgets
 *  5. SSE para updates em tempo real
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Phosphor Icons
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChartBar,
  PencilSimple,
  Plus,
  Eye,
  ArrowsClockwise,
  WarningCircle,
  TrendUp,
  CurrencyDollar,
  Percent,
  FloppyDisk,
  X,
} from '@phosphor-icons/react'

import { DashboardGrid } from '@nucleo/dashboard/DashboardGrid/index.js'
import { DashboardPainelContainer } from '@nucleo/dashboard/WidgetContainer/index.js'
import { DashboardWidgetKPI } from '@nucleo/dashboard/widgets/KpiWidget/index.js'
import { DashboardWidgetLinha } from '@nucleo/dashboard/widgets/LineChartWidget/index.js'
import { DashboardWidgetBarras } from '@nucleo/dashboard/widgets/BarChartWidget/index.js'
import {
  useDashboardData,
  useDashboardSSE,
  useDashboardLayout,
  useDashboardStore,
} from '@organizacao/dashboard'
import type { DashboardWidgetConfig, DashboardConfig, GridLayoutItem } from '@organizacao/dashboard'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface KpiResumo {
  saving_total: number
  valor_operado: number
  taxa_resposta: number
}

// ─── Formatação ───────────────────────────────────────────────────────────────

const fmtMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(val)

const fmtPercent = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val) + '%'

function getTenantId(): string {
  return localStorage.getItem('x-id-organizacao') ?? ''
}

function getTenantHeaders(): Record<string, string> {
  const tenantId = getTenantId()
  const userId = localStorage.getItem('x-id-usuario') ?? ''
  return {
    'Content-Type': 'application/json',
    ...(tenantId ? { 'x-id-organizacao': tenantId } : {}),
    ...(userId ? { 'x-id-usuario': userId } : {}),
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ width, height }: { width: string; height: string }) {
  return (
    <div style={{
      width, height,
      borderRadius: 8,
      background: 'var(--bg-elevated, #475569)',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function SkeletonKpiCard() {
  return (
    <div style={{
      background: 'var(--bg-surface, #334155)',
      borderRadius: 12,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <Skeleton width="55%" height="13px" />
      <Skeleton width="40%" height="30px" />
      <Skeleton width="65%" height="12px" />
    </div>
  )
}

function SkeletonWidget() {
  return (
    <div style={{
      background: 'var(--bg-surface, #334155)',
      borderRadius: 12,
      padding: '1.25rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <Skeleton width="55%" height="14px" />
      <Skeleton width="35%" height="32px" />
      <Skeleton width="100%" height="80px" />
    </div>
  )
}

// ─── KPI Card de Resumo ───────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  accentColor?: string
}

function KpiCard({ icon, label, value, sublabel, accentColor = 'var(--accent, #6366f1)' }: KpiCardProps) {
  return (
    <div style={{
      background: 'var(--bg-surface, #334155)',
      borderRadius: 12,
      padding: '1.25rem',
      borderLeft: `3px solid ${accentColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ color: accentColor }}>{icon}</span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted, #64748b)',
        }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}

// ─── Widget Renderer ─────────────────────────────────────────────────────────

function WidgetRenderer({ widget, editMode }: { widget: DashboardWidgetConfig; editMode: boolean }) {
  const { result, loading, error, refetch } = useDashboardData({
    widgetId: widget.id,
    querySpec: widget.query_spec,
    enabled: true,
  })

  const commonProps = {
    title: widget.title,
    loading,
    error: error ?? undefined,
    onRefresh: refetch,
    editMode,
  }

  const chartType = widget.chart_type

  if (chartType === 'KPI_CARD') {
    const value = result?.data?.['value']
    const numericValue = typeof value === 'number' ? value : 0
    return (
      <DashboardPainelContainer {...commonProps}>
        <DashboardWidgetKPI
          value={numericValue}
          label={widget.title}
          config={widget.config}
        />
      </DashboardPainelContainer>
    )
  }

  if (chartType === 'LINE' || chartType === 'AREA') {
    return (
      <DashboardPainelContainer {...commonProps}>
        <DashboardWidgetLinha
          data={result?.data ?? {}}
          config={widget.config}
        />
      </DashboardPainelContainer>
    )
  }

  if (chartType === 'BAR' || chartType === 'BAR_HORIZONTAL') {
    return (
      <DashboardPainelContainer {...commonProps}>
        <DashboardWidgetBarras
          data={result?.data ?? {}}
          horizontal={chartType === 'BAR_HORIZONTAL'}
          config={widget.config}
        />
      </DashboardPainelContainer>
    )
  }

  return (
    <DashboardPainelContainer {...commonProps}>
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted, #64748b)',
        fontSize: '0.875rem',
      }}>
        {loading ? 'Carregando...' : (error ?? `Tipo ${chartType} não suportado`)}
      </div>
    </DashboardPainelContainer>
  )
}

// ─── DashboardConstrutorConsulta Modal ───────────────────────────────────────────────────────

interface QueryBuilderModalProps {
  configId: string
  onClose: () => void
  onSaved: () => void
}

function QueryBuilderModal({ configId, onClose, onSaved }: QueryBuilderModalProps) {
  const [title, setTitle] = useState('')
  const [chartType, setChartType] = useState<'KPI_CARD' | 'LINE' | 'BAR'>('KPI_CARD')
  const [field, setField] = useState('')
  const [period, setPeriod] = useState('30d')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim() || !field.trim()) {
      setError('Preencha o título e o campo de dados.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/dashboard/widgets', {
        method: 'POST',
        headers: getTenantHeaders(),
        body: JSON.stringify({
          config_id: configId,
          title: title.trim(),
          chart_type: chartType,
          widget_type: 'CATALOG',
          widget_key: field.trim(),
          query_spec: {
            fields: [field.trim()],
            operation: 'SUM',
            filters: { period },
          },
          position: { x: 0, y: 9999, w: 3, h: 3 },
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => `Status ${res.status}`)
        throw new Error(text || `Status ${res.status}`)
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar widget')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
    border: '1px solid var(--bg-elevated, #475569)',
    background: 'var(--bg-surface, #334155)',
    color: 'var(--text-primary, #f1f5f9)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-base, #1e293b)',
        borderRadius: 16,
        padding: '2rem',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
            Adicionar Widget
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748b)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Título do widget
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Saving Acumulado"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tipo de gráfico
            </span>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'KPI_CARD' | 'LINE' | 'BAR')}
              style={inputStyle}
            >
              <option value="KPI_CARD">KPI Card</option>
              <option value="LINE">Linha</option>
              <option value="BAR">Barras</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Campo de dados (chave)
            </span>
            <input
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="Ex: saving_total, volume_brl, cotacoes_fechadas"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Período
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={inputStyle}
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </label>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger, #ef4444)', fontSize: '0.875rem' }}>
              <WarningCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 9999,
                fontSize: '0.875rem',
                fontWeight: 600,
                border: '1px solid var(--bg-elevated, #475569)',
                background: 'transparent',
                color: 'var(--text-secondary, #94a3b8)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 9999,
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                background: 'var(--accent, #6366f1)',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FloppyDisk size={15} />
              {saving ? 'Salvando...' : 'Salvar Widget'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useTranslation()
  const tenantId = getTenantId()

  // ─── Estado local ────────────────────────────────────────────────────────────

  const [kpiResumo, setKpiResumo] = useState<KpiResumo | null>(null)
  const [loadingKpis, setLoadingKpis] = useState(true)

  const [loadingConfig, setLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)
  const [showQueryBuilder, setShowQueryBuilder] = useState(false)

  // ─── Store ───────────────────────────────────────────────────────────────────

  const activeConfig = useDashboardStore((s) => s.activeConfig)
  const setActiveConfig = useDashboardStore((s) => s.setActiveConfig)
  const editMode = useDashboardStore((s) => s.editMode)
  const setEditMode = useDashboardStore((s) => s.setEditMode)

  const { handleLayoutChange, saveLayout, isSaving } = useDashboardLayout({
    configId: activeConfig?.id ?? null,
  })

  // ─── Carregar KPIs de resumo (fixos no topo) ─────────────────────────────────

  const carregarKpis = useCallback(async () => {
    setLoadingKpis(true)
    try {
      const res = await fetch('/api/v1/bid-cambio/dashboard/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-id-organizacao': tenantId },
        body: JSON.stringify({
          metrics: ['saving_total', 'valor_operado', 'taxa_resposta'],
          filters: { period: '30d' },
        }),
      })
      if (!res.ok) return
      const body: { data: KpiResumo } = await res.json()
      setKpiResumo(body.data)
    } catch {
      // KPIs de resumo são best-effort — falha silenciosa
    } finally {
      setLoadingKpis(false)
    }
  }, [tenantId])

  // ─── Carregar config do dashboard produto ────────────────────────────────────

  const carregarConfig = useCallback(async () => {
    setLoadingConfig(true)
    setConfigError(null)
    try {
      const res = await fetch('/api/v1/dashboard/configs?mode=PRODUCT&product_id=bid-cambio', {
        headers: getTenantHeaders(),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => `Status ${res.status}`)
        throw new Error(text || `Status ${res.status}`)
      }
      const body: { data: DashboardConfig[] } = await res.json()
      setActiveConfig(body.data?.[0] ?? null)
    } catch (err: unknown) {
      setConfigError(err instanceof Error ? err.message : 'Erro ao carregar configuração')
    } finally {
      setLoadingConfig(false)
    }
  }, [setActiveConfig])

  useEffect(() => {
    void carregarKpis()
    void carregarConfig()
  }, [carregarKpis, carregarConfig])

  // ─── SSE ─────────────────────────────────────────────────────────────────────

  const { connected } = useDashboardSSE({
    dashboardId: activeConfig?.id ?? null,
    onWidgetUpdate: (widgetId) => {
      window.dispatchEvent(
        new CustomEvent('dashboard:widget-update', { detail: { widgetId } }),
      )
    },
  })

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleToggleEdit = () => {
    if (editMode) void saveLayout()
    setEditMode(!editMode)
  }

  const handleWidgetSaved = () => {
    setShowQueryBuilder(false)
    void carregarConfig()
  }

  const handleLayoutChangeWrapper = (layouts: Record<string, GridLayoutItem[]>) => {
    const lgLayout = layouts['lg'] ?? []
    handleLayoutChange(lgLayout)
  }

  // ─── Criar config se não existir ─────────────────────────────────────────────

  const criarConfigEAbrirBuilder = async () => {
    try {
      const res = await fetch('/api/v1/dashboard/configs', {
        method: 'POST',
        headers: getTenantHeaders(),
        body: JSON.stringify({
          name: t('bidcambio.dashboard.titulo'),
          mode: 'PRODUCT',
          product_id: 'bid-cambio',
          is_default: true,
        }),
      })
      if (!res.ok) return
      const body: { data: DashboardConfig } = await res.json()
      setActiveConfig(body.data)
      setShowQueryBuilder(true)
    } catch {
      // Silently fail
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  const widgets = activeConfig?.widgets ?? []
  const hasWidgets = widgets.length > 0

  return (
    <div style={{
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: 'var(--text-primary, #f1f5f9)',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ChartBar size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {t('bidcambio.dashboard.titulo')}
          </h1>
          {connected && (
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--success, #22c55e)',
              background: 'rgba(34,197,94,0.12)',
              padding: '0.2rem 0.5rem',
              borderRadius: 9999,
            }}>
              LIVE
            </span>
          )}
          {isSaving && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>
              Salvando layout...
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button
            onClick={() => { void carregarKpis(); void carregarConfig() }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 9999,
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: '1px solid var(--bg-elevated, #475569)',
              background: 'transparent',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <ArrowsClockwise size={14} />
            {t('comum.atualizar')}
          </button>

          {hasWidgets && (
            <button
              onClick={handleToggleEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 9999,
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: editMode
                  ? '1px solid var(--accent, #6366f1)'
                  : '1px solid var(--bg-elevated, #475569)',
                background: editMode ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: editMode ? 'var(--accent, #6366f1)' : 'var(--text-secondary, #94a3b8)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {editMode ? <Eye size={14} /> : <PencilSimple size={14} />}
              {editMode ? 'Visualizar' : 'Editar Dashboard'}
            </button>
          )}

          {activeConfig && (
            <button
              onClick={() => setShowQueryBuilder(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 9999,
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                background: 'var(--accent, #6366f1)',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Plus size={14} />
              Adicionar Widget
            </button>
          )}
        </div>
      </div>

      {/* ── KPIs de Resumo (sempre visíveis no topo) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {loadingKpis ? (
          <>
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </>
        ) : (
          <>
            <KpiCard
              icon={<TrendUp size={16} />}
              label={t('bidcambio.dashboard.economia_acumulada')}
              value={kpiResumo ? fmtMoney(kpiResumo.saving_total) : '—'}
              sublabel="Últimos 30 dias"
              accentColor="var(--success, #22c55e)"
            />
            <KpiCard
              icon={<CurrencyDollar size={16} />}
              label="Valor Operado"
              value={kpiResumo ? fmtMoney(kpiResumo.valor_operado) : '—'}
              sublabel="Últimos 30 dias"
              accentColor="var(--accent, #6366f1)"
            />
            <KpiCard
              icon={<Percent size={16} />}
              label="Taxa de Resposta"
              value={kpiResumo ? fmtPercent(kpiResumo.taxa_resposta) : '—'}
              sublabel="Corretoras ativas"
              accentColor="var(--warning, #f59e0b)"
            />
          </>
        )}
      </div>

      {/* ── Grid Dinâmico ── */}
      {loadingConfig ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonWidget key={i} />)}
        </div>
      ) : configError ? (
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '2rem',
          textAlign: 'center',
        }}>
          <WarningCircle size={28} style={{ color: 'var(--danger, #ef4444)', marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 600, margin: '0 0 0.5rem' }}>
            Erro ao carregar widgets
          </p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
            {configError}
          </p>
          <button
            onClick={carregarConfig}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 9999,
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              background: 'var(--accent, #6366f1)',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <ArrowsClockwise size={14} />
            Tentar novamente
          </button>
        </div>
      ) : !hasWidgets ? (
        /* ── Empty State ── */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          gap: '1.25rem',
          textAlign: 'center',
          background: 'var(--bg-surface, #334155)',
          borderRadius: 16,
          border: '1.5px dashed var(--bg-elevated, #475569)',
        }}>
          <ChartBar size={48} style={{ color: 'var(--text-muted, #64748b)', opacity: 0.5 }} />
          <div>
            <p style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 600, margin: '0 0 0.5rem', fontSize: '1rem' }}>
              {t('bidcambio.dashboard.sem_dados')}
            </p>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
              Adicione widgets para visualizar métricas de câmbio personalizadas.
            </p>
          </div>
          <button
            onClick={() => {
              if (!activeConfig) void criarConfigEAbrirBuilder()
              else setShowQueryBuilder(true)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.5rem',
              borderRadius: 9999,
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              background: 'var(--accent, #6366f1)',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Plus size={16} />
            Adicionar Primeiro Widget
          </button>
        </div>
      ) : (
        <DashboardGrid
          widgets={widgets}
          editMode={editMode}
          onLayoutChange={handleLayoutChangeWrapper}
          renderWidget={(widget) => (
            <WidgetRenderer widget={widget} editMode={editMode} />
          )}
        />
      )}

      {/* ── DashboardConstrutorConsulta Modal ── */}
      {showQueryBuilder && activeConfig && (
        <QueryBuilderModal
          configId={activeConfig.id}
          onClose={() => setShowQueryBuilder(false)}
          onSaved={handleWidgetSaved}
        />
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  )
}
