/**
 * Desempenho.tsx — Portal da Corretora: Metricas de performance e rating
 * KPI cards, rating por categoria, score global, placeholder de grafico
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  Star,
  Clock,
  Percent,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Settings,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface DesempenhoData {
  taxa_resposta: number
  taxa_aprovacao: number
  tempo_medio_resposta_min: number
  rating_global: number
  categorias: {
    taxa: number
    agilidade: number
    atendimento: number
    confiabilidade: number
  }
}

type PageState = 'loading' | 'error' | 'empty' | 'filled' | 'disabled'

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
    marginBottom: '2rem',
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  kpiCard: {
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    gap: '0.35rem',
  } as React.CSSProperties,
  kpiIconWrap: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
  } as React.CSSProperties,
  kpiLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: 'var(--text-muted, #64748b)',
  } as React.CSSProperties,
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  } as React.CSSProperties,
  card: {
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    padding: '1.25rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--bg-base, #334155)',
    margin: 0,
  } as React.CSSProperties,
  ratingHero: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    padding: '2rem',
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  ratingNumber: {
    fontSize: '3.5rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
    lineHeight: 1,
  } as React.CSSProperties,
  ratingSub: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: 'var(--text-muted, #64748b)',
  } as React.CSSProperties,
  starRow: {
    display: 'flex',
    gap: '0.15rem',
  } as React.CSSProperties,
  progressRow: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 40px',
    gap: '0.75rem',
    alignItems: 'center',
    marginTop: '0.75rem',
  } as React.CSSProperties,
  progressLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--text-secondary, #94a3b8)',
  } as React.CSSProperties,
  progressBar: {
    height: 8,
    background: 'var(--bg-base, #334155)',
    borderRadius: 9999,
    overflow: 'hidden',
  } as React.CSSProperties,
  progressNota: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
    textAlign: 'right' as const,
  } as React.CSSProperties,
  chartPlaceholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '2rem',
    color: 'var(--text-muted, #64748b)',
    fontSize: '0.8125rem',
    border: '1px dashed var(--bg-base, #334155)',
    borderRadius: 8,
    marginTop: '1rem',
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function StarRating({ nota, tamanho = 16 }: { nota: number; tamanho?: number }) {
  return (
    <div style={s.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={tamanho}
          fill={i <= Math.round(nota) ? 'var(--warning, #f59e0b)' : 'none'}
          stroke={i <= Math.round(nota) ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #64748b)'}
        />
      ))}
    </div>
  )
}

function ProgressBar({ label, valor, max = 5 }: { label: string; valor: number; max?: number }) {
  const pct = Math.min((valor / max) * 100, 100)
  const cor = pct >= 80
    ? 'var(--success, #22c55e)'
    : pct >= 60
      ? 'var(--warning, #f59e0b)'
      : 'var(--danger, #ef4444)'

  return (
    <div style={s.progressRow}>
      <span style={s.progressLabel}>{label}</span>
      <div style={s.progressBar}>
        <div style={{
          height: '100%',
          borderRadius: 9999,
          width: `${pct}%`,
          background: cor,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={s.progressNota}>
        {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(valor)}
      </span>
    </div>
  )
}

const fmtPct = (val: number): string =>
  `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val)}%`

// ─── Component ──────────────────────────────────────────────────────────────

interface DesempenhoProps {
  disabled?: boolean
}

export default function Desempenho({ disabled = false }: DesempenhoProps) {
  const { t } = useTranslation()
  const [dados, setDados] = useState<DesempenhoData | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')

  const carregar = useCallback(async () => {
    if (disabled) {
      setPageState('disabled')
      return
    }
    setPageState('loading')
    try {
      const { getPortalMeuDesempenho } = await import('../../shared/api')
      const data = await getPortalMeuDesempenho()
      const d = data as unknown as DesempenhoData
      if (d.taxa_resposta === 0 && d.taxa_aprovacao === 0 && d.rating_global === 0) {
        setDados(d)
        setPageState('empty')
      } else {
        setDados(d)
        setPageState('filled')
      }
    } catch {
      setPageState('error')
    }
  }, [disabled])

  useEffect(() => {
    carregar()
  }, [carregar])

  // ─── Render States ──────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><TrendingUp size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.meu_desempenho.titulo')}</h1></div>
        </div>
        <div style={s.center}>
          <Loader2 size={48} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
          <p>{t('bidcambio.portal.meu_desempenho.carregando')}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><TrendingUp size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.meu_desempenho.titulo')}</h1></div>
        </div>
        <div style={s.center}>
          <AlertCircle size={48} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
          <p style={{ color: 'var(--danger, #ef4444)' }}>Erro ao carregar metricas.</p>
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
          <div style={s.headerIcon}><TrendingUp size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.meu_desempenho.titulo')}</h1><p style={s.subtitle}>{t('bidcambio.portal.config.desabilitado')}</p></div>
        </div>
        <div style={s.center}>
          <Settings size={48} style={{ opacity: 0.3 }} />
          <p>Funcionalidade desabilitada.</p>
        </div>
      </div>
    )
  }

  if (pageState === 'empty') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><TrendingUp size={22} /></div>
          <div>
            <h1 style={s.title}>{t('bidcambio.portal.meu_desempenho.titulo')}</h1>
            <p style={s.subtitle}>{t('bidcambio.portal.meu_desempenho.subtitulo')}</p>
          </div>
        </div>
        <div style={s.center}>
          <BarChart3 size={48} style={{ opacity: 0.3 }} />
          <p>{t('bidcambio.portal.meu_desempenho.vazio')}</p>
        </div>
      </div>
    )
  }

  const cats = dados?.categorias ?? { taxa: 0, agilidade: 0, atendimento: 0, confiabilidade: 0 }
  const rating = dados?.rating_global ?? 0

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerIcon}><TrendingUp size={22} /></div>
        <div>
          <h1 style={s.title}>{t('bidcambio.portal.meu_desempenho.titulo')}</h1>
          <p style={s.subtitle}>{t('bidcambio.portal.meu_desempenho.subtitulo')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiGrid}>
        <div style={s.kpiCard}>
          <div style={{ ...s.kpiIconWrap, background: 'rgba(99,102,241,0.15)', color: 'var(--accent, #6366f1)' }}>
            <Percent size={20} />
          </div>
          <span style={s.kpiValue}>{fmtPct(dados?.taxa_resposta ?? 0)}</span>
          <span style={s.kpiLabel}>{t('bidcambio.portal.meu_desempenho.taxa_resposta')}</span>
        </div>
        <div style={s.kpiCard}>
          <div style={{ ...s.kpiIconWrap, background: 'rgba(34,197,94,0.15)', color: 'var(--success, #22c55e)' }}>
            <CheckCircle size={20} />
          </div>
          <span style={s.kpiValue}>{fmtPct(dados?.taxa_aprovacao ?? 0)}</span>
          <span style={s.kpiLabel}>{t('bidcambio.portal.meu_desempenho.taxa_aprovacao')}</span>
        </div>
        <div style={s.kpiCard}>
          <div style={{ ...s.kpiIconWrap, background: 'rgba(245,158,11,0.15)', color: 'var(--warning, #f59e0b)' }}>
            <Clock size={20} />
          </div>
          <span style={s.kpiValue}>{dados?.tempo_medio_resposta_min ?? 0} min</span>
          <span style={s.kpiLabel}>{t('bidcambio.portal.meu_desempenho.tempo_medio')}</span>
        </div>
      </div>

      {/* Score Global */}
      <div style={s.ratingHero}>
        <div style={s.ratingNumber}>
          {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rating)}
        </div>
        <StarRating nota={rating} tamanho={28} />
        <span style={s.ratingSub}>{t('bidcambio.portal.meu_desempenho.score_global')}</span>
      </div>

      {/* Bottom Grid */}
      <div style={s.bottomGrid}>
        {/* Rating por Categoria */}
        <div style={s.card}>
          <h3 style={s.sectionTitle}>{t('bidcambio.portal.meu_desempenho.rating_categoria')}</h3>
          <ProgressBar label={t('bidcambio.portal.meu_desempenho.taxa')} valor={cats.taxa} />
          <ProgressBar label={t('bidcambio.portal.meu_desempenho.agilidade')} valor={cats.agilidade} />
          <ProgressBar label={t('bidcambio.portal.meu_desempenho.atendimento')} valor={cats.atendimento} />
          <ProgressBar label={t('bidcambio.portal.meu_desempenho.confiabilidade')} valor={cats.confiabilidade} />
        </div>

        {/* Chart Placeholder */}
        <div style={s.card}>
          <h3 style={s.sectionTitle}>{t('bidcambio.portal.meu_desempenho.evolucao_historica')}</h3>
          <div style={s.chartPlaceholder}>
            <BarChart3 size={32} style={{ opacity: 0.4 }} />
            <p style={{ margin: 0 }}>{t('bidcambio.portal.meu_desempenho.grafico_breve')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
