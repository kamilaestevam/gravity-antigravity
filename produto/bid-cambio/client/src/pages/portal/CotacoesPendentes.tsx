/**
 * CotacoesPendentes.tsx — Portal da Corretora: Cotacoes aguardando resposta
 * Tabela com filtro por moeda, sort por valor/recebido_em, botao responder
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Clock,
  ArrowRight,
  AlertCircle,
  Loader2,
  FileText,
  Filter,
  ArrowUpDown,
  Inbox,
  Settings,
} from 'lucide-react'
import type {
  MoedaCambio,
  TipoOperacaoCambio,
  LiquidacaoCambio,
} from '../../shared/types'
import {
  MOEDA_CAMBIO_LABELS,
  OPERACAO_CAMBIO_LABELS,
  LIQUIDACAO_LABELS,
} from '../../shared/types'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CotacaoPendente {
  id: string
  bid_request_id: string
  comprador_label: string
  moeda: MoedaCambio
  valor_moeda_estrangeira: number
  tipo_operacao: TipoOperacaoCambio
  liquidacao: LiquidacaoCambio
  recebido_em: string
  validade: string | null
}

type PageState = 'loading' | 'error' | 'empty' | 'filled' | 'disabled'
type SortField = 'valor_moeda_estrangeira' | 'recebido_em'
type SortDir = 'asc' | 'desc'

// ─── Formatacao ─────────────────────────────────────────────────────────────

const fmtValor = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const fmtData = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const fmtDataHora = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

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
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  select: {
    background: 'var(--bg-surface, #1e293b)',
    border: '1px solid var(--bg-base, #334155)',
    borderRadius: 8,
    padding: '0.5rem 0.75rem',
    fontSize: '0.8125rem',
    color: 'var(--text-primary, #f1f5f9)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none',
    cursor: 'pointer',
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
  thSortable: {
    cursor: 'pointer',
    userSelect: 'none' as const,
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
    padding: '0.2rem 0.6rem',
    borderRadius: 9999,
    fontSize: '0.6875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  btnResponder: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 1rem',
    borderRadius: 9999,
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: 'var(--accent, #6366f1)',
    color: '#fff',
    transition: 'all 0.15s ease',
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

const MOEDAS_FILTRO: MoedaCambio[] = ['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY']

// ─── Component ──────────────────────────────────────────────────────────────

interface CotacoesPendentesProps {
  disabled?: boolean
  onResponder?: (bidRequestId: string) => void
}

export default function CotacoesPendentes({ disabled = false, onResponder }: CotacoesPendentesProps) {
  const { t } = useTranslation()
  const [cotacoes, setCotacoes] = useState<CotacaoPendente[]>([])
  const [pageState, setPageState] = useState<PageState>('loading')
  const [filtroMoeda, setFiltroMoeda] = useState<MoedaCambio | ''>('')
  const [sortField, setSortField] = useState<SortField>('recebido_em')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const carregar = useCallback(async () => {
    if (disabled) {
      setPageState('disabled')
      return
    }
    setPageState('loading')
    try {
      const { getPortalCotacoesPendentes } = await import('../../shared/api')
      const data = await getPortalCotacoesPendentes()
      const lista = data as unknown as CotacaoPendente[]
      setCotacoes(lista)
      setPageState(lista.length === 0 ? 'empty' : 'filled')
    } catch {
      setPageState('error')
    }
  }, [disabled])

  useEffect(() => {
    carregar()
  }, [carregar])

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir('desc')
      return field
    })
  }, [])

  const filtradas = useMemo(() => {
    let lista = [...cotacoes]
    if (filtroMoeda) {
      lista = lista.filter((c) => c.moeda === filtroMoeda)
    }
    lista.sort((a, b) => {
      let cmp = 0
      if (sortField === 'valor_moeda_estrangeira') {
        cmp = a.valor_moeda_estrangeira - b.valor_moeda_estrangeira
      } else {
        cmp = new Date(a.recebido_em).getTime() - new Date(b.recebido_em).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return lista
  }, [cotacoes, filtroMoeda, sortField, sortDir])

  // ─── Render States ──────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><Clock size={22} /></div>
          <div>
            <h1 style={s.title}>{t('bidcambio.portal.cotacoes_pendentes.titulo')}</h1>
          </div>
        </div>
        <div style={s.center}>
          <Loader2 size={48} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
          <p>{t('bidcambio.portal.cotacoes_pendentes.carregando')}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><Clock size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.cotacoes_pendentes.titulo')}</h1></div>
        </div>
        <div style={s.center}>
          <AlertCircle size={48} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
          <p style={{ color: 'var(--danger, #ef4444)' }}>{t('comum.erro_carregar')}</p>
          <button onClick={carregar} style={{ ...s.btnResponder }}>{t('comum.tentar_novamente')}</button>
        </div>
      </div>
    )
  }

  if (pageState === 'disabled') {
    return (
      <div style={{ ...s.page, opacity: 0.5, pointerEvents: 'none' }}>
        <div style={s.header}>
          <div style={s.headerIcon}><Clock size={22} /></div>
          <div>
            <h1 style={s.title}>{t('bidcambio.portal.cotacoes_pendentes.titulo')}</h1>
            <p style={s.subtitle}>{t('bidcambio.portal.config.desabilitado')}</p>
          </div>
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
        <div style={s.headerIcon}><Clock size={22} /></div>
        <div>
          <h1 style={s.title}>{t('bidcambio.portal.cotacoes_pendentes.titulo')}</h1>
          <p style={s.subtitle}>{filtradas.length} cotacao(oes) aguardando sua resposta</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <Filter size={14} style={{ color: 'var(--text-muted, #64748b)' }} />
        <select
          style={s.select}
          value={filtroMoeda}
          onChange={(e) => setFiltroMoeda(e.target.value as MoedaCambio | '')}
        >
          <option value="">{t('bidcambio.portal.cotacoes_pendentes.todas_moedas')}</option>
          {MOEDAS_FILTRO.map((m) => (
            <option key={m} value={m}>{MOEDA_CAMBIO_LABELS[m]} ({m})</option>
          ))}
        </select>
      </div>

      {pageState === 'empty' || filtradas.length === 0 ? (
        <div style={s.center}>
          <Inbox size={48} style={{ opacity: 0.3 }} />
          <p>{t('bidcambio.portal.cotacoes_pendentes.vazio')}</p>
        </div>
      ) : (
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t('bidcambio.portal.cotacoes_pendentes.col_comprador')}</th>
                <th style={s.th}>{t('bidcambio.portal.cotacoes_pendentes.col_moeda')}</th>
                <th
                  style={{ ...s.th, ...s.thSortable }}
                  onClick={() => toggleSort('valor_moeda_estrangeira')}
                >
                  {t('bidcambio.portal.cotacoes_pendentes.col_valor')} <ArrowUpDown size={10} style={{ marginLeft: 4 }} />
                </th>
                <th style={s.th}>{t('bidcambio.portal.cotacoes_pendentes.col_tipo')}</th>
                <th style={s.th}>{t('bidcambio.portal.cotacoes_pendentes.col_liquidacao')}</th>
                <th
                  style={{ ...s.th, ...s.thSortable }}
                  onClick={() => toggleSort('recebido_em')}
                >
                  {t('bidcambio.portal.cotacoes_pendentes.col_recebido')} <ArrowUpDown size={10} style={{ marginLeft: 4 }} />
                </th>
                <th style={s.th}>{t('bidcambio.portal.cotacoes_pendentes.col_validade')}</th>
                <th style={{ ...s.th, textAlign: 'center' }}>{t('bidcambio.portal.cotacoes_pendentes.col_acoes')}</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} style={{ transition: 'background 0.1s' }}>
                  <td style={s.td}>{c.comprador_label}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: 'rgba(99,102,241,0.15)',
                      color: 'var(--accent, #6366f1)',
                    }}>
                      {c.moeda}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{fmtValor(c.valor_moeda_estrangeira)}</td>
                  <td style={{ ...s.td, ...s.tdMuted }}>{OPERACAO_CAMBIO_LABELS[c.tipo_operacao]}</td>
                  <td style={{ ...s.td, ...s.tdMuted }}>{LIQUIDACAO_LABELS[c.liquidacao]}</td>
                  <td style={{ ...s.td, ...s.tdMuted }}>{fmtDataHora(c.recebido_em)}</td>
                  <td style={{ ...s.td, ...s.tdMuted }}>
                    {c.validade ? fmtDataHora(c.validade) : '—'}
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <button
                      style={s.btnResponder}
                      onClick={() => onResponder?.(c.bid_request_id)}
                    >
                      Responder
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
