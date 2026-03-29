import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChartBar,
  TrendUp,
  CurrencyDollar,
  Calculator,
  Sparkle,
  ArrowRight,
  CaretRight,
  WarningCircle,
  Clock,
  ChartPieSlice,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SeletorVisualizacao, type ViewMode } from '@nucleo/view-toggle-global'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DashboardKPIs {
  totalSimulacoes: number
  finalizadas: number
  rascunhos: number
  mediaLandedCostBrl: number | null
  maiorLandedCostBrl: number | null
  menorLandedCostBrl: number | null
  totalCifUsd: number | null
  viavel: number
  atencao: number
  inviavel: number
}

interface SimulacaoRecente {
  id: string
  ncm: string
  pais_origem: string
  valor_fob_usd: number | null
  landed_cost_brl: number
  status: string
  data_simulacao: string
}

// ─── Formatação ──────────────────────────────────────────────────────────────
const brl = (val: number | null) =>
  val == null
    ? '—'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const usdFmt = (val: number | null) =>
  val == null
    ? '—'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

const fmtDate = (iso: string) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="db-skeleton-card">
    <div className="db-skeleton-line" style={{ width: '60%', height: '0.75rem' }} />
    <div className="db-skeleton-line" style={{ width: '40%', height: '1.75rem', marginTop: '0.5rem' }} />
    <div className="db-skeleton-line" style={{ width: '50%', height: '0.65rem', marginTop: '0.5rem' }} />
  </div>
)

// ─── Colunas da tabela ────────────────────────────────────────────────────────
const COLUNAS_TABELA: TabelaGlobalColuna<SimulacaoRecente>[] = [
  { key: 'ncm',            label: 'NCM',        tipo: 'texto', render: (v: string) => <strong style={{ color: 'var(--ws-text)' }}>{v}</strong> },
  { key: 'pais_origem',    label: 'PAÍS',       tipo: 'texto' },
  { key: 'valor_fob_usd',  label: 'VALOR FOB',  tipo: 'texto', render: (v: number | null) => <span style={{ fontFamily: 'monospace', color: 'var(--ws-muted)' }}>{usdFmt(v)}</span> },
  { key: 'landed_cost_brl',label: 'LANDED COST',tipo: 'texto', render: (v: number) => <span style={{ fontWeight: 600, color: '#10b981' }}>{brl(v)}</span> },
  { key: 'data_simulacao', label: 'DATA',       tipo: 'texto', render: (v: string) => <span style={{ color: 'var(--ws-muted)' }}>{fmtDate(v)}</span> },
]

// ─── Insight da Gabi ──────────────────────────────────────────────────────────
const GabiInsight = ({ text }: { text: string }) => (
  <div className="db-gabi-insight">
    <div className="db-gabi-header">
      <div className="db-gabi-avatar">
        <Sparkle weight="fill" size={14} color="#fff" />
      </div>
      <span className="db-gabi-title">GABI AI • INSIGHT</span>
    </div>
    <p className="db-gabi-text">{text}</p>
    <div className="db-gabi-footer">
      <button className="db-gabi-btn">Ver Detalhes <CaretRight size={12} /></button>
    </div>
  </div>
)

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function DashboardSimulaCusto() {
  const navigate = useNavigate()
  const [kpis, setKpis]             = useState<DashboardKPIs | null>(null)
  const [recentes, setRecentes]     = useState<SimulacaoRecente[]>([])
  const [loadingKpis, setLoadingKpis]         = useState(true)
  const [loadingRecentes, setLoadingRecentes] = useState(true)
  const [erro, setErro]             = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoadingKpis(true)
    setLoadingRecentes(true)
    setErro(null)
    try {
      const [resKpis, resRecentes] = await Promise.all([
        fetch('/api/v1/dashboard/kpis'),
        fetch('/api/v1/dashboard/recentes'),
      ])
      if (!resKpis.ok) throw new Error(`KPIs: ${resKpis.status}`)
      if (!resRecentes.ok) throw new Error(`Recentes: ${resRecentes.status}`)

      const { data: kpisData }     = await resKpis.json()
      const { data: recentesData } = await resRecentes.json()

      setKpis(kpisData)
      setRecentes(recentesData)
    } catch (err: any) {
      console.error('[Dashboard] Erro ao carregar dados:', err)
      setErro(err.message || 'Erro ao carregar dashboard')
    } finally {
      setLoadingKpis(false)
      setLoadingRecentes(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  // ── Valores derivados ──────────────────────────────────────────────────────
  const totalSimulacoes = kpis?.totalSimulacoes ?? 0
  const mediaLanded   = brl(kpis?.mediaLandedCostBrl ?? null)
  const maiorLanded   = brl(kpis?.maiorLandedCostBrl ?? null)
  const menorLanded   = brl(kpis?.menorLandedCostBrl ?? null)

  // ── Loading global ─────────────────────────────────────────────────────────
  const statsContent = loadingKpis ? (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  ) : (
    <>
      <CardBasicoGlobal
        titulo="Total de Simulações"
        icone={<Calculator weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
        valor={totalSimulacoes}
        periodos={[
          { periodo: '7d',  rotulo: '7 dias',  valor: '+4',   direcao: 'up',   descricao: 'vs semana anterior'   },
          { periodo: '30d', rotulo: '30 dias', valor: '+12%', direcao: 'up',   descricao: 'vs mês anterior'      },
          { periodo: '6m',  rotulo: '6 meses', valor: '+38%', direcao: 'up',   descricao: 'vs semestre anterior' },
          { periodo: '1a',  rotulo: '1 ano',   valor: '+92',  direcao: 'up',   descricao: 'vs ano anterior'      },
        ] as PeriodoTendencia[]}
        tooltip={
          <>
            <p className="cg-tooltip__title">Volume de Operações</p>
            <div className="cg-tooltip__row">
              <span>Total de simulações</span>
              <strong>{totalSimulacoes}</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Finalizadas</span>
              <strong style={{ color: '#34d399' }}>{kpis?.finalizadas ?? 0}</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Em rascunho</span>
              <strong style={{ color: '#fbbf24' }}>{kpis?.rascunhos ?? 0}</strong>
            </div>
          </>
        }
      />

      <CardBasicoGlobal
        titulo="Custo Médio (BRL)"
        icone={<TrendUp weight="duotone" size={16} style={{ color: '#34d399' }} />}
        valor={mediaLanded}
        variante="sucesso"
        periodos={[
          { periodo: '7d',  rotulo: '7 dias',  valor: '-1%',  direcao: 'down', descricao: 'vs semana anterior'   },
          { periodo: '30d', rotulo: '30 dias', valor: '-4%',  direcao: 'down', descricao: 'vs mês anterior'      },
          { periodo: '6m',  rotulo: '6 meses', valor: '-8%',  direcao: 'down', descricao: 'vs semestre anterior' },
          { periodo: '1a',  rotulo: '1 ano',   valor: '-11%', direcao: 'down', descricao: 'vs ano anterior'      },
        ] as PeriodoTendencia[]}
        tooltip={
          <>
            <p className="cg-tooltip__title">Custo Médio por Simulação</p>
            <div className="cg-tooltip__row">
              <span>Média atual</span>
              <strong>{mediaLanded}</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Maior custo</span>
              <strong style={{ color: '#f87171' }}>{maiorLanded}</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Menor custo</span>
              <strong style={{ color: '#34d399' }}>{menorLanded}</strong>
            </div>
          </>
        }
      />

      <div className="db-custom-card db-card-alerta">
        <div className="db-custom-card-header">
          <WarningCircle weight="fill" size={16} color="#fbbf24" />
          <span>ALERTAS DE CÂMBIO</span>
        </div>
        <div className="db-custom-card-body">
          <p>A taxa PTAX do USD subiu <strong>1.4%</strong> hoje. Revise rascunhos.</p>
          <div className="db-custom-card-time">
            <Clock weight="bold" size={10} /> há 45 min
          </div>
        </div>
      </div>

      <CardGraficoGlobal
        titulo="Componente de Custo"
        icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
        total={100}
        valorPrincipal={60}
        corGauge="#818cf8"
        legenda={[
          { label: 'Produto',  valor: 60, cor: '#818cf8' },
          { label: 'Impostos', valor: 25, cor: '#10b981' },
          { label: 'Taxas',    valor: 15, cor: '#fbbf24' },
        ]}
        tooltip={
          <>
            <div className="cg-tooltip__row">
              <span>Produto</span>
              <strong>60%</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Impostos</span>
              <strong>25%</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Taxas</span>
              <strong>15%</strong>
            </div>
            <div className="cg-tooltip__divider" />
            <div className="cg-tooltip__row">
              <span>Referência</span>
              <strong>{mediaLanded}</strong>
            </div>
          </>
        }
      />
    </>
  )

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="SimulaCusto"
          subtitulo="Simulação completa de custos, impostos e viabilidade para operações de importação"
          icone={<ChartBar weight="duotone" size={22} color="#818cf8" />}
          viewToggle={
            <SeletorVisualizacao 
              view="dashboard" 
              onChange={(v: ViewMode) => {
                if (v === 'lista') navigate('/estimativas')
              }} 
            />
          }
        />
      }
      stats={statsContent}
      acoes={
        <div style={{ display: 'flex', gap: '0.75rem', height: '100%', alignItems: 'flex-end' }}>
          <BotaoGlobal
            variante="fantasma"
            tamanho="pequeno"
            icone={<ArrowsClockwise weight="bold" />}
            onClick={fetchDashboard}
          >
            Atualizar
          </BotaoGlobal>
          <BotaoGlobal variante="primario" tamanho="pequeno" icone={<Calculator weight="bold" />}>
            Nova Simulação
          </BotaoGlobal>
        </div>
      }
    >
      <div className="db-grid-container">
        {/* Coluna Esquerda */}
        <div className="db-col db-col-main">
          {/* Card: Fluxo de Câmbio */}
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Projeção de Fluxo de Caixa (Câmbio)</span>
              <div className="db-panel-legend">
                <span className="dot dot-opt"></span> Otimista
                <span className="dot dot-base"></span> Base
                <span className="dot dot-pess"></span> Pessimista
              </div>
            </div>
            <div className="db-chart-placeholder">
              <svg width="100%" height="200" viewBox="0 0 800 200">
                <path d="M0,150 Q200,100 400,120 T800,50" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.6" />
                <path d="M0,160 Q200,110 400,130 T800,60" fill="none" stroke="#818cf8" strokeWidth="4" />
                <path d="M0,170 Q200,120 400,140 T800,70" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.6" />
                <circle cx="400" cy="130" r="6" fill="#818cf8" />
                <text x="415" y="130" fill="var(--ws-text)" fontSize="12">
                  {mediaLanded} (Base)
                </text>
              </svg>
            </div>
          </div>

          {/* Card: Simulações Recentes — dados reais */}
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Simulações Recentes</span>
              <button className="db-btn-ghost">Ver todas <ArrowRight size={14} /></button>
            </div>

            {loadingRecentes ? (
              <div className="db-skeleton-table">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="db-skeleton-row">
                    <div className="db-skeleton-line" style={{ width: '20%' }} />
                    <div className="db-skeleton-line" style={{ width: '10%' }} />
                    <div className="db-skeleton-line" style={{ width: '20%' }} />
                    <div className="db-skeleton-line" style={{ width: '22%' }} />
                    <div className="db-skeleton-line" style={{ width: '15%' }} />
                  </div>
                ))}
              </div>
            ) : erro ? (
              <p style={{ color: '#f87171', fontSize: '0.8125rem', padding: '1rem 0' }}>
                ⚠ {erro}
              </p>
            ) : (
              <TabelaGlobal<SimulacaoRecente>
                id="simulacoes-recentes-dashboard"
                dados={recentes}
                colunas={COLUNAS_TABELA}
                mensagemVazio="Nenhuma simulação encontrada para este workspace."
                tooltipBusca="Filtrar por NCM ou País"
              />
            )}
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="db-col db-col-side">
          <GabiInsight text="Identificamos que 40% das suas simulações recentes para NCM 8471 poderiam economizar até 12% em ICMS se o desembaraço fosse feito via Santa Catarina." />
          <div className="db-panel db-panel-warning">
            <div className="db-panel-header">
              <span className="db-panel-title"><WarningCircle weight="fill" size={16} /> Alertas de Câmbio</span>
            </div>
            <div className="db-warning-content">
              <p>A taxa PTAX do USD subiu <strong>1.4%</strong> hoje. Recomenda-se revisar simulações em rascunho.</p>
              <span className="db-time"><Clock weight="bold" /> há 45 min</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .db-grid-container { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; margin-top: 1.5rem; padding-bottom: 2rem; }
        .db-col { display: flex; flex-direction: column; gap: 1.5rem; }
        .db-panel { background: var(--ws-surface, #1e293b); border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.15)); border-radius: 16px; padding: 1.5rem; }
        .db-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .db-panel-title { font-size: 0.875rem; font-weight: 700; color: var(--ws-text, #f1f5f9); display: flex; align-items: center; gap: 0.5rem; }
        .db-panel-legend { display: flex; gap: 1rem; font-size: 0.7rem; color: var(--ws-muted); }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
        .dot-opt { background: #10b981; } .dot-base { background: #818cf8; } .dot-pess { background: #ef4444; }
        .db-chart-placeholder { padding: 1rem 0; }
        .db-btn-ghost { background: transparent; border: none; color: var(--ws-accent, #818cf8); font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }
        
        /* ── Custom Cards ── */
        .db-custom-card {
          background: var(--ws-surface, #1e293b);
          border: 1px solid var(--ws-accent-border, rgba(129, 140, 248, 0.2));
          border-radius: 12px;
          padding: 1.125rem;
          width: 240px;
          min-width: 240px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.2s ease;
        }
        .db-custom-card:hover { border-color: var(--ws-accent); transform: translateY(-2px); }
        .db-custom-card-header { display: flex; align-items: center; gap: 0.5rem; }
        .db-custom-card-header span { font-size: 0.6875rem; font-weight: 700; color: var(--ws-muted); letter-spacing: 0.05em; }
        .db-custom-card-body p { font-size: 0.8125rem; color: var(--ws-text); margin: 0; line-height: 1.4; }
        .db-custom-card-time { font-size: 0.65rem; color: var(--ws-muted); display: flex; align-items: center; gap: 4px; margin-top: 0.5rem; }
        .db-card-alerta { border-left: 3px solid #fbbf24; }

        .db-gabi-insight { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 16px; padding: 1.25rem; color: white; box-shadow: 0 8px 24px rgba(79,70,229,0.3); }
        .db-gabi-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
        .db-gabi-avatar { background: rgba(255,255,255,0.2); width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .db-gabi-title { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; }
        .db-gabi-text { font-size: 0.875rem; font-weight: 500; line-height: 1.5; color: rgba(255,255,255,0.95); margin-bottom: 1rem; }
        .db-gabi-footer { display: flex; justify-content: flex-end; }
        .db-gabi-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }
        
        /* ── Skeleton ─────────────────────────────────────────────────────── */
        @keyframes db-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .db-skeleton-card {
          background: var(--ws-surface, #1e293b);
          border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.15));
          border-radius: 16px; padding: 1.5rem;
          animation: db-pulse 1.5s infinite;
        }
        .db-skeleton-line {
          background: rgba(129,140,248,0.12);
          border-radius: 6px; height: 0.75rem;
        }
        .db-skeleton-table { display: flex; flex-direction: column; gap: 0.75rem; }
        .db-skeleton-row { display: flex; gap: 1rem; align-items: center; animation: db-pulse 1.5s infinite; }
        .db-skeleton-row .db-skeleton-line { height: 0.65rem; border-radius: 4px; }
      `}</style>
    </PaginaGlobal>
  )
}
