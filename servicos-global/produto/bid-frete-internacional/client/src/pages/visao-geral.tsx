/**
 * Dashboard.tsx — Dashboard Premium do BID Frete Internacional
 *
 * Layout glassmorphism com KPIs + sparklines, gráficos SVG,
 * funil com percentuais, donut com progress bars, câmbio do dia.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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

import { DEMO_MENSAL, DEMO_MODAL, DEMO_MELHOR_COTACAO, DEMO_INCOTERMS } from '../shared/demo-data'
import {
  getDashboardInsightsAlertas,
  getDashboardKpis,
  getDashboardMapaCotacoesVisaoGeral,
} from '../shared/api'
import { STATUS_LABELS, MODAL_LABELS, CalendarioAlerta } from '../shared/types'
import type { DashboardKPIs, StatusCotacao } from '../shared/types'
import {
  VisaoGeralMapaBidFrete as VisaoGeralMapa,
  type DadosMapaBidFrete,
  type RouteDetailBidFrete as RouteDetail,
} from '../shared/componentes/visao-geral-mapa-bid-frete'
import { BidFreteFunilBarras } from '../shared/componentes/visao-geral-bid-frete-ui'
import { ConteudoCarregandoBidFreteInternacional } from '../shared/pagina-carregando-bid-frete-internacional'
import '../shared/bid-frete-visao-geral-layout.css'
import '../shared/bid-frete-visao-geral-mapa.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const MODAL_ICONS: Record<string, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={16} />,
  AEREO: <AirplaneTilt weight="duotone" size={16} />,
  RODOVIARIO: <Truck weight="duotone" size={16} />,
}

const FUNIL_CORES: Partial<Record<StatusCotacao, string>> = {
  RASCUNHO: '#94a3b8',
  ENVIADA_FORNECEDORES: '#8b5cf6',
  EM_COTACAO: '#818cf8',
  AGUARDANDO_APROVACAO: '#fbbf24',
  REPROVADA: '#f87171',
  APROVADA: '#34d399',
  EXPIRADA: '#64748b',
}


function GraficoBarrasMensal() {
  const W = 520
  const H = 280
  const pad = { top: 35, right: 20, bottom: 40, left: 40 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const barW = innerW / DEMO_MENSAL.length
  
  // Dynamic maxVal calculated from the tallest total, leaving 10% elegant spacing at the top
  const maxMonthlyTotal = Math.max(...DEMO_MENSAL.map(d => d.aprovadas + d.andamento + d.recusadas))
  const maxVal = maxMonthlyTotal > 0 ? maxMonthlyTotal * 1.1 : 100

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

      {DEMO_MENSAL.map((d, i) => {
        const total = d.aprovadas + d.andamento + d.recusadas
        const w = barW * 0.45
        const x = pad.left + i * barW + (barW - w) / 2
        const fullH = (total / maxVal) * innerH

        const hAprov = (d.aprovadas / total) * fullH
        const hAnd = (d.andamento / total) * fullH
        const hRec = (d.recusadas / total) * fullH
        
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

function GraficoDonutModal() {
  const total = DEMO_MODAL.reduce((s, m) => s + m.count, 0)
  const cx = 80
  const cy = 80
  const r = 58
  const stroke = 16
  const circ = 2 * Math.PI * r

  let offset = 0
  const arcs = DEMO_MODAL.map(m => {
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
        {DEMO_MODAL.map(m => (
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
}

export default function VisaoGeral() {
  const [isDialogoCompletoOpen, setIsDialogoCompletoOpen] = useState(false)
  const [alertModalTab, setAlertModalTab] = useState<'geral' | 'itens' | 'propostas' | 'historico'>('geral')
  const [selectedAlertContextCompleto, setSelectedAlertContextCompleto] = useState<CalendarioAlerta | (RouteDetail & { tipo: 'route' }) | null>(null)
  const [kpis, setKpis] = useState<KpisInsightsVisaoGeral | null>(null)
  const [alertas, setAlertas] = useState<CalendarioAlerta[]>([])
  const [dadosMapa, setDadosMapa] = useState<DadosMapaBidFrete>({ pins: [], routes: [] })
  const [carregando, setCarregando] = useState(true)

  const carregarInsights = useCallback(async () => {
    setCarregando(true)
    try {
      const [kpisData, alertasData, mapaData] = await Promise.all([
        getDashboardKpis(),
        getDashboardInsightsAlertas(),
        getDashboardMapaCotacoesVisaoGeral(),
      ])
      setKpis(kpisData)
      setAlertas(alertasData)
      setDadosMapa(mapaData)
    } catch {
      setKpis(null)
      setAlertas([])
      setDadosMapa({ pins: [], routes: [] })
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregarInsights()
  }, [carregarInsights])

  // Interactive exchange rate & spread states (DDD nomenclature, PT-BR without accents)
  const [cambioModo, setCambioModo] = useState<'hoje' | 'historico' | 'futuro'>('hoje')
  const [dataSelecionada, setDataSelecionada] = useState<string>('2026-05-22')
  const [futuroDias, setFuturoDias] = useState<number>(30)

  const etapasFunil = useMemo(
    () =>
      (kpis?.funil ?? []).map((item) => ({
        rotulo: STATUS_LABELS[item.status],
        quantidade: item.count,
        cor: FUNIL_CORES[item.status] ?? '#94a3b8',
      })),
    [kpis?.funil],
  )

  // PTAX currency simulation
  const obterCotacoes = useMemo(() => {
    const moedasBase = [
      { codigo: 'USD', nome: 'Dólar', referencia: true, valor_brl: 5.12, variacao: -0.32 },
      { codigo: 'EUR', nome: 'Euro', referencia: false, valor_brl: 5.68, variacao: 0.15 },
      { codigo: 'CNY', nome: 'Yuan', referencia: false, valor_brl: 0.71, variacao: -0.08 },
    ]

    if (cambioModo === 'hoje') {
      return moedasBase
    }

    if (cambioModo === 'historico') {
      let hash = 0
      for (let i = 0; i < dataSelecionada.length; i++) {
        hash = dataSelecionada.charCodeAt(i) + ((hash << 5) - hash)
      }
      const fator = (hash % 120) / 1000
      const variacaoBase = (hash % 300) / 100 - 1.5
      return [
        { codigo: 'USD', nome: 'Dólar', referencia: true, valor_brl: +(5.12 * (1 + fator)).toFixed(2), variacao: +variacaoBase.toFixed(2) },
        { codigo: 'EUR', nome: 'Euro', referencia: false, valor_brl: +(5.68 * (1 + fator * 1.05)).toFixed(2), variacao: +(variacaoBase * 1.1).toFixed(2) },
        { codigo: 'CNY', nome: 'Yuan', referencia: false, valor_brl: +(0.71 * (1 + fator * 0.95)).toFixed(2), variacao: +(variacaoBase * 0.85).toFixed(2) },
      ]
    }

    if (cambioModo === 'futuro') {
      const fatorDias = futuroDias === 30 ? 1 : futuroDias === 90 ? 3 : futuroDias === 180 ? 6 : 12
      const fatorAcrescimo = 1 + (0.0075 * fatorDias)
      return [
        { codigo: 'USD', nome: 'Dólar', referencia: true, valor_brl: +(5.12 * fatorAcrescimo).toFixed(2), variacao: +(0.45 * fatorDias).toFixed(2) },
        { codigo: 'EUR', nome: 'Euro', referencia: false, valor_brl: +(5.68 * fatorAcrescimo * 1.01).toFixed(2), variacao: +(0.52 * fatorDias).toFixed(2) },
        { codigo: 'CNY', nome: 'Yuan', referencia: false, valor_brl: +(0.71 * fatorAcrescimo * 0.99).toFixed(2), variacao: +(0.38 * fatorDias).toFixed(2) },
      ]
    }

    return moedasBase
  }, [cambioModo, dataSelecionada, futuroDias])
  const andamentoSpark = [12, 14, 18, 15, 20, 22, 25]
  const savingSpark = [15, 18, 16, 21, 19, 23, 24]

  if (carregando || !kpis) {
    return <ConteudoCarregandoBidFreteInternacional />
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
        @media (max-width: 1200px) {
          .bfd-globe-row {
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
          titulo="Em andamento"
          icone={<Clock weight="duotone" size={16} style={{ color: '#fb923c' }} />}
          valor={String(kpis.cotacoes_andamento)}
          tendencia={{ valor: '+3/sem', direcao: 'up' }}
          subtexto={`USD ${fmtMoeda(kpis.valor_andamento_usd)} em aberto`}
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>Volume em aberto</span>
                <strong>USD {fmtMoeda(kpis.valor_andamento_usd)}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Cotações ativas</span>
                <strong>{kpis.cotacoes_andamento}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Marítimo (Estimado)</span>
                <strong style={{ color: '#34d399' }}>{Math.round(kpis.cotacoes_andamento * 0.6)}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Aéreo (Estimado)</span>
                <strong style={{ color: '#a78bfa' }}>{Math.round(kpis.cotacoes_andamento * 0.4)}</strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo="Aprovadas"
          icone={<CheckCircle weight="duotone" size={16} style={{ color: '#34d399' }} />}
          valor={String(kpis.cotacoes_aprovadas)}
          tendencia={{ valor: '', direcao: 'up' }}
          subtexto={`USD ${fmtMoeda(kpis.valor_aprovado_usd)} total`}
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>Volume fechado</span>
                <strong>USD {fmtMoeda(kpis.valor_aprovado_usd)}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Total aprovado</span>
                <strong>{kpis.cotacoes_aprovadas}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Taxa de conversão</span>
                <strong style={{ color: '#60a5fa' }}>78.4%</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Parceiros atendidos</span>
                <strong>14 armadores</strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo="Saving Médio"
          icone={<Coins weight="duotone" size={16} style={{ color: '#34d399' }} />}
          valor={`${kpis.savings.media_saving_percentual}%`}
          tendencia={{ valor: '+2.3pp', direcao: 'up' }}
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
                <span>Benchmark target</span>
                <strong>12.0%</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Performance vs target</span>
                <strong style={{ color: '#34d399' }}>+{(kpis.savings.media_saving_percentual - 12).toFixed(1)} pp</strong>
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
      <div className="bfd-globe-row">
        {/* Global World Map Overview Section */}
        <VisaoGeralMapa
          vistaInicialMapa="mapa"
          fonteDados="api"
          dadosMapa={dadosMapa}
          painelRankingsSeparado
          exibirPainelLateralMapa
          onOpenCompleto={(route) => {
            setSelectedAlertContextCompleto({
              tipo: 'route',
              ...route
            })
            setAlertModalTab('geral')
            setIsDialogoCompletoOpen(true)
          }}
        />

        {/* Right Column Stacking Alertas + Funil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', minHeight: 0 }}>
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
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 6px', color: '#94a3b8', borderRadius: '12px', transition: 'all 0.2s' }}><CaretLeft size={12} /></button>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', padding: '0 4px', letterSpacing: '0.02em' }}>Hoje</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 6px', color: '#94a3b8', borderRadius: '12px', transition: 'all 0.2s' }}><CaretRight size={12} /></button>
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
                      setSelectedAlertContextCompleto(a)
                      setAlertModalTab('geral')
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
          <GraficoBarrasMensal />
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
          <GraficoDonutModal />
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
                  max="2026-05-22"
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
            {obterCotacoes.map(m => (
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
            {[
              { moeda: 'USD', valor: '1,85%', pct: 60, cor: '#3b82f6' },
              { moeda: 'EUR', valor: '2,10%', pct: 75, cor: '#8b5cf6' },
              { moeda: 'CNY', valor: '1,45%', pct: 45, cor: '#fbbf24' },
            ].map(item => (
              <div key={item.moeda} style={{ display: 'flex', flexDirection: 'column', gap: '0.3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{item.moeda}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa' }}>{item.valor}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.pct}%`,
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
              Média aplicada pelos fornecedores sobre as cotações ativas dos últimos 30 dias.
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
          <div className="bfd-best">
            <div className="bfd-best__route" style={{ margin: '0.35rem 0 0.75rem' }}>
              <div className="bfd-best__port">
                <div className="bfd-best__port-flag">🇨🇳</div>
                <div className="bfd-best__port-code">Shanghai (CNSHA)</div>
              </div>
              
              <div className="bfd-best__arrow" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 0.5rem' }}>
                <span className="bfd-best__arrow-tt" style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.02em', marginBottom: '4px', fontWeight: 500 }}>
                  {DEMO_MELHOR_COTACAO.transit_time} dias
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
                <div className="bfd-best__port-flag">🇧🇷</div>
                <div className="bfd-best__port-code">Santos (BRSSZ)</div>
              </div>
            </div>
            <div className="bfd-best__saving">
              <span className="bfd-best__saving-badge">
                <TrendUp size={12} /> {DEMO_MELHOR_COTACAO.saving_pct}% saving
              </span>
              <span className="bfd-best__saving-val">USD {fmtMoeda(DEMO_MELHOR_COTACAO.ganho_valor_cotacao_bid_frete_internacional)}</span>
            </div>
            <div className="bfd-best__meta">
              {DEMO_MELHOR_COTACAO.numero_cotacao_bid_frete_internacional} | {DEMO_MELHOR_COTACAO.fornecedor} | USD {fmtMoeda(DEMO_MELHOR_COTACAO.valor_aprovado_ganho_bid_frete_internacional)}
            </div>
          </div>
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
            {DEMO_INCOTERMS.map(inc => (
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

      <div className="bfd-footer">
        ⚙ Dados demonstrativos — conecte o backend para dados reais
      </div>

      {/* Tabbed Quotation Modal Overlay */}
      {isDialogoCompletoOpen && selectedAlertContextCompleto && (() => {
         const context = selectedAlertContextCompleto;
         // Generate mock data for the selected alert type
         let modalTitle = 'Detalhes da Cotação';
         let quoteId = 'COT-2026-F401';
         let origin = 'Shanghai (CNSHA)';
         let destination = 'Santos (BRSSZ)';
         let goods = 'Componentes Eletrônicos Premium e Placas de Circuito';
         let weight = '12.450 Kg';
         let volume = '38.5 m³';
         let incoterm = 'FOB';
         let value = 'USD 8.048,00';
         let category = 'Marítimo (FCL 40\' HC)';
         let proposals = [
           { fornecedor: 'Pacific Cargo (E96)', valor: 'USD 7.950,00', transit: '32 dias', status: 'Melhor Preço', cor: '#34d399' },
           { fornecedor: 'DHL Global Forwarding', valor: 'USD 8.200,00', transit: '28 dias', status: 'Em Análise', cor: '#60a5fa' }
         ];
         let history = [
           { data: '21/05/2026 12:00', texto: 'Alerta gerado: Prazo de resposta se encerra hoje', autor: 'Sistema' },
           { data: '15/05/2026 10:20', texto: 'Disparada para 6 fornecedores no portal', autor: 'Daniel' },
           { data: '15/05/2026 10:14', texto: 'Cotação criada e homologada', autor: 'Daniel' }
         ];

         const dotColor = context.tipo === 'route'
           ? ((context as RouteDetail).mode === 'AEREO' ? '#a78bfa' : '#34d399')
           : ((context as CalendarioAlerta).cor === 'red' ? '#f87171' : (context as CalendarioAlerta).cor === 'orange' ? '#fbbf24' : (context as CalendarioAlerta).cor === 'green' ? '#34d399' : '#60a5fa');

         if (context.tipo === 'route') {
           const route = context as RouteDetail;
           modalTitle = 'Detalhes da Rota Ativa';
           quoteId = 'COT-2026-R' + Math.floor(100 + Math.random() * 900);
           origin = route.fromPort;
           destination = route.toPort;
           goods = 'Componentes de Alta Tecnologia e Cargas Premium';
           weight = '14.800 Kg';
           volume = '32.4 m³';
           incoterm = route.mode === 'AEREO' ? 'FCA' : 'FOB';
           value = 'USD ' + fmtMoeda(route.bestPrice);
           category = route.mode === 'AEREO' ? "Aéreo (Geral)" : "Marítimo (FCL 40' HC)";
           proposals = [
             { fornecedor: route.supplier, valor: 'USD ' + fmtMoeda(route.bestPrice), transit: route.transitTime + ' dias', status: 'Melhor Preço', cor: route.mode === 'AEREO' ? '#a78bfa' : '#34d399' },
             { fornecedor: 'Apex Global forwarders', valor: 'USD ' + fmtMoeda(route.bestPrice * 1.08), transit: (route.transitTime + 3) + ' dias', status: 'Em Análise', cor: '#60a5fa' }
           ];
           history = [
             { data: '21/05/2026 10:00', texto: 'Melhor proposta validada de ' + route.supplier, autor: 'Sistema' },
             { data: '18/05/2026 14:30', texto: 'Resposta de Apex Global forwarders recebida', autor: 'Portal' },
             { data: '15/05/2026 09:00', texto: 'Cotação disparada para 4 fornecedores homologados', autor: 'Daniel' }
           ];
         } else if (context.tipo === 'resposta') {
           modalTitle = 'Respostas Pendentes';
           quoteId = 'COT-2026-A228';
           origin = 'Frankfurt (FRA)';
           destination = 'Guarulhos (GRU)';
           goods = 'Peças Automotivas e Motores de Alta Performance';
           weight = '4.200 Kg';
           volume = '12.8 m³';
           incoterm = 'FCA';
           value = 'EUR 14.200,00';
           category = 'Aéreo (Geral)';
           proposals = [
             { fornecedor: 'Lufthansa Cargo', valor: 'EUR 13.800,00', transit: '4 dias', status: 'Melhor Transit', cor: '#a78bfa' },
             { fornecedor: 'Kuehne + Nagel', valor: 'Pendente', transit: '—', status: 'Aguardando', cor: '#fbbf24' }
           ];
           history = [
             { data: '21/05/2026 09:30', texto: 'Resposta pendente de Kuehne + Nagel notificada', autor: 'Sistema' },
             { data: '20/05/2026 14:00', texto: 'Resposta recebida de Lufthansa Cargo', autor: 'Portal' },
             { data: '19/05/2026 14:15', texto: 'Disparada via e-mail e portal', autor: 'Daniel' }
           ];
         } else if (context.tipo === 'aprovacao') {
           modalTitle = 'Aguardando Aprovação';
           quoteId = 'COT-2026-M892';
           origin = 'Miami (MIA)';
           destination = 'Itajaí (BRSSZ)';
           goods = 'Equipamentos Médicos e Ultrassons de Alta Precisão';
           weight = '1.850 Kg';
           volume = '6.2 m³';
           incoterm = 'EXW';
           value = 'USD 6.800,00';
           category = 'Marítimo (LCL)';
           proposals = [
             { fornecedor: 'Panalpina', valor: 'USD 6.250,00', transit: '22 dias', status: 'Aprovada', cor: '#34d399' },
             { fornecedor: 'Expeditors', valor: 'USD 6.400,00', transit: '24 dias', status: 'Reprovada', cor: '#f87171' }
           ];
           history = [
             { data: '21/05/2026 10:00', texto: 'Enviada para aprovação do Diretor de Comex', autor: 'Daniel' },
             { data: '16/05/2026 15:45', texto: 'Proposta consolidada de Panalpina selecionada', autor: 'Sistema' },
             { data: '14/05/2026 11:30', texto: 'Criada e disparada para 4 fornecedores', autor: 'Daniel' }
           ];
         } else if (context.tipo === 'nova') {
           modalTitle = 'Novas Cotações (7 dias)';
           quoteId = 'COT-2026-R115';
           origin = 'Buenos Aires (BUE)';
           destination = 'São Paulo (SPO)';
           goods = 'Fios de Cobre e Condutores Elétricos Industriais';
           weight = '24.000 Kg';
           volume = '44.0 m³';
           incoterm = 'DDP';
           value = 'BRL 28.000,00';
           category = 'Rodoviário (FTL)';
           proposals = [
             { fornecedor: 'Mercosul Transportes', valor: 'BRL 26.500,00', transit: '5 dias', status: 'Melhor Preço', cor: '#34d399' }
           ];
           history = [
             { data: '21/05/2026 10:00', texto: 'Validada e publicada no portal', autor: 'Daniel' },
             { data: '20/05/2026 08:00', texto: 'Cotação rascunhada', autor: 'Daniel' }
           ];
         }

         return (
            <div className="bfd-dialogo-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 0.25s ease-out'
            }} onClick={() => setIsDialogoCompletoOpen(false)}>
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes scaleIn {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
              `}</style>
              <div className="bfd-dialogo-card" style={{
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '750px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: dotColor }}>●</span>
                      {modalTitle}
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>Referência: {quoteId}</p>
                  </div>
                  <button style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.2s' }}
                    onClick={() => setIsDialogoCompletoOpen(false)}
                  >✕</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(15, 23, 42, 0.2)', padding: '0 1rem' }}>
                  {['geral', 'itens', 'propostas', 'historico'].map(t => {
                    const isActive = alertModalTab === t;
                    const labels = { geral: 'Geral', itens: 'Itens', propostas: 'Propostas', historico: 'Histórico' };
                    return (
                      <button key={t} style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                        color: isActive ? '#3b82f6' : '#94a3b8',
                        padding: '0.85rem 1rem',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }} onClick={() => setAlertModalTab(t as any)}>{labels[t as keyof typeof labels]}</button>
                    )
                  })}
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: '300px' }}>
                  {alertModalTab === 'geral' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field">
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Origem</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{origin}</div>
                      </div>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field">
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Destino</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{destination}</div>
                      </div>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Mercadoria / Descrição</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{goods}</div>
                      </div>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field">
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Peso Total</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{weight}</div>
                      </div>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field">
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Cubagem (M³)</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{volume}</div>
                      </div>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field">
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Incoterm</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{incoterm}</div>
                      </div>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field">
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Valor Limite / Estimado</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{value}</div>
                      </div>
                      <div className="modal_completo_cotação_bid_frete_iternacional-field" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Modalidade</label>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>{category}</div>
                      </div>
                    </div>
                  )}

                  {alertModalTab === 'itens' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>
                        <div style={{ flex: 1 }}>Código</div>
                        <div style={{ flex: 2 }}>Descrição</div>
                        <div style={{ flex: 1, textAlign: 'right' }}>Qtd</div>
                        <div style={{ flex: 1, textAlign: 'right' }}>Peso (Kg)</div>
                      </div>
                      <div style={{ display: 'flex', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
                        <div style={{ flex: 1, color: '#60a5fa', fontWeight: 600 }}>ITM-01</div>
                        <div style={{ flex: 2, color: '#cbd5e1' }}>{goods}</div>
                        <div style={{ flex: 1, textAlign: 'right', color: '#ffffff' }}>1.000 un</div>
                        <div style={{ flex: 1, textAlign: 'right', color: '#ffffff' }}>{weight}</div>
                      </div>
                    </div>
                  )}

                  {alertModalTab === 'propostas' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {proposals.map((p, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'block' }}>{p.fornecedor}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Transit time: {p.transit}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa', display: 'block' }}>{p.valor}</span>
                            <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: p.cor + '22', color: p.cor }}>{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {alertModalTab === 'historico' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                      {history.map((h, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <span style={{
                            position: 'absolute',
                            left: '-1.45rem',
                            top: '4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            boxShadow: '0 0 8px #3b82f6'
                          }} />
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>{h.data} • por {h.autor}</span>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'block' }}>{h.texto}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(15, 23, 42, 0.2)' }}>
                  <button style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                    onClick={() => setIsDialogoCompletoOpen(false)}
                  >Fechar</button>
                  <button style={{
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                  }}
                    onClick={() => alert('Operação atualizada com sucesso!')}
                  >Salvar</button>
                </div>
              </div>
            </div>
         )
      })()}
    </div>
  )
}
