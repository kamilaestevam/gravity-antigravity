/**
 * DashboardSimulaCusto.tsx — Dashboard de visão geral
 * Produto: SimulaCusto
 *
 * Layout: 4 KPI cards + coluna principal (gráfico + tabela recentes) + sidebar (Gabi + alertas)
 * i18n via @nucleo/Utilidades/localization/i18n (inicializado no main.tsx)
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import type { PeriodoTendencia } from '@nucleo/card-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SeletorVisualizacao } from '@nucleo/view-toggle-global'
import type { ViewMode } from '@nucleo/view-toggle-global'
import './DashboardSimulaCusto.css'

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

// ─── Formatação ───────────────────────────────────────────────────────────────

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

// ─── Colunas da tabela de recentes ────────────────────────────────────────────

const COLUNAS_RECENTES: GTColuna<SimulacaoRecente>[] = [
  {
    key: 'ncm',
    label: 'NCM',
    tipo: 'texto',
    naoOcultavel: true,
    render: (val) => <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>{String(val)}</strong>,
  },
  {
    key: 'pais_origem',
    label: 'País',
    tipo: 'texto',
  },
  {
    key: 'valor_fob_usd',
    label: 'Valor FOB',
    tipo: 'numero',
    align: 'right',
    render: (val) => (
      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted, #64748b)' }}>
        {usdFmt(val as number | null)}
      </span>
    ),
  },
  {
    key: 'landed_cost_brl',
    label: 'Landed Cost',
    tipo: 'numero',
    align: 'right',
    render: (val) => (
      <span style={{ fontWeight: 600, color: '#10b981' }}>
        {brl(val as number | null)}
      </span>
    ),
  },
  {
    key: 'data_simulacao',
    label: 'Data',
    tipo: 'periodo',
    render: (val) => (
      <span style={{ color: 'var(--text-muted, #64748b)' }}>{fmtDate(String(val))}</span>
    ),
  },
]

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DashboardSimulaCusto() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [kpis, setKpis]                       = useState<DashboardKPIs | null>(null)
  const [recentes, setRecentes]               = useState<SimulacaoRecente[]>([])
  const [loadingKpis, setLoadingKpis]         = useState(true)
  const [loadingRecentes, setLoadingRecentes] = useState(true)
  const [erro, setErro]                       = useState<string | null>(null)

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
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
    } finally {
      setLoadingKpis(false)
      setLoadingRecentes(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const totalSimulacoes = kpis?.totalSimulacoes ?? 0
  const mediaLanded     = brl(kpis?.mediaLandedCostBrl ?? null)
  const maiorLanded     = brl(kpis?.maiorLandedCostBrl ?? null)
  const menorLanded     = brl(kpis?.menorLandedCostBrl ?? null)

  // ─── KPI Cards ────────────────────────────────────────────────────────────

  const kpiCards = (
    <>
      <CardBasicoGlobal
        icone={<Calculator weight="duotone" size={16} />}
        titulo={t('simulacusto.dashboard.total_simulacoes')}
        valor={totalSimulacoes}
        periodos={[
          { periodo: '7d',  rotulo: t('simulacusto.periodos.7_dias'),  valor: '+4',   direcao: 'up',   descricao: t('simulacusto.periodos.vs_semana')   },
          { periodo: '30d', rotulo: t('simulacusto.periodos.30_dias'), valor: '+12%', direcao: 'up',   descricao: t('simulacusto.periodos.vs_mes')      },
          { periodo: '6m',  rotulo: t('simulacusto.periodos.6_meses'), valor: '+38%', direcao: 'up',   descricao: t('simulacusto.periodos.vs_semestre') },
          { periodo: '1a',  rotulo: t('simulacusto.periodos.1_ano'),   valor: '+92',  direcao: 'up',   descricao: t('simulacusto.periodos.vs_ano')      },
        ] as PeriodoTendencia[]}
        tooltip={
          <>
            <p className="cg-tooltip__title">Volume de Operações</p>
            <div className="cg-tooltip__row">
              <span>Total de simulações</span><strong>{totalSimulacoes}</strong>
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
        icone={<TrendUp weight="duotone" size={16} />}
        titulo={t('simulacusto.dashboard.custo_medio')}
        valor={mediaLanded}
        variante="sucesso"
        periodos={[
          { periodo: '7d',  rotulo: t('simulacusto.periodos.7_dias'),  valor: '-1%',  direcao: 'down', descricao: t('simulacusto.periodos.vs_semana')   },
          { periodo: '30d', rotulo: t('simulacusto.periodos.30_dias'), valor: '-4%',  direcao: 'down', descricao: t('simulacusto.periodos.vs_mes')      },
          { periodo: '6m',  rotulo: t('simulacusto.periodos.6_meses'), valor: '-8%',  direcao: 'down', descricao: t('simulacusto.periodos.vs_semestre') },
          { periodo: '1a',  rotulo: t('simulacusto.periodos.1_ano'),   valor: '-11%', direcao: 'down', descricao: t('simulacusto.periodos.vs_ano')      },
        ] as PeriodoTendencia[]}
        tooltip={
          <>
            <p className="cg-tooltip__title">Custo Médio por Simulação</p>
            <div className="cg-tooltip__row"><span>Média atual</span><strong>{mediaLanded}</strong></div>
            <div className="cg-tooltip__row">
              <span>Maior custo</span><strong style={{ color: '#f87171' }}>{maiorLanded}</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Menor custo</span><strong style={{ color: '#34d399' }}>{menorLanded}</strong>
            </div>
          </>
        }
      />

      <CardBasicoGlobal
        icone={<CurrencyDollar weight="duotone" size={16} />}
        titulo={t('simulacusto.dashboard.base_cif')}
        valor={usdFmt(kpis?.totalCifUsd ?? null)}
        variante="aviso"
        periodos={[
          { periodo: '30d', rotulo: t('simulacusto.periodos.30_dias'), valor: '+6%',  direcao: 'up', descricao: t('simulacusto.periodos.vs_mes')      },
          { periodo: '6m',  rotulo: t('simulacusto.periodos.6_meses'), valor: '+14%', direcao: 'up', descricao: t('simulacusto.periodos.vs_semestre') },
        ] as PeriodoTendencia[]}
        tooltip={
          <>
            <p className="cg-tooltip__title">Custo, Seguro e Frete (CIF)</p>
            <div className="cg-tooltip__row">
              <span>Total USD</span><strong>{usdFmt(kpis?.totalCifUsd ?? null)}</strong>
            </div>
          </>
        }
      />

      <CardGraficoGlobal
        icone={<ChartPieSlice weight="duotone" size={16} />}
        titulo={t('simulacusto.dashboard.viabilidade')}
        total={totalSimulacoes}
        valorPrincipal={kpis?.viavel ?? 0}
        corGauge="#34d399"
        legenda={[
          { label: t('simulacusto.dashboard.viavel'),   valor: kpis?.viavel ?? 0,   cor: 'green'  },
          { label: t('simulacusto.dashboard.atencao'),  valor: kpis?.atencao ?? 0,  cor: 'yellow' },
          { label: t('simulacusto.dashboard.inviavel'), valor: kpis?.inviavel ?? 0, cor: 'red'    },
        ]}
        tooltip={
          <>
            <div className="cg-tooltip__row">
              <span>Projetos viáveis</span>
              <strong style={{ color: '#34d399' }}>{kpis?.viavel ?? 0}</strong>
            </div>
            <div className="cg-tooltip__row">
              <span>Atenção / Risco</span>
              <strong style={{ color: '#fbbf24' }}>{kpis?.atencao ?? 0}</strong>
            </div>
            <div className="cg-tooltip__divider" />
            <div className="cg-tooltip__row">
              <span>Taxa de sucesso</span>
              <strong>
                {totalSimulacoes > 0
                  ? Math.round(((kpis?.viavel ?? 0) / totalSimulacoes) * 100)
                  : 0}%
              </strong>
            </div>
          </>
        }
      />
    </>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<ChartBar weight="duotone" size={22} />}
          titulo={t('simulacusto.dashboard.titulo')}
          subtitulo="Simulação completa de custos, impostos e viabilidade para operações de importação"
          viewToggle={
            <SeletorVisualizacao
              view="dashboard"
              onChange={(v: ViewMode) => { if (v === 'lista') navigate('/estimativas') }}
            />
          }
          acoes={
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <BotaoGlobal
                variante="fantasma"
                tamanho="pequeno"
                icone={<ArrowsClockwise weight="bold" />}
                onClick={fetchDashboard}
              >
                {t('comum.atualizar')}
              </BotaoGlobal>
              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                icone={<Calculator weight="bold" />}
                onClick={() => navigate('/estimativas/nova')}
              >
                {t('simulacusto.estimativas.nova')}
              </BotaoGlobal>
            </div>
          }
        />
      }
      stats={loadingKpis ? undefined : kpiCards}
    >
      <div className="sc-db-grid">

        {/* ── Coluna principal ─────────────────────────────── */}
        <div className="sc-db-col">

          {/* Gráfico de projeção */}
          <div className="sc-db-panel">
            <div className="sc-db-panel-header">
              <span className="sc-db-panel-title">{t('simulacusto.dashboard.projecao_fluxo')}</span>
              <div className="sc-db-panel-legend">
                <span className="sc-db-dot sc-db-dot--otimista" />
                {t('simulacusto.dashboard.otimista')}
                <span className="sc-db-dot sc-db-dot--base" />
                {t('simulacusto.dashboard.base')}
                <span className="sc-db-dot sc-db-dot--pessimista" />
                {t('simulacusto.dashboard.pessimista')}
              </div>
            </div>
            <div className="sc-db-chart">
              <svg width="100%" height="200" viewBox="0 0 800 200">
                <path d="M0,150 Q200,100 400,120 T800,50" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.6" />
                <path d="M0,160 Q200,110 400,130 T800,60" fill="none" stroke="#818cf8" strokeWidth="4" />
                <path d="M0,170 Q200,120 400,140 T800,70" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.6" />
                <circle cx="400" cy="130" r="6" fill="#818cf8" />
                <text x="415" y="134" fill="var(--text-primary, #f1f5f9)" fontSize="12">
                  {mediaLanded}
                </text>
              </svg>
            </div>
          </div>

          {/* Tabela de simulações recentes */}
          <div className="sc-db-panel">
            <div className="sc-db-panel-header">
              <span className="sc-db-panel-title">{t('simulacusto.dashboard.simulacoes_recentes')}</span>
              <button className="sc-db-btn-ghost" onClick={() => navigate('/estimativas')}>
                {t('simulacusto.dashboard.ver_todas')}
                <ArrowRight size={14} />
              </button>
            </div>

            {loadingRecentes ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="sc-db-skeleton-row">
                    <div className="sc-db-skeleton-cell" style={{ width: '18%' }} />
                    <div className="sc-db-skeleton-cell" style={{ width: '10%' }} />
                    <div className="sc-db-skeleton-cell" style={{ width: '20%' }} />
                    <div className="sc-db-skeleton-cell" style={{ width: '22%' }} />
                    <div className="sc-db-skeleton-cell" style={{ width: '14%' }} />
                  </div>
                ))}
              </>
            ) : erro ? (
              <p style={{ color: '#f87171', fontSize: '0.8125rem', padding: '0.5rem 0', margin: 0 }}>
                ⚠ {erro}
              </p>
            ) : (
              <TabelaVirtualGlobal<SimulacaoRecente>
                dados={recentes}
                colunas={COLUNAS_RECENTES}
                itemId={(item) => item.id}
                emptyTitle={t('simulacusto.dashboard.sem_simulacoes')}
                ariaLabel="Simulações recentes"
              />
            )}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <div className="sc-db-col">

          {/* Insight da Gabi */}
          <div className="sc-db-gabi">
            <div className="sc-db-gabi-header">
              <div className="sc-db-gabi-avatar">
                <Sparkle weight="fill" size={14} color="#fff" />
              </div>
              <span className="sc-db-gabi-label">GABI AI • INSIGHT</span>
            </div>
            <p className="sc-db-gabi-text">
              Identificamos que 40% das suas simulações recentes para NCM 8471 poderiam
              economizar até 12% em ICMS se o desembaraço fosse feito via Santa Catarina.
            </p>
            <div className="sc-db-gabi-footer">
              <button className="sc-db-gabi-btn">
                Ver Detalhes <CaretRight size={12} />
              </button>
            </div>
          </div>

          {/* Alerta de câmbio */}
          <div className="sc-db-panel sc-db-panel-alerta">
            <div className="sc-db-panel-header">
              <span className="sc-db-panel-title">
                <WarningCircle weight="fill" size={16} color="var(--warning, #f59e0b)" />
                {t('simulacusto.dashboard.alertas_cambio')}
              </span>
            </div>
            <p className="sc-db-alerta-text">
              A taxa PTAX do USD subiu <strong>1.4%</strong> hoje.
              Recomenda-se revisar simulações em rascunho.
            </p>
            <span className="sc-db-alerta-tempo">
              <Clock weight="bold" size={12} /> há 45 min
            </span>
          </div>

        </div>
      </div>
    </PaginaGlobal>
  )
}
