/**
 * PortalDashboard.tsx — Portal da Corretora: Dashboard com KPI cards
 * 6 KPI cards + action cards para navegacao rapida
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  Clock,
  Send,
  CheckCircle,
  Percent,
  DollarSign,
  Timer,
  ArrowRight,
  FileText,
  TrendingUp,
  Settings,
  AlertCircle,
  Loader2,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface PortalKPIs {
  cotacoes_pendentes: number
  respostas_enviadas: number
  respostas_aprovadas: number
  taxa_conversao: number
  volume_total_brl: number
  tempo_medio_resposta_min: number
}

type PageState = 'loading' | 'error' | 'empty' | 'filled' | 'disabled'

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = {
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
  headerTitle: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
    margin: 0,
  } as React.CSSProperties,
  headerSub: {
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
    gap: '0.5rem',
  } as React.CSSProperties,
  kpiIconWrap: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  kpiLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted, #64748b)',
  } as React.CSSProperties,
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  } as React.CSSProperties,
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  } as React.CSSProperties,
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'var(--bg-surface, #1e293b)',
    border: '1px solid var(--bg-base, #334155)',
    borderRadius: 12,
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    width: '100%',
    color: 'inherit',
    textDecoration: 'none',
  } as React.CSSProperties,
  actionIconWrap: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base, #334155)',
    borderRadius: 8,
    flexShrink: 0,
  } as React.CSSProperties,
  actionTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
  } as React.CSSProperties,
  actionDesc: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #94a3b8)',
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
  disabledOverlay: {
    opacity: 0.5,
    pointerEvents: 'none' as const,
  } as React.CSSProperties,
} as const

// ─── Formatacao ─────────────────────────────────────────────────────────────

const fmtBRL = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const fmtPct = (val: number): string =>
  `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val)}%`

// ─── Component ──────────────────────────────────────────────────────────────

interface PortalDashboardProps {
  disabled?: boolean
  onNavigate?: (path: string) => void
}

export default function PortalDashboard({ disabled = false, onNavigate }: PortalDashboardProps) {
  const [kpis, setKpis] = useState<PortalKPIs | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')

  const carregar = useCallback(async () => {
    if (disabled) {
      setPageState('disabled')
      return
    }
    setPageState('loading')
    try {
      const { getPortalCorretoraDashboard } = await import('../../shared/api')
      const data = await getPortalCorretoraDashboard()
      const kpiData = data as unknown as PortalKPIs
      if (
        kpiData.cotacoes_pendentes === 0 &&
        kpiData.respostas_enviadas === 0 &&
        kpiData.respostas_aprovadas === 0 &&
        kpiData.volume_total_brl === 0
      ) {
        setKpis(kpiData)
        setPageState('empty')
      } else {
        setKpis(kpiData)
        setPageState('filled')
      }
    } catch {
      setPageState('error')
    }
  }, [disabled])

  useEffect(() => {
    carregar()
  }, [carregar])

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
  }

  const kpiCards = [
    {
      icon: <Clock size={18} />,
      label: 'Cotacoes Pendentes',
      value: String(kpis?.cotacoes_pendentes ?? 0),
      color: 'var(--warning, #f59e0b)',
      bg: 'rgba(245,158,11,0.15)',
    },
    {
      icon: <Send size={18} />,
      label: 'Respostas Enviadas',
      value: String(kpis?.respostas_enviadas ?? 0),
      color: 'var(--accent, #6366f1)',
      bg: 'rgba(99,102,241,0.15)',
    },
    {
      icon: <CheckCircle size={18} />,
      label: 'Respostas Aprovadas',
      value: String(kpis?.respostas_aprovadas ?? 0),
      color: 'var(--success, #22c55e)',
      bg: 'rgba(34,197,94,0.15)',
    },
    {
      icon: <Percent size={18} />,
      label: 'Taxa de Conversao',
      value: fmtPct(kpis?.taxa_conversao ?? 0),
      color: 'var(--accent, #6366f1)',
      bg: 'rgba(99,102,241,0.15)',
    },
    {
      icon: <DollarSign size={18} />,
      label: 'Volume Total Operado',
      value: fmtBRL(kpis?.volume_total_brl ?? 0),
      color: 'var(--success, #22c55e)',
      bg: 'rgba(34,197,94,0.15)',
    },
    {
      icon: <Timer size={18} />,
      label: 'Tempo Medio Resposta',
      value: `${kpis?.tempo_medio_resposta_min ?? 0} min`,
      color: 'var(--warning, #f59e0b)',
      bg: 'rgba(245,158,11,0.15)',
    },
  ]

  const actionCards = [
    {
      title: 'Cotacoes Pendentes',
      desc: 'Responda cotacoes antes do prazo',
      icon: <FileText size={20} />,
      path: '/portal/cotacoes-pendentes',
      color: 'var(--accent, #6366f1)',
    },
    {
      title: 'Minhas Respostas',
      desc: 'Acompanhe o status das propostas',
      icon: <Send size={20} />,
      path: '/portal/minhas-respostas',
      color: 'var(--warning, #f59e0b)',
    },
    {
      title: 'Meu Desempenho',
      desc: 'Veja seu rating e metricas',
      icon: <TrendingUp size={20} />,
      path: '/portal/meu-desempenho',
      color: 'var(--success, #22c55e)',
    },
  ]

  // ─── Render States ──────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.headerIcon}><LayoutDashboard size={22} /></div>
          <div>
            <h1 style={styles.headerTitle}>Portal da Corretora</h1>
            <p style={styles.headerSub}>Visao geral das suas cotacoes e desempenho</p>
          </div>
        </div>
        <div style={styles.center}>
          <Loader2 size={48} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.headerIcon}><LayoutDashboard size={22} /></div>
          <div>
            <h1 style={styles.headerTitle}>Portal da Corretora</h1>
          </div>
        </div>
        <div style={styles.center}>
          <AlertCircle size={48} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
          <p style={{ color: 'var(--danger, #ef4444)' }}>Erro ao carregar dashboard. Tente novamente.</p>
          <button
            onClick={carregar}
            style={{
              ...pillButton,
              background: 'var(--accent, #6366f1)',
              color: '#fff',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (pageState === 'disabled') {
    return (
      <div style={{ ...styles.page, ...styles.disabledOverlay }}>
        <div style={styles.header}>
          <div style={styles.headerIcon}><LayoutDashboard size={22} /></div>
          <div>
            <h1 style={styles.headerTitle}>Portal da Corretora</h1>
            <p style={styles.headerSub}>Portal desabilitado</p>
          </div>
        </div>
        <div style={styles.center}>
          <Settings size={48} style={{ opacity: 0.3 }} />
          <p>O portal da corretora esta desabilitado. Contate o administrador.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerIcon}><LayoutDashboard size={22} /></div>
        <div>
          <h1 style={styles.headerTitle}>Portal da Corretora</h1>
          <p style={styles.headerSub}>Visao geral das suas cotacoes e desempenho</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {kpiCards.map((card) => (
          <div key={card.label} style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconWrap, background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <span style={styles.kpiLabel}>{card.label}</span>
            <span style={styles.kpiValue}>{card.value}</span>
          </div>
        ))}
      </div>

      {pageState === 'empty' && (
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-secondary, #94a3b8)',
          fontSize: '0.875rem',
        }}>
          Nenhuma atividade registrada ainda. Aguarde o recebimento de cotacoes.
        </div>
      )}

      {/* Action Cards */}
      <div style={styles.actionGrid}>
        {actionCards.map((card) => (
          <button
            key={card.path}
            style={styles.actionCard}
            onClick={() => navigate(card.path)}
          >
            <div style={{ ...styles.actionIconWrap, color: card.color }}>
              {card.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
              <span style={styles.actionTitle}>{card.title}</span>
              <span style={styles.actionDesc}>{card.desc}</span>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  )
}

const pillButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1.25rem',
  borderRadius: 9999,
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: 'all 0.15s ease',
}
