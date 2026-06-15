/**
 * Dashboard.tsx — Dashboard Premium do BID Frete Internacional
 *
 * Layout glassmorphism com KPIs + sparklines, gráficos SVG,
 * funil com percentuais, donut com progress bars, câmbio do dia.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useShellStore } from '@gravity/shell'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  MagnifyingGlass,
  Export,
  DownloadSimple,
  TrendUp,
  TrendDown,
  Timer,
  Anchor,
  AirplaneTilt,
  Truck,
  Trophy,
  ArrowRight,
  CaretLeft,
  CaretRight,
  Plus,
  Minus,
  ArrowCounterClockwise,
  Play,
  Pause,
  Globe,
  MapTrifold,
  List,
  MapPin,
  Clock,
  CheckCircle,
  ChatText,
  Bell,
  Coins,
  Funnel,
  ChartBar,
  ChartPie,
  CurrencyDollar,
  ListNumbers,
  ThumbsUp,
  Eye,
  ChartLine,
  CalendarBlank,
} from '@phosphor-icons/react'

import {
  getDashboardInsightsAlertas,
  getDashboardInsightsGraficos,
  getDashboardKpis,
  getDashboardMapaCotacoesVisaoGeral,
} from '../shared/api'
import type { InsightsGraficosBidFreteInternacionalCliente } from '../shared/insights-visao-geral-bid-frete-internacional'
import {
  buscarPrevisoesTaxaFuturaInsights,
  buscarTaxasMoedaAtuaisInsights,
  buscarTaxasMoedaHistoricoInsights,
  calcularVariacaoPtaxDiaAnterior,
  lerTaxasCambioConfigBidFreteInternacional,
  montarCotacoesPtaxFuturoPorMoeda,
  montarCotacoesPtaxHistoricoInsights,
  montarCotacoesPtaxInsights,
  montarSpreadMedioInsights,
  type CotacaoPtaxInsights,
  type SpreadMoedaInsights,
} from '../shared/taxas-cambio-insights-bid-frete-internacional'
import { DialogoDetalheInsightsBidFreteInternacional } from '../shared/dialogo-detalhe-insights-bid-frete-internacional'
import {
  extrairCodigoPortoInsights,
  type ContextoDialogoInsights,
} from '../shared/insights-detalhe-bid-frete-internacional'
import {
  resolverIdsWorkspacesParaApi,
  useEscopoWorkspacesBidFreteInternacional,
} from '../shared/useEscopoWorkspacesBidFreteInternacional'
import { MODAL_LABELS, CalendarioAlerta } from '../shared/types'
import type { DashboardKPIs } from '../shared/types'
import {
  montarEtapasFunilInsightsBidFreteInternacional,
  contagemStatusNoFunilBidFreteInternacional,
  resolverCorStatusConfigBidFreteInternacional,
  resolverRotuloStatusConfigBidFreteInternacional,
  useStatusCotacaoConfigBidFreteInternacional,
} from '../shared/status-config-bid-frete-internacional'
import { useDashboardTopKpiBidFrete } from '../shared/use-dashboard-top-kpi-bid-frete'
import {
  VisaoGeralMapaBidFrete as VisaoGeralMapa,
  type DadosMapaBidFrete,
} from '../shared/componentes/visao-geral-mapa-bid-frete'
import { BidFreteFunilBarras } from '../shared/componentes/visao-geral-bid-frete-ui'
import { ConteudoCarregandoBidFreteInternacional } from '../shared/pagina-carregando-bid-frete-internacional'
import '../shared/bid-frete-visao-geral-layout.css'
import '../shared/bid-frete-visao-geral-mapa.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

type MesGraficoInsights = InsightsGraficosBidFreteInternacionalCliente['cotacoes_por_mes'][number]
type ModalGraficoInsights = InsightsGraficosBidFreteInternacionalCliente['distribuicao_modal'][number]

function PainelSemDadosInsights({ mensagem }: { mensagem: string }) {
  return (
    <p style={{ margin: '1.5rem 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
      {mensagem}
    </p>
  )
}

function GraficoBarrasMensal({ dados }: { dados: MesGraficoInsights[] }) {
  const W = 520
  const H = 280
  const pad = { top: 35, right: 20, bottom: 40, left: 40 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const barW = dados.length > 0 ? innerW / dados.length : innerW

  const totais = dados.map(d => d.aprovadas + d.andamento + d.recusadas)
  const maxMonthlyTotal = Math.max(...totais, 0)
  if (maxMonthlyTotal === 0) {
    return <PainelSemDadosInsights mensagem="Nenhuma cotação nos últimos 6 meses para os workspaces selecionados." />
  }
  const maxVal = maxMonthlyTotal * 1.1

  // Y-axis grid ticks (from 0 = top/max to 1 = bottom/zero)
  const gridTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bfd-chart-svg" style={{ overflow: 'visible' }}>
      <defs>
        {/* Vibrant blue gradient (Aprovadas) */}
        <linearGradient id="grad-aprov" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        
        {/* Vibrant lavender/violet gradient (Em andamento) */}
        <linearGradient id="grad-and" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        
        {/* Vibrant rose/red gradient */}
        <linearGradient id="grad-rec" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>

        {/* Premium smooth drop shadow for columns */}
        <filter id="col-shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Gridlines & Y-axis labels in background */}
      {gridTicks.map((t, idx) => {
        const y = pad.top + t * innerH
        const val = Math.round((1 - t) * maxVal)
        return (
          <g key={idx} className="bfd-chart-gridline-group">
            <line
              x1={pad.left}
              y1={y}
              x2={W - pad.right}
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
              strokeDasharray={t === 1 ? undefined : "4, 4"}
            />
            <text
              x={pad.left - 12}
              y={y + 4}
              textAnchor="end"
              fill="#64748b"
              fontSize="11"
              fontWeight="600"
              className="bfd-chart-grid-text"
            >
              {val}
            </text>
          </g>
        )
      })}

      {dados.map((d, i) => {
        const total = d.aprovadas + d.andamento + d.recusadas
        const w = barW * 0.45
        const x = pad.left + i * barW + (barW - w) / 2
        const fullH = (total / maxVal) * innerH

        const hAprov = total > 0 ? (d.aprovadas / total) * fullH : 0
        const hAnd = total > 0 ? (d.andamento / total) * fullH : 0
        const hRec = total > 0 ? (d.recusadas / total) * fullH : 0
        
        const yTop = pad.top + innerH - fullH

        // Gaps & drawing adjustments
        const hTopDraw = Math.max(3, hAprov - 1)
        const hMidDraw = Math.max(3, hAnd - 2)
        const hBotDraw = Math.max(3, hRec - 1)

        const yTopSeg = yTop
        const yMidSeg = yTop + hAprov + 1
        const yBotSeg = yTop + hAprov + hAnd + 1

        // Bottom rounded corners path
        const r = Math.min(6, hBotDraw / 2, w / 2)
        const botPath = `M ${x} ${yBotSeg} L ${x + w} ${yBotSeg} L ${x + w} ${yBotSeg + hBotDraw - r} A ${r} ${r} 0 0 1 ${x + w - r} ${yBotSeg + hBotDraw} L ${x + r} ${yBotSeg + hBotDraw} A ${r} ${r} 0 0 1 ${x} ${yBotSeg + hBotDraw - r} Z`

        return (
          <g key={i} className="bfd-chart-bar-group" filter="url(#col-shadow)">
            {/* Top Segment: Mint/Emerald Gradient Capsule */}
            <rect
              x={x}
              y={yTopSeg}
              width={w}
              height={hTopDraw}
              rx={6}
              ry={6}
              fill="url(#grad-aprov)"
            />
            
            {/* Middle Segment: Blue Gradient Rect */}
            <rect
              x={x}
              y={yMidSeg}
              width={w}
              height={hMidDraw}
              fill="url(#grad-and)"
            />
            
            {/* Bottom Segment: Rose Red Gradient Rounded Bottom */}
            <path
              d={botPath}
              fill="url(#grad-rec)"
            />
            
            {/* Total value text above the bar */}
            <text
              x={x + w / 2}
              y={yTop - 10}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="14"
              fontWeight="700"
              className="bfd-chart-total-text"
            >
              {total}
            </text>
            
            {/* Month label below the bar */}
            <text
              x={x + w / 2}
              y={H - 12}
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize="12"
              fontWeight="600"
              className="bfd-chart-month-text"
            >
              {d.mes}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Donut Modal (SVG + progress bars) ──────────────────────────────────────

const MODAL_ICONS: Record<string, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={16} />,
  AEREO: <AirplaneTilt weight="duotone" size={16} />,
  RODOVIARIO: <Truck weight="duotone" size={16} />,
}

function GraficoDonutModal({ dados }: { dados: ModalGraficoInsights[] }) {
  const total = dados.reduce((s, m) => s + m.count, 0)
  if (total === 0) {
    return <PainelSemDadosInsights mensagem="Nenhuma cotação para distribuir por modal." />
  }
  const cx = 80
  const cy = 80
  const r = 58
  const stroke = 16
  const circ = 2 * Math.PI * r

  let offset = 0
  const arcs = dados.map(m => {
    const pct = m.count / total
    const dashLen = pct * circ
    const arc = { ...m, dashLen, dashOffset: -offset }
    offset += dashLen
    return arc
  })

  return (
    <div className="bfd-donut">
      <svg viewBox="0 0 160 160" width="130" height="130">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={a.cor}
            strokeWidth={stroke}
            strokeDasharray={`${a.dashLen} ${circ - a.dashLen}`}
            strokeDashoffset={a.dashOffset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="800" style={{ letterSpacing: '0.02em' }}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600" style={{ letterSpacing: '0.04em' }}>cotações</text>
      </svg>
      <div className="bfd-donut__legend">
        {dados.map(m => (
          <div key={m.modal_cotacao_bid_frete_internacional} className="bfd-donut__legend-row">
            <span className="bfd-donut__legend-icon" style={{ color: m.cor }}>{MODAL_ICONS[m.modal_cotacao_bid_frete_internacional]}</span>
            <span className="bfd-donut__legend-label">{MODAL_LABELS[m.modal_cotacao_bid_frete_internacional as keyof typeof MODAL_LABELS] ?? m.modal_cotacao_bid_frete_internacional}</span>
            <div className="bfd-donut__legend-bar">
              <div className="bfd-donut__legend-bar-fill" style={{ width: `${m.pct}%`, background: m.cor }} />
            </div>
            <span className="bfd-donut__legend-count" style={{ color: m.cor }}>{m.count}</span>
            <span className="bfd-donut__legend-pct">{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Taxa Aprovação (donut) ──────────────────────────────────────────────────

function TaxaAprovacao({
  aprovacao,
}: {
  aprovacao: DashboardKPIs['aprovacao']
}) {
  const { percentual_em_tempo, percentual_atraso, nao_respondidas } = aprovacao
  const cx = 55
  const cy = 55
  const r = 42
  const stroke = 10
  const circ = 2 * Math.PI * r

  const segments = [
    { pct: percentual_em_tempo, cor: '#60a5fa', label: `Em tempo: ${percentual_em_tempo}%` },
    { pct: percentual_atraso, cor: '#fbbf24', label: `Atrasadas: ${percentual_atraso}%` },
    { pct: nao_respondidas, cor: '#f87171', label: `Sem resposta: ${nao_respondidas}%` },
  ]
  let off = 0

  return (
    <div className="bfd-taxa">
      <svg viewBox="0 0 110 110" width="105" height="105">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const dashLen = (s.pct / 100) * circ
          const arc = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.cor}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={-off}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
            />
          )
          off += dashLen
          return arc
        })}
        <text x={cx} y={cy + 2} textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="800" style={{ letterSpacing: '0.02em' }}>{percentual_em_tempo}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600" style={{ letterSpacing: '0.04em' }}>em tempo</text>
      </svg>
      <div className="bfd-taxa__legend">
        {segments.map((s, i) => (
          <div key={i} className="bfd-taxa__legend-row">
            <span className="bfd-taxa__dot" style={{ background: s.cor }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type KpisInsightsVisaoGeral = DashboardKPIs & {
  tempo_medio_resposta_dias: number | null
  cotacoes_aprovadas: number
  distribuicao_modal_andamento: Array<{ modal_cotacao_bid_frete_internacional: string; count: number }>
  total_cotacoes_com_saving: number
  total_saving_vs_media: number
}

function contagemModalAndamento(
  distribuicao: KpisInsightsVisaoGeral['distribuicao_modal_andamento'],
  modal: string,
): number {
  return distribuicao.find(d => d.modal_cotacao_bid_frete_internacional === modal)?.count ?? 0
}

export default function VisaoGeral() {
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const idsWorkspacesEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.idsWorkspacesEscopo)
  const escopoHidratado = useEscopoWorkspacesBidFreteInternacional(s => s.hidratado)
  const versaoEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.versaoEscopo)
  const idsWorkspacesFiltro = useMemo(
    () => resolverIdsWorkspacesParaApi(idsWorkspacesEscopo, idWorkspaceAtivo ?? ''),
    [idsWorkspacesEscopo, idWorkspaceAtivo],
  )

  const [isDialogoCompletoOpen, setIsDialogoCompletoOpen] = useState(false)
  const [contextoDialogo, setContextoDialogo] = useState<ContextoDialogoInsights | null>(null)
  const [kpis, setKpis] = useState<KpisInsightsVisaoGeral | null>(null)
  const [graficos, setGraficos] = useState<InsightsGraficosBidFreteInternacionalCliente | null>(null)
  const [alertas, setAlertas] = useState<CalendarioAlerta[]>([])
  const [dadosMapa, setDadosMapa] = useState<DadosMapaBidFrete>({ pins: [], routes: [] })
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
  const [cotacoesPtax, setCotacoesPtax] = useState<CotacaoPtaxInsights[]>([])
  const [spreadsMoeda, setSpreadsMoeda] = useState<SpreadMoedaInsights[]>([])
  const [erroPtax, setErroPtax] = useState<string | null>(null)
  const statusCotacaoConfig = useStatusCotacaoConfigBidFreteInternacional()
  const { mapa: dashboardTopKpiMapa } = useDashboardTopKpiBidFrete()

  const [dataReferenciaAlertas, setDataReferenciaAlertas] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  )
  const dataReferenciaAlertasAnterior = useRef(dataReferenciaAlertas)

  const carregarInsights = useCallback(async () => {
    setCarregando(true)
    setErroCarregamento(null)
    try {
      const [kpisData, alertasData, mapaData, graficosData] = await Promise.all([
        getDashboardKpis(idsWorkspacesFiltro, {
          status_slug_kpi_andamento: dashboardTopKpiMapa.kpi_cotacoes_andamento,
        }),
        getDashboardInsightsAlertas(idsWorkspacesFiltro, dataReferenciaAlertas),
        getDashboardMapaCotacoesVisaoGeral(idsWorkspacesFiltro),
        getDashboardInsightsGraficos(idsWorkspacesFiltro),
      ])
      setKpis(kpisData)
      setAlertas(alertasData)
      setDadosMapa(mapaData)
      setGraficos(graficosData)
    } catch (err) {
      console.error('[BidFrete Insights] falha ao carregar', err)
      setKpis(null)
      setGraficos(null)
      setAlertas([])
      setDadosMapa({ pins: [], routes: [] })
      setErroCarregamento(
        err instanceof Error ? err.message : 'Falha ao carregar insights do BID Frete Internacional',
      )
    } finally {
      setCarregando(false)
    }
  }, [idsWorkspacesFiltro, dataReferenciaAlertas, dashboardTopKpiMapa.kpi_cotacoes_andamento])

  useEffect(() => {
    if (!escopoHidratado) return
    void carregarInsights()
  }, [carregarInsights, escopoHidratado, versaoEscopo])

  useEffect(() => {
    if (!escopoHidratado) return
    if (dataReferenciaAlertasAnterior.current === dataReferenciaAlertas) return
    dataReferenciaAlertasAnterior.current = dataReferenciaAlertas
    void getDashboardInsightsAlertas(idsWorkspacesFiltro, dataReferenciaAlertas)
      .then(setAlertas)
      .catch(err => {
        console.error('[BidFrete Insights] falha ao carregar alertas', err)
        setAlertas([])
      })
  }, [dataReferenciaAlertas, escopoHidratado, idsWorkspacesFiltro])

  // Câmbio PTAX (BACEN via Configurador) + spread (config taxa-cambio do produto)
  const [cambioModo, setCambioModo] = useState<'hoje' | 'historico' | 'futuro'>('hoje')
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [futuroDias, setFuturoDias] = useState<number>(30)

  const atualizarPtaxSpread = useCallback(async () => {
    setErroPtax(null)
    try {
      const taxasAplicadas = lerTaxasCambioConfigBidFreteInternacional()
      if (cambioModo === 'historico') {
        const [usd, eur, cny] = await Promise.all([
          buscarTaxasMoedaHistoricoInsights('USD', 90),
          buscarTaxasMoedaHistoricoInsights('EUR', 90),
          buscarTaxasMoedaHistoricoInsights('CNY', 90),
        ])
        setCotacoesPtax([
          ...montarCotacoesPtaxHistoricoInsights(usd.dados, dataSelecionada, 'USD'),
          ...montarCotacoesPtaxHistoricoInsights(eur.dados, dataSelecionada, 'EUR'),
          ...montarCotacoesPtaxHistoricoInsights(cny.dados, dataSelecionada, 'CNY'),
        ])
        setSpreadsMoeda([])
        return
      }

      const atuais = await buscarTaxasMoedaAtuaisInsights()
      const base = montarCotacoesPtaxInsights(atuais.por_moeda).map(m => ({
        ...m,
        variacao: calcularVariacaoPtaxDiaAnterior(atuais.por_moeda, m.codigo),
      }))
      if (cambioModo === 'futuro') {
        const meses = futuroDias >= 360 ? 12 : futuroDias >= 180 ? 6 : 4
        const moedasFuturo = ['USD', 'EUR', 'CNY'] as const
        const respostas = await Promise.all(
          moedasFuturo.map(moeda => buscarPrevisoesTaxaFuturaInsights(moeda, meses).catch(() => null)),
        )
        const previsoesPorMoeda: Record<string, Array<{ valor_mediano_previsao_taxa_futura_moeda: number }>> = {}
        for (let i = 0; i < moedasFuturo.length; i++) {
          const moeda = moedasFuturo[i]
          const resposta = respostas[i]
          if (resposta?.data?.length) previsoesPorMoeda[moeda] = resposta.data
        }
        const futuro = montarCotacoesPtaxFuturoPorMoeda(base, previsoesPorMoeda, futuroDias)
        if (futuro.length === 0) {
          setErroPtax(
            'Previsões Focus indisponíveis. Sincronize em Admin › Taxas de Moeda › Cotação Futura (BACEN publica USD; demais moedas só aparecem se houver série no banco).',
          )
          setCotacoesPtax([])
        } else {
          setCotacoesPtax(futuro)
        }
      } else {
        setCotacoesPtax(base)
      }
      setSpreadsMoeda(montarSpreadMedioInsights(atuais.por_moeda, taxasAplicadas))
    } catch (err) {
      setErroPtax(err instanceof Error ? err.message : 'Falha ao carregar PTAX')
      setCotacoesPtax([])
      setSpreadsMoeda([])
    }
  }, [cambioModo, dataSelecionada, futuroDias])

  useEffect(() => {
    if (!escopoHidratado) return
    void atualizarPtaxSpread()
  }, [atualizarPtaxSpread, escopoHidratado])

  const etapasFunil = useMemo(
    () =>
      montarEtapasFunilInsightsBidFreteInternacional(
        statusCotacaoConfig,
        kpis?.funil ?? [],
      ),
    [statusCotacaoConfig, kpis?.funil],
  )

  const kpiCardAndamento = useMemo(() => {
    const slug = dashboardTopKpiMapa.kpi_cotacoes_andamento
    return {
      slug,
      rotulo: resolverRotuloStatusConfigBidFreteInternacional(statusCotacaoConfig, slug, 'Em andamento'),
      cor: resolverCorStatusConfigBidFreteInternacional(statusCotacaoConfig, slug, '#fb923c'),
      count: contagemStatusNoFunilBidFreteInternacional(kpis?.funil ?? [], slug),
    }
  }, [dashboardTopKpiMapa.kpi_cotacoes_andamento, statusCotacaoConfig, kpis?.funil])

  const kpiCardAprovadas = useMemo(() => {
    const slug = dashboardTopKpiMapa.kpi_cotacoes_aprovadas
    return {
      slug,
      rotulo: resolverRotuloStatusConfigBidFreteInternacional(statusCotacaoConfig, slug, 'Aprovadas'),
      cor: resolverCorStatusConfigBidFreteInternacional(statusCotacaoConfig, slug, '#34d399'),
      count: contagemStatusNoFunilBidFreteInternacional(kpis?.funil ?? [], slug),
    }
  }, [dashboardTopKpiMapa.kpi_cotacoes_aprovadas, statusCotacaoConfig, kpis?.funil])

  const totalCotacoesEscopo = graficos?.total_cotacoes
    ?? kpis?.funil?.reduce((acc, f) => acc + f.count, 0)
    ?? 0

  const labelDataAlertas = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    if (dataReferenciaAlertas === hoje) return 'Hoje'
    const d = new Date(`${dataReferenciaAlertas}T12:00:00`)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }, [dataReferenciaAlertas])

  const deslocarDiaAlertas = (delta: number) => {
    const d = new Date(`${dataReferenciaAlertas}T12:00:00`)
    d.setDate(d.getDate() + delta)
    setDataReferenciaAlertas(d.toISOString().slice(0, 10))
  }

  if (carregando) {
    return <ConteudoCarregandoBidFreteInternacional />
  }

  if (erroCarregamento || !kpis || !graficos) {
    return (
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: '#f87171',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, maxWidth: 520 }}>
          {erroCarregamento ?? 'Não foi possível carregar os insights.'}
        </p>
        <button
          type="button"
          onClick={() => { void carregarInsights() }}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 8,
            color: '#fecaca',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const tempoRespostaLabel =
    kpis.tempo_medio_resposta_dias != null ? `${kpis.tempo_medio_resposta_dias} d` : '—'

  return (
    <div className="bfd-dashboard">
      <style>{`
        .bfd-dashboard {
          padding: var(--bid-frete-page-pt) var(--bid-frete-page-px) var(--bid-frete-page-pb);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
          letter-spacing: 0.015em;
          color: #f1f5f9;
        }

        /* ── Header ──────────────────────────────────────────────── */
        .bfd-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; }
        .bfd-header__left h1 { font-size: 1.65rem; font-weight: 700; color: #ffffff; letter-spacing: -0.005em; margin: 0; }
        .bfd-header__left p {
          font-size: 0.95rem;
          color: #f1f5f9;
          font-weight: 500;
          letter-spacing: 0.025em;
          line-height: 1.6;
          margin: 0.45rem 0 0;
        }
        .bfd-header__actions { display: flex; align-items: center; gap: 0.75rem; transform: translateY(24px); }
        .bfd-header__icon-btn {
          width: 38px; height: 38px; border-radius: 8px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); color: #cbd5e1;
          transition: all 0.2s;
        }
        .bfd-header__icon-btn:hover { background: rgba(255,255,255,0.12); color: #ffffff; }

        /* ── KPI Grid ────────────────────────────────────────────── */
        .bfd-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .bfd-kpi {
          background: rgba(255,255,255,0.04); border-radius: 14px; padding: 1.5rem 1.75rem;
          border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 0.65rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bfd-kpi:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
        }
        
        .bfd-kpi--destacado {
          border: 1px solid #60a5fa !important;
          background: rgba(96, 165, 250, 0.08) !important;
          box-shadow: 0 0 18px rgba(96, 165, 250, 0.15);
        }
        .bfd-kpi--destacado:hover {
          background: rgba(96, 165, 250, 0.12) !important;
          box-shadow: 0 0 24px rgba(96, 165, 250, 0.25);
        }

        .bfd-kpi--action {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          text-align: center;
        }
        .bfd-kpi--action:hover {
          transform: translateY(-5px) !important;
          filter: brightness(1.1);
          box-shadow: 0 10px 22px rgba(59, 130, 246, 0.25);
        }

        .bfd-kpi__header { display: flex; align-items: center; gap: 0.6rem; }
        .bfd-kpi__icon { color: #cbd5e1; display: flex; }
        .bfd-kpi__label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: #cbd5e1; }
        .bfd-kpi__row { display: flex; align-items: baseline; gap: 0.65rem; }
        .bfd-kpi__value { font-size: 2.2rem; font-weight: 700; color: #ffffff; line-height: 1.1; letter-spacing: -0.01em; }
        .bfd-kpi__badge {
          font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem;
          border-radius: 6px; letter-spacing: 0.02em;
        }
        .bfd-kpi__sub { font-size: 0.85rem; color: #e2e8f0; font-weight: 500; letter-spacing: 0.02em; line-height: 1.5; }
        .bfd-kpi__spark { display: flex; align-items: flex-end; gap: 4px; height: 32px; margin: 0.35rem 0; }
        .bfd-kpi__spark-bar { flex: 1; border-radius: 2px; min-width: 8px; transition: height 0.3s; }
        .bfd-kpi__spark-line { display: flex; align-items: center; height: 32px; margin: 0.35rem 0; width: 100%; }
        .bfd-kpi__progress-wrap { display: flex; align-items: center; height: 32px; margin: 0.35rem 0; width: 100%; }
        .bfd-kpi__progress-bg { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; width: 100%; }
        .bfd-kpi__progress-fill { height: 100%; background: #60a5fa; border-radius: 3px; }

        /* ── Base Cards and Containers ───────────────────────────── */
        .bfd-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 1.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bfd-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px rgba(59, 130, 246, 0.18) !important; /* Unified native blue hover glow */
        }

        /* Modificadores premium com efeito glow no hover (sem borda acentuada) */
        .bfd-card--accent-blue:hover {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px rgba(59, 130, 246, 0.18) !important;
        }

        .bfd-card--accent-indigo:hover {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px rgba(129, 140, 248, 0.18) !important;
        }

        .bfd-card--accent-purple:hover {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px rgba(167, 139, 250, 0.18) !important;
        }

        .bfd-card--accent-emerald:hover {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px rgba(52, 211, 153, 0.18) !important;
        }

        .bfd-card--accent-amber:hover {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px rgba(251, 191, 36, 0.18) !important;
        }

        .bfd-card--accent-rose:hover {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px rgba(248, 113, 113, 0.18) !important;
        }



        .bfd-card__title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }

        /* ── Globe Map + Câmbio Row ───────────────────────────────── */
        .bfd-globe-row {
          display: grid;
          grid-template-columns: 2.15fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .bfd-globe-row--tres-colunas {
          grid-template-columns: 1.6fr 0.9fr 1fr;
        }
        @media (max-width: 1200px) {
          .bfd-globe-row,
          .bfd-globe-row--tres-colunas {
            grid-template-columns: 1fr;
          }
        }

        /* ── Charts Grid ─────────────────────────────────────────── */
        .bfd-charts-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 1.25rem; }
        .bfd-charts-grid .bfd-card { height: 380px; }
        .bfd-chart-svg { width: 100%; max-height: 230px; height: auto; display: block; margin: auto 0; }
        .bfd-chart__legend { display: flex; gap: 1.25rem; margin-top: auto; padding-top: 0.75rem; justify-content: center; }
        .bfd-chart__legend span { font-size: 0.85rem; color: #cbd5e1; letter-spacing: 0.02em; display: flex; align-items: center; gap: 8px; font-weight: 500; }
        .bfd-chart__legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .bfd-chart__subtitle { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.02em; text-align: right; margin-bottom: 0.5rem; font-weight: 500; }

        /* ── Column Chart Hovers ─────────────────────────────────── */
        .bfd-chart-bar-group {
          cursor: pointer;
          transform-origin: bottom;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bfd-chart-bar-group:hover {
          transform: translateY(-4px);
        }
        .bfd-chart-bar-group text {
          transition: fill 0.2s ease, font-size 0.2s ease;
        }
        .bfd-chart-bar-group:hover .bfd-chart-total-text {
          fill: #ffffff;
          font-weight: 800;
        }
        .bfd-chart-svg:has(.bfd-chart-bar-group:hover) .bfd-chart-bar-group:not(:hover) {
          opacity: 0.35;
        }

        /* ── Câmbio ──────────────────────────────────────────────── */
        .bfd-cambio { display: flex; flex-direction: column; gap: 0; margin: auto 0; }
        .bfd-cambio__row {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .bfd-cambio__row:last-child { border-bottom: none; }
        .bfd-cambio__code { font-size: 0.85rem; font-weight: 700; color: #ffffff; min-width: 44px; letter-spacing: 0.02em; }
        .bfd-cambio__val { font-size: 0.85rem; color: #cbd5e1; flex: 1; letter-spacing: 0.02em; font-weight: 600; }
        .bfd-cambio__var {
          font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; letter-spacing: 0.01em;
        }

        /* ── Insights Grid ───────────────────────────────────────── */
        .bfd-insights-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.25rem; }

        /* ── Melhor cotação ──────────────────────────────────────── */
        .bfd-best { display: flex; flex-direction: column; gap: 0.85rem; }
        .bfd-best__route { display: flex; align-items: center; justify-content: space-between; }
        .bfd-best__port { text-align: center; }
        .bfd-best__port-flag { font-size: 1.1rem; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; }
        .bfd-best__port-code { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 600; }
        .bfd-best__arrow { display: flex; align-items: center; gap: 0.25rem; color: #cbd5e1; flex: 1; justify-content: center; }
        .bfd-best__arrow-line { height: 1px; flex: 1; background: rgba(255,255,255,0.15); max-width: 120px; }
        .bfd-best__arrow-tt { font-size: 0.78rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 600; }
        .bfd-best__saving {
          display: flex; align-items: center; gap: 0.75rem;
        }
        .bfd-best__saving-badge {
          font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 6px;
          background: rgba(96, 165, 250, 0.12); color: #60a5fa; display: flex; align-items: center; gap: 4px;
          letter-spacing: 0.01em;
        }
        .bfd-best__saving-val { font-size: 1.45rem; font-weight: 800; color: #60a5fa; letter-spacing: 0.02em; }
        .bfd-best__meta { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 500; line-height: 1.5; }

        /* ── Donut ───────────────────────────────────────────────── */
        .bfd-donut { display: flex; align-items: center; gap: 1.75rem; margin: auto 0; }
        .bfd-donut__legend { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
        .bfd-donut__legend-row { display: flex; align-items: center; gap: 0.6rem; }
        .bfd-donut__legend-icon { color: #cbd5e1; display: flex; }
        .bfd-donut__legend-label { font-size: 0.85rem; color: #cbd5e1; min-width: 80px; letter-spacing: 0.02em; font-weight: 600; }
        .bfd-donut__legend-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .bfd-donut__legend-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
        .bfd-donut__legend-count { font-size: 0.88rem; font-weight: 700; min-width: 28px; text-align: right; color: #ffffff; }
        .bfd-donut__legend-pct { font-size: 0.82rem; color: #cbd5e1; min-width: 32px; text-align: right; letter-spacing: 0.02em; font-weight: 500; }

        /* ── Funil ───────────────────────────────────────────────── */
        .bfd-funil { display: flex; flex-direction: column; gap: 0.55rem; }
        .bfd-funil__row { display: flex; align-items: center; gap: 0.6rem; }
        .bfd-funil__label { font-size: 0.85rem; color: #cbd5e1; min-width: 155px; white-space: nowrap; letter-spacing: 0.02em; font-weight: 600; }
        .bfd-funil__bar-wrap { flex: 1; height: 14px; background: rgba(255,255,255,0.04); border-radius: 4px; overflow: hidden; }
        .bfd-funil__bar { height: 100%; border-radius: 4px; transition: width 0.4s; }
        .bfd-funil__count { font-size: 0.88rem; font-weight: 700; color: #ffffff; min-width: 24px; text-align: right; }
        .bfd-funil__pct { font-size: 0.82rem; color: #cbd5e1; min-width: 32px; text-align: right; letter-spacing: 0.02em; font-weight: 500; }

        /* ── Top Incoterms ───────────────────────────────────────── */
        .bfd-incoterms { display: flex; flex-direction: column; gap: 0.45rem; }
        .bfd-incoterms__row { display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0; }
        .bfd-incoterms__code { font-size: 0.88rem; font-weight: 700; color: #ffffff; letter-spacing: 0.03em; }
        .bfd-incoterms__count { font-size: 0.85rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 600; }

        /* ── Bottom Grid ─────────────────────────────────────────── */
        .bfd-bottom-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }

        /* ── Taxa ────────────────────────────────────────────────── */
        .bfd-taxa { display: flex; align-items: center; gap: 1.25rem; }
        .bfd-taxa__legend { display: flex; flex-direction: column; gap: 0.5rem; }
        .bfd-taxa__legend-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: #cbd5e1; font-weight: 600; letter-spacing: 0.02em; line-height: 1.5; }
        .bfd-taxa__dot { width: 8px; height: 8px; border-radius: 50%; }

        /* ── Alertas ─────────────────────────────────────────────── */
        .bfd-alertas { display: flex; flex-direction: column; gap: 0.85rem; }
        .bfd-alertas__nav { display: flex; align-items: center; gap: 0.6rem; justify-content: flex-end; margin-bottom: 0.5rem; }
        .bfd-alertas__nav button {
          background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; transition: color 0.15s;
        }
        .bfd-alertas__nav button:hover { color: #ffffff; }
        .bfd-alertas__nav span { font-size: 0.82rem; color: #cbd5e1; font-weight: 600; letter-spacing: 0.02em; }
        .bfd-alertas__pills { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .bfd-alertas__pill {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1rem;
          border-radius: 8px; font-size: 0.85rem; color: #cbd5e1; font-weight: 600; letter-spacing: 0.02em;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        }
        .bfd-alertas__pill-count { font-weight: 800; font-size: 0.9rem; }

        /* ── Footer ──────────────────────────────────────────────── */
        .bfd-footer { text-align: center; font-size: 0.8rem; color: #cbd5e1; padding: 0.75rem 0; opacity: 0.8; letter-spacing: 0.02em; font-weight: 500; }

        /* ── Animations ──────────────────────────────────────────── */
        @keyframes pinPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes tooltipFadeUp {
          from { opacity: 0; transform: translate3d(-50%, 8px, 0); }
          to { opacity: 1; transform: translate3d(-50%, 0, 0); }
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 1200px) {
          .bfd-kpi-grid { grid-template-columns: repeat(3, 1fr); }
          .bfd-charts-grid { grid-template-columns: 1fr; }
          .bfd-insights-grid { grid-template-columns: 1fr; }
          .bfd-bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .bfd-kpi-grid { grid-template-columns: repeat(1, 1fr); }
        }
      `}</style>

      {/* KPIs Grid (5 columns now) */}
      <div className="bfd-kpi-grid">
        <CardBasicoGlobal
          titulo={kpiCardAndamento.rotulo}
          icone={<Clock weight="duotone" size={16} style={{ color: kpiCardAndamento.cor }} />}
          valor={String(kpiCardAndamento.count)}
          subtexto={`${totalCotacoesEscopo} no escopo · USD ${fmtMoeda(kpis.valor_andamento_usd)} em aberto`}
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>Volume em aberto</span>
                <strong>USD {fmtMoeda(kpis.valor_andamento_usd)}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>{kpiCardAndamento.rotulo}</span>
                <strong>{kpiCardAndamento.count}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Marítimo</span>
                <strong style={{ color: '#34d399' }}>{contagemModalAndamento(kpis.distribuicao_modal_andamento, 'MARITIMO')}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Aéreo</span>
                <strong style={{ color: '#a78bfa' }}>{contagemModalAndamento(kpis.distribuicao_modal_andamento, 'AEREO')}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Rodoviário</span>
                <strong style={{ color: '#fbbf24' }}>{contagemModalAndamento(kpis.distribuicao_modal_andamento, 'RODOVIARIO')}</strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo={kpiCardAprovadas.rotulo}
          icone={<CheckCircle weight="duotone" size={16} style={{ color: kpiCardAprovadas.cor }} />}
          valor={String(kpiCardAprovadas.count)}
          subtexto={`USD ${fmtMoeda(kpis.valor_aprovado_usd)} total`}
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>Volume fechado</span>
                <strong>USD {fmtMoeda(kpis.valor_aprovado_usd)}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>{kpiCardAprovadas.rotulo}</span>
                <strong>{kpiCardAprovadas.count}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Total no escopo</span>
                <strong>{totalCotacoesEscopo}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Taxa de conversão</span>
                <strong style={{ color: '#60a5fa' }}>
                  {totalCotacoesEscopo > 0
                    ? `${Math.round((kpiCardAprovadas.count / totalCotacoesEscopo) * 1000) / 10}%`
                    : '—'}
                </strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo="Saving Médio"
          icone={<Coins weight="duotone" size={16} style={{ color: '#34d399' }} />}
          valor={`${kpis.savings.media_saving_percentual}%`}
          subtexto={`USD ${fmtMoeda(kpis.savings.total_saving_usd)} acumulado`}
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>Saving acumulado</span>
                <strong>USD {fmtMoeda(kpis.savings.total_saving_usd)}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Saving percentual</span>
                <strong style={{ color: '#34d399' }}>{kpis.savings.media_saving_percentual}%</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Cotações com saving</span>
                <strong>{kpis.total_cotacoes_com_saving}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Saving vs média de mercado</span>
                <strong style={{ color: '#34d399' }}>USD {fmtMoeda(kpis.total_saving_vs_media)}</strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo="Tempo Médio de Resposta"
          icone={<Timer weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
          valor={tempoRespostaLabel}
          tendencia={{ valor: '', direcao: 'down' }}
          subtexto="Meta: 3 dias"
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>Média de resposta</span>
                <strong>
                  {kpis.tempo_medio_resposta_dias != null
                    ? `${kpis.tempo_medio_resposta_dias} dias`
                    : 'Sem dados'}
                </strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Meta SLA</span>
                <strong>3.0 dias</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Aprovações no prazo</span>
                <strong style={{ color: '#34d399' }}>{kpis.aprovacao.percentual_em_tempo}%</strong>
              </div>
            </>
          }
        />
      </div>

      {/* Row 2: Globe Map + Right Column (Alertas on top, Funil de Cotações on bottom) */}
      <div className="bfd-globe-row bfd-globe-row--tres-colunas">
        {/* Global World Map Overview Section */}
        <VisaoGeralMapa
          vistaInicialMapa="mapa"
          fonteDados="api"
          dadosMapa={dadosMapa}
          painelRankingsExterno
          exibirPainelLateralMapa
          onOpenCompleto={(route) => {
            setContextoDialogo({
              tipo: 'rota',
              label: 'Detalhes da Rota',
              codigo_origem: route.codigo_origem ?? extrairCodigoPortoInsights(route.fromPort),
              codigo_destino: route.codigo_destino ?? extrairCodigoPortoInsights(route.toPort),
              modal_cotacao_bid_frete_internacional: route.mode,
              fromPort: route.fromPort,
              toPort: route.toPort,
              mode: route.mode,
            })
            setIsDialogoCompletoOpen(true)
          }}
        />

        {/* Right Column Stacking Alertas + Funil */}
        <div className="bfd-globe-row__coluna-direita">
          {/* Alertas */}
          <div className="bfd-card bfd-alertas bfd-card--accent-rose" style={{ flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div className="cg-card__header">
                <div className="cg-card__icon-wrap">
                  <Bell weight="duotone" size={16} style={{ color: '#f87171' }} />
                </div>
                <p className="cg-card__label" style={{ margin: 0 }}>Alertas</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '2px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 6px', color: '#94a3b8', borderRadius: '12px', transition: 'all 0.2s' }}
                  onClick={() => deslocarDiaAlertas(-1)}
                  aria-label="Dia anterior"
                >
                  <CaretLeft size={12} />
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', padding: '0 4px', letterSpacing: '0.02em' }}>{labelDataAlertas}</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 6px', color: '#94a3b8', borderRadius: '12px', transition: 'all 0.2s' }}
                  onClick={() => deslocarDiaAlertas(1)}
                  aria-label="Próximo dia"
                >
                  <CaretRight size={12} />
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', flex: 1 }}>
              {alertas.map((a, i) => {
                let icon = <Clock size={16} weight="duotone" />
                let glowColor = 'rgba(248, 113, 113, 0.15)'
                let textColor = '#f87171'
                let borderLeftColor = '#f87171'
                let itemBg = 'rgba(248, 113, 113, 0.04)'

                if (a.cor === 'orange' || a.cor === 'yellow') {
                  icon = <ChatText size={16} weight="duotone" />
                  glowColor = 'rgba(251, 191, 36, 0.15)'
                  textColor = '#fbbf24'
                  borderLeftColor = '#fbbf24'
                  itemBg = 'rgba(251, 191, 36, 0.04)'
                } else if (a.cor === 'green') {
                  icon = <Bell size={16} weight="duotone" />
                  glowColor = 'rgba(52, 211, 153, 0.15)'
                  textColor = '#34d399'
                  borderLeftColor = '#34d399'
                  itemBg = 'rgba(52, 211, 153, 0.04)'
                } else {
                  icon = <CheckCircle size={16} weight="duotone" />
                  glowColor = 'rgba(96, 165, 250, 0.15)'
                  textColor = '#60a5fa'
                  borderLeftColor = '#60a5fa'
                  itemBg = 'rgba(96, 165, 250, 0.04)'
                }

                return (
                  <div
                    key={i}
                    className="bfd-alertas__glow-card"
                    onClick={() => {
                      if (
                        a.tipo !== 'vence_hoje'
                        && a.tipo !== 'resposta'
                        && a.tipo !== 'aprovacao'
                        && a.tipo !== 'nova'
                      ) return
                      setContextoDialogo({ tipo: a.tipo, label: a.label, cor: a.cor })
                      setIsDialogoCompletoOpen(true)
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: itemBg,
                      border: '1px solid rgba(255, 255, 255, 0.03)',
                      borderLeft: `3px solid ${borderLeftColor}`,
                      borderRadius: '6px',
                      padding: '0.65rem 0.8rem',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      minHeight: '75px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.background = itemBg.replace('0.04', '0.07')
                      e.currentTarget.style.borderColor = borderLeftColor + '2b'
                      e.currentTarget.style.boxShadow = `0 4px 12px ${glowColor}`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.background = itemBg
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ color: borderLeftColor, display: 'flex', alignItems: 'center' }}>
                        {icon}
                      </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {a.count}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', lineHeight: '1.2', marginTop: '0.35rem', letterSpacing: '0.01em' }}>
                      {a.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Funil */}
          <div className="bfd-card bfd-card--accent-indigo" style={{ flex: 1, padding: '1.25rem 1.5rem' }}>
            <div className="cg-card__header" style={{ marginBottom: '1.25rem' }}>
              <div className="cg-card__icon-wrap">
                <Funnel weight="duotone" size={16} style={{ color: '#818cf8' }} />
              </div>
              <p className="cg-card__label" style={{ margin: 0 }}>Funil de Cotações</p>
            </div>
            <BidFreteFunilBarras etapas={etapasFunil} rotuloEtapa={(rotulo) => rotulo} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="bfd-charts-grid">
        {/* Barras mensal */}
        <div className="bfd-card bfd-card--accent-blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div className="cg-card__header">
              <div className="cg-card__icon-wrap">
                <ChartBar weight="duotone" size={16} style={{ color: '#3b82f6' }} />
              </div>
              <p className="cg-card__label" style={{ margin: 0 }}>Cotações por Mês</p>
            </div>
            <span className="bfd-chart__subtitle">Últimos 6 meses</span>
          </div>
          <GraficoBarrasMensal dados={graficos.cotacoes_por_mes} />
          <div className="bfd-chart__legend">
            <span><span className="bfd-chart__legend-dot" style={{ background: '#60a5fa' }} /> Aprovadas</span>
            <span><span className="bfd-chart__legend-dot" style={{ background: '#8b5cf6' }} /> Em andamento</span>
            <span><span className="bfd-chart__legend-dot" style={{ background: '#f87171' }} /> Recusadas</span>
          </div>
        </div>

        {/* Donut modal_cotacao_bid_frete_internacional */}
        <div className="bfd-card bfd-card--accent-emerald">
          <div className="cg-card__header" style={{ marginBottom: '1.25rem' }}>
            <div className="cg-card__icon-wrap">
              <ChartPie weight="duotone" size={16} style={{ color: '#34d399' }} />
            </div>
            <p className="cg-card__label" style={{ margin: 0 }}>Distribuição por Modal</p>
          </div>
          <GraficoDonutModal dados={graficos.distribuicao_modal} />
        </div>

        {/* Câmbio PTAX (BACEN) */}
        <div className="bfd-card bfd-card--accent-blue" style={{ height: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="cg-card__header">
              <div className="cg-card__icon-wrap">
                <CurrencyDollar weight="duotone" size={16} style={{ color: '#3b82f6' }} />
              </div>
              <p className="cg-card__label" style={{ margin: 0 }}>Câmbio PTAX (BACEN)</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.2rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: 'historico', label: 'Histórico' },
              { id: 'futuro', label: 'Futuro' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCambioModo(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: cambioModo === tab.id ? '#3b82f6' : 'transparent',
                  color: cambioModo === tab.id ? '#ffffff' : '#cbd5e1',
                  boxShadow: cambioModo === tab.id ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Histórico: Date Picker */}
          {cambioModo === 'historico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>SELECIONAR DATA PTAX</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <CalendarBlank size={14} style={{ position: 'absolute', left: '8px', color: '#94a3b8' }} />
                <input
                  type="date"
                  value={dataSelecionada}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.5rem 0.35rem 1.75rem',
                    fontSize: '0.75rem',
                    color: '#ffffff',
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          )}

          {/* Futuro: Forward Horizon Selectors */}
          {cambioModo === 'futuro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>HORIZONTE HEDGE</label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[30, 90, 180, 360].map(dias => (
                  <button
                    key={dias}
                    onClick={() => setFuturoDias(dias)}
                    style={{
                      flex: 1,
                      padding: '0.3rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: futuroDias === dias ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: futuroDias === dias ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                      color: futuroDias === dias ? '#60a5fa' : '#cbd5e1',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    +{dias}d
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exchange Rates List */}
          <div className="bfd-cambio" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', margin: cambioModo === 'hoje' ? 'auto 0' : '0' }}>
            {erroPtax ? (
              <PainelSemDadosInsights mensagem={erroPtax} />
            ) : cotacoesPtax.length === 0 ? (
              <PainelSemDadosInsights mensagem="PTAX indisponível. Sincronize em Configurador › Taxas de Moeda." />
            ) : cotacoesPtax.map(m => (
              <div key={m.codigo} className="bfd-cambio__row" style={{ padding: '0.55rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="bfd-cambio__code" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', minWidth: '40px' }}>{m.codigo}</span>
                <span className="bfd-cambio__val" style={{ fontSize: '0.82rem', color: '#cbd5e1', flex: 1, fontWeight: 600, paddingLeft: '0.5rem' }}>R$ {m.valor_brl.toFixed(2).replace('.', ',')}</span>
                <span
                  className="bfd-cambio__var"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    color: m.variacao >= 0 ? '#34d399' : '#f87171',
                    background: m.variacao >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  }}
                >
                  {m.variacao >= 0 ? '+' : ''}{m.variacao.toFixed(2).replace('.', ',')}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Taxa Média de Spread */}
        <div className="bfd-card bfd-card--accent-blue" style={{ height: '100%', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="cg-card__header">
              <div className="cg-card__icon-wrap">
                <ChartLine weight="duotone" size={16} style={{ color: '#3b82f6' }} />
              </div>
              <p className="cg-card__label" style={{ margin: 0 }}>Spread Médio Aplicado</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 'auto 0' }}>
            {spreadsMoeda.length === 0 ? (
              <PainelSemDadosInsights mensagem="Configure taxas em BID Frete › Configurações › Taxa de Câmbio para calcular o spread." />
            ) : spreadsMoeda.map(item => (
              <div key={item.moeda} style={{ display: 'flex', flexDirection: 'column', gap: '0.3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{item.moeda}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa' }}>
                    {item.valor_pct.toFixed(2).replace('.', ',')}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.pct_barra}%`,
                      background: `linear-gradient(90deg, #3b82f6 0%, ${item.cor} 100%)`,
                      boxShadow: `0 0 6px ${item.cor}60`,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease-out',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
              Spread = diferença entre taxa configurada no produto e PTAX (BACEN) de hoje.
            </p>
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="bfd-insights-grid">
        {/* Melhor cotação */}
        <div className="bfd-card bfd-card--accent-amber">
          <div className="cg-card__header" style={{ marginBottom: '1.25rem' }}>
            <div className="cg-card__icon-wrap">
              <Trophy weight="duotone" size={16} style={{ color: '#fbbf24' }} />
            </div>
            <p className="cg-card__label" style={{ margin: 0 }}>Melhor Cotação do Mês</p>
          </div>
          {graficos.melhor_cotacao_mes ? (
          <div className="bfd-best">
            <div className="bfd-best__route" style={{ margin: '0.35rem 0 0.75rem' }}>
              <div className="bfd-best__port">
                <div className="bfd-best__port-code">{graficos.melhor_cotacao_mes.origem}</div>
              </div>
              
              <div className="bfd-best__arrow" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 0.5rem' }}>
                <span className="bfd-best__arrow-tt" style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.02em', marginBottom: '4px', fontWeight: 500 }}>
                  {graficos.melhor_cotacao_mes.transit_time != null
                    ? `${graficos.melhor_cotacao_mes.transit_time} dias`
                    : '—'}
                </span>
                <svg width="100%" height="20" viewBox="0 0 160 20" style={{ overflow: 'visible' }}>
                  <line x1="0" y1="10" x2="160" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4,4" />
                  <circle cx="80" cy="10" r="10" fill="rgba(96,165,250,0.15)" />
                  <circle cx="80" cy="10" r="3.5" fill="#60a5fa" />
                  <g transform="translate(73, 3)">
                    <Anchor size={14} weight="bold" style={{ color: '#60a5fa' }} />
                  </g>
                </svg>
              </div>

              <div className="bfd-best__port">
                <div className="bfd-best__port-code">{graficos.melhor_cotacao_mes.destino}</div>
              </div>
            </div>
            <div className="bfd-best__saving">
              <span className="bfd-best__saving-badge">
                <TrendUp size={12} /> {graficos.melhor_cotacao_mes.saving_pct}% saving
              </span>
              <span className="bfd-best__saving-val">USD {fmtMoeda(graficos.melhor_cotacao_mes.ganho_valor_cotacao_bid_frete_internacional)}</span>
            </div>
            <div className="bfd-best__meta">
              {graficos.melhor_cotacao_mes.numero_cotacao_bid_frete_internacional} | {graficos.melhor_cotacao_mes.fornecedor} | USD {fmtMoeda(graficos.melhor_cotacao_mes.valor_aprovado_ganho_bid_frete_internacional)}
            </div>
          </div>
          ) : (
            <PainelSemDadosInsights mensagem="Nenhuma cotação aprovada neste mês no escopo selecionado." />
          )}
        </div>

        {/* Top Incoterms */}
        <div className="bfd-card bfd-card--accent-purple">
          <div className="cg-card__header" style={{ marginBottom: '1.25rem' }}>
            <div className="cg-card__icon-wrap">
              <List weight="duotone" size={16} style={{ color: '#a78bfa' }} />
            </div>
            <p className="cg-card__label" style={{ margin: 0 }}>Top Incoterms</p>
          </div>
          <div className="bfd-incoterms">
            {graficos.top_incoterms.length === 0 ? (
              <PainelSemDadosInsights mensagem="Nenhum incoterm registrado nas cotações do escopo." />
            ) : graficos.top_incoterms.map(inc => (
              <div key={inc.incoterm_cotacao_bid_frete_internacional} className="bfd-incoterms__row" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.4rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="bfd-incoterms__code">{inc.incoterm_cotacao_bid_frete_internacional}</span>
                  <span className="bfd-incoterms__count" style={{ fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>
                    {inc.count} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>({inc.pct}%)</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${inc.pct}%`, height: '100%', background: 'linear-gradient(90deg, #60a5fa, #2563eb)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bfd-bottom-grid">
        {/* Taxa aprovação */}
        <div className="bfd-card bfd-card--accent-emerald">
          <div className="cg-card__header" style={{ marginBottom: '1.25rem' }}>
            <div className="cg-card__icon-wrap">
              <ThumbsUp weight="duotone" size={16} style={{ color: '#34d399' }} />
            </div>
            <p className="cg-card__label" style={{ margin: 0 }}>Taxa de Aprovação</p>
          </div>
          <TaxaAprovacao aprovacao={kpis.aprovacao} />
        </div>
      </div>

      <DialogoDetalheInsightsBidFreteInternacional
        aberto={isDialogoCompletoOpen}
        contexto={contextoDialogo}
        idsWorkspacesFiltro={idsWorkspacesFiltro}
        dataReferencia={dataReferenciaAlertas}
        onFechar={() => setIsDialogoCompletoOpen(false)}
      />

    </div>
  )
}
