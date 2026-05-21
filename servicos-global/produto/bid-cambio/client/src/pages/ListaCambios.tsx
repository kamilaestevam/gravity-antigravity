/**
 * ListaCambios.tsx — Grid principal de cambios do buyer
 * 25+ colunas configuraveis, badges por moeda, selecao, acoes em lote
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  Settings2,
  Check,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  CreditCard,
  Columns3,
  Save,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react'

import { listarCambios, getCambiosTotais, agendarParcelas } from '../shared/api'
import type {
  BidCambioParcela,
  BidCambioMoeda,
  BidCambioStatusCotacao,
  BidCambioStatusParcela,
} from '../shared/types'
import {
  STATUS_COTACAO_LABELS,
  STATUS_COTACAO_BADGE,
  STATUS_PARCELA_LABELS,
  STATUS_PARCELA_BADGE,
  OPERACAO_CAMBIO_LABELS,
  MODALIDADE_CAMBIO_LABELS,
  LIQUIDACAO_LABELS,
  MOEDA_CAMBIO_LABELS,
} from '../shared/types'

// ─── Formatacao ────────────────────────────────────────────────────────────

const fmtMoney = (val: number | null | undefined) =>
  val != null ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) : '—'

const fmtRate = (val: number | null | undefined) =>
  val != null ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(val) : '—'

const dataBR = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

// ─── Badge Colors ──────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

const MOEDA_COLORS: Record<string, string> = {
  USD: '#22c55e', EUR: '#3b82f6', GBP: '#a855f7', JPY: '#ef4444',
  CNY: '#f59e0b', CHF: '#06b6d4', ARS: '#ec4899', CLP: '#f97316',
  MXN: '#14b8a6', COP: '#8b5cf6',
}

// ─── Column Definitions ────────────────────────────────────────────────────

interface ColumnDef {
  key: string
  label: string
  visible: boolean
  width: number
  render: (item: BidCambioParcela) => React.ReactNode
}

function buildColumns(t: (key: string) => string): ColumnDef[] {
  return [
    { key: 'referencia_processo_parcela_bid_cambio', label: t('bidcambio.coluna.dati'), visible: true, width: 120,
      render: (c) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8125rem', color: 'var(--accent, #6366f1)', cursor: 'pointer', textDecoration: 'underline' }}>
          {c.referencia_processo_parcela_bid_cambio}
        </span>
      ),
    },
    { key: 'referencia_cliente_parcela_bid_cambio', label: t('bidcambio.coluna.referencia'), visible: true, width: 120,
      render: (c) => <span>{c.referencia_cliente_parcela_bid_cambio ?? '—'}</span>,
    },
    { key: 'moeda_parcela_bid_cambio', label: t('bidcambio.coluna.moeda'), visible: true, width: 80,
      render: (c) => (
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700,
          color: MOEDA_COLORS[c.moeda_parcela_bid_cambio] ?? 'var(--accent)',
          background: `${MOEDA_COLORS[c.moeda_parcela_bid_cambio] ?? 'var(--accent)'}22`,
          padding: '0.15rem 0.45rem', borderRadius: 9999,
        }}>
          {c.moeda_parcela_bid_cambio}
        </span>
      ),
    },
    { key: 'valor_a_pagar_parcela_bid_cambio', label: t('bidcambio.coluna.valor_me'), visible: true, width: 130,
      render: (c) => <span style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', display: 'block' }}>{fmtMoney(c.valor_a_pagar_parcela_bid_cambio)}</span>,
    },
    { key: 'valor_a_pagar_brl_parcela_bid_cambio', label: t('bidcambio.coluna.valor_brl_est'), visible: true, width: 140,
      render: (c) => <span style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', display: 'block' }}>{fmtMoney(c.valor_a_pagar_brl_parcela_bid_cambio)}</span>,
    },
    { key: 'valor_pago_brl_parcela_bid_cambio', label: t('bidcambio.coluna.valor_aprovado_brl'), visible: true, width: 150,
      render: (c) => <span style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', display: 'block', color: c.valor_pago_brl_parcela_bid_cambio ? 'var(--success, #22c55e)' : undefined }}>{fmtMoney(c.valor_pago_brl_parcela_bid_cambio)}</span>,
    },
    { key: 'taxa_fechamento_parcela_bid_cambio', label: t('bidcambio.coluna.ptax_ref'), visible: true, width: 110,
      render: (c) => <span style={{ fontFamily: "'DM Mono', monospace" }}>{fmtRate(c.taxa_fechamento_parcela_bid_cambio)}</span>,
    },
    { key: 'status_parcela_bid_cambio', label: t('bidcambio.coluna.status'), visible: true, width: 160,
      render: (c) => {
        const badge = STATUS_PARCELA_BADGE[c.status_parcela_bid_cambio] ?? 'default'
        const cores = BADGE_COLORS[badge]
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.2rem 0.6rem', borderRadius: 9999,
            fontSize: '0.75rem', fontWeight: 600,
            background: cores.bg, color: cores.color,
          }}>
            {STATUS_PARCELA_LABELS[c.status_parcela_bid_cambio]}
          </span>
        )
      },
    },
    { key: 'metodo_vencimento_parcela_bid_cambio', label: t('bidcambio.coluna.modalidade'), visible: true, width: 100,
      render: (c) => <span>{c.metodo_vencimento_parcela_bid_cambio ?? '—'}</span>,
    },
    { key: 'numero_parcela_bid_cambio', label: t('bidcambio.coluna.parcelas'), visible: true, width: 80,
      render: (c) => {
        return <span>{c.numero_parcela_bid_cambio}/{c.total_parcelas_parcela_bid_cambio}</span>
      },
    },
    { key: 'numero_pedido_parcela_bid_cambio', label: t('bidcambio.coluna.processo'), visible: false, width: 120,
      render: (c) => <span>{c.numero_pedido_parcela_bid_cambio ?? '—'}</span>,
    },
    { key: 'numero_invoice_parcela_bid_cambio', label: t('bidcambio.coluna.invoice'), visible: false, width: 120,
      render: (c) => <span>{c.numero_invoice_parcela_bid_cambio ?? '—'}</span>,
    },
    { key: 'exportador_parcela_bid_cambio', label: t('bidcambio.coluna.descricao'), visible: false, width: 200,
      render: (c) => <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200, display: 'block' }}>{c.exportador_parcela_bid_cambio ?? '—'}</span>,
    },
    { key: 'data_vencimento_parcela_bid_cambio', label: t('bidcambio.coluna.data_liquidacao'), visible: true, width: 120,
      render: (c) => <span>{dataBR(c.data_vencimento_parcela_bid_cambio)}</span>,
    },
    { key: 'data_criacao_parcela_bid_cambio', label: t('bidcambio.coluna.criado_em'), visible: true, width: 110,
      render: (c) => <span>{dataBR(c.data_criacao_parcela_bid_cambio)}</span>,
    },
    { key: 'data_atualizacao_parcela_bid_cambio', label: t('bidcambio.coluna.atualizado_em'), visible: false, width: 110,
      render: (c) => <span>{dataBR(c.data_atualizacao_parcela_bid_cambio)}</span>,
    },
    { key: 'id_usuario', label: t('bidcambio.coluna.criado_por'), visible: false, width: 120,
      render: (c) => <span>{c.id_usuario ?? '—'}</span>,
    },
    { key: 'banco_corretora_parcela_bid_cambio', label: t('bidcambio.coluna.corretoras_contatadas'), visible: false, width: 150,
      render: (c) => <span>{c.banco_corretora_parcela_bid_cambio ?? '—'}</span>,
    },
  ]
}

// ─── Tab Config ────────────────────────────────────────────────────────────

type FilterTab = 'PENDENTES' | 'AGENDADOS' | 'PAGOS' | 'TODAS'

const TABS: { key: FilterTab; labelKey: string }[] = [
  { key: 'PENDENTES', labelKey: 'bidcambio.tab.pendentes' },
  { key: 'AGENDADOS', labelKey: 'bidcambio.tab.agendados' },
  { key: 'PAGOS',     labelKey: 'bidcambio.tab.pagos'     },
  { key: 'TODAS',     labelKey: 'bidcambio.tab.todas'     },
]

// ─── Componente Principal ──────────────────────────────────────────────────

export default function ListaCambios() {
  const { t } = useTranslation()
  const [cambios, setCambios] = useState<BidCambioParcela[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('TODAS')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [columns, setColumns] = useState<ColumnDef[]>(() => buildColumns(t))
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cambioRes = await listarCambios({ page, limit: 50 })
      setCambios(cambioRes.data)
      setTotalPages(cambioRes.pagination.pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cambios')
    } finally {
      setLoading(false)
    }
  }, [page, busca])

  useEffect(() => { carregar() }, [carregar])

  // ── Filtro por tab ─────────────────────────────────────────────────────

  const filteredCambios = useMemo(() => {
    if (activeTab === 'TODAS') return cambios
    return cambios.filter((c) => {
      if (activeTab === 'PENDENTES') return c.status_parcela_bid_cambio === 'PENDENTE'
      if (activeTab === 'AGENDADOS') return c.status_parcela_bid_cambio === 'AGENDADO'
      if (activeTab === 'PAGOS') return c.status_parcela_bid_cambio === 'PAGO'
      return true
    })
  }, [cambios, activeTab])

  // ── Selection ──────────────────────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredCambios.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredCambios.map(c => c.id_parcela_bid_cambio)))
    }
  }, [filteredCambios, selectedIds])

  const selectedTotal = useMemo(() => {
    return filteredCambios
      .filter(c => selectedIds.has(c.id_parcela_bid_cambio))
      .reduce((sum, c) => sum + (c.valor_a_pagar_brl_parcela_bid_cambio ?? 0), 0)
  }, [filteredCambios, selectedIds])

  // ── Column toggle ──────────────────────────────────────────────────────

  const toggleColumn = useCallback((key: string) => {
    setColumns(prev => prev.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ))
  }, [])

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns])

  // ── Export ─────────────────────────────────────────────────────────────

  const handleExport = useCallback(async (formato: 'csv' | 'xlsx') => {
    try {
      // Export not yet implemented in api.ts
    } catch {
      // silently fail
    }
    setShowExportMenu(false)
  }, [])

  // ── Styles ─────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary, #f1f5f9)',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem',
  }

  const badgePillStyle = (color: string): React.CSSProperties => ({
    fontSize: '0.6875rem', fontWeight: 700, color,
    background: color + '22', padding: '0.2rem 0.6rem',
    borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  })

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: active ? 600 : 500,
    color: active ? 'var(--accent, #6366f1)' : 'var(--text-secondary, #94a3b8)',
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--accent, #6366f1)' : '2px solid transparent',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  })

  const btnPill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1.25rem', borderRadius: 9999,
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
    border: 'none', fontFamily: 'inherit',
  }

  const btnSecondary: React.CSSProperties = {
    ...btnPill,
    background: 'var(--bg-surface, #334155)', color: 'var(--text-secondary, #94a3b8)',
    border: '1px solid var(--bg-elevated, #475569)',
  }

  const btnPrimary: React.CSSProperties = {
    ...btnPill,
    background: 'var(--accent, #6366f1)', color: '#fff',
  }

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading && cambios.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <FileText size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cambios</h1>
        </div>
        <div style={{ background: 'var(--bg-surface, #334155)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={28} style={{ color: 'var(--accent, #6366f1)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '0.75rem' }}>Carregando cambios...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <FileText size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cambios</h1>
        </div>
        <div style={{ background: 'var(--bg-surface, #334155)', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
          <AlertTriangle size={32} style={{ color: 'var(--danger, #ef4444)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>Erro ao carregar</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{error}</p>
          <button onClick={carregar} style={btnPrimary}><RefreshCw size={14} /> Tentar novamente</button>
        </div>
      </div>
    )
  }

  // ─── Empty ─────────────────────────────────────────────────────────────

  if (cambios.length === 0 && !loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <FileText size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cambios</h1>
        </div>
        <div style={{ background: 'var(--bg-surface, #334155)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
          <FileText size={40} style={{ color: 'var(--text-muted, #64748b)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>Nenhum cambio encontrado</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            Crie uma cotacao para comecar a gerenciar seus cambios.
          </p>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={headerStyle}>
          <FileText size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Cambios</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setShowColumnModal(true)} style={btnSecondary} title="Configurar colunas">
            <Columns3 size={14} /> Colunas
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowExportMenu(!showExportMenu)} style={btnSecondary}>
              <Download size={14} /> Exportar <ChevronDown size={12} />
            </button>
            {showExportMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--bg-surface, #334155)', border: '1px solid var(--bg-elevated, #475569)',
                borderRadius: 8, padding: '0.25rem 0', minWidth: 140, zIndex: 50,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}>
                {[
                  { label: 'CSV', fmt: 'csv' as const },
                  { label: 'Excel', fmt: 'xlsx' as const },
                ].map((opt) => (
                  <button
                    key={opt.fmt}
                    onClick={() => handleExport(opt.fmt)}
                    style={{
                      display: 'block', width: '100%', padding: '0.5rem 1rem',
                      fontSize: '0.8125rem', fontWeight: 500, textAlign: 'left',
                      background: 'none', border: 'none', color: 'var(--text-primary, #f1f5f9)',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { window.print() }} style={btnSecondary} title="Imprimir">
            <Printer size={14} />
          </button>
          <button onClick={() => { /* save grid preferences */ }} style={btnSecondary} title="Salvar preferencias">
            <Save size={14} />
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div style={{
        background: 'var(--bg-surface, #334155)',
        borderRadius: '12px 12px 0 0',
        borderBottom: '1px solid var(--bg-elevated, #475569)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem',
      }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabStyle(activeTab === tab.key)}>
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-base, #1e293b)', borderRadius: 9999,
          padding: '0.35rem 0.75rem',
        }}>
          <Search size={14} style={{ color: 'var(--text-muted, #64748b)' }} />
          <input
            type="text"
            placeholder="Buscar numero, moeda..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary, #f1f5f9)', fontSize: '0.8125rem',
              fontFamily: 'inherit', width: 180,
            }}
          />
        </div>
      </div>

      {/* Selection bar */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.1)',
          borderBottom: '1px solid var(--bg-elevated, #475569)',
        }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent, #6366f1)' }}>
            {selectedIds.size} selecionado(s) — Total: R$ {fmtMoney(selectedTotal)}
          </span>
          <button style={{ ...btnPill, background: 'var(--warning, #f59e0b)', color: '#000', padding: '0.35rem 1rem', fontSize: '0.8125rem' }}>
            <CalendarClock size={14} /> Agendar
          </button>
          <button style={{ ...btnPill, background: 'var(--success, #22c55e)', color: '#fff', padding: '0.35rem 1rem', fontSize: '0.8125rem' }}>
            <CreditCard size={14} /> Pagar Cambio
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: 'var(--bg-surface, #334155)',
        borderRadius: selectedIds.size > 0 ? '0' : '0',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-elevated, #475569)' }}>
              <th style={{ padding: '0.75rem 0.5rem', width: 40, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredCambios.length && filteredCambios.length > 0}
                  onChange={toggleSelectAll}
                  style={{ accentColor: 'var(--accent, #6366f1)' }}
                />
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '0.75rem 0.5rem',
                    textAlign: 'left',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted, #64748b)',
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCambios.map((cambio) => (
              <tr
                key={cambio.id_parcela_bid_cambio}
                style={{
                  borderBottom: '1px solid var(--bg-elevated, #475569)',
                  background: selectedIds.has(cambio.id_parcela_bid_cambio) ? 'rgba(99,102,241,0.08)' : undefined,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!selectedIds.has(cambio.id_parcela_bid_cambio)) (e.currentTarget.style.background = 'var(--bg-base, #1e293b)') }}
                onMouseLeave={(e) => { if (!selectedIds.has(cambio.id_parcela_bid_cambio)) (e.currentTarget.style.background = '') }}
              >
                <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(cambio.id_parcela_bid_cambio)}
                    onChange={() => toggleSelect(cambio.id_parcela_bid_cambio)}
                    style={{ accentColor: 'var(--accent, #6366f1)' }}
                  />
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '0.6rem 0.5rem',
                      color: 'var(--text-secondary, #94a3b8)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.render(cambio)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'var(--bg-surface, #334155)',
        borderRadius: '0 0 12px 12px',
        borderTop: '1px solid var(--bg-elevated, #475569)',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
          Pagina {page} de {totalPages}
        </span>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              ...btnSecondary, padding: '0.35rem 0.65rem', fontSize: '0.75rem',
              opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{
              ...btnSecondary, padding: '0.35rem 0.65rem', fontSize: '0.75rem',
              opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Column Selector Modal */}
      {showColumnModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowColumnModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface, #334155)',
              borderRadius: 12, padding: '1.5rem', width: 400, maxHeight: '70vh', overflowY: 'auto',
              border: '1px solid var(--bg-elevated, #475569)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Configurar Colunas</h3>
              <button onClick={() => setShowColumnModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #64748b)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            {columns.map((col) => (
              <label
                key={col.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.5rem 0', cursor: 'pointer', fontSize: '0.875rem',
                  color: col.visible ? 'var(--text-primary, #f1f5f9)' : 'var(--text-muted, #64748b)',
                }}
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => toggleColumn(col.key)}
                  style={{ accentColor: 'var(--accent, #6366f1)' }}
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
