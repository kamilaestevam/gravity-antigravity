/**
 * Dashboard.tsx — Visão Geral do BID Frete (T1)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Baseado nos prints: modelo.png, modelo 5, 6, 7, 10
 * Layout: KPIs + Donut Fornecedores + Calendário Alertas + Moedas + Tabela Cotações
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { CardGraficoGlobal } from '@nucleo/card-global'
import {
  ChartPieSlice,
  Truck,
  CurrencyDollar,
  TrendUp,
  CheckCircle,
  ClockCountdown,
  Eye,
  ArrowRight,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Buildings,
  Warning,
  Timer,
  Prohibit,
} from '@phosphor-icons/react'

import { getDashboardKpis, getDashboardCalendario, getCotacoes } from '../shared/api'
import type {
  DashboardKPIs,
  CalendarioAlerta,
  Cotacao,
  StatusCotacao,
} from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'

// ─── Formatação ──────────────────────────────────────────────────────────────

const usd = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const brl = (val: number) =>
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

// ─── Alerta do calendário ────────────────────────────────────────────────────

const ALERTA_ICONS: Record<string, React.ReactNode> = {
  green:  <CheckCircle weight="duotone" size={16} />,
  yellow: <ClockCountdown weight="duotone" size={16} />,
  orange: <Timer weight="duotone" size={16} />,
  red:    <Prohibit weight="duotone" size={16} />,
}

const ALERTA_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  green:  { bg: 'rgba(34,197,94,0.1)',   color: 'var(--success, #22c55e)', border: 'rgba(34,197,94,0.3)' },
  yellow: { bg: 'rgba(245,158,11,0.1)',  color: 'var(--warning, #f59e0b)', border: 'rgba(245,158,11,0.3)' },
  orange: { bg: 'rgba(249,115,22,0.1)',  color: '#f97316',                 border: 'rgba(249,115,22,0.3)' },
  red:    { bg: 'rgba(239,68,68,0.1)',   color: 'var(--danger, #ef4444)',  border: 'rgba(239,68,68,0.3)' },
}

// ─── Tabs de filtro rápido ───────────────────────────────────────────────────

interface TabFiltroProps {
  ativo: string
  aoMudar: (v: string) => void
  contadores: Record<string, number>
}

const TABS_COTACAO: { key: string; label: string }[] = [
  { key: 'TODAS', label: 'Todas as cotações' },
  { key: 'DATA_LIMITE', label: 'Data limite para resposta' },
  { key: 'PROXIMO_VENCIMENTO', label: 'Próximos ao vencimento' },
  { key: 'FALTA_INFORMACAO', label: 'Falta de informação para cotação' },
]

function TabsFiltro({ ativo, aoMudar, contadores }: TabFiltroProps) {
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
      // Server retorna { alertas: [...] } — extrair o array
      const alertas = Array.isArray(calRes) ? calRes : (calRes as Record<string, unknown>).alertas as CalendarioAlerta[] ?? []
      setCalendario(alertas)
      setCotacoes(cotRes.cotacoes)
    } catch {
      // erro silencioso — loading state
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
      label: 'Referência',
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
      label: 'Data da cotação',
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="bf-dashboard"
      cabecalho={
        <CabecalhoGlobal
          icone={<ChartPieSlice weight="duotone" size={22} />}
          titulo="Visão Geral"
          acoes={
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/cotacoes')}>
                Cotações
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/fornecedores')}>
                Fornecedores cadastrados
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/cotacoes/nova')}>
                <Truck weight="bold" size={16} />
                Buscar frete
              </button>
            </div>
          }
        />
      }
    >
      {/* ════════ LINHA 1: KPIs + Donut + Calendário ════════ */}
      <div className="bf-dash-row">
        {/* ── KPIs Esquerda ── */}
        <div className="bf-dash-kpis">
          {/* Linha KPIs em andamento */}
          <div className="bf-kpi-section">
            <div className="bf-kpi-pair">
              <CardBasicoGlobal
                titulo="Cotações em andamento"
                icone={<ClockCountdown weight="duotone" size={16} />}
                valor={kpis?.cotacoes_andamento ?? 0}
                className="bf-kpi-card"
              />
              <div className="bf-kpi-valores">
                <div className="bf-kpi-moeda">
                  <span className="bf-kpi-moeda-flag">USD</span>
                  <span className="bf-kpi-moeda-valor">{usd(kpis?.valor_andamento_usd ?? 0)}</span>
                </div>
                <div className="bf-kpi-moeda">
                  <span className="bf-kpi-moeda-flag">BRL</span>
                  <span className="bf-kpi-moeda-valor">{brl(kpis?.valor_andamento_brl ?? 0)}</span>
                </div>
              </div>
            </div>
            <div className="bf-kpi-saving">
              <span className="bf-kpi-saving-label">Saving estimado</span>
              <span className="bf-kpi-saving-valor" style={{ color: 'var(--success)' }}>
                {(kpis?.savings.media_saving_percentual ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Barra aprovação */}
          <div className="bf-aprovacao-section">
            <p className="bf-section-label">Cotações aprovadas</p>
            <div className="bf-aprovacao-bar">
              <div className="bf-aprovacao-bar-fill" style={{ width: `${kpis?.aprovacao.percentual_em_tempo ?? 0}%` }}>
                <span>{kpis?.aprovacao.percentual_em_tempo ?? 0}%</span>
              </div>
            </div>
            <div className="bf-aprovacao-legenda">
              <span><span className="bf-dot bf-dot--green" /> Autorizadas em tempo</span>
              <span><span className="bf-dot bf-dot--yellow" /> Recusadas em tempo</span>
              <span><span className="bf-dot bf-dot--red" /> Não respondidas</span>
            </div>
          </div>

          {/* Linha KPIs passadas */}
          <div className="bf-kpi-section">
            <div className="bf-kpi-pair">
              <CardBasicoGlobal
                titulo="Total de cotações passadas"
                icone={<CheckCircle weight="duotone" size={16} />}
                valor={kpis?.cotacoes_passadas ?? 0}
                className="bf-kpi-card"
              />
              <div className="bf-kpi-valores">
                <div className="bf-kpi-moeda">
                  <span className="bf-kpi-moeda-flag">USD</span>
                  <span className="bf-kpi-moeda-valor">{usd(kpis?.valor_aprovado_usd ?? 0)}</span>
                </div>
                <div className="bf-kpi-moeda">
                  <span className="bf-kpi-moeda-flag">BRL</span>
                  <span className="bf-kpi-moeda-valor">{brl(kpis?.valor_aprovado_brl ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Principais moedas */}
          {kpis?.moedas && kpis.moedas.length > 0 && (
            <div className="bf-moedas-section">
              <p className="bf-section-label">Principais moedas</p>
              <div className="bf-moedas-grid">
                {kpis.moedas.map(m => (
                  <div key={m.codigo} className="bf-moeda-item">
                    <span className="bf-moeda-nome">
                      {m.referencia && <CurrencyDollar weight="duotone" size={14} />}
                      {m.codigo} - {m.nome}
                    </span>
                    <span className="bf-moeda-brl">R$ {m.valor_brl.toFixed(m.codigo === 'CNY' ? 3 : 2)}</span>
                    <span className={`bf-moeda-var ${m.variacao >= 0 ? 'bf-moeda-var--up' : 'bf-moeda-var--down'}`}>
                      {m.variacao >= 0 ? '+' : ''}{m.variacao.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Donut Fornecedores + Calendário ── */}
        <div className="bf-dash-right">
          <CardGraficoGlobal
            titulo="Fornecedores cadastrados"
            icone={<Buildings weight="duotone" size={16} />}
            total={kpis?.fornecedores_cadastrados ?? 0}
            valorPrincipal={kpis?.fornecedores_cadastrados ?? 0}
            corGauge="#6366f1"
            legenda={(kpis?.fornecedores_por_tipo ?? []).map(f => ({
              label: f.tipo.replace('_', ' '),
              valor: f.count,
              cor: f.tipo === 'AGENTE_CARGA' ? 'green' : f.tipo === 'ARMADOR' ? '#6366f1' : f.tipo === 'CIA_AEREA' ? 'yellow' : 'red',
            }))}
          />

          {/* Calendário de alertas */}
          <div className="bf-calendario">
            <div className="bf-calendario-header">
              <div className="bf-calendario-nav">
                <span>Ontem</span>
                <button className="bf-cal-btn"><CaretLeft size={14} weight="bold" /></button>
                <span className="bf-cal-hoje">
                  <CalendarBlank weight="duotone" size={16} />
                  Hoje
                </span>
                <button className="bf-cal-btn"><CaretRight size={14} weight="bold" /></button>
                <span>Amanhã</span>
              </div>
            </div>
            <p className="bf-section-label" style={{ padding: '0 1rem' }}>Calendário</p>
            <div className="bf-alertas">
              {calendario.map(a => {
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
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ LINHA 2: Tabela de Cotações em Andamento ════════ */}
      <div className="bf-table-section">
        <div className="bf-table-header">
          <h2 className="bf-table-title">Cotações em andamento</h2>
          <div className="bf-table-tools">
            <button className="bf-icon-btn" title="Modo de visualização">
              <Eye weight="duotone" size={18} />
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
          mensagemVazio="Nenhuma cotação em andamento"
          tooltipBusca="Buscar por número, origem ou destino"
          aoClicarLinha={(item: Cotacao) => navigate(`/cotacoes/${item.id}`)}
        />
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════ */
        /* BID FRETE — Dashboard Styles                          */
        /* Design System: Solid Slate (CSS Vars)                 */
        /* ═══════════════════════════════════════════════════════ */

        .bf-dashboard { padding: 0; }

        /* ── Layout principal ── */
        .bf-dash-row {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 1200px) {
          .bf-dash-row { grid-template-columns: 1fr; }
        }

        /* ── KPIs Esquerda ── */
        .bf-dash-kpis {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bf-kpi-section {
          display: flex;
          gap: 1rem;
          align-items: stretch;
        }

        .bf-kpi-pair {
          display: flex;
          gap: 1rem;
          flex: 1;
          align-items: stretch;
        }

        .bf-kpi-card {
          flex: 0 0 auto;
          min-width: 200px;
        }

        .bf-kpi-valores {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          justify-content: center;
        }

        .bf-kpi-moeda {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .bf-kpi-moeda-flag {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          background: var(--bg-elevated, #475569);
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm, 4px);
          min-width: 2rem;
          text-align: center;
        }

        .bf-kpi-moeda-valor {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        .bf-kpi-saving {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          min-width: 140px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(34,197,94,0.2);
        }

        .bf-kpi-saving-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          letter-spacing: 0.05em;
        }

        .bf-kpi-saving-valor {
          font-size: 1.5rem;
          font-weight: 700;
        }

        /* ── Barra Aprovação ── */
        .bf-aprovacao-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
        }

        .bf-section-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
          margin-bottom: 0.5rem;
        }

        .bf-aprovacao-bar {
          height: 28px;
          background: var(--bg-elevated, #475569);
          border-radius: var(--radius-pill, 9999px);
          overflow: hidden;
          position: relative;
        }

        .bf-aprovacao-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #16a34a);
          border-radius: var(--radius-pill, 9999px);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.75rem;
          transition: width 0.5s ease;
        }

        .bf-aprovacao-bar-fill span {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        .bf-aprovacao-legenda {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
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

        /* ── Moedas ── */
        .bf-moedas-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
        }

        .bf-moedas-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bf-moeda-item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 1rem;
          align-items: center;
          padding: 0.35rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }
        .bf-moeda-item:last-child { border-bottom: none; }

        .bf-moeda-nome {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .bf-moeda-brl {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        .bf-moeda-var {
          font-size: 0.75rem;
          font-weight: 600;
          font-family: 'DM Mono', monospace;
        }
        .bf-moeda-var--up   { color: var(--success, #22c55e); }
        .bf-moeda-var--down { color: var(--danger, #ef4444); }

        /* ── Painel Direito ── */
        .bf-dash-right {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* ── Calendário ── */
        .bf-calendario {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 0;
          flex: 1;
        }

        .bf-calendario-header {
          padding: 0 1rem 0.75rem;
          border-bottom: 1px solid var(--bg-elevated, #475569);
          margin-bottom: 0.75rem;
        }

        .bf-calendario-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }

        .bf-cal-btn {
          background: var(--bg-elevated, #475569);
          border: none;
          border-radius: var(--radius-sm, 4px);
          padding: 0.25rem;
          cursor: pointer;
          color: var(--text-secondary, #94a3b8);
          display: flex;
          align-items: center;
        }
        .bf-cal-btn:hover {
          background: var(--bg-base, #1e293b);
          color: var(--text-primary, #f1f5f9);
        }

        .bf-cal-hoje {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }

        .bf-alertas {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
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

        /* ── Tabela Section ── */
        .bf-table-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
        }

        .bf-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem 0;
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

        /* ── Botões ── */
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
          color: #fff;
        }
        .btn-primary:hover { background: var(--accent-hover, #4f46e5); }
        .btn-secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .btn-secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }
      `}</style>
    </PaginaGlobal>
  )
}
