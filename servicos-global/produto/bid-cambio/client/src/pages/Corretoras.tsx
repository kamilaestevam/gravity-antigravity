/**
 * Corretoras.tsx — Lista de corretoras cadastradas
 * Filtros por tipo e status, badges, rating, botao adicionar
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Search,
  Plus,
  Star,
  Mail,
  Phone,
  Globe,
  Filter,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

import { listarCorretoras } from '../shared/api'
import type {
  BidCambioCorretora,
  BidCambioTipoCorretora,
  BidCambioStatusCorretora,
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

// ─── Componente Principal ──────────────────────────────────────────────────

export default function Corretoras() {
  const { t } = useTranslation()
  const [corretoras, setCorretoras] = useState<BidCambioCorretora[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listarCorretoras({
        busca: busca || undefined,
        status: filtroStatus || undefined,
      })
      setCorretoras(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar corretoras')
    } finally {
      setLoading(false)
    }
  }, [busca, filtroStatus])

  useEffect(() => { carregar() }, [carregar])

  // ── Styles ─────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary, #f1f5f9)',
  }

  const selectStyle: React.CSSProperties = {
    padding: '0.4rem 0.65rem',
    borderRadius: 8,
    border: '1px solid var(--bg-elevated, #475569)',
    background: 'var(--bg-base, #1e293b)',
    color: 'var(--text-primary, #f1f5f9)',
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1.25rem', borderRadius: 9999,
    fontSize: '0.875rem', fontWeight: 600,
    background: 'var(--accent, #6366f1)', color: '#fff',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  }

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading && corretoras.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Building2 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.corretoras.titulo')}</h1>
        </div>
        <div style={{ background: 'var(--bg-surface, #334155)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={28} style={{ color: 'var(--accent, #6366f1)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '0.75rem' }}>{t('bidcambio.corretoras.carregando')}</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────

  if (error && corretoras.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Building2 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.corretoras.titulo')}</h1>
        </div>
        <div style={{ background: 'var(--bg-surface, #334155)', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
          <AlertTriangle size={32} style={{ color: 'var(--danger, #ef4444)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{t('comum.erro_carregar')}</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{error}</p>
          <button onClick={carregar} style={btnPrimary}>
            <RefreshCw size={14} /> {t('acoes.tentar_novamente')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Empty ─────────────────────────────────────────────────────────────

  if (corretoras.length === 0 && !loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.corretoras.titulo')}</h1>
          </div>
          <button style={btnPrimary}><Plus size={14} /> {t('bidcambio.corretoras.adicionar')}</button>
        </div>
        <div style={{ background: 'var(--bg-surface, #334155)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
          <Building2 size={40} style={{ color: 'var(--text-muted, #64748b)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{t('bidcambio.corretoras.nenhuma')}</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {t('bidcambio.corretoras.nenhuma_desc')}
          </p>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.corretoras.titulo')}</h1>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent, #6366f1)',
            background: 'rgba(99,102,241,0.15)', padding: '0.15rem 0.5rem', borderRadius: 9999,
          }}>
            {corretoras.length}
          </span>
        </div>
        <button style={btnPrimary}><Plus size={14} /> {t('bidcambio.corretoras.adicionar')}</button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-base, #1e293b)', borderRadius: 9999,
          padding: '0.35rem 0.75rem', flex: '1 1 200px', maxWidth: 320,
        }}>
          <Search size={14} style={{ color: 'var(--text-muted, #64748b)' }} />
          <input
            type="text"
            placeholder={t('bidcambio.corretoras.buscar')}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary, #f1f5f9)', fontSize: '0.8125rem',
              fontFamily: 'inherit', width: '100%',
            }}
          />
        </div>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={selectStyle}>
          <option value="">{t('comum.todos_tipos')}</option>
          {(Object.entries(TIPO_CORRETORA_LABELS) as [BidCambioTipoCorretora, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={selectStyle}>
          <option value="">{t('comum.todos_status')}</option>
          {(Object.entries(STATUS_CORRETORA_LABELS) as [BidCambioStatusCorretora, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface, #334155)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bg-elevated, #475569)' }}>
                {[t('tabela.nome'), t('tabela.tipo'), t('tabela.email'), t('tabela.status'), t('tabela.rating'), t('tabela.moedas'), t('tabela.acoes')].map((h) => (
                  <th key={h} style={{
                    padding: '0.75rem 0.75rem', textAlign: 'left',
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corretoras.map((c) => {
                const statusBadge = STATUS_CORRETORA_BADGE[c.status_corretora_bid_cambio] ?? 'default'
                const cores = BADGE_COLORS[statusBadge]
                const moedasArr = c.moedas_operadas_corretora_bid_cambio?.split(',').map(m => m.trim()).filter(Boolean) ?? []
                return (
                  <tr
                    key={c.id_corretora_bid_cambio}
                    style={{ borderBottom: '1px solid var(--bg-elevated, #475569)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-base, #1e293b)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    {/* Nome */}
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                      <div>{c.razao_social_corretora_bid_cambio}</div>
                      {c.nome_fantasia_corretora_bid_cambio && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>
                          {c.nome_fantasia_corretora_bid_cambio}
                        </div>
                      )}
                    </td>

                    {/* Tipo */}
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent, #6366f1)',
                        background: 'rgba(99,102,241,0.15)', padding: '0.1rem 0.4rem', borderRadius: 9999,
                      }}>
                        {TIPO_CORRETORA_LABELS[c.tipo_corretora_bid_cambio]}
                      </span>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        <Mail size={12} /> {c.email_corretora_bid_cambio}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '0.15rem 0.5rem', borderRadius: 9999,
                        fontSize: '0.6875rem', fontWeight: 600,
                        background: cores.bg, color: cores.color,
                      }}>
                        {STATUS_CORRETORA_LABELS[c.status_corretora_bid_cambio]}
                      </span>
                    </td>

                    {/* Rating */}
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted, #64748b)' }}>—</span>
                    </td>

                    {/* Moedas */}
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                        {moedasArr.slice(0, 5).map((m) => (
                          <span key={m} style={{
                            fontSize: '0.5625rem', fontWeight: 700, color: 'var(--accent, #6366f1)',
                            background: 'rgba(99,102,241,0.15)', padding: '0.05rem 0.3rem', borderRadius: 9999,
                          }}>
                            {m}
                          </span>
                        ))}
                        {moedasArr.length > 5 && (
                          <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted, #64748b)' }}>
                            +{moedasArr.length - 5}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Acoes */}
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        style={{
                          padding: '0.3rem 0.65rem', borderRadius: 9999,
                          fontSize: '0.75rem', fontWeight: 600,
                          border: '1px solid var(--bg-elevated, #475569)', background: 'transparent',
                          color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {t('acoes.detalhes')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
