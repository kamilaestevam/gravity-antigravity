/**
 * Dashboard.tsx — Visao Geral do BID Frete
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Layout: KPIs em grid responsivo + Barra aprovacao + Tabela cotacoes
 * Padrao alinhado com Bid Cambio e Pedido dashboards
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  Truck,
  TrendUp,
  CheckCircle,
  ClockCountdown,
  Eye,
  Buildings,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Package,
} from '@phosphor-icons/react'

import { getDashboardKpis, getDashboardCalendario, getCotacoes } from '../shared/api'
import type {
  DashboardKPIs,
  CalendarioAlerta,
  Cotacao,
  StatusCotacao,
} from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'

// ─── Formatacao ──────────────────────────────────────────────────────────────

const formatarMoeda = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Badge de status ─────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

function BadgeStatus({ status }: { status: StatusCotacao }) {
  const variante = STATUS_BADGE[status]
  const cores = BADGE_COLORS[variante]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: cores.bg,
      color: cores.color,
    }}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icone: React.ReactNode
  label: string
  valor: string | number
  sublabel?: string
  acento?: string
}

function KpiCard({ icone, label, valor, sublabel, acento = '#60a5fa' }: KpiCardProps) {
  return (
    <div className="bf-kpi-card">
      <div className="bf-kpi-card__borda" style={{ background: acento }} />
      <div className="bf-kpi-card__conteudo">
        <div className="bf-kpi-card__header">
          <span className="bf-kpi-card__icone" style={{ color: acento }}>{icone}</span>
          <span className="bf-kpi-card__label">{label}</span>
        </div>
        <span className="bf-kpi-card__valor">{valor}</span>
        {sublabel && <span className="bf-kpi-card__sublabel">{sublabel}</span>}
      </div>
    </div>
  )
}

// ─── Alerta do calendario ────────────────────────────────────────────────────

const ALERTA_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  green:  { bg: 'rgba(34,197,94,0.1)',   color: 'var(--success, #22c55e)', border: 'rgba(34,197,94,0.3)' },
  yellow: { bg: 'rgba(245,158,11,0.1)',  color: 'var(--warning, #f59e0b)', border: 'rgba(245,158,11,0.3)' },
  orange: { bg: 'rgba(249,115,22,0.1)',  color: '#f97316',                 border: 'rgba(249,115,22,0.3)' },
  red:    { bg: 'rgba(239,68,68,0.1)',   color: 'var(--danger, #ef4444)',  border: 'rgba(239,68,68,0.3)' },
}

// ─── Tabs de filtro rapido ───────────────────────────────────────────────────

const TABS_COTACAO: { key: string; label: string }[] = [
  { key: 'TODAS', label: 'Todas as cotacoes' },
  { key: 'DATA_LIMITE', label: 'Data limite para resposta' },
  { key: 'PROXIMO_VENCIMENTO', label: 'Proximos ao vencimento' },
  { key: 'FALTA_INFORMACAO', label: 'Falta de informacao para cotacao' },
]

function TabsFiltro({ ativo, aoMudar, contadores }: {
  ativo: string
  aoMudar: (v: string) => void
  contadores: Record<string, number>
}) {
  return (
    <div className="bf-tabs">
      {TABS_COTACAO.map(tab => (
        <button
          key={tab.key}
          className={`bf-tab ${ativo === tab.key ? 'bf-tab--ativo' : ''}`}
          onClick={() => aoMudar(tab.key)}
        >
          {tab.label}
          {contadores[tab.key] != null && (
            <span className="bf-tab-count">{contadores[tab.key]}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [calendario, setCalendario] = useState<CalendarioAlerta[]>([])
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroTab, setFiltroTab] = useState('TODAS')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [kpisRes, calRes, cotRes] = await Promise.all([
        getDashboardKpis(),
        getDashboardCalendario(),
        getCotacoes({ limit: 10 }),
      ])
      setKpis(kpisRes)
      const alertas = Array.isArray(calRes)
        ? calRes
        : (calRes as Record<string, unknown>).alertas as CalendarioAlerta[] ?? []
      setCalendario(alertas)
      setCotacoes(cotRes.cotacoes)
    } catch {
      // loading state permanece
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ─── Colunas da TabelaGlobal ──────────────────────────────────────────────

  const colunas: TabelaGlobalColuna<Cotacao>[] = [
    {
      key: 'numero',
      label: 'Processo (DATI)',
      tipo: 'texto',
      largura: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--accent, #6366f1)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'referencia_interna',
      label: 'Referencia',
      tipo: 'texto',
      largura: 120,
      render: (val: string | null) => val ?? '—',
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      largura: 160,
      render: (val: StatusCotacao) => <BadgeStatus status={val} />,
    },
    {
      key: 'created_at',
      label: 'Data da cotacao',
      tipo: 'periodo',
      largura: 120,
      render: (val: string) => dataBR(val),
    },
    {
      key: 'user_id',
      label: 'Quem gerou',
      tipo: 'texto',
      largura: 100,
      render: () => 'DATI',
    },
    {
      key: 'origem_nome',
      label: 'Origem',
      tipo: 'texto',
      largura: 140,
    },
    {
      key: 'destino_nome',
      label: 'Destino',
      tipo: 'texto',
      largura: 120,
    },
    {
      key: 'modal',
      label: 'Modal',
      tipo: 'texto',
      largura: 100,
      render: (val: string) => MODAL_LABELS[val as keyof typeof MODAL_LABELS] ?? val,
    },
    {
      key: 'modalidade',
      label: 'Modalidade',
      tipo: 'texto',
      largura: 100,
      render: (val: string) => MODALIDADE_LABELS[val as keyof typeof MODALIDADE_LABELS] ?? val,
    },
    {
      key: 'peso_kg',
      label: 'Peso (Kg)',
      tipo: 'numero',
      largura: 100,
      align: 'right',
      render: (val: number | null) => val != null ? val.toLocaleString('pt-BR') : '—',
    },
  ]

  const acoes: TabelaGlobalAcao<Cotacao>[] = [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: (item: Cotacao) => navigate(`/cotacoes/${item.id}`),
    },
  ]

  // ─── Dados derivados ─────────────────────────────────────────────────────

  const savingPct = kpis?.savings.media_saving_percentual ?? 0
  const aprovacaoPct = kpis?.aprovacao.percentual_em_tempo ?? 0
  const totalFornecedores = kpis?.fornecedores_cadastrados ?? 0
  const fornecedoresPorTipo = kpis?.fornecedores_por_tipo ?? []

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PaginaGlobal className="bf-dashboard">
      {/* ════════ LINHA 1: KPI Cards + Botao CTA ════════ */}
      <div className="bf-kpis-row">
        <div className="bf-kpis-grid">
        <KpiCard
          icone={<ClockCountdown weight="duotone" size={20} />}
          label="Cotacoes em andamento"
          valor={kpis?.cotacoes_andamento ?? 0}
          sublabel={`USD ${formatarMoeda(kpis?.valor_andamento_usd ?? 0)} | BRL ${formatarMoeda(kpis?.valor_andamento_brl ?? 0)}`}
          acento="#60a5fa"
        />
        <KpiCard
          icone={<CheckCircle weight="duotone" size={20} />}
          label="Total de cotacoes passadas"
          valor={kpis?.cotacoes_passadas ?? 0}
          sublabel={`USD ${formatarMoeda(kpis?.valor_aprovado_usd ?? 0)} | BRL ${formatarMoeda(kpis?.valor_aprovado_brl ?? 0)}`}
          acento="#22c55e"
        />
        <KpiCard
          icone={<TrendUp weight="duotone" size={20} />}
          label="Saving estimado"
          valor={`${savingPct.toFixed(1)}%`}
          sublabel={`USD ${formatarMoeda(kpis?.savings.total_saving_usd ?? 0)} total`}
          acento="#22c55e"
        />
        <KpiCard
          icone={<Buildings weight="duotone" size={20} />}
          label="Fornecedores cadastrados"
          valor={totalFornecedores}
          sublabel={fornecedoresPorTipo.map(f => `${f.count} ${f.tipo.replace(/_/g, ' ').toLowerCase()}`).join(' | ') || 'Nenhum cadastrado'}
          acento="#6366f1"
        />
        </div>
        <div className="bf-kpis-cta">
          <BotaoGlobal
            variante="primario"
            icone={<Truck weight="bold" size={18} />}
            onClick={() => navigate('/cotacoes/nova')}
          >
            Buscar frete
          </BotaoGlobal>
        </div>
      </div>

      {/* ════════ LINHA 2: Aprovacao + Calendario ════════ */}
      <div className="bf-meio-row">
        {/* Barra de aprovacao */}
        <div className="bf-aprovacao-card">
          <p className="bf-section-label">Cotacoes aprovadas</p>
          <div className="bf-aprovacao-bar">
            <div
              className="bf-aprovacao-bar__fill"
              style={{ width: `${Math.max(aprovacaoPct, 2)}%` }}
            >
              {aprovacaoPct > 10 && (
                <span className="bf-aprovacao-bar__pct">{aprovacaoPct}%</span>
              )}
            </div>
          </div>
          <div className="bf-aprovacao-legenda">
            <span><span className="bf-dot bf-dot--green" /> Autorizadas em tempo</span>
            <span><span className="bf-dot bf-dot--yellow" /> Recusadas em tempo</span>
            <span><span className="bf-dot bf-dot--red" /> Nao respondidas</span>
          </div>
        </div>

        {/* Calendario de alertas */}
        <div className="bf-calendario-card">
          <div className="bf-calendario-nav">
            <span className="bf-calendario-nav__label">Ontem</span>
            <button className="bf-cal-btn"><CaretLeft size={14} weight="bold" /></button>
            <span className="bf-calendario-nav__hoje">
              <CalendarBlank weight="duotone" size={16} />
              Hoje
            </span>
            <button className="bf-cal-btn"><CaretRight size={14} weight="bold" /></button>
            <span className="bf-calendario-nav__label">Amanha</span>
          </div>
          <p className="bf-section-label" style={{ marginTop: '0.75rem' }}>Calendario</p>
          <div className="bf-alertas">
            {calendario.length > 0 ? calendario.map(a => {
              const cores = ALERTA_COLORS[a.cor]
              return (
                <div
                  key={a.tipo}
                  className="bf-alerta-item"
                  style={{ background: cores.bg, borderLeft: `3px solid ${cores.border}` }}
                >
                  <span className="bf-alerta-count" style={{ color: cores.color }}>{a.count}</span>
                  <span className="bf-alerta-label">{a.label}</span>
                </div>
              )
            }) : (
              <span className="bf-alertas-vazio">Nenhum alerta para hoje</span>
            )}
          </div>
        </div>
      </div>

      {/* ════════ LINHA 3: Tabela de Cotacoes em Andamento ════════ */}
      <div className="bf-table-section">
        <div className="bf-table-header">
          <h2 className="bf-table-title">Cotacoes em andamento</h2>
          <div className="bf-table-tools">
            <button className="bf-icon-btn" title="Exportar">
              <Package weight="duotone" size={18} />
            </button>
          </div>
        </div>

        <TabsFiltro
          ativo={filtroTab}
          aoMudar={setFiltroTab}
          contadores={{
            TODAS: cotacoes.length,
            DATA_LIMITE: cotacoes.filter(c => c.status === 'AGUARDANDO_APROVACAO').length,
            PROXIMO_VENCIMENTO: cotacoes.filter(c => c.status === 'EM_COTACAO').length,
            FALTA_INFORMACAO: cotacoes.filter(c => c.status === 'FALTA_INFORMACAO').length,
          }}
        />

        <TabelaGlobal
          dados={cotacoes}
          colunas={colunas}
          acoes={acoes}
          idKey="id"
          carregando={carregando}
          mensagemVazio="Nenhum registro cadastrado."
          tooltipBusca="Buscar..."
          aoClicarLinha={(item: Cotacao) => navigate(`/cotacoes/${item.id}`)}
        />
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════ */
        /* BID FRETE — Dashboard Styles                          */
        /* Design System: Solid Slate                             */
        /* Cor do produto: #60a5fa (Blue 400)                    */
        /* ═══════════════════════════════════════════════════════ */

        .bf-dashboard {
          padding: 0.5rem 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 0;
        }

        /* ── KPI Row (grid + botao CTA ao lado) ── */
        .bf-kpis-row {
          display: flex;
          align-items: stretch;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .bf-kpis-grid {
          flex: 1;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }
        .bf-kpis-cta {
          display: flex;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .bf-kpi-card {
          display: flex;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
          min-height: 100px;
        }

        .bf-kpi-card__borda {
          width: 4px;
          flex-shrink: 0;
          border-radius: 12px 0 0 12px;
        }

        .bf-kpi-card__conteudo {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          padding: 1.25rem;
          flex: 1;
        }

        .bf-kpi-card__header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bf-kpi-card__icone {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .bf-kpi-card__label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
        }

        .bf-kpi-card__valor {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
          line-height: 1.2;
        }

        .bf-kpi-card__sublabel {
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
          font-family: 'DM Mono', monospace;
          margin-top: 0.125rem;
        }

        /* ── Linha 2: Aprovacao + Calendario ── */
        .bf-meio-row {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 1200px) {
          .bf-meio-row { grid-template-columns: 1fr; }
        }

        /* ── Aprovacao ── */
        .bf-aprovacao-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem;
        }

        .bf-section-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
          margin-bottom: 0.625rem;
        }

        .bf-aprovacao-bar {
          height: 28px;
          background: var(--bg-elevated, #475569);
          border-radius: var(--radius-pill, 9999px);
          overflow: hidden;
        }

        .bf-aprovacao-bar__fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #16a34a);
          border-radius: var(--radius-pill, 9999px);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.75rem;
          transition: width 0.5s ease;
          min-width: 8px;
        }

        .bf-aprovacao-bar__pct {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        .bf-aprovacao-legenda {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.625rem;
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
        }

        .bf-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.35rem;
        }
        .bf-dot--green  { background: #22c55e; }
        .bf-dot--yellow { background: #f59e0b; }
        .bf-dot--red    { background: #ef4444; }

        /* ── Calendario ── */
        .bf-calendario-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem;
        }

        .bf-calendario-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .bf-calendario-nav__label {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }

        .bf-calendario-nav__hoje {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary, #f1f5f9);
        }

        .bf-cal-btn {
          background: var(--bg-elevated, #475569);
          border: none;
          border-radius: var(--radius-sm, 4px);
          padding: 0.3rem;
          cursor: pointer;
          color: var(--text-secondary, #94a3b8);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .bf-cal-btn:hover {
          background: var(--bg-base, #1e293b);
          color: var(--text-primary, #f1f5f9);
        }

        .bf-alertas {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bf-alerta-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-md, 8px);
        }

        .bf-alerta-count {
          font-size: 1.125rem;
          font-weight: 700;
          min-width: 1.5rem;
          text-align: center;
        }

        .bf-alerta-label {
          font-size: 0.8125rem;
          color: var(--text-primary, #f1f5f9);
        }

        .bf-alertas-vazio {
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
          text-align: center;
          padding: 1rem 0;
        }

        /* ── Tabela Section (Linha 3) ── */
        .bf-table-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
        }

        .bf-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.25rem 0;
        }

        .bf-table-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }

        .bf-table-tools {
          display: flex;
          gap: 0.5rem;
        }

        .bf-icon-btn {
          background: var(--bg-elevated, #475569);
          border: none;
          border-radius: var(--radius-md, 8px);
          padding: 0.4rem;
          cursor: pointer;
          color: var(--text-secondary, #94a3b8);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .bf-icon-btn:hover {
          background: var(--bg-base, #1e293b);
          color: var(--text-primary, #f1f5f9);
        }

        /* ── Tabs ── */
        .bf-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 0.75rem 1.25rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }

        .bf-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .bf-tab:hover { color: var(--text-primary, #f1f5f9); }
        .bf-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }

        .bf-tab-count {
          font-size: 0.6875rem;
          font-weight: 700;
          background: var(--bg-elevated, #475569);
          color: var(--text-secondary, #94a3b8);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-pill, 9999px);
          min-width: 1.25rem;
          text-align: center;
        }
        .bf-tab--ativo .bf-tab-count {
          background: rgba(99,102,241,0.2);
          color: var(--accent, #6366f1);
        }

        /* Botões: usar BotaoGlobal do nucleo-global */
      `}</style>
    </PaginaGlobal>
  )
}
