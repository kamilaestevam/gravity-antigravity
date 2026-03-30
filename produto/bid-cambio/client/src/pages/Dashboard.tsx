/**
 * Dashboard.tsx — Visao Geral do BID Cambio (Buyer-side)
 * KPIs por moeda, parcelas, economia, corretoras, cotacoes, calendario de vencimentos
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Building2,
  ArrowLeftRight,
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react'

import { getDashboard } from '../shared/api'
import type {
  DashboardKPIs,
  MoedaCambio,
  StatusCotacaoCambio,
} from '../shared/types'
import {
  MOEDA_CAMBIO_LABELS,
  STATUS_COTACAO_LABELS,
  STATUS_COTACAO_BADGE,
} from '../shared/types'

// ─── Formatacao ────────────────────────────────────────────────────────────

const fmtMoney = (val: number, decimals = 2) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val)

const fmtRate = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(val)

const fmtPercent = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val) + '%'

// ─── Badge Colors ──────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

const MOEDA_COLORS: Record<string, string> = {
  USD: '#22c55e',
  EUR: '#3b82f6',
  GBP: '#a855f7',
  JPY: '#ef4444',
  CNY: '#f59e0b',
  CHF: '#06b6d4',
  ARS: '#ec4899',
  CLP: '#f97316',
  MXN: '#14b8a6',
  COP: '#8b5cf6',
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function Skeleton({ width, height }: { width: string; height: string }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: 8,
      background: 'var(--bg-elevated, #475569)',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-surface, #334155)',
      borderRadius: 12,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <Skeleton width="60%" height="14px" />
      <Skeleton width="40%" height="28px" />
    </div>
  )
}

// ─── Componente Principal ──────────────────────────────────────────────────

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboard()
      setKpis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ─── Loading State ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <LayoutDashboard size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: 0 }}>
            Visao Geral
          </h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    )
  }

  // ─── Error State ───────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{
        padding: '1.5rem',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <LayoutDashboard size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: 0 }}>
            Visao Geral
          </h1>
        </div>
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '2rem',
          textAlign: 'center',
        }}>
          <AlertTriangle size={32} style={{ color: 'var(--danger, #ef4444)', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 600, margin: '0 0 0.5rem' }}>
            Erro ao carregar dados
          </p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
            {error}
          </p>
          <button
            onClick={carregar}
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
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // ─── Empty State ───────────────────────────────────────────────────────

  if (!kpis) {
    return (
      <div style={{
        padding: '1.5rem',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <LayoutDashboard size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: 0 }}>
            Visao Geral
          </h1>
        </div>
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '3rem 2rem',
          textAlign: 'center',
        }}>
          <DollarSign size={40} style={{ color: 'var(--text-muted, #64748b)', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 600, margin: '0 0 0.5rem' }}>
            Nenhum dado disponivel
          </p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            Crie sua primeira cotacao de cambio para visualizar o dashboard.
          </p>
        </div>
      </div>
    )
  }

  // ─── Filled State ──────────────────────────────────────────────────────

  return (
    <div style={{
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: 'var(--text-primary, #f1f5f9)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LayoutDashboard size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Visao Geral</h1>
        </div>
        <button
          onClick={carregar}
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
          <RefreshCw size={14} />
          Atualizar
        </button>
      </div>

      {/* ── Totais por Moeda (badges coloridos) ── */}
      {kpis.taxas_mercado && kpis.taxas_mercado.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {kpis.taxas_mercado.map((tm) => (
            <div
              key={tm.moeda}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--bg-surface, #334155)',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                borderLeft: `3px solid ${MOEDA_COLORS[tm.moeda] ?? 'var(--accent, #6366f1)'}`,
              }}
            >
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: MOEDA_COLORS[tm.moeda] ?? 'var(--accent, #6366f1)',
                background: `${MOEDA_COLORS[tm.moeda] ?? 'var(--accent, #6366f1)'}22`,
                padding: '0.15rem 0.5rem',
                borderRadius: 9999,
              }}>
                {tm.moeda}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>Comercial</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                  R$ {fmtRate(tm.taxa_comercial)}
                </span>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: "'DM Mono', monospace",
                color: tm.variacao_24h >= 0 ? 'var(--success, #22c55e)' : 'var(--danger, #ef4444)',
              }}>
                {tm.variacao_24h >= 0 ? '+' : ''}{fmtPercent(tm.variacao_24h)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Cards Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Parcelas Pendentes */}
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Clock size={16} style={{ color: 'var(--warning, #f59e0b)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)' }}>
              Parcelas Pendentes
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpis.parcelas.pendentes}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
            R$ {fmtMoney(kpis.parcelas.valor_pendente_brl)}
          </div>
        </div>

        {/* Parcelas Vencidas */}
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '1.25rem',
          borderLeft: kpis.parcelas.vencidas > 0 ? '3px solid var(--danger, #ef4444)' : undefined,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--danger, #ef4444)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)' }}>
              Parcelas Vencidas
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: kpis.parcelas.vencidas > 0 ? 'var(--danger, #ef4444)' : undefined }}>
            {kpis.parcelas.vencidas}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
            R$ {fmtMoney(kpis.parcelas.valor_vencido_brl)}
          </div>
        </div>

        {/* Economia Acumulada */}
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '1.25rem',
          borderLeft: '3px solid var(--success, #22c55e)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--success, #22c55e)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)' }}>
              Economia Acumulada
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success, #22c55e)' }}>
            R$ {fmtMoney(kpis.savings.total_saving_brl)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
            Media: {fmtPercent(kpis.savings.media_saving_percentual)}
          </div>
        </div>

        {/* Corretoras Ativas */}
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Building2 size={16} style={{ color: 'var(--accent, #6366f1)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)' }}>
              Corretoras Cadastradas
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpis.corretoras_cadastradas}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
            {kpis.corretoras_por_tipo.map((ct) => (
              <span
                key={ct.tipo}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--accent, #6366f1)',
                  background: 'rgba(99,102,241,0.15)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 9999,
                }}
              >
                {ct.tipo}: {ct.count}
              </span>
            ))}
          </div>
        </div>

        {/* Cotacoes em Andamento */}
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ArrowLeftRight size={16} style={{ color: 'var(--accent, #6366f1)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)' }}>
              Cotacoes em Andamento
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpis.cotacoes_andamento}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
            Volume: R$ {fmtMoney(kpis.volume_brl)}
          </div>
        </div>

        {/* Aprovacao */}
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--success, #22c55e)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)' }}>
              Aprovacao
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{fmtPercent(kpis.aprovacao.percentual_em_tempo)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
            Nao respondidas: {kpis.aprovacao.nao_respondidas}
          </div>
        </div>
      </div>

      {/* ── Funil de Cotacoes ── */}
      {kpis.funil && kpis.funil.length > 0 && (
        <div style={{
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--text-primary, #f1f5f9)' }}>
            Funil de Cotacoes
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {kpis.funil.map((f) => {
              const badgeType = STATUS_COTACAO_BADGE[f.status] ?? 'default'
              const cores = BADGE_COLORS[badgeType]
              return (
                <div
                  key={f.status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: cores.bg,
                    color: cores.color,
                    padding: '0.4rem 0.75rem',
                    borderRadius: 9999,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{f.count}</span>
                  {STATUS_COTACAO_LABELS[f.status]}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Calendario de Vencimentos ── */}
      <div style={{
        background: 'var(--bg-surface, #334155)',
        borderRadius: 12,
        padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <CalendarClock size={16} style={{ color: 'var(--accent, #6366f1)' }} />
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
            Calendario de Vencimentos
          </h2>
        </div>

        {kpis.parcelas.pendentes === 0 && kpis.parcelas.vencidas === 0 ? (
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            Nenhum vencimento proximo.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {kpis.parcelas.vencidas > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.1)',
                borderLeft: '3px solid var(--danger, #ef4444)',
              }}>
                <AlertTriangle size={16} style={{ color: 'var(--danger, #ef4444)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--danger, #ef4444)' }}>
                  {kpis.parcelas.vencidas} parcela(s) vencida(s)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginLeft: 'auto' }}>
                  R$ {fmtMoney(kpis.parcelas.valor_vencido_brl)}
                </span>
              </div>
            )}
            {kpis.parcelas.pendentes > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 8,
                background: 'rgba(245,158,11,0.1)',
                borderLeft: '3px solid var(--warning, #f59e0b)',
              }}>
                <Clock size={16} style={{ color: 'var(--warning, #f59e0b)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--warning, #f59e0b)' }}>
                  {kpis.parcelas.pendentes} parcela(s) pendente(s)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginLeft: 'auto' }}>
                  R$ {fmtMoney(kpis.parcelas.valor_pendente_brl)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  )
}
