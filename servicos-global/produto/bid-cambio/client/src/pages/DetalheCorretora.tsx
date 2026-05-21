/**
 * DetalheCorretora.tsx — Detalhe de uma corretora
 * Info card, rating card (4 criterios), historico de respostas
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  ChevronLeft,
  Star,
  Mail,
  Phone,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Zap,
  HeadphonesIcon,
  Shield,
  TrendingDown,
} from 'lucide-react'

import { getCorretoraDetalhe } from '../shared/api'
import type {
  BidCambioCorretora,
} from '../shared/types'
import {
  TIPO_CORRETORA_LABELS,
  STATUS_CORRETORA_LABELS,
  STATUS_CORRETORA_BADGE,
} from '../shared/types'

// ─── Badge Colors ──────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

// ─── Rating Bar ────────────────────────────────────────────────────────────

function RatingBar({ label, icon, value, maxValue = 5 }: {
  label: string
  icon: React.ReactNode
  value: number | null
  maxValue?: number
}) {
  const pct = value != null ? (value / maxValue) * 100 : 0
  const color = pct >= 80 ? 'var(--success, #22c55e)' :
                pct >= 50 ? 'var(--warning, #f59e0b)' :
                'var(--danger, #ef4444)'

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
          {icon}
          {label}
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
          {value != null ? value.toFixed(1) : '—'}
        </span>
      </div>
      <div style={{
        height: 6, borderRadius: 9999,
        background: 'var(--bg-elevated, #475569)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 9999,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface DetalheCorretoraProps {
  corretoraId: string
  onBack?: () => void
}

// ─── Componente Principal ──────────────────────────────────────────────────

export default function DetalheCorretora({ corretoraId, onBack }: DetalheCorretoraProps) {
  const { t } = useTranslation()
  const [corretora, setCorretora] = useState<BidCambioCorretora | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCorretoraDetalhe(corretoraId)
      setCorretora(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('comum.erro_carregar'))
    } finally {
      setLoading(false)
    }
  }, [corretoraId])

  useEffect(() => { carregar() }, [carregar])

  // ── Styles ─────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary, #f1f5f9)', maxWidth: 800,
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface, #334155)', borderRadius: 12,
    padding: '1.25rem', marginBottom: '1.25rem',
  }

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20} /></button>}
          <Building2 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.detalhe_corretora.titulo')}</h1>
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

  if (!corretora) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} style={{ color: 'var(--text-muted, #64748b)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{t('bidcambio.detalhe_corretora.nao_encontrada')}</p>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  const statusBadge = STATUS_CORRETORA_BADGE[corretora.status_corretora_bid_cambio] ?? 'default'
  const statusCores = BADGE_COLORS[statusBadge]

  // Rating breakdown — not available directly on BidCambioCorretora (comes from classificacao)
  const ratingTaxa: number | null = null
  const ratingAgilidade: number | null = null
  const ratingAtendimento: number | null = null
  const ratingConfiabilidade: number | null = null

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <ChevronLeft size={20} />
          </button>
        )}
        <Building2 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{corretora.razao_social_corretora_bid_cambio}</h1>
          {corretora.nome_fantasia_corretora_bid_cambio && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{corretora.nome_fantasia_corretora_bid_cambio}</span>
          )}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '0.15rem 0.5rem', borderRadius: 9999,
          fontSize: '0.6875rem', fontWeight: 600,
          background: statusCores.bg, color: statusCores.color,
          marginLeft: '0.5rem',
        }}>
          {STATUS_CORRETORA_LABELS[corretora.status_corretora_bid_cambio]}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Info Card */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--accent, #6366f1)' }} />
            {t('bidcambio.detalhe_corretora.informacoes')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('tabela.tipo')}</span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent, #6366f1)',
                background: 'rgba(99,102,241,0.15)', padding: '0.1rem 0.4rem', borderRadius: 9999,
              }}>
                {TIPO_CORRETORA_LABELS[corretora.tipo_corretora_bid_cambio]}
              </span>
            </div>
            {corretora.cnpj_corretora_bid_cambio && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>CNPJ</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{corretora.cnpj_corretora_bid_cambio}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('tabela.email')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {corretora.email_corretora_bid_cambio}
              </div>
            </div>
            {corretora.telefone_corretora_bid_cambio && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('tabela.telefone')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                  <Phone size={12} style={{ color: 'var(--text-muted)' }} /> {corretora.telefone_corretora_bid_cambio}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('bidcambio.detalhe_corretora.aceita_cotacao')}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: corretora.portal_habilitado_corretora_bid_cambio ? 'var(--success, #22c55e)' : 'var(--text-muted, #64748b)' }}>
                {corretora.portal_habilitado_corretora_bid_cambio ? t('comum.sim') : t('comum.nao')}
              </span>
            </div>

            {/* Moedas */}
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.35rem' }}>{t('bidcambio.detalhe_corretora.moedas_atendidas')}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {(corretora.moedas_operadas_corretora_bid_cambio?.split(',').map(m => m.trim()).filter(Boolean) ?? []).map((m) => (
                  <span key={m} style={{
                    fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent, #6366f1)',
                    background: 'rgba(99,102,241,0.15)', padding: '0.1rem 0.4rem', borderRadius: 9999,
                  }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={16} style={{ color: 'var(--warning, #f59e0b)' }} />
            {t('bidcambio.detalhe_corretora.avaliacao')}
          </h3>

          {/* Score Global */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem', borderRadius: 8,
            background: 'var(--bg-base, #1e293b)', marginBottom: '1rem',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `conic-gradient(var(--warning, #f59e0b) 0deg, var(--bg-elevated, #475569) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--bg-base, #1e293b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem', fontWeight: 700,
              }}>
                —
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                {t('bidcambio.detalhe_corretora.score_global')}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
                — {t('bidcambio.detalhe_corretora.cotacoes')}
              </div>
            </div>
          </div>

          {/* 4 Criteria */}
          <RatingBar label={t('bidcambio.detalhe_corretora.rating_taxa')} icon={<TrendingDown size={14} />} value={ratingTaxa} />
          <RatingBar label={t('bidcambio.detalhe_corretora.rating_agilidade')} icon={<Zap size={14} />} value={ratingAgilidade} />
          <RatingBar label={t('bidcambio.detalhe_corretora.rating_atendimento')} icon={<HeadphonesIcon size={14} />} value={ratingAtendimento} />
          <RatingBar label={t('bidcambio.detalhe_corretora.rating_confiabilidade')} icon={<Shield size={14} />} value={ratingConfiabilidade} />

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
            marginTop: '1rem', paddingTop: '1rem',
            borderTop: '1px solid var(--bg-elevated, #475569)',
          }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>{t('bidcambio.detalhe_corretora.taxa_resposta')}</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>—</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>{t('bidcambio.detalhe_corretora.taxa_aprovacao')}</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>—</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>{t('bidcambio.detalhe_corretora.tempo_medio_resposta')}</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>—</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>{t('bidcambio.detalhe_corretora.total_cotacoes')}</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>—</div>
            </div>
          </div>
        </div>
      </div>

      {/* History section placeholder */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} style={{ color: 'var(--accent, #6366f1)' }} />
          {t('bidcambio.detalhe_corretora.historico')}
        </h3>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
          {t('bidcambio.detalhe_corretora.historico_placeholder')}
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
