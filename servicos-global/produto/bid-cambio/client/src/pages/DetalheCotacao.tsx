/**
 * DetalheCotacao.tsx — Detalhe de uma cotacao de cambio
 * Header, bid requests, bid responses, link para comparativo
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  ChevronLeft,
  Building2,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ExternalLink,
  BarChart3,
} from 'lucide-react'

import { getCotacaoDetalhe } from '../shared/api'
import type {
  BidCambioCotacao,
  BidCambioDisparoCotacao,
  BidCambioRespostaCotacao,
  BidCambioStatusCotacao,
  BidCambioStatusDisparoCotacao,
  BidCambioStatusRespostaCotacao,
} from '../shared/types'
import {
  STATUS_COTACAO_LABELS,
  STATUS_COTACAO_BADGE,
  STATUS_BID_REQUEST_LABELS,
  STATUS_BID_RESPONSE_LABELS,
  STATUS_BID_RESPONSE_BADGE,
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

const MOEDA_COLORS: Record<string, string> = {
  USD: '#22c55e', EUR: '#3b82f6', GBP: '#a855f7', JPY: '#ef4444',
  CNY: '#f59e0b', CHF: '#06b6d4',
}

function StatusBadge({ label, badgeType }: { label: string; badgeType: string }) {
  const cores = BADGE_COLORS[badgeType] ?? BADGE_COLORS.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.6rem', borderRadius: 9999,
      fontSize: '0.75rem', fontWeight: 600,
      background: cores.bg, color: cores.color,
    }}>
      {label}
    </span>
  )
}

// ─── Info Row ──────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>{value}</span>
    </div>
  )
}

// ─── Component Props ───────────────────────────────────────────────────────

interface DetalheCotacaoProps {
  cotacaoId: string
  onBack?: () => void
  onNavigateComparativo?: (cotacaoId: string) => void
}

// ─── Componente Principal ──────────────────────────────────────────────────

export default function DetalheCotacao({ cotacaoId, onBack, onNavigateComparativo }: DetalheCotacaoProps) {
  const { t } = useTranslation()
  const [cotacao, setCotacao] = useState<BidCambioCotacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCotacaoDetalhe(cotacaoId)
      setCotacao(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('comum.erro_carregar'))
    } finally {
      setLoading(false)
    }
  }, [cotacaoId])

  useEffect(() => { carregar() }, [carregar])

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary, #f1f5f9)',
    maxWidth: 900,
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface, #334155)',
    borderRadius: 12,
    padding: '1.25rem',
    marginBottom: '1.25rem',
  }

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <ArrowLeftRight size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.detalhe_cotacao.titulo')}</h1>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={28} style={{ color: 'var(--accent, #6366f1)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '0.75rem' }}>{t('comum.carregando')}</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────

  if (error) {
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
            <RefreshCw size={14} /> {t('acoes.tentar_novamente')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Empty ─────────────────────────────────────────────────────────────

  if (!cotacao) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <ArrowLeftRight size={40} style={{ color: 'var(--text-muted, #64748b)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{t('bidcambio.detalhe_cotacao.nao_encontrada')}</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {t('bidcambio.detalhe_cotacao.nao_encontrada_desc')}
          </p>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  const statusBadgeType = STATUS_COTACAO_BADGE[cotacao.status_cotacao_bid_cambio] ?? 'default'
  const moedaColor = MOEDA_COLORS[cotacao.moeda_cotacao_bid_cambio] ?? 'var(--accent, #6366f1)'

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <ArrowLeftRight size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {t('bidcambio.detalhe_cotacao.cotacao_num')} {cotacao.id_cotacao_bid_cambio}
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
              {t('bidcambio.detalhe_cotacao.criada_em')} {dataBR(cotacao.data_criacao_cotacao_bid_cambio)}
            </span>
          </div>
        </div>
        {onNavigateComparativo && cotacao.bid_responses && cotacao.bid_responses.length > 0 && (
          <button
            onClick={() => onNavigateComparativo(cotacao.id_cotacao_bid_cambio)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: 9999,
              fontSize: '0.875rem', fontWeight: 600, border: 'none',
              background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <BarChart3 size={14} /> {t('bidcambio.detalhe_cotacao.ver_comparativo')}
          </button>
        )}
      </div>

      {/* Info Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, color: moedaColor,
            background: moedaColor + '22', padding: '0.2rem 0.6rem', borderRadius: 9999,
          }}>
            {cotacao.moeda_cotacao_bid_cambio}
          </span>
          <StatusBadge label={STATUS_COTACAO_LABELS[cotacao.status_cotacao_bid_cambio]} badgeType={statusBadgeType} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
          <InfoRow label={t('bidcambio.detalhe_cotacao.valor_me')} value={`${cotacao.moeda_cotacao_bid_cambio} ${fmtMoney(cotacao.valor_cotacao_bid_cambio)}`} />
          <InfoRow label={t('bidcambio.detalhe_cotacao.ptax_referencia')} value={fmtRate(cotacao.ptax_referencia_cotacao_bid_cambio)} />
          <InfoRow label={t('bidcambio.detalhe_cotacao.tipo_operacao')} value={OPERACAO_CAMBIO_LABELS[cotacao.tipo_operacao_cotacao_bid_cambio]} />
          <InfoRow label={t('bidcambio.detalhe_cotacao.modalidade')} value={MODALIDADE_CAMBIO_LABELS[cotacao.modalidade_cotacao_bid_cambio]} />
          <InfoRow label={t('bidcambio.detalhe_cotacao.liquidacao')} value={LIQUIDACAO_LABELS[cotacao.liquidacao_cotacao_bid_cambio]} />
          <InfoRow label={t('bidcambio.detalhe_cotacao.data_liquidacao')} value={dataBR(cotacao.data_expiracao_cotacao_bid_cambio)} />
          {cotacao.economia_brl_cotacao_bid_cambio != null && (
            <InfoRow
              label={t('bidcambio.detalhe_cotacao.saving')}
              value={
                <span style={{ color: 'var(--success, #22c55e)' }}>
                  R$ {fmtMoney(cotacao.economia_brl_cotacao_bid_cambio)} ({cotacao.economia_percentual_cotacao_bid_cambio?.toFixed(1)}%)
                </span>
              }
            />
          )}
          {cotacao.referencia_processo_cotacao_bid_cambio && <InfoRow label={t('bidcambio.detalhe_cotacao.referencia_interna')} value={cotacao.referencia_processo_cotacao_bid_cambio} />}
          {cotacao.numero_pedido_cotacao_bid_cambio && <InfoRow label={t('bidcambio.detalhe_cotacao.invoice')} value={cotacao.numero_pedido_cotacao_bid_cambio} />}
          {cotacao.exportador_cotacao_bid_cambio && <InfoRow label={t('bidcambio.detalhe_cotacao.processo')} value={cotacao.exportador_cotacao_bid_cambio} />}
        </div>
      </div>

      {/* Bid Requests */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Send size={16} style={{ color: 'var(--accent, #6366f1)' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
            {t('bidcambio.detalhe_cotacao.corretoras_contatadas')} ({cotacao.bid_requests?.length ?? 0})
          </h3>
        </div>

        {!cotacao.bid_requests || cotacao.bid_requests.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {t('bidcambio.detalhe_cotacao.nenhuma_corretora')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cotacao.bid_requests.map((req) => (
              <div
                key={req.id_disparo_cotacao_bid_cambio}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem', borderRadius: 8,
                  background: 'var(--bg-base, #1e293b)',
                  border: '1px solid var(--bg-elevated, #475569)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Building2 size={16} style={{ color: 'var(--text-muted, #64748b)' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {req.corretora?.razao_social_corretora_bid_cambio ?? 'Corretora'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                      {req.canal_disparo_cotacao_bid_cambio} — {t('bidcambio.detalhe_cotacao.enviado_em')} {datetimeBR(req.enviado_em_disparo_cotacao_bid_cambio)}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                  borderRadius: 9999,
                  background: req.status_disparo_cotacao_bid_cambio === 'RESPONDIDO' ? 'rgba(34,197,94,0.15)' :
                              req.status_disparo_cotacao_bid_cambio === 'ERRO_ENVIO' ? 'rgba(239,68,68,0.15)' :
                              'rgba(100,116,139,0.15)',
                  color: req.status_disparo_cotacao_bid_cambio === 'RESPONDIDO' ? 'var(--success, #22c55e)' :
                         req.status_disparo_cotacao_bid_cambio === 'ERRO_ENVIO' ? 'var(--danger, #ef4444)' :
                         'var(--text-muted, #64748b)',
                }}>
                  {STATUS_BID_REQUEST_LABELS[req.status_disparo_cotacao_bid_cambio]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bid Responses */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BarChart3 size={16} style={{ color: 'var(--accent, #6366f1)' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
            {t('bidcambio.detalhe_cotacao.propostas_recebidas')} ({cotacao.bid_responses?.length ?? 0})
          </h3>
        </div>

        {!cotacao.bid_responses || cotacao.bid_responses.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {t('bidcambio.detalhe_cotacao.nenhuma_proposta')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cotacao.bid_responses.map((resp) => {
              const respBadge = STATUS_BID_RESPONSE_BADGE[resp.status_resposta_cotacao_bid_cambio] ?? 'default'
              const respCores = BADGE_COLORS[respBadge]
              return (
                <div
                  key={resp.id_resposta_cotacao_bid_cambio}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 8,
                    background: 'var(--bg-base, #1e293b)',
                    border: resp.status_resposta_cotacao_bid_cambio === 'APROVADA' ? '1px solid var(--success, #22c55e)' : '1px solid var(--bg-elevated, #475569)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {resp.corretora?.razao_social_corretora_bid_cambio ?? 'Corretora'}
                    </span>
                    <StatusBadge label={STATUS_BID_RESPONSE_LABELS[resp.status_resposta_cotacao_bid_cambio]} badgeType={respBadge} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>{t('bidcambio.comparativo.col_taxa')}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmtRate(resp.taxa_oferecida_resposta_cotacao_bid_cambio)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>{t('bidcambio.comparativo.col_spread')}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmtRate(resp.spread_resposta_cotacao_bid_cambio)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>{t('bidcambio.comparativo.col_valor_total')}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>R$ {fmtMoney(resp.valor_total_brl_resposta_cotacao_bid_cambio)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>{t('bidcambio.detalhe_cotacao.validade')}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{datetimeBR(resp.validade_ate_resposta_cotacao_bid_cambio)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
