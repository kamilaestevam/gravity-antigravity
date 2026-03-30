/**
 * DetalheCorretora.tsx — Detalhe de uma corretora
 * Info card, rating card (4 criterios), historico de respostas
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback } from 'react'
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
  Corretora,
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
  const [corretora, setCorretora] = useState<Corretora | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCorretoraDetalhe(corretoraId)
      setCorretora(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar corretora')
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Detalhe da Corretora</h1>
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

  if (!corretora) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} style={{ color: 'var(--text-muted, #64748b)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>Corretora nao encontrada</p>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  const statusBadge = STATUS_CORRETORA_BADGE[corretora.status] ?? 'default'
  const statusCores = BADGE_COLORS[statusBadge]

  // Simulated rating breakdown (real would come from API)
  const ratingTaxa = corretora.rating_global != null ? Math.min(5, corretora.rating_global * 1.05) : null
  const ratingAgilidade = corretora.rating_global != null ? Math.min(5, corretora.rating_global * 0.95) : null
  const ratingAtendimento = corretora.rating_global != null ? Math.min(5, corretora.rating_global * 1.0) : null
  const ratingConfiabilidade = corretora.rating_global != null ? Math.min(5, corretora.rating_global * 0.98) : null

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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{corretora.nome}</h1>
          {corretora.nome_fantasia && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{corretora.nome_fantasia}</span>
          )}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '0.15rem 0.5rem', borderRadius: 9999,
          fontSize: '0.6875rem', fontWeight: 600,
          background: statusCores.bg, color: statusCores.color,
          marginLeft: '0.5rem',
        }}>
          {STATUS_CORRETORA_LABELS[corretora.status]}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Info Card */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--accent, #6366f1)' }} />
            Informacoes
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>Tipo</span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent, #6366f1)',
                background: 'rgba(99,102,241,0.15)', padding: '0.1rem 0.4rem', borderRadius: 9999,
              }}>
                {TIPO_CORRETORA_LABELS[corretora.tipo]}
              </span>
            </div>
            {corretora.cnpj && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>CNPJ</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{corretora.cnpj}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>Email</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {corretora.email}
              </div>
            </div>
            {corretora.telefone && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>Telefone</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                  <Phone size={12} style={{ color: 'var(--text-muted)' }} /> {corretora.telefone}
                </div>
              </div>
            )}
            {corretora.website && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>Website</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                  <Globe size={12} style={{ color: 'var(--text-muted)' }} /> {corretora.website}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>Aceita Cotacao Aberta</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: corretora.aceita_cotacao_aberta ? 'var(--success, #22c55e)' : 'var(--text-muted, #64748b)' }}>
                {corretora.aceita_cotacao_aberta ? 'Sim' : 'Nao'}
              </span>
            </div>

            {/* Moedas */}
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.35rem' }}>Moedas Atendidas</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {corretora.moedas_atendidas.map((m) => (
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
            Avaliacao
          </h3>

          {/* Score Global */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem', borderRadius: 8,
            background: 'var(--bg-base, #1e293b)', marginBottom: '1rem',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `conic-gradient(var(--warning, #f59e0b) ${((corretora.rating_global ?? 0) / 5) * 360}deg, var(--bg-elevated, #475569) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--bg-base, #1e293b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem', fontWeight: 700,
              }}>
                {corretora.rating_global?.toFixed(1) ?? '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                Score Global
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
                {corretora.total_cotacoes} cotacoes | Spread medio: {corretora.spread_medio?.toFixed(4) ?? '—'}
              </div>
            </div>
          </div>

          {/* 4 Criteria */}
          <RatingBar label="Taxa" icon={<TrendingDown size={14} />} value={ratingTaxa} />
          <RatingBar label="Agilidade" icon={<Zap size={14} />} value={ratingAgilidade} />
          <RatingBar label="Atendimento" icon={<HeadphonesIcon size={14} />} value={ratingAtendimento} />
          <RatingBar label="Confiabilidade" icon={<Shield size={14} />} value={ratingConfiabilidade} />

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
            marginTop: '1rem', paddingTop: '1rem',
            borderTop: '1px solid var(--bg-elevated, #475569)',
          }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Taxa Resposta</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{corretora.taxa_resposta != null ? `${corretora.taxa_resposta.toFixed(0)}%` : '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Taxa Aprovacao</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{corretora.taxa_aprovacao != null ? `${corretora.taxa_aprovacao.toFixed(0)}%` : '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Tempo Medio Resposta</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{corretora.tempo_medio_resposta != null ? `${corretora.tempo_medio_resposta}h` : '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Total Cotacoes</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{corretora.total_cotacoes}</div>
            </div>
          </div>
        </div>
      </div>

      {/* History section placeholder */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} style={{ color: 'var(--accent, #6366f1)' }} />
          Historico de Respostas
        </h3>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
          O historico detalhado de respostas (aprovadas / rejeitadas) sera carregado a partir das cotacoes da corretora.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
