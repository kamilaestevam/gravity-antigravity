/**
 * DetalheCotacao.tsx — Detalhe de uma cotacao de cambio
 * Header, bid requests, bid responses, link para comparativo
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback } from 'react'
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
  CotacaoCambio,
  BidRequestCambio,
  BidResponseCambio,
  StatusCotacaoCambio,
  StatusBidRequestCambio,
  StatusBidResponseCambio,
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
  const [cotacao, setCotacao] = useState<CotacaoCambio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCotacaoDetalhe(cotacaoId)
      setCotacao(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cotacao')
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Detalhe da Cotacao</h1>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={28} style={{ color: 'var(--accent, #6366f1)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '0.75rem' }}>Carregando...</p>
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
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>Erro ao carregar</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{error}</p>
          <button onClick={carregar} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.25rem', borderRadius: 9999, fontSize: '0.875rem', fontWeight: 600,
            border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <RefreshCw size={14} /> Tentar novamente
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
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>Cotacao nao encontrada</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            A cotacao solicitada nao existe ou foi removida.
          </p>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  const statusBadgeType = STATUS_COTACAO_BADGE[cotacao.status] ?? 'default'
  const moedaColor = MOEDA_COLORS[cotacao.moeda] ?? 'var(--accent, #6366f1)'

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
              Cotacao {cotacao.numero}
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
              Criada em {dataBR(cotacao.created_at)}
            </span>
          </div>
        </div>
        {onNavigateComparativo && cotacao.bid_responses && cotacao.bid_responses.length > 0 && (
          <button
            onClick={() => onNavigateComparativo(cotacao.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: 9999,
              fontSize: '0.875rem', fontWeight: 600, border: 'none',
              background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <BarChart3 size={14} /> Ver Comparativo
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
            {cotacao.moeda}
          </span>
          <StatusBadge label={STATUS_COTACAO_LABELS[cotacao.status]} badgeType={statusBadgeType} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
          <InfoRow label="Valor Moeda Estrangeira" value={`${cotacao.moeda} ${fmtMoney(cotacao.valor_moeda_estrangeira)}`} />
          <InfoRow label="Valor BRL Estimado" value={`R$ ${fmtMoney(cotacao.valor_brl_estimado)}`} />
          <InfoRow label="PTAX Referencia" value={fmtRate(cotacao.taxa_cambio_referencia)} />
          <InfoRow label="Taxa Aprovada" value={fmtRate(cotacao.taxa_aprovada)} />
          <InfoRow label="Tipo Operacao" value={OPERACAO_CAMBIO_LABELS[cotacao.tipo_operacao]} />
          <InfoRow label="Modalidade" value={MODALIDADE_CAMBIO_LABELS[cotacao.modalidade]} />
          <InfoRow label="Liquidacao" value={LIQUIDACAO_LABELS[cotacao.liquidacao]} />
          <InfoRow label="Data Liquidacao" value={dataBR(cotacao.data_liquidacao)} />
          <InfoRow label="Parcelas" value={`${cotacao.total_parcelas}`} />
          <InfoRow label="Prazo Resposta" value={datetimeBR(cotacao.prazo_resposta)} />
          {cotacao.saving_valor != null && (
            <InfoRow
              label="Saving"
              value={
                <span style={{ color: 'var(--success, #22c55e)' }}>
                  R$ {fmtMoney(cotacao.saving_valor)} ({cotacao.saving_percentual?.toFixed(1)}%)
                </span>
              }
            />
          )}
          {cotacao.referencia_interna && <InfoRow label="Referencia Interna" value={cotacao.referencia_interna} />}
          {cotacao.invoice_numero && <InfoRow label="Invoice" value={cotacao.invoice_numero} />}
          {cotacao.processo_id && <InfoRow label="Processo" value={cotacao.processo_id} />}
        </div>

        {cotacao.descricao && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-base, #1e293b)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)' }}>
              Descricao
            </span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', margin: '0.25rem 0 0' }}>
              {cotacao.descricao}
            </p>
          </div>
        )}
      </div>

      {/* Bid Requests */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Send size={16} style={{ color: 'var(--accent, #6366f1)' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
            Corretoras Contatadas ({cotacao.bid_requests?.length ?? 0})
          </h3>
        </div>

        {!cotacao.bid_requests || cotacao.bid_requests.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            Nenhuma corretora contatada ainda.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cotacao.bid_requests.map((req) => (
              <div
                key={req.id}
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
                      {req.corretora?.nome ?? 'Corretora'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                      {req.canal} — Enviado em {datetimeBR(req.enviado_em)}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                  borderRadius: 9999,
                  background: req.status === 'RESPONDIDO' ? 'rgba(34,197,94,0.15)' :
                              req.status === 'ERRO_ENVIO' ? 'rgba(239,68,68,0.15)' :
                              'rgba(100,116,139,0.15)',
                  color: req.status === 'RESPONDIDO' ? 'var(--success, #22c55e)' :
                         req.status === 'ERRO_ENVIO' ? 'var(--danger, #ef4444)' :
                         'var(--text-muted, #64748b)',
                }}>
                  {STATUS_BID_REQUEST_LABELS[req.status]}
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
            Propostas Recebidas ({cotacao.bid_responses?.length ?? 0})
          </h3>
        </div>

        {!cotacao.bid_responses || cotacao.bid_responses.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            Nenhuma proposta recebida ainda.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cotacao.bid_responses.map((resp) => {
              const respBadge = STATUS_BID_RESPONSE_BADGE[resp.status] ?? 'default'
              const respCores = BADGE_COLORS[respBadge]
              return (
                <div
                  key={resp.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 8,
                    background: 'var(--bg-base, #1e293b)',
                    border: resp.status === 'APROVADA' ? '1px solid var(--success, #22c55e)' : '1px solid var(--bg-elevated, #475569)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {resp.corretora?.nome ?? 'Corretora'}
                    </span>
                    <StatusBadge label={STATUS_BID_RESPONSE_LABELS[resp.status]} badgeType={respBadge} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>Taxa</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmtRate(resp.taxa_cambio)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>Spread</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmtRate(resp.spread)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>Valor Total BRL</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>R$ {fmtMoney(resp.valor_total_brl)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', display: 'block' }}>Validade</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{datetimeBR(resp.validade)}</span>
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
