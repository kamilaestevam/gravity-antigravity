/**
 * Respostas.tsx — Portal da Corretora: Historico de respostas enviadas
 * Tabela com filtro por status, paginacao, badges de status
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Settings,
} from 'lucide-react'
import type {
  CambioMoeda,
  StatusBidResponseCambio,
} from '../../shared/types'
import {
  MOEDA_CAMBIO_LABELS,
} from '../../shared/types'

// ─── Types ──────────────────────────────────────────────────────────────────

type RespostaStatus = 'RECEBIDA' | 'APROVADA' | 'REPROVADA' | 'EXPIRADA'

interface RespostaHistorico {
  id: string
  comprador_label: string
  moeda: CambioMoeda
  valor_moeda_estrangeira: number
  taxa_oferecida: number
  spread: number
  status: RespostaStatus
  respondido_em: string
}

type PageState = 'loading' | 'error' | 'empty' | 'filled' | 'disabled'
type FiltroStatus = '' | RespostaStatus

const ITEMS_PER_PAGE = 15

// ─── Formatacao ─────────────────────────────────────────────────────────────

const fmtValor2 = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const fmtTaxa4 = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(val)

const fmtData = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RespostaStatus, { label: string; bg: string; color: string }> = {
  RECEBIDA:  { label: 'Recebida',  bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  APROVADA:  { label: 'Aprovada',  bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  REPROVADA: { label: 'Reprovada', bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  EXPIRADA:  { label: 'Expirada',  bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

const STATUS_ICONS: Record<RespostaStatus, React.ReactNode> = {
  RECEBIDA:  <Clock size={12} />,
  APROVADA:  <CheckCircle size={12} />,
  REPROVADA: <XCircle size={12} />,
  EXPIRADA:  <Clock size={12} />,
}

const FILTRO_TABS: { key: FiltroStatus; label: string }[] = [
  { key: '', label: 'Todas' },
  { key: 'RECEBIDA', label: 'Recebidas' },
  { key: 'APROVADA', label: 'Aprovadas' },
  { key: 'REPROVADA', label: 'Reprovadas' },
  { key: 'EXPIRADA', label: 'Expiradas' },
]

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = {
  page: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    minHeight: '100vh',
    background: 'var(--bg-body-dark, #0f172a)',
    padding: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  headerIcon: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    color: 'var(--accent, #6366f1)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #94a3b8)',
    margin: 0,
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: '0.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--bg-base, #334155)',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--text-secondary, #94a3b8)',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  tabActive: {
    color: 'var(--accent, #6366f1)',
    borderBottomColor: 'var(--accent, #6366f1)',
  } as React.CSSProperties,
  tabCount: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    background: 'var(--bg-base, #334155)',
    color: 'var(--text-secondary, #94a3b8)',
    padding: '0.1rem 0.45rem',
    borderRadius: 9999,
    minWidth: '1.25rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  tabCountActive: {
    background: 'rgba(99,102,241,0.2)',
    color: 'var(--accent, #6366f1)',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    overflow: 'hidden',
  } as React.CSSProperties,
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted, #64748b)',
    textAlign: 'left' as const,
    borderBottom: '1px solid var(--bg-base, #334155)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.8125rem',
    color: 'var(--text-primary, #f1f5f9)',
    borderBottom: '1px solid var(--bg-base, #334155)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  tdMuted: {
    color: 'var(--text-secondary, #94a3b8)',
  } as React.CSSProperties,
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.2rem 0.6rem',
    borderRadius: 9999,
    fontSize: '0.6875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  pageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: 'var(--bg-surface, #1e293b)',
    color: 'var(--text-secondary, #94a3b8)',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.15s',
  } as React.CSSProperties,
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  pageInfo: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted, #64748b)',
  } as React.CSSProperties,
  center: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '1rem',
    color: 'var(--text-muted, #64748b)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
} as const

// ─── Component ──────────────────────────────────────────────────────────────

interface RespostasProps {
  disabled?: boolean
}

export default function Respostas({ disabled = false }: RespostasProps) {
  const { t } = useTranslation()
  const [respostas, setRespostas] = useState<RespostaHistorico[]>([])
  const [pageState, setPageState] = useState<PageState>('loading')
  const [filtro, setFiltro] = useState<FiltroStatus>('')
  const [pagina, setPagina] = useState(1)

  const carregar = useCallback(async () => {
    if (disabled) {
      setPageState('disabled')
      return
    }
    setPageState('loading')
    try {
      const { getPortalMinhasRespostas } = await import('../../shared/api')
      const data = await getPortalMinhasRespostas()
      const lista = data as unknown as RespostaHistorico[]
      setRespostas(lista)
      setPageState(lista.length === 0 ? 'empty' : 'filled')
    } catch {
      setPageState('error')
    }
  }, [disabled])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    setPagina(1)
  }, [filtro])

  const filtradas = useMemo(() => {
    if (!filtro) return respostas
    return respostas.filter((r) => r.status === filtro)
  }, [respostas, filtro])

  const contadores = useMemo(() => {
    const c: Record<string, number> = { '': respostas.length }
    for (const status of ['RECEBIDA', 'APROVADA', 'REPROVADA', 'EXPIRADA'] as RespostaStatus[]) {
      c[status] = respostas.filter((r) => r.status === status).length
    }
    return c
  }, [respostas])

  const totalPages = Math.max(1, Math.ceil(filtradas.length / ITEMS_PER_PAGE))
  const paginadas = filtradas.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE)

  // ─── Render States ──────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><Send size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.minhas_respostas.titulo')}</h1></div>
        </div>
        <div style={s.center}>
          <Loader2 size={48} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
          <p>{t('bidcambio.portal.minhas_respostas.carregando')}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><Send size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.minhas_respostas.titulo')}</h1></div>
        </div>
        <div style={s.center}>
          <AlertCircle size={48} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
          <p style={{ color: 'var(--danger, #ef4444)' }}>Erro ao carregar respostas.</p>
          <button onClick={carregar} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.25rem', borderRadius: 9999, fontSize: '0.875rem',
            fontWeight: 600, cursor: 'pointer', border: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: 'var(--accent, #6366f1)', color: '#fff',
          }}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (pageState === 'disabled') {
    return (
      <div style={{ ...s.page, opacity: 0.5, pointerEvents: 'none' }}>
        <div style={s.header}>
          <div style={s.headerIcon}><Send size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.minhas_respostas.titulo')}</h1><p style={s.subtitle}>{t('bidcambio.portal.config.desabilitado')}</p></div>
        </div>
        <div style={s.center}>
          <Settings size={48} style={{ opacity: 0.3 }} />
          <p>Funcionalidade desabilitada.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerIcon}><Send size={22} /></div>
        <div>
          <h1 style={s.title}>{t('bidcambio.portal.minhas_respostas.titulo')}</h1>
          <p style={s.subtitle}>{respostas.length} resposta(s) enviada(s)</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {FILTRO_TABS.map((tab) => {
          const ativo = filtro === tab.key
          return (
            <button
              key={tab.key}
              style={{ ...s.tab, ...(ativo ? s.tabActive : {}) }}
              onClick={() => setFiltro(tab.key)}
            >
              {tab.label}
              <span style={{ ...s.tabCount, ...(ativo ? s.tabCountActive : {}) }}>
                {contadores[tab.key] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {pageState === 'empty' || filtradas.length === 0 ? (
        <div style={s.center}>
          <Inbox size={48} style={{ opacity: 0.3 }} />
          <p>{t('bidcambio.portal.minhas_respostas.vazio')}</p>
        </div>
      ) : (
        <>
          <div style={{ borderRadius: 12, overflow: 'hidden' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>{t('bidcambio.portal.minhas_respostas.col_comprador')}</th>
                  <th style={s.th}>{t('bidcambio.portal.minhas_respostas.col_moeda')}</th>
                  <th style={s.th}>{t('bidcambio.portal.minhas_respostas.col_valor')}</th>
                  <th style={s.th}>{t('bidcambio.portal.minhas_respostas.col_taxa')}</th>
                  <th style={s.th}>{t('bidcambio.portal.minhas_respostas.col_spread')}</th>
                  <th style={s.th}>{t('bidcambio.portal.minhas_respostas.col_status')}</th>
                  <th style={s.th}>{t('bidcambio.portal.minhas_respostas.col_respondido')}</th>
                </tr>
              </thead>
              <tbody>
                {paginadas.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.RECEBIDA
                  return (
                    <tr key={r.id}>
                      <td style={s.td}>{r.comprador_label}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          background: 'rgba(99,102,241,0.15)',
                          color: 'var(--accent, #6366f1)',
                        }}>
                          {r.moeda}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{fmtValor2(r.valor_moeda_estrangeira)}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{fmtTaxa4(r.taxa_oferecida)}</td>
                      <td style={{ ...s.td, ...s.tdMuted }}>
                        {r.spread >= 0 ? '+' : ''}{fmtValor2(r.spread)}%
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>
                          {STATUS_ICONS[r.status]}
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ ...s.td, ...s.tdMuted }}>{fmtData(r.respondido_em)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button
                style={{ ...s.pageBtn, ...(pagina <= 1 ? s.pageBtnDisabled : {}) }}
                disabled={pagina <= 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={s.pageInfo}>
                {t('bidcambio.portal.minhas_respostas.pagina')} {pagina} {t('bidcambio.portal.minhas_respostas.de')} {totalPages}
              </span>
              <button
                style={{ ...s.pageBtn, ...(pagina >= totalPages ? s.pageBtnDisabled : {}) }}
                disabled={pagina >= totalPages}
                onClick={() => setPagina((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
