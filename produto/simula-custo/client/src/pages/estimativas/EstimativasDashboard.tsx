/**
 * EstimativasDashboard.tsx — Dashboard de Estimativas do SimulaCusto
 * Skill: antigravity-simulacusto
 *
 * KPI cards + TabelaGlobal com filtros, badges de status, ações por linha.
 * Design: Solid Slate (Dark Mode) — skill: antigravity-design-system.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  Calculator,
  Plus,
  Eye,
  CopySimple,
  Archive,
  CurrencyDollar,
  ChartBar,
  ClockCountdown,
  CheckCircle,
} from '@phosphor-icons/react'
import { getEstimativas, getEstimativasKpis, duplicarEstimativa, atualizarStatusEstimativa } from '../../shared/api'
import type { Estimativa, EstimativasKpis, EstimativaStatus } from '../../shared/types'
import { STATUS_LABELS, STATUS_BADGE, OPERACAO_LABELS } from '../../shared/types'

// ─── Formatação ──────────────────────────────────────────────────────────────

const brl = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : '—'

const dataBR = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Badge de status ─────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  warning: { bg: 'rgba(245,158,11,0.15)', color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)', color: 'var(--success, #22c55e)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

function BadgeStatus({ status }: { status: EstimativaStatus }) {
  const variante = STATUS_BADGE[status]
  const cores = BADGE_COLORS[variante]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-pill, 9999px)',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: cores.bg,
        color: cores.color,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icone: React.ReactNode
  label: string
  valor: string
  destaque?: boolean
}

function KpiCard({ icone, label, valor, destaque }: KpiCardProps) {
  return (
    <div className="ed-kpi-card" data-destaque={destaque || undefined}>
      <div className="ed-kpi-icon">{icone}</div>
      <div className="ed-kpi-content">
        <span className="ed-kpi-label">{label}</span>
        <span className="ed-kpi-value">{valor}</span>
      </div>
    </div>
  )
}

// ─── Tabs de filtro ──────────────────────────────────────────────────────────

interface TabFiltroProps {
  ativo: EstimativaStatus | 'TODAS'
  aoMudar: (v: EstimativaStatus | 'TODAS') => void
  contadores: { total: number; em_criacao: number; criadas: number; arquivadas: number }
}

const TABS: { key: EstimativaStatus | 'TODAS'; label: string }[] = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'EM_CRIACAO', label: 'Em Criação' },
  { key: 'CRIADA', label: 'Criadas' },
  { key: 'ARQUIVADA', label: 'Arquivadas' },
]

function TabsFiltro({ ativo, aoMudar, contadores }: TabFiltroProps) {
  const getContador = (key: EstimativaStatus | 'TODAS') => {
    if (key === 'TODAS') return contadores.total
    if (key === 'EM_CRIACAO') return contadores.em_criacao
    if (key === 'CRIADA') return contadores.criadas
    return contadores.arquivadas
  }

  return (
    <div className="ed-tabs">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`ed-tab ${ativo === tab.key ? 'ed-tab--ativo' : ''}`}
          onClick={() => aoMudar(tab.key)}
        >
          {tab.label}
          <span className="ed-tab-count">{getContador(tab.key)}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function EstimativasDashboard() {
  const navigate = useNavigate()
  const [estimativas, setEstimativas] = useState<Estimativa[]>([])
  const [kpis, setKpis] = useState<EstimativasKpis>({
    total: 0, em_criacao: 0, criadas: 0, arquivadas: 0,
    landed_cost_medio: 0, total_tributos_acumulado: 0,
  })
  const [filtroStatus, setFiltroStatus] = useState<EstimativaStatus | 'TODAS'>('TODAS')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [listRes, kpisRes] = await Promise.all([
        getEstimativas({ status: filtroStatus === 'TODAS' ? undefined : filtroStatus }),
        getEstimativasKpis(),
      ])
      setEstimativas(listRes.data)
      setKpis(kpisRes)
    } catch {
      setEstimativas([])
    } finally {
      setCarregando(false)
    }
  }, [filtroStatus])

  useEffect(() => { carregar() }, [carregar])

  const handleDuplicar = async (item: Estimativa) => {
    await duplicarEstimativa(item.id)
    carregar()
  }

  const handleArquivar = async (item: Estimativa) => {
    await atualizarStatusEstimativa(item.id, 'ARQUIVADA')
    carregar()
  }

  // ─── Colunas da TabelaGlobal ──────────────────────────────────────────────

  const colunas: TabelaGlobalColuna<Estimativa>[] = [
    {
      key: 'numero',
      label: 'Número',
      tipo: 'texto',
      largura: 170,
      render: (val: string) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--accent, #6366f1)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      largura: 130,
      render: (val: EstimativaStatus) => <BadgeStatus status={val} />,
    },
    {
      key: 'operacao',
      label: 'Operação',
      tipo: 'texto',
      largura: 120,
      render: (val: string) => OPERACAO_LABELS[val as keyof typeof OPERACAO_LABELS] ?? val,
    },
    {
      key: 'ncm',
      label: 'NCM',
      tipo: 'texto',
      largura: 110,
      render: (val: string) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>{val}</span>
      ),
    },
    {
      key: 'referencia',
      label: 'Referência',
      tipo: 'texto',
      largura: 140,
      render: (val: string | null) => val ?? '—',
    },
    {
      key: 'landed_cost_brl',
      label: 'Landed Cost',
      tipo: 'numero',
      largura: 150,
      align: 'right',
      render: (val: number | null) => (
        <span style={{ fontWeight: 600, color: val ? 'var(--success, #22c55e)' : 'var(--text-muted)' }}>
          {brl(val)}
        </span>
      ),
    },
    {
      key: 'total_tributos',
      label: 'Tributos',
      tipo: 'numero',
      largura: 130,
      align: 'right',
      render: (val: number | null) => brl(val),
    },
    {
      key: 'data_geracao',
      label: 'Data',
      tipo: 'periodo',
      largura: 110,
      render: (val: string) => dataBR(val),
    },
  ]

  // ─── Ações por linha ──────────────────────────────────────────────────────

  const acoes: TabelaGlobalAcao<Estimativa>[] = [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: (item: Estimativa) => navigate(`/estimativas/${item.id}`),
    },
    {
      id: 'duplicar',
      icone: <CopySimple weight="duotone" size={16} />,
      tooltip: 'Duplicar estimativa',
      onClick: (item: Estimativa) => handleDuplicar(item),
    },
    {
      id: 'arquivar',
      icone: <Archive weight="duotone" size={16} />,
      tooltip: (item: Estimativa) => item.status === 'ARQUIVADA' ? 'Já arquivada' : 'Arquivar',
      onClick: (item: Estimativa) => handleArquivar(item),
      disabled: (item: Estimativa) => item.status === 'ARQUIVADA',
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="ed-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<Calculator weight="duotone" size={22} />}
          titulo="Estimativas de Custo"
          subtitulo="Gerencie suas simulações de Landed Cost"
          acoes={
            <button className="btn btn-primary" onClick={() => navigate('/estimativas/nova')}>
              <Plus weight="bold" size={16} />
              Nova Estimativa
            </button>
          }
        />
      }
    >
      {/* ─── KPIs ────────────────────────────────────────── */}
      <div className="ed-kpis">
        <KpiCard
          icone={<ChartBar weight="duotone" size={20} color="#6366f1" />}
          label="Total de Estimativas"
          valor={String(kpis.total)}
        />
        <KpiCard
          icone={<ClockCountdown weight="duotone" size={20} color="#f59e0b" />}
          label="Em Criação"
          valor={String(kpis.em_criacao)}
        />
        <KpiCard
          icone={<CheckCircle weight="duotone" size={20} color="#22c55e" />}
          label="Criadas"
          valor={String(kpis.criadas)}
        />
        <KpiCard
          icone={<CurrencyDollar weight="duotone" size={20} color="#22c55e" />}
          label="Landed Cost Médio"
          valor={brl(kpis.landed_cost_medio)}
          destaque
        />
      </div>

      {/* ─── Tabs + Tabela ───────────────────────────────── */}
      <div className="ed-table-section">
        <TabsFiltro
          ativo={filtroStatus}
          aoMudar={setFiltroStatus}
          contadores={kpis}
        />

        <TabelaGlobal
          dados={estimativas}
          colunas={colunas}
          acoes={acoes}
          idKey="id"
          mensagemVazio="Nenhuma estimativa encontrada"
          tooltipBusca="Buscar por número, NCM ou referência"
        />
      </div>

      <style>{`
        /* ─── KPIs Grid ───────────────────────────────────── */
        .ed-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 1024px) {
          .ed-kpis { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .ed-kpis { grid-template-columns: 1fr; }
        }

        .ed-kpi-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ed-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.5));
        }
        .ed-kpi-card[data-destaque] {
          border: 1px solid rgba(34,197,94,0.3);
          background: linear-gradient(135deg, var(--bg-surface, #334155) 0%, rgba(34,197,94,0.08) 100%);
        }

        .ed-kpi-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md, 8px);
          background: var(--bg-base, #1e293b);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ed-kpi-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .ed-kpi-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
        }
        .ed-kpi-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
        }

        /* ─── Table Section ───────────────────────────────── */
        .ed-table-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
        }

        /* ─── Tabs ────────────────────────────────────────── */
        .ed-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 1rem 1.25rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }
        .ed-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ed-tab:hover {
          color: var(--text-primary, #f1f5f9);
        }
        .ed-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }
        .ed-tab-count {
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--bg-elevated, #475569);
          color: var(--text-secondary, #94a3b8);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-pill, 9999px);
          min-width: 1.25rem;
          text-align: center;
        }
        .ed-tab--ativo .ed-tab-count {
          background: rgba(99,102,241,0.2);
          color: var(--accent, #6366f1);
        }

        /* ─── Botão Nova Estimativa ──────────────────────── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: inherit;
        }
        .btn-primary {
          background: var(--accent, #6366f1);
          color: #0f172a;
        }
        .btn-primary:hover { background: var(--accent-hover, #4f46e5); }
      `}</style>
    </PaginaGlobal>
  )
}
