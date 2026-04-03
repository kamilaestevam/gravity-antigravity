/**
 * Comparativo.tsx — Ranking de respostas para uma cotacao de cambio
 * Tabela com posicao, corretora, taxa, spread, tags, aprovar/rejeitar
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Trophy,
  ChevronLeft,
  ArrowUpDown,
  Check,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Star,
  TrendingDown,
  Award,
} from 'lucide-react'

import { getComparativo, aprovarResposta } from '../shared/api'
import type {
  BidResponseCambio,
  StatusBidResponseCambio,
} from '../shared/types'
import {
  STATUS_BID_RESPONSE_LABELS,
  STATUS_BID_RESPONSE_BADGE,
  LIQUIDACAO_LABELS,
} from '../shared/types'

// ─── Formatacao ────────────────────────────────────────────────────────────

const fmtMoney = (val: number | null | undefined) =>
  val != null ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) : '—'

const fmtRate = (val: number | null | undefined) =>
  val != null ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(val) : '—'

const datetimeBR = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

// ─── Badge Colors ──────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

const TAG_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  MELHOR_TAXA:      { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)',   icon: <Trophy size={10} /> },
  MELHOR_SPREAD:    { bg: 'rgba(59,130,246,0.15)',   color: 'var(--accent, #6366f1)',    icon: <TrendingDown size={10} /> },
  MELHOR_AVALIACAO: { bg: 'rgba(245,158,11,0.15)',   color: 'var(--warning, #f59e0b)',   icon: <Star size={10} /> },
}

// ─── Sort Options ──────────────────────────────────────────────────────────

type SortKey = 'taxa' | 'spread' | 'rating'

const SORT_OPTIONS: { key: SortKey; labelKey: string }[] = [
  { key: 'taxa', labelKey: 'bidcambio.comparativo.menor_taxa' },
  { key: 'spread', labelKey: 'bidcambio.comparativo.menor_spread' },
  { key: 'rating', labelKey: 'bidcambio.comparativo.maior_rating' },
]

// ─── Props ─────────────────────────────────────────────────────────────────

interface ComparativoProps {
  cotacaoId: string
  onBack?: () => void
}

// ─── Componente Principal ──────────────────────────────────────────────────

export default function Comparativo({ cotacaoId, onBack }: ComparativoProps) {
  const { t } = useTranslation()
  const [respostas, setRespostas] = useState<BidResponseCambio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('taxa')
  const [confirmAprovar, setConfirmAprovar] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRanking(cotacaoId)
      setRespostas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }, [cotacaoId])

  useEffect(() => { carregar() }, [carregar])

  // ── Sort + Tag logic ───────────────────────────────────────────────────

  const sorted = useMemo(() => {
    const copy = [...respostas]
    if (sortBy === 'taxa') copy.sort((a, b) => a.taxa_cambio - b.taxa_cambio)
    else if (sortBy === 'spread') copy.sort((a, b) => a.spread - b.spread)
    else copy.sort((a, b) => (b.score_rating ?? 0) - (a.score_rating ?? 0))
    return copy
  }, [respostas, sortBy])

  const tags = useMemo(() => {
    const map: Record<string, string[]> = {}
    if (respostas.length === 0) return map

    const byTaxa = [...respostas].sort((a, b) => a.taxa_cambio - b.taxa_cambio)
    const bySpread = [...respostas].sort((a, b) => a.spread - b.spread)
    const byRating = [...respostas].sort((a, b) => (b.score_rating ?? 0) - (a.score_rating ?? 0))

    if (byTaxa[0]) { map[byTaxa[0].id] = [...(map[byTaxa[0].id] ?? []), 'MELHOR_TAXA'] }
    if (bySpread[0]) { map[bySpread[0].id] = [...(map[bySpread[0].id] ?? []), 'MELHOR_SPREAD'] }
    if (byRating[0] && (byRating[0].score_rating ?? 0) > 0) {
      map[byRating[0].id] = [...(map[byRating[0].id] ?? []), 'MELHOR_AVALIACAO']
    }
    return map
  }, [respostas])

  // ── Aprovar ────────────────────────────────────────────────────────────

  const handleAprovar = useCallback(async (responseId: string) => {
    setSubmitting(true)
    try {
      await aprovarResposta(cotacaoId, responseId)
      await carregar()
      setConfirmAprovar(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar')
    } finally {
      setSubmitting(false)
    }
  }, [cotacaoId, carregar])

  // ── Styles ─────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary, #f1f5f9)',
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface, #334155)', borderRadius: 12, overflow: 'hidden',
  }

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.35rem 0.9rem', borderRadius: 9999,
    fontSize: '0.75rem', fontWeight: 600, border: 'none',
    background: 'var(--success, #22c55e)', color: '#fff',
    cursor: 'pointer', fontFamily: 'inherit',
  }

  const btnDanger: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.35rem 0.9rem', borderRadius: 9999,
    fontSize: '0.75rem', fontWeight: 600, border: 'none',
    background: 'var(--danger, #ef4444)', color: '#fff',
    cursor: 'pointer', fontFamily: 'inherit',
  }

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20} /></button>}
          <BarChart3 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.comparativo.titulo')}</h1>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={28} style={{ color: 'var(--accent, #6366f1)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '0.75rem' }}>{t('bidcambio.comparativo.carregando')}</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────

  if (error && respostas.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={32} style={{ color: 'var(--danger, #ef4444)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{t('comum.erro_carregar')}</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{error}</p>
          <button onClick={carregar} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.25rem', borderRadius: 9999, fontSize: '0.875rem', fontWeight: 600,
            border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <RefreshCw size={14} /> {t('comum.tentar_novamente')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Empty ─────────────────────────────────────────────────────────────

  if (respostas.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20} /></button>}
          <BarChart3 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.comparativo.titulo')}</h1>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <BarChart3 size={40} style={{ color: 'var(--text-muted, #64748b)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{t('bidcambio.comparativo.sem_propostas')}</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {t('bidcambio.comparativo.aguardar_propostas')}
          </p>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20} /></button>}
          <BarChart3 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {t('bidcambio.comparativo.titulo')} ({respostas.length} {respostas.length !== 1 ? t('bidcambio.comparativo.propostas') : t('bidcambio.comparativo.proposta')})
          </h1>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--text-muted, #64748b)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>{t('bidcambio.comparativo.ordenar')}</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              style={{
                padding: '0.3rem 0.65rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600,
                border: 'none', fontFamily: 'inherit', cursor: 'pointer',
                background: sortBy === opt.key ? 'var(--accent, #6366f1)' : 'var(--bg-elevated, #475569)',
                color: sortBy === opt.key ? '#fff' : 'var(--text-secondary, #94a3b8)',
              }}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--danger, #ef4444)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--danger, #ef4444)' }}>{error}</span>
        </div>
      )}

      {/* Ranking Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bg-elevated, #475569)' }}>
                {[t('bidcambio.comparativo.col_rank'), t('bidcambio.comparativo.col_corretora'), t('bidcambio.comparativo.col_taxa'), t('bidcambio.comparativo.col_spread'), t('bidcambio.comparativo.col_valor_total'), t('bidcambio.comparativo.col_iof'), t('bidcambio.comparativo.col_validade'), t('bidcambio.comparativo.col_rating'), t('bidcambio.comparativo.col_tags'), t('bidcambio.comparativo.col_status'), t('bidcambio.comparativo.col_acoes')].map((h) => (
                  <th key={h} style={{
                    padding: '0.75rem 0.5rem', textAlign: 'left',
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((resp, idx) => {
                const respTags = tags[resp.id] ?? []
                const respBadge = STATUS_BID_RESPONSE_BADGE[resp.status] ?? 'default'
                const respCores = BADGE_COLORS[respBadge]
                const isFirst = idx === 0

                return (
                  <tr
                    key={resp.id}
                    style={{
                      borderBottom: '1px solid var(--bg-elevated, #475569)',
                      background: isFirst ? 'rgba(34,197,94,0.05)' : undefined,
                    }}
                  >
                    {/* Position */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      {isFirst ? (
                        <Trophy size={16} style={{ color: 'var(--warning, #f59e0b)' }} />
                      ) : (
                        <span style={{ fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>{idx + 1}</span>
                      )}
                    </td>

                    {/* Corretora */}
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      {resp.corretora?.nome ?? '—'}
                    </td>

                    {/* Taxa */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      {fmtRate(resp.taxa_cambio)}
                    </td>

                    {/* Spread */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: "'DM Mono', monospace" }}>
                      {fmtRate(resp.spread)}
                    </td>

                    {/* Valor Total */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      R$ {fmtMoney(resp.valor_total_brl)}
                    </td>

                    {/* IOF */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: "'DM Mono', monospace" }}>
                      {resp.iof_percentual.toFixed(2)}% (R$ {fmtMoney(resp.iof_valor)})
                    </td>

                    {/* Validade */}
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>
                      {datetimeBR(resp.validade)}
                    </td>

                    {/* Rating */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={12} style={{ color: 'var(--warning, #f59e0b)' }} />
                        <span style={{ fontWeight: 600 }}>{resp.score_rating?.toFixed(1) ?? '—'}</span>
                      </div>
                    </td>

                    {/* Tags */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {respTags.map((tag) => {
                          const tagStyle = TAG_STYLES[tag]
                          return tagStyle ? (
                            <span
                              key={tag}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                fontSize: '0.625rem', fontWeight: 700,
                                padding: '0.1rem 0.4rem', borderRadius: 9999,
                                background: tagStyle.bg, color: tagStyle.color,
                              }}
                            >
                              {tagStyle.icon}
                              {tag.replace(/_/g, ' ')}
                            </span>
                          ) : null
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '0.15rem 0.5rem', borderRadius: 9999,
                        fontSize: '0.6875rem', fontWeight: 600,
                        background: respCores.bg, color: respCores.color,
                      }}>
                        {STATUS_BID_RESPONSE_LABELS[resp.status]}
                      </span>
                    </td>

                    {/* Acoes */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {resp.status === 'PENDENTE' && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {confirmAprovar === resp.id ? (
                            <>
                              <button
                                onClick={() => handleAprovar(resp.id)}
                                disabled={submitting}
                                style={{ ...btnPrimary, opacity: submitting ? 0.5 : 1 }}
                              >
                                {submitting ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={10} />}
                                {t('bidcambio.comparativo.confirmar')}
                              </button>
                              <button onClick={() => setConfirmAprovar(null)} style={{ ...btnDanger, background: 'var(--bg-elevated, #475569)', color: 'var(--text-secondary)' }}>
                                <X size={10} /> {t('bidcambio.comparativo.cancelar')}
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setConfirmAprovar(resp.id)} style={btnPrimary}>
                                <Check size={10} /> {t('bidcambio.comparativo.aprovar')}
                              </button>
                              <button onClick={() => setRejectId(resp.id)} style={{ ...btnDanger }}>
                                <X size={10} /> {t('bidcambio.comparativo.rejeitar')}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => { setRejectId(null); setRejectReason('') }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface, #334155)',
              borderRadius: 12, padding: '1.5rem', width: 400,
              border: '1px solid var(--bg-elevated, #475569)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>{t('bidcambio.comparativo.rejeitar_proposta')}</h3>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)', marginBottom: '0.35rem',
            }}>
              {t('bidcambio.comparativo.motivo_rejeicao')}
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder={t('bidcambio.comparativo.motivo_placeholder')}
              style={{
                width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
                border: '1px solid var(--bg-elevated, #475569)',
                background: 'var(--bg-base, #1e293b)', color: 'var(--text-primary, #f1f5f9)',
                fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => { setRejectId(null); setRejectReason('') }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 9999, fontSize: '0.875rem', fontWeight: 600,
                  border: '1px solid var(--bg-elevated, #475569)', background: 'transparent',
                  color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {t('bidcambio.comparativo.cancelar')}
              </button>
              <button
                onClick={() => { setRejectId(null); setRejectReason('') }}
                disabled={!rejectReason.trim()}
                style={{
                  ...btnDanger, padding: '0.5rem 1rem', fontSize: '0.875rem',
                  opacity: !rejectReason.trim() ? 0.5 : 1,
                }}
              >
                <X size={14} /> {t('bidcambio.comparativo.rejeitar')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
