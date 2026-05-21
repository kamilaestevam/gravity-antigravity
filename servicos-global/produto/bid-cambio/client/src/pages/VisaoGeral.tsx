/**
 * VisaoGeral.tsx — Visão Geral do BID Câmbio
 *
 * Layout glassmorphism com KPIs + sparklines, gráficos SVG,
 * funil com percentuais, donut com progress bars, câmbio do dia.
 * Design System: Solid Slate (dark mode)
 * Cor do produto: #06b6d4 (Cyan 500)
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  TrendUp,
  Timer,
  Trophy,
  ArrowsLeftRight,
  CaretLeft,
  CaretRight,
  Plus,
  Minus,
  ArrowCounterClockwise,
  Play,
  Pause,
  Globe,
  List,
  MapPin,
  Compass,
  CurrencyDollar,
  CurrencyEur,
  CurrencyGbp,
  Clock,
  CheckCircle,
  ChatText,
  Bell,
} from '@phosphor-icons/react'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const MOEDA_ICONS: Record<string, React.ReactNode> = {
  USD: <CurrencyDollar weight="duotone" size={16} />,
  EUR: <CurrencyEur weight="duotone" size={16} />,
  GBP: <CurrencyGbp weight="duotone" size={16} />,
  OUTRAS: <Globe weight="duotone" size={16} />,
}

// ─── Demo data inline (câmbio context) ─────────────────────────────────────

const DEMO_KPIS_CAMBIO = {
  operacoes_abertas: 85,
  operacoes_fechadas: 420,
  valor_aberto_usd: 12400000,
  valor_fechado_usd: 48500000,
  saving: { total_saving_usd: 892000, media_saving_percentual: 12.4 },
  resposta: { percentual_em_tempo: 82, percentual_atraso: 12, nao_respondidas: 6 },
  moedas: [
    { codigo: 'USD', nome: 'Dólar', valor_brl: 5.12, variacao: -0.32 },
    { codigo: 'EUR', nome: 'Euro', valor_brl: 5.68, variacao: 0.15 },
    { codigo: 'GBP', nome: 'Libra', valor_brl: 6.45, variacao: 0.22 },
    { codigo: 'JPY', nome: 'Iene', valor_brl: 0.034, variacao: -0.18 },
    { codigo: 'CNY', nome: 'Yuan', valor_brl: 0.71, variacao: -0.08 },
  ],
}

const DEMO_CALENDARIO_CAMBIO = [
  { tipo: 'vencimento', label: 'Operações vencem hoje', count: 4, cor: 'red' },
  { tipo: 'resposta', label: 'Respostas pendentes', count: 18, cor: 'orange' },
  { tipo: 'aprovacao', label: 'Aguardando aprovação', count: 8, cor: 'yellow' },
  { tipo: 'nova', label: 'Novas operações (7 dias)', count: 32, cor: 'green' },
]

const DEMO_MENSAL_CAMBIO = [
  { mes: 'Dez', fechadas: 48, andamento: 12, canceladas: 5 },
  { mes: 'Jan', fechadas: 55, andamento: 15, canceladas: 6 },
  { mes: 'Fev', fechadas: 52, andamento: 14, canceladas: 4 },
  { mes: 'Mar', fechadas: 68, andamento: 18, canceladas: 8 },
  { mes: 'Abr', fechadas: 62, andamento: 16, canceladas: 5 },
  { mes: 'Mai', fechadas: 75, andamento: 22, canceladas: 7 },
]

const DEMO_MOEDA_DIST = [
  { moeda: 'USD', count: 280, pct: 52, cor: '#06b6d4' },
  { moeda: 'EUR', count: 140, pct: 26, cor: '#a78bfa' },
  { moeda: 'GBP', count: 65, pct: 12, cor: '#34d399' },
  { moeda: 'Outras', count: 55, pct: 10, cor: '#fbbf24' },
]

const DEMO_MELHOR_OPERACAO = {
  referencia: 'OP-2028-0089',
  origem: 'New York',
  destino: 'São Paulo',
  saving_pct: 15.2,
  valor_saving: 18400,
  valor_operacao: 121200,
  corretora: 'Banco Safra',
  prazo: 'T+2',
}

const DEMO_TOP_CORRETORAS = [
  { nome: 'Banco Safra', count: 95, pct: 35 },
  { nome: 'BTG Pactual', count: 72, pct: 27 },
  { nome: 'XP Investimentos', count: 55, pct: 20 },
  { nome: 'Treviso', count: 30, pct: 11 },
  { nome: 'Outros', count: 18, pct: 7 },
]

// ─── Map Pin Data ──────────────────────────────────────────────────────────

interface MapPin {
  id: number
  label: string
  portCode: string
  country: string
  lat: number
  lng: number
  geoLat: number
  geoLng: number
  activeBids: number
  bestPrice: number
  savingPct: number
  mode: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY'
  supplier: string
  flag: string
}

const MAP_PINS: MapPin[] = [
  {
    id: 1,
    label: 'New York',
    portCode: 'USNYC',
    country: 'EUA',
    lat: 42,
    lng: 27,
    geoLat: 40.7,
    geoLng: -74.0,
    activeBids: 180,
    bestPrice: 121200,
    savingPct: 15.2,
    mode: 'USD',
    supplier: 'Banco Safra',
    flag: '🇺🇸'
  },
  {
    id: 2,
    label: 'São Paulo',
    portCode: 'BRSAO',
    country: 'Brasil',
    lat: 74,
    lng: 39,
    geoLat: -23.5,
    geoLng: -46.6,
    activeBids: 150,
    bestPrice: 48500,
    savingPct: 12.8,
    mode: 'USD',
    supplier: 'BTG Pactual',
    flag: '🇧🇷'
  },
  {
    id: 3,
    label: 'London',
    portCode: 'GBLON',
    country: 'Reino Unido',
    lat: 32,
    lng: 49,
    geoLat: 51.5,
    geoLng: -0.1,
    activeBids: 90,
    bestPrice: 85000,
    savingPct: 11.5,
    mode: 'GBP',
    supplier: 'XP Investimentos',
    flag: '🇬🇧'
  },
  {
    id: 4,
    label: 'Frankfurt',
    portCode: 'DEFRA',
    country: 'Alemanha',
    lat: 34,
    lng: 53,
    geoLat: 50.1,
    geoLng: 8.7,
    activeBids: 60,
    bestPrice: 62000,
    savingPct: 10.2,
    mode: 'EUR',
    supplier: 'Treviso',
    flag: '🇩🇪'
  },
  {
    id: 5,
    label: 'Tokyo',
    portCode: 'JPTYO',
    country: 'Japão',
    lat: 38,
    lng: 84,
    geoLat: 35.7,
    geoLng: 139.7,
    activeBids: 45,
    bestPrice: 38000,
    savingPct: 9.8,
    mode: 'JPY',
    supplier: 'Banco Safra',
    flag: '🇯🇵'
  },
  {
    id: 6,
    label: 'Shanghai',
    portCode: 'CNSHA',
    country: 'China',
    lat: 40,
    lng: 82,
    geoLat: 31.2,
    geoLng: 121.5,
    activeBids: 30,
    bestPrice: 28000,
    savingPct: 8.5,
    mode: 'CNY',
    supplier: 'BTG Pactual',
    flag: '🇨🇳'
  }
]

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, badge, badgeColor, sparkData, sparkType = 'bar', destacado = false }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  badge?: string
  badgeColor?: string
  sparkData?: number[]
  sparkType?: 'line' | 'bar' | 'progress'
  destacado?: boolean
}) {
  const maxSpark = sparkData ? Math.max(...sparkData) : 0
  return (
    <div className={`bcc-kpi ${destacado ? 'bcc-kpi--destacado' : ''}`}>
      <div className="bcc-kpi__header">
        <span className="bcc-kpi__icon" style={{ color: destacado ? '#06b6d4' : '#cbd5e1' }}>{icon}</span>
        <span className="bcc-kpi__label" style={{ color: destacado ? '#ffffff' : '#94a3b8' }}>{label}</span>
      </div>
      <div className="bcc-kpi__row">
        <span className="bcc-kpi__value" style={{ color: destacado ? '#ffffff' : '#ffffff' }}>{value}</span>
        {badge && (
          <span
            className="bcc-kpi__badge"
            style={{
              color: destacado ? '#ffffff' : (badgeColor || '#06b6d4'),
              background: destacado ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.12)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      
      {sparkData && sparkType === 'bar' && (
        <div className="bcc-kpi__spark">
          {sparkData.map((d, i) => (
            <div
              key={i}
              className="bcc-kpi__spark-bar"
              style={{
                height: `${(d / maxSpark) * 100}%`,
                background: destacado ? '#06b6d4' : `rgba(99,91,255,${0.3 + (i / sparkData.length) * 0.7})`,
              }}
            />
          ))}
        </div>
      )}

      {sparkData && sparkType === 'line' && (
        <div className="bcc-kpi__spark-line">
          {(() => {
            const w = 140
            const h = 32
            const points = sparkData.map((d, i) => {
              const x = (i / (sparkData.length - 1)) * w
              const y = h - (d / maxSpark) * 22 - 5
              return { x, y }
            })
            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
            const fillPath = `${linePath} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`
            
            return (
              <svg width="100%" height="32" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="sparkline-grad-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={fillPath} fill="url(#sparkline-grad-blue)" />
                <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )
          })()}
        </div>
      )}

      {sparkType === 'progress' && (
        <div className="bcc-kpi__progress-wrap">
          <div className="bcc-kpi__progress-bg">
            <div className="bcc-kpi__progress-fill" style={{ width: '80%' }} />
          </div>
        </div>
      )}

      <span className="bcc-kpi__sub" style={{ color: destacado ? '#ffffff' : '#cbd5e1' }}>{sub}</span>
    </div>
  )
}

// ─── Gráfico de Barras Mensal (SVG) ─────────────────────────────────────────

function GraficoBarrasMensalCambio() {
  const W = 520
  const H = 280
  const pad = { top: 35, right: 20, bottom: 40, left: 40 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const barW = innerW / DEMO_MENSAL_CAMBIO.length
  
  // Dynamic maxVal calculated from the tallest total, leaving 10% elegant spacing at the top
  const maxMonthlyTotal = Math.max(...DEMO_MENSAL_CAMBIO.map(d => d.fechadas + d.andamento + d.canceladas))
  const maxVal = maxMonthlyTotal > 0 ? maxMonthlyTotal * 1.1 : 100

  // Y-axis grid ticks (from 0 = top/max to 1 = bottom/zero)
  const gridTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bcc-chart-svg" style={{ overflow: 'visible' }}>
      <defs>
        {/* Vibrant blue gradient (Aprovadas) */}
        <linearGradient id="grad-aprov" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
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
          <g key={idx} className="bcc-chart-gridline-group">
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
              className="bcc-chart-grid-text"
            >
              {val}
            </text>
          </g>
        )
      })}

      {DEMO_MENSAL_CAMBIO.map((d, i) => {
        const total = d.fechadas + d.andamento + d.canceladas
        const w = barW * 0.45
        const x = pad.left + i * barW + (barW - w) / 2
        const fullH = (total / maxVal) * innerH

        const hAprov = (d.fechadas / total) * fullH
        const hAnd = (d.andamento / total) * fullH
        const hRec = (d.canceladas / total) * fullH
        
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
          <g key={i} className="bcc-chart-bar-group" filter="url(#col-shadow)">
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
              className="bcc-chart-total-text"
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
              className="bcc-chart-month-text"
            >
              {d.mes}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Donut Moeda (SVG + progress bars) ──────────────────────────────────────

function GraficoDonutMoeda() {
  const total = DEMO_MOEDA_DIST.reduce((s, m) => s + m.count, 0)
  const cx = 80
  const cy = 80
  const r = 58
  const stroke = 16
  const circ = 2 * Math.PI * r

  let offset = 0
  const arcs = DEMO_MOEDA_DIST.map(m => {
    const pct = m.count / total
    const dashLen = pct * circ
    const arc = { ...m, dashLen, dashOffset: -offset }
    offset += dashLen
    return arc
  })

  return (
    <div className="bcc-donut">
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
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600" style={{ letterSpacing: '0.04em' }}>operações</text>
      </svg>
      <div className="bcc-donut__legend">
        {DEMO_MOEDA_DIST.map(m => (
          <div key={m.moeda} className="bcc-donut__legend-row">
            <span className="bcc-donut__legend-icon" style={{ color: m.cor }}>{MOEDA_ICONS[m.moeda] ?? MOEDA_ICONS.OUTRAS}</span>
            <span className="bcc-donut__legend-label">{m.moeda}</span>
            <div className="bcc-donut__legend-bar">
              <div className="bcc-donut__legend-bar-fill" style={{ width: `${m.pct}%`, background: m.cor }} />
            </div>
            <span className="bcc-donut__legend-count" style={{ color: m.cor }}>{m.count}</span>
            <span className="bcc-donut__legend-pct">{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Funil ──────────────────────────────────────────────────────────────────

function FunilStatus() {
  const localFunil = [
    { label: 'Rascunho', count: 3, color: '#94a3b8' },
    { label: 'Enviada corretoras', count: 12, color: '#8b5cf6' },
    { label: 'Em cotação', count: 28, color: '#06b6d4' },
    { label: 'Aguardando aprovação', count: 15, color: '#fbbf24' },
    { label: 'Aprovada', count: 8, color: '#22c55e' },
    { label: 'Fechada', count: 35, color: '#06b6d4' },
    { label: 'Cancelada', count: 2, color: '#64748b' },
  ]
  const total = localFunil.reduce((s, f) => s + f.count, 0)
  const maxCount = Math.max(...localFunil.map(f => f.count))
  
  return (
    <div className="bcc-funil">
      {localFunil.map(f => {
        const pct = total ? Math.round((f.count / total) * 100) : 0
        const barW = maxCount ? (f.count / maxCount) * 100 : 0
        return (
          <div key={f.label} className="bcc-funil__row">
            <span className="bcc-funil__label">{f.label}</span>
            <div className="bcc-funil__bar-wrap">
              <div
                className="bcc-funil__bar"
                style={{ width: `${barW}%`, background: f.color }}
              />
            </div>
            <span className="bcc-funil__count">{f.count}</span>
            <span className="bcc-funil__pct">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Taxa de Resposta (donut) ────────────────────────────────────────────────

function TaxaResposta() {
  const { percentual_em_tempo, percentual_atraso, nao_respondidas } = DEMO_KPIS_CAMBIO.resposta
  const cx = 55
  const cy = 55
  const r = 42
  const stroke = 10
  const circ = 2 * Math.PI * r

  const segments = [
    { pct: percentual_em_tempo, cor: '#06b6d4', label: `Em tempo: ${percentual_em_tempo}%` },
    { pct: percentual_atraso, cor: '#fbbf24', label: `Atrasadas: ${percentual_atraso}%` },
    { pct: nao_respondidas, cor: '#f87171', label: `Sem resposta: ${nao_respondidas}%` },
  ]
  let off = 0

  return (
    <div className="bcc-taxa">
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
      <div className="bcc-taxa__legend">
        {segments.map((s, i) => (
          <div key={i} className="bcc-taxa__legend-row">
            <span className="bcc-taxa__dot" style={{ background: s.cor }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 3D Globe Helpers & Data ────────────────────────────────────────────────

// Precise geographic polygons for realistic continent rendering
// Extremely high-fidelity realistic world polygons generated with lower RDP epsilon
const POLYGONS = {
  americas: [
    [-90.547, 69.498], [-90.552, 68.475], [-89.215, 69.259], [-88.02, 68.615], [-88.318, 67.873], [-87.35, 67.199], [-86.306, 67.922], [-85.577, 68.784],
    [-85.522, 69.882], [-82.622, 69.658], [-81.28, 69.162], [-81.22, 68.666], [-81.964, 68.133], [-81.259, 67.597], [-81.386, 67.111], [-83.344, 66.412],
    [-84.735, 66.257], [-85.769, 66.558], [-86.068, 66.056], [-87.031, 65.213], [-87.323, 64.776], [-88.483, 64.099], [-89.914, 64.033], [-90.704, 63.61],
    [-90.77, 62.96], [-91.933, 62.835], [-93.157, 62.025], [-94.242, 60.899], [-94.629, 60.11], [-94.685, 58.949], [-93.215, 58.782], [-92.297, 57.087],
    [-90.898, 57.285], [-89.039, 56.852], [-88.04, 56.472], [-87.324, 55.999], [-86.071, 55.724], [-85.012, 55.303], [-82.273, 55.148], [-82.436, 54.282],
    [-82.125, 53.277], [-81.401, 52.158], [-79.913, 51.208], [-79.143, 51.534], [-78.602, 52.562], [-79.124, 54.141], [-79.83, 54.668], [-78.229, 55.136],
    [-77.096, 55.838], [-76.541, 56.534], [-76.623, 57.203], [-77.302, 58.052], [-78.517, 58.805], [-77.337, 59.853], [-77.773, 60.758], [-78.107, 62.32],
    [-77.411, 62.55], [-74.668, 62.181], [-73.84, 62.444], [-72.909, 62.105], [-71.677, 61.525], [-71.374, 61.137], [-69.59, 61.062], [-69.62, 60.221],
    [-69.288, 58.957], [-68.375, 58.801], [-67.65, 58.212], [-66.202, 58.767], [-65.245, 59.871], [-64.583, 60.336], [-61.396, 56.968], [-61.799, 56.339],
    [-60.469, 55.776], [-59.57, 55.204], [-57.975, 54.945], [-57.333, 54.627], [-56.937, 53.78], [-56.158, 53.648], [-55.756, 53.271], [-55.683, 52.147],
    [-57.127, 51.42], [-58.775, 51.064], [-60.033, 50.243], [-61.724, 50.081], [-63.862, 50.291], [-66.399, 50.229], [-67.236, 49.511], [-68.511, 49.068],
    [-69.954, 47.745], [-71.104, 46.822], [-70.255, 46.986], [-68.65, 48.3], [-66.552, 49.133], [-65.056, 49.233], [-64.171, 48.742], [-65.115, 48.071],
    [-64.799, 46.993], [-64.472, 46.239], [-63.173, 45.739], [-61.521, 45.884], [-60.518, 47.008], [-60.449, 46.283], [-59.803, 45.92], [-61.04, 45.265],
    [-63.255, 44.67], [-64.247, 44.266], [-65.364, 43.545], [-66.123, 43.619], [-66.162, 44.465], [-64.425, 45.292], [-66.026, 45.259], [-67.137, 45.138],
    [-66.965, 44.81], [-68.032, 44.325], [-70.116, 43.684], [-70.69, 43.03], [-70.815, 42.865], [-70.825, 42.335], [-70.495, 41.805], [-70.08, 41.78],
    [-70.185, 42.145], [-69.885, 41.923], [-69.965, 41.637], [-70.64, 41.475], [-71.12, 41.495], [-71.86, 41.32], [-72.876, 41.221], [-73.71, 40.931],
    [-72.241, 41.12], [-71.945, 40.93], [-73.345, 40.63], [-73.982, 40.628], [-73.952, 40.751], [-74.257, 40.474], [-73.962, 40.428], [-74.178, 39.709],
    [-74.906, 38.94], [-74.98, 39.196], [-75.2, 39.248], [-75.528, 39.498], [-75.32, 38.96], [-75.083, 38.781], [-75.057, 38.404], [-75.94, 37.217],
    [-76.031, 37.257], [-75.722, 37.937], [-76.233, 38.319], [-76.35, 39.15], [-76.543, 38.718], [-76.329, 38.083], [-76.96, 38.233], [-76.302, 37.918],
    [-76.259, 36.966], [-75.972, 36.897], [-75.727, 35.551], [-76.363, 34.808], [-77.398, 34.512], [-78.055, 33.925], [-78.554, 33.861], [-79.061, 33.494],
    [-79.203, 33.159], [-80.301, 32.509], [-80.865, 32.033], [-81.336, 31.44], [-81.49, 30.73], [-81.314, 30.036], [-80.98, 29.18], [-80.536, 28.472],
    [-80.53, 28.04], [-80.057, 26.88], [-80.131, 25.817], [-80.381, 25.206], [-80.68, 25.08], [-81.172, 25.201], [-81.33, 25.64], [-81.71, 25.87],
    [-82.705, 27.495], [-82.855, 27.886], [-82.65, 28.55], [-82.93, 29.1], [-83.71, 29.937], [-84.1, 30.09], [-85.109, 29.636], [-85.288, 29.686],
    [-85.773, 30.153], [-86.4, 30.4], [-87.53, 30.274], [-88.418, 30.385], [-89.18, 30.316], [-89.605, 30.176], [-89.414, 29.894], [-89.43, 29.489],
    [-89.218, 29.291], [-89.408, 29.16], [-89.779, 29.307], [-90.155, 29.117], [-90.88, 29.149], [-91.627, 29.677], [-92.499, 29.552], [-93.226, 29.784],
    [-93.848, 29.714], [-94.69, 29.48], [-95.6, 28.739], [-96.594, 28.307], [-97.14, 27.83], [-97.37, 27.38], [-97.33, 26.21], [-97.139, 25.868],
    [-97.528, 24.992], [-97.703, 24.272], [-97.776, 22.933], [-97.872, 22.444], [-97.699, 21.899], [-97.389, 21.411], [-97.189, 20.635], [-96.526, 19.891],
    [-96.292, 19.32], [-95.901, 18.828], [-94.839, 18.563], [-94.426, 18.144], [-93.549, 18.424], [-92.037, 18.705], [-91.408, 18.876], [-90.772, 19.284],
    [-90.534, 19.867], [-90.451, 20.708], [-90.279, 21.0], [-89.601, 21.262], [-88.544, 21.494], [-87.658, 21.459], [-87.052, 21.544], [-86.812, 21.331],
    [-86.846, 20.85], [-87.383, 20.255], [-87.621, 19.646], [-87.437, 19.472], [-87.837, 18.26], [-88.091, 18.517], [-88.3, 18.5], [-88.296, 18.353],
    [-88.107, 18.349], [-88.123, 18.077], [-88.285, 17.644], [-88.198, 17.49], [-88.355, 16.531], [-88.552, 16.266], [-88.732, 16.234], [-88.931, 15.887],
    [-88.605, 15.706], [-88.518, 15.856], [-88.121, 15.689], [-87.902, 15.865], [-86.903, 15.757], [-86.441, 15.783], [-86.002, 16.005], [-85.444, 15.886],
    [-84.984, 15.996], [-84.368, 15.835], [-83.774, 15.424], [-83.41, 15.271], [-83.147, 14.996], [-83.284, 14.677], [-83.182, 14.311], [-83.412, 13.97],
    [-83.52, 13.568], [-83.552, 13.127], [-83.473, 12.419], [-83.626, 12.321], [-83.72, 11.893], [-83.651, 11.629], [-83.855, 11.373], [-83.809, 11.103],
    [-83.656, 10.939], [-83.402, 10.396], [-82.187, 9.208], [-82.208, 8.996], [-81.809, 8.951], [-81.714, 9.032], [-81.439, 8.786], [-80.947, 8.859],
    [-80.522, 9.111], [-79.915, 9.313], [-79.573, 9.612], [-79.021, 9.553], [-79.058, 9.455], [-78.501, 9.42], [-78.056, 9.248], [-77.353, 8.67],
    [-76.837, 8.639], [-76.086, 9.337], [-75.675, 9.443], [-75.48, 10.619], [-74.907, 11.083], [-74.277, 11.102], [-74.197, 11.31], [-73.415, 11.227],
    [-72.238, 11.956], [-71.754, 12.437], [-71.4, 12.376], [-71.137, 12.113], [-71.332, 11.776], [-71.36, 11.54], [-71.947, 11.423], [-71.621, 10.969],
    [-71.633, 10.446], [-72.074, 9.866], [-71.696, 9.072], [-71.265, 9.137], [-71.04, 9.86], [-71.35, 10.212], [-71.401, 10.969], [-70.155, 11.375],
    [-70.294, 11.847], [-69.943, 12.162], [-69.584, 11.46], [-68.883, 11.443], [-68.233, 10.886], [-68.194, 10.555], [-67.296, 10.546], [-66.228, 10.649],
    [-65.655, 10.201], [-64.89, 10.077], [-64.329, 10.39], [-64.318, 10.641], [-61.881, 10.716], [-62.73, 10.42], [-62.388, 9.948], [-61.589, 9.873],
    [-60.831, 9.381], [-60.671, 8.58], [-60.15, 8.603], [-59.102, 7.999], [-58.483, 7.348], [-58.455, 6.833], [-58.078, 6.809], [-57.147, 5.973],
    [-55.949, 5.773], [-55.842, 5.953], [-55.033, 6.025], [-53.958, 5.757], [-52.882, 5.41], [-51.823, 4.566], [-51.658, 4.156], [-51.317, 4.203],
    [-51.07, 3.651], [-50.509, 1.901], [-49.974, 1.737], [-49.947, 1.046], [-50.699, 0.223], [-50.388, -0.078], [-48.62, -0.235], [-48.584, -1.238],
    [-47.825, -0.582], [-46.567, -0.941], [-44.906, -1.552], [-44.418, -2.138], [-44.582, -2.691], [-43.419, -2.383], [-41.473, -2.912], [-39.979, -2.873],
    [-38.5, -3.701], [-37.223, -4.821], [-36.453, -5.109], [-35.598, -5.149], [-35.235, -5.465], [-34.73, -7.343], [-35.128, -8.996], [-35.637, -9.649],
    [-37.047, -11.041], [-37.684, -12.171], [-38.424, -13.038], [-38.674, -13.058], [-38.953, -13.793], [-38.882, -15.667], [-39.267, -17.868], [-39.583, -18.262],
    [-39.761, -19.599], [-40.775, -20.904], [-40.945, -21.937], [-41.754, -22.371], [-41.988, -22.97], [-43.075, -22.968], [-44.648, -23.352], [-45.352, -23.797],
    [-46.472, -24.089], [-47.649, -24.885], [-48.495, -25.877], [-48.641, -26.624], [-48.475, -27.176], [-48.661, -28.186], [-48.888, -28.674], [-49.587, -29.224],
    [-50.697, -30.984], [-51.576, -31.778], [-52.256, -32.245], [-52.712, -33.197], [-53.374, -33.768], [-53.806, -34.397], [-54.936, -34.953], [-55.674, -34.753],
    [-56.215, -34.86], [-57.14, -34.43], [-57.818, -34.463], [-58.427, -33.909], [-58.495, -34.432], [-57.226, -35.288], [-57.362, -35.977], [-56.737, -36.413],
    [-56.788, -36.901], [-57.749, -38.184], [-59.232, -38.72], [-61.237, -38.928], [-62.336, -38.828], [-62.126, -39.424], [-62.331, -40.173], [-62.146, -40.677],
    [-62.746, -41.029], [-63.771, -41.167], [-64.732, -40.803], [-65.118, -41.064], [-64.979, -42.058], [-64.303, -42.359], [-63.756, -42.044], [-63.458, -42.563],
    [-64.379, -42.873], [-65.182, -43.495], [-65.329, -44.501], [-65.565, -45.037], [-66.51, -45.04], [-67.294, -45.552], [-67.581, -46.302], [-66.597, -47.034],
    [-65.641, -47.236], [-65.985, -48.133], [-67.166, -48.697], [-67.816, -49.87], [-68.729, -50.264], [-69.138, -50.732], [-68.815, -51.771], [-68.15, -52.35],
    [-69.461, -52.292], [-70.845, -52.899], [-71.006, -53.833], [-71.43, -53.856], [-72.558, -53.531], [-73.703, -52.835], [-74.947, -52.263], [-75.26, -51.629],
    [-74.977, -51.043], [-75.48, -50.378], [-75.608, -48.674], [-75.183, -47.712], [-74.127, -46.939], [-75.644, -46.648], [-74.692, -45.764], [-74.352, -44.103],
    [-73.24, -44.455], [-72.718, -42.383], [-73.389, -42.117], [-73.701, -43.366], [-74.332, -43.225], [-73.677, -39.942], [-73.218, -39.259], [-73.505, -38.283],
    [-73.588, -37.156], [-73.167, -37.124], [-71.862, -33.909], [-71.438, -32.419], [-71.669, -30.921], [-71.37, -30.096], [-71.49, -28.861], [-70.905, -27.64],
    [-70.725, -25.706], [-70.091, -21.393], [-70.164, -19.756], [-70.372, -18.348], [-71.375, -17.774], [-71.462, -17.363], [-73.445, -16.359], [-75.238, -15.266],
    [-76.009, -14.649], [-76.423, -13.823], [-76.259, -13.535], [-77.106, -12.223], [-78.092, -10.378], [-79.037, -8.387], [-79.446, -7.931], [-79.76, -7.194],
    [-80.537, -6.542], [-81.25, -6.137], [-80.926, -5.69], [-81.411, -4.737], [-81.1, -4.036], [-80.302, -3.405], [-79.77, -2.657], [-79.987, -2.221],
    [-80.369, -2.685], [-80.968, -2.247], [-80.765, -1.965], [-80.934, -1.057], [-80.583, -0.907], [-80.399, -0.284], [-80.021, 0.36], [-80.091, 0.768],
    [-79.543, 0.983], [-78.855, 1.381], [-78.991, 1.691], [-78.618, 1.766], [-78.662, 2.267], [-78.428, 2.63], [-77.932, 2.697], [-77.128, 3.85],
    [-77.496, 4.088], [-77.308, 4.668], [-77.533, 5.583], [-77.319, 5.845], [-77.477, 6.691], [-77.882, 7.224], [-78.215, 7.512], [-78.429, 8.052],
    [-78.182, 8.319], [-78.435, 8.388], [-78.622, 8.718], [-79.12, 8.996], [-79.558, 8.932], [-79.76, 8.584], [-80.164, 8.333], [-80.383, 8.299],
    [-80.481, 8.09], [-80.004, 7.547], [-80.421, 7.271], [-80.886, 7.221], [-81.06, 7.818], [-81.19, 7.648], [-81.519, 7.707], [-81.721, 8.109],
    [-82.391, 8.292], [-82.82, 8.291], [-82.851, 8.074], [-82.966, 8.225], [-83.508, 8.447], [-83.711, 8.657], [-83.596, 8.831], [-83.633, 9.052],
    [-83.91, 9.291], [-84.648, 9.615], [-84.713, 9.908], [-84.976, 10.087], [-84.911, 9.796], [-85.111, 9.557], [-85.339, 9.834], [-85.661, 9.933],
    [-85.797, 10.135], [-85.792, 10.439], [-85.659, 10.754], [-85.942, 10.895], [-85.713, 11.089], [-86.526, 11.807], [-86.746, 12.144], [-87.669, 12.91],
    [-87.557, 13.065], [-87.392, 12.914], [-87.317, 12.985], [-87.489, 13.297], [-87.793, 13.385], [-87.904, 13.149], [-88.483, 13.164], [-89.257, 13.459],
    [-89.812, 13.521], [-90.096, 13.735], [-90.609, 13.91], [-91.232, 13.928], [-91.69, 14.126], [-92.228, 14.539], [-93.359, 15.615], [-93.875, 15.94],
    [-94.692, 16.201], [-95.25, 16.128], [-96.053, 15.752], [-96.557, 15.654], [-98.013, 16.107], [-98.948, 16.566], [-99.697, 16.706], [-100.83, 17.171],
    [-101.666, 17.649], [-101.919, 17.916], [-102.478, 17.976], [-103.501, 18.292], [-103.917, 18.749], [-104.992, 19.316], [-105.493, 19.947], [-105.731, 20.434],
    [-105.398, 20.532], [-105.501, 20.817], [-105.271, 21.076], [-105.266, 21.422], [-105.603, 21.871], [-105.693, 22.269], [-106.029, 22.774], [-106.91, 23.768],
    [-107.915, 24.549], [-108.402, 25.172], [-109.26, 25.581], [-109.444, 25.825], [-109.292, 26.443], [-109.801, 26.676], [-110.392, 27.162], [-110.641, 27.86],
    [-111.179, 27.941], [-112.228, 28.955], [-112.272, 29.267], [-112.81, 30.021], [-113.164, 30.787], [-113.149, 31.171], [-113.872, 31.568], [-114.206, 31.524],
    [-114.776, 31.8], [-114.937, 31.393], [-114.771, 30.914], [-114.674, 30.163], [-113.424, 28.826], [-113.272, 28.755], [-113.14, 28.411], [-112.962, 28.425],
    [-112.762, 27.78], [-112.458, 27.526], [-112.245, 27.172], [-111.617, 26.663], [-111.285, 25.733], [-110.71, 24.826], [-110.655, 24.299], [-110.173, 24.266],
    [-109.409, 23.365], [-109.433, 23.186], [-109.854, 22.818], [-110.031, 22.823], [-110.295, 23.431], [-110.95, 24.001], [-112.182, 24.739], [-112.149, 25.47],
    [-112.301, 26.012], [-113.465, 26.768], [-113.597, 26.64], [-113.849, 26.9], [-114.466, 27.142], [-115.055, 27.723], [-114.982, 27.798], [-114.57, 27.742],
    [-114.199, 28.115], [-114.162, 28.566], [-114.932, 29.279], [-115.519, 29.556], [-116.721, 31.636], [-117.296, 33.046], [-117.944, 33.621], [-118.411, 33.741],
    [-118.52, 34.028], [-119.081, 34.078], [-119.439, 34.349], [-120.368, 34.447], [-120.623, 34.609], [-120.744, 35.157], [-121.715, 36.162], [-122.547, 37.552],
    [-122.512, 37.784], [-122.953, 38.114], [-123.727, 38.952], [-123.865, 39.767], [-124.398, 40.313], [-124.179, 41.142], [-124.214, 42.0], [-124.533, 42.766],
    [-124.142, 43.708], [-123.899, 45.523], [-124.08, 46.865], [-124.396, 47.72], [-124.687, 48.185], [-124.566, 48.38], [-123.12, 48.04], [-122.587, 47.096],
    [-122.34, 47.36], [-122.5, 48.18], [-122.84, 49.0], [-122.974, 49.003], [-124.91, 49.985], [-125.625, 50.417], [-127.436, 50.831], [-127.993, 51.716],
    [-127.85, 52.33], [-129.13, 52.755], [-129.305, 53.562], [-130.515, 54.288], [-130.536, 54.803], [-131.086, 55.179], [-131.967, 55.498], [-132.25, 56.37],
    [-133.539, 57.179], [-134.078, 58.123], [-136.628, 58.212], [-137.8, 58.5], [-139.868, 59.538], [-142.574, 60.084], [-143.959, 59.999], [-145.925, 60.459],
    [-147.114, 60.885], [-148.224, 60.673], [-148.018, 59.978], [-149.728, 59.706], [-150.608, 59.368], [-151.716, 59.156], [-151.859, 59.745], [-151.41, 60.726],
    [-150.347, 61.034], [-150.621, 61.284], [-151.896, 60.727], [-152.578, 60.062], [-154.019, 59.35], [-153.287, 58.865], [-154.232, 58.146], [-156.308, 57.423],
    [-156.556, 56.98], [-158.117, 56.464], [-158.433, 55.994], [-159.603, 55.567], [-160.29, 55.644], [-163.069, 54.69], [-164.786, 54.404], [-164.942, 54.572],
    [-163.848, 55.039], [-162.87, 55.348], [-161.804, 55.895], [-160.564, 56.008], [-160.07, 56.418], [-158.684, 57.017], [-158.461, 57.217], [-157.723, 57.57],
    [-157.55, 58.328], [-157.042, 58.919], [-158.195, 58.616], [-158.517, 58.788], [-159.059, 58.424], [-159.712, 58.932], [-159.981, 58.573], [-160.355, 59.071],
    [-161.355, 58.671], [-161.969, 58.672], [-162.055, 59.267], [-161.874, 59.634], [-162.518, 59.99], [-163.818, 59.798], [-164.662, 60.268], [-165.346, 60.508],
    [-165.351, 61.074], [-166.121, 61.5], [-165.734, 62.075], [-164.919, 62.633], [-164.562, 63.146], [-163.753, 63.219], [-163.067, 63.06], [-162.26, 63.542],
    [-161.534, 63.456], [-160.773, 63.766], [-160.958, 64.223], [-161.518, 64.403], [-160.778, 64.789], [-161.392, 64.777], [-162.453, 64.56], [-162.758, 64.339],
    [-163.546, 64.559], [-164.961, 64.447], [-166.425, 64.687], [-166.845, 65.089], [-168.11, 65.67], [-166.705, 66.088], [-164.475, 66.577], [-163.653, 66.577],
    [-163.789, 66.077], [-161.678, 66.116], [-162.49, 66.735], [-163.72, 67.117], [-164.431, 67.616], [-165.39, 68.043], [-166.764, 68.359], [-166.205, 68.883],
    [-164.431, 68.916], [-163.169, 69.371], [-162.93, 69.858], [-161.909, 70.333], [-160.935, 70.448], [-159.039, 70.892], [-158.12, 70.825], [-156.581, 71.358],
    [-155.068, 71.148], [-154.344, 70.696], [-153.9, 70.89], [-152.21, 70.83], [-152.27, 70.6], [-150.74, 70.43], [-149.72, 70.53], [-147.613, 70.214],
    [-145.69, 70.12], [-144.92, 69.99], [-143.589, 70.153], [-142.073, 69.852], [-139.12, 69.471], [-137.546, 68.99], [-136.504, 68.898], [-135.626, 69.315],
    [-134.415, 69.628], [-132.929, 69.505], [-131.431, 69.945], [-129.795, 70.194], [-129.108, 69.779], [-128.362, 70.013], [-128.138, 70.484], [-127.447, 70.377],
    [-125.756, 69.481], [-124.425, 70.159], [-124.29, 69.4], [-123.061, 69.564], [-122.683, 69.856], [-121.472, 69.798], [-119.943, 69.378], [-117.603, 69.011],
    [-116.226, 68.841], [-115.247, 68.906], [-113.898, 68.399], [-115.305, 67.903], [-113.497, 67.688], [-110.798, 67.806], [-109.946, 67.981], [-108.88, 67.382],
    [-107.792, 67.888], [-108.813, 68.312], [-108.167, 68.654], [-106.15, 68.8], [-105.343, 68.561], [-104.338, 68.018], [-103.221, 68.098], [-101.454, 67.647],
    [-99.902, 67.806], [-98.443, 67.782], [-98.559, 68.404], [-97.669, 68.579], [-96.12, 68.24], [-96.126, 67.294], [-95.489, 68.091], [-94.685, 68.064],
    [-94.233, 69.069], [-95.304, 69.686], [-96.471, 70.09], [-96.391, 71.195], [-95.209, 71.92], [-93.89, 71.76], [-92.878, 71.319], [-91.52, 70.191],
    [-92.407, 69.7], [-90.547, 69.498]
  ] as [number, number][],

  eurasiaAfrica: [
    [106.97, 76.974], [107.24, 76.48], [108.154, 76.723], [111.077, 76.71], [113.331, 76.222], [114.134, 75.848], [113.885, 75.328], [110.151, 74.477],
    [109.4, 74.18], [112.119, 73.788], [113.019, 73.977], [113.53, 73.335], [113.969, 73.595], [115.568, 73.753], [118.776, 73.588], [119.02, 73.12],
    [123.201, 72.971], [123.258, 73.735], [125.38, 73.56], [126.977, 73.565], [128.591, 73.039], [129.052, 72.399], [128.46, 71.98], [129.716, 71.193],
    [131.289, 70.787], [132.253, 71.836], [133.858, 71.386], [135.562, 71.655], [137.498, 71.348], [138.234, 71.628], [139.87, 71.488], [139.148, 72.416],
    [140.468, 72.849], [149.5, 72.2], [150.351, 71.607], [152.969, 70.842], [157.007, 71.031], [158.998, 70.867], [159.83, 70.453], [159.709, 69.722],
    [160.941, 69.437], [162.279, 69.642], [164.052, 69.668], [165.94, 69.472], [167.836, 69.583], [169.578, 68.694], [170.817, 69.014], [170.008, 69.653],
    [170.453, 70.097], [173.644, 69.818], [175.724, 69.877], [178.6, 69.4], [180.0, 68.964], [180.0, 64.98], [178.707, 64.535], [177.411, 64.608],
    [178.313, 64.076], [178.908, 63.252], [179.37, 62.983], [179.487, 62.569], [179.228, 62.304], [177.364, 62.522], [174.569, 61.769], [173.68, 61.653],
    [170.698, 60.336], [170.331, 59.882], [168.901, 60.573], [166.295, 59.789], [165.84, 60.16], [164.877, 59.732], [163.539, 59.869], [163.217, 59.211],
    [162.017, 58.243], [162.053, 57.839], [163.192, 57.615], [163.058, 56.159], [162.13, 56.122], [161.701, 55.286], [162.117, 54.855], [160.369, 54.344],
    [160.022, 53.203], [158.531, 52.959], [158.231, 51.943], [156.79, 51.011], [156.42, 51.7], [155.434, 55.381], [155.914, 56.768], [156.758, 57.365],
    [156.81, 57.832], [158.364, 58.056], [160.151, 59.315], [161.872, 60.343], [163.67, 61.141], [164.474, 62.551], [163.258, 62.466], [162.658, 61.643],
    [160.122, 60.544], [159.302, 61.774], [156.721, 61.435], [154.218, 59.758], [155.044, 59.145], [151.266, 58.781], [151.338, 59.504], [149.784, 59.656],
    [148.545, 59.164], [145.487, 59.336], [142.198, 59.04], [135.126, 54.73], [136.702, 54.604], [137.193, 53.977], [138.165, 53.755], [138.805, 54.255],
    [139.901, 54.19], [141.345, 53.09], [141.379, 52.239], [140.597, 51.24], [140.513, 50.045], [140.062, 48.447], [138.555, 47.0], [138.22, 46.308],
    [134.87, 43.398], [133.537, 42.812], [132.906, 42.799], [132.278, 43.284], [130.936, 42.553], [130.78, 42.22], [130.4, 42.28], [129.966, 41.941],
    [129.667, 41.601], [129.705, 40.883], [129.188, 40.662], [128.633, 40.19], [127.968, 40.026], [127.534, 39.757], [127.502, 39.324], [127.385, 39.214],
    [127.783, 39.051], [128.35, 38.612], [129.213, 37.432], [129.461, 36.784], [129.468, 35.632], [129.091, 35.083], [128.186, 34.891], [127.386, 34.476],
    [126.486, 34.39], [126.374, 34.935], [126.559, 35.685], [126.117, 36.726], [126.86, 36.894], [126.175, 37.75], [125.689, 37.94], [125.568, 37.752],
    [125.275, 37.669], [125.24, 37.857], [124.712, 38.108], [124.986, 38.549], [125.222, 38.666], [125.133, 38.849], [125.387, 39.388], [125.321, 39.552],
    [124.737, 39.66], [124.266, 39.929], [122.868, 39.638], [122.132, 39.17], [121.055, 38.898], [121.586, 39.361], [121.377, 39.75], [122.169, 40.422],
    [121.641, 40.946], [120.769, 40.594], [119.64, 39.898], [119.023, 39.252], [118.043, 39.204], [117.533, 38.738], [118.06, 38.062], [118.878, 37.897],
    [118.912, 37.448], [119.703, 37.156], [120.823, 37.87], [121.711, 37.481], [122.358, 37.455], [122.52, 36.931], [121.104, 36.651], [120.637, 36.112],
    [119.665, 35.61], [119.151, 34.91], [120.227, 34.36], [120.62, 33.377], [121.229, 32.46], [121.908, 31.692], [121.892, 30.949], [121.264, 30.676],
    [121.503, 30.143], [122.092, 29.833], [121.685, 28.226], [121.126, 28.136], [119.586, 25.741], [118.657, 24.547], [115.891, 22.783], [114.764, 22.668],
    [114.153, 22.224], [113.807, 22.548], [113.241, 22.052], [111.844, 21.55], [110.786, 21.397], [110.444, 20.341], [109.89, 20.282], [109.628, 21.008],
    [109.865, 21.395], [108.523, 21.715], [108.05, 21.552], [106.715, 20.697], [105.882, 19.752], [105.662, 19.058], [107.362, 16.698], [108.269, 16.08],
    [108.877, 15.277], [109.335, 13.426], [109.2, 11.667], [108.366, 11.008], [107.221, 10.365], [106.405, 9.531], [105.158, 8.6], [104.795, 9.241],
    [105.076, 9.919], [104.334, 10.487], [103.497, 10.633], [103.091, 11.154], [102.585, 12.187], [101.687, 12.646], [100.832, 12.627], [100.979, 13.413],
    [100.098, 13.407], [100.019, 12.307], [99.154, 9.963], [99.222, 9.239], [99.874, 9.208], [100.28, 8.295], [100.459, 7.43], [101.017, 6.857],
    [101.623, 6.741], [102.962, 5.524], [103.381, 4.855], [103.439, 4.182], [103.332, 3.727], [103.503, 2.791], [103.855, 2.516], [104.248, 1.631],
    [104.229, 1.293], [103.52, 1.226], [101.391, 2.761], [101.274, 3.27], [100.695, 3.939], [100.557, 4.767], [100.197, 5.312], [100.306, 6.041],
    [100.086, 6.464], [99.691, 6.848], [99.52, 7.344], [98.504, 8.382], [98.34, 7.794], [98.15, 8.35], [98.554, 9.933], [98.457, 10.675],
    [98.765, 11.441], [98.428, 12.033], [98.51, 13.122], [98.104, 13.641], [97.778, 14.837], [97.597, 16.101], [97.165, 16.929], [95.369, 15.714],
    [94.808, 15.804], [94.189, 16.038], [94.534, 17.277], [94.325, 18.214], [93.541, 19.367], [93.663, 19.727], [93.078, 19.855], [92.369, 20.671],
    [92.083, 21.192], [92.025, 21.702], [91.835, 22.183], [91.417, 22.765], [90.496, 22.805], [90.587, 22.393], [90.273, 21.836], [89.847, 22.039],
    [89.702, 21.857], [89.032, 22.056], [88.889, 21.691], [88.208, 21.703], [86.976, 21.495], [87.033, 20.743], [86.499, 20.152], [85.06, 19.479],
    [83.941, 18.302], [83.189, 17.671], [82.193, 17.017], [82.191, 16.557], [80.792, 15.952], [80.325, 15.899], [80.025, 15.136], [80.286, 13.006],
    [79.862, 12.056], [79.858, 10.357], [79.341, 10.309], [78.885, 9.546], [79.19, 9.217], [78.278, 8.933], [77.941, 8.253], [77.54, 7.966],
    [76.593, 8.899], [75.747, 11.308], [74.865, 12.742], [74.444, 14.617], [73.534, 15.991], [72.821, 19.208], [72.825, 20.419], [72.631, 21.356],
    [71.175, 20.758], [70.471, 20.877], [69.164, 22.089], [69.645, 22.451], [69.35, 22.843], [68.177, 23.692], [67.444, 23.945], [67.146, 24.664],
    [66.373, 25.425], [61.497, 25.078], [57.397, 25.74], [56.971, 26.966], [56.492, 27.143], [55.724, 26.965], [54.715, 26.481], [53.493, 26.812],
    [52.484, 27.581], [51.521, 27.866], [50.853, 28.815], [50.115, 30.148], [49.577, 29.986], [48.941, 30.317], [48.568, 29.927], [47.974, 29.976],
    [48.183, 29.534], [48.094, 29.306], [48.808, 27.69], [49.3, 27.461], [49.471, 27.11], [50.153, 26.69], [50.213, 26.277], [50.113, 25.944],
    [50.24, 25.608], [50.528, 25.328], [50.81, 24.755], [50.744, 25.482], [51.013, 26.007], [51.286, 26.115], [51.589, 25.801], [51.607, 25.216],
    [51.39, 24.628], [51.58, 24.245], [51.758, 24.294], [51.794, 24.02], [52.577, 24.177], [54.008, 24.122], [56.362, 26.396], [56.486, 26.309],
    [56.261, 25.715], [56.397, 24.925], [56.845, 24.242], [57.404, 23.879], [58.729, 23.566], [59.45, 22.66], [59.808, 22.534], [59.806, 22.31],
    [59.282, 21.434], [58.861, 21.114], [58.488, 20.429], [58.034, 20.482], [57.826, 20.243], [57.666, 19.736], [57.789, 19.068], [57.695, 18.945],
    [57.234, 18.948], [56.61, 18.574], [56.512, 18.087], [56.284, 17.876], [55.661, 17.884], [55.27, 17.632], [55.275, 17.228], [54.791, 16.951],
    [54.239, 17.045], [53.57, 16.708], [53.109, 16.651], [52.385, 16.383], [52.192, 15.938], [52.168, 15.597], [51.172, 15.175], [49.575, 14.709],
    [48.679, 14.003], [47.939, 14.007], [47.354, 13.592], [46.717, 13.4], [45.625, 13.291], [45.406, 13.027], [45.144, 12.954], [44.99, 12.7],
    [44.495, 12.722], [44.175, 12.586], [43.483, 12.637], [43.223, 13.221], [43.252, 13.768], [42.892, 14.802], [42.605, 15.213], [42.805, 15.262],
    [42.703, 15.719], [42.824, 15.912], [42.779, 16.348], [42.65, 16.775], [42.348, 17.076], [42.271, 17.475], [41.755, 17.833], [41.221, 18.672],
    [40.939, 19.487], [40.248, 20.175], [39.802, 20.339], [39.14, 21.292], [39.024, 21.987], [39.066, 22.58], [38.493, 23.688], [38.024, 24.079],
    [37.484, 24.286], [37.155, 24.859], [37.209, 25.084], [36.932, 25.603], [36.64, 25.826], [36.249, 26.57], [35.13, 28.063], [34.632, 28.058],
    [34.956, 29.357], [34.923, 29.501], [34.642, 29.099], [34.427, 28.344], [34.154, 27.823], [33.922, 27.649], [33.137, 28.418], [32.423, 29.851],
    [32.32, 29.76], [32.735, 28.705], [33.349, 27.7], [34.105, 26.142], [34.795, 25.034], [35.693, 23.927], [35.494, 23.753], [35.526, 23.102],
    [36.866, 22.0], [37.189, 21.019], [36.969, 20.838], [37.115, 19.808], [37.482, 18.614], [38.41, 17.998], [38.991, 16.841], [39.266, 15.923],
    [39.814, 15.436], [41.179, 14.491], [42.59, 13.0], [43.081, 12.7], [43.318, 12.39], [43.286, 11.975], [42.716, 11.736], [43.471, 11.278],
    [43.667, 10.864], [44.118, 10.446], [44.614, 10.442], [45.557, 10.698], [46.646, 10.817], [47.526, 11.127], [48.022, 11.193], [48.379, 11.375],
    [49.268, 11.43], [50.259, 11.68], [50.732, 12.022], [51.111, 12.025], [51.045, 10.641], [50.834, 10.28], [50.552, 9.199], [49.453, 6.805],
    [48.594, 5.339], [47.741, 4.219], [46.565, 2.855], [43.136, 0.292], [42.042, -0.919], [41.811, -1.446], [41.585, -1.683], [40.885, -2.083],
    [40.638, -2.5], [40.263, -2.573], [40.121, -3.278], [39.8, -3.681], [39.605, -4.346], [39.202, -4.677], [38.74, -5.909], [38.8, -6.476],
    [39.44, -6.84], [39.47, -7.1], [39.195, -7.704], [39.252, -8.008], [39.187, -8.485], [39.95, -10.098], [40.317, -10.317], [40.479, -10.765],
    [40.437, -11.762], [40.561, -12.639], [40.6, -14.202], [40.776, -14.692], [40.089, -16.101], [39.453, -16.721], [37.411, -17.586], [36.281, -18.66],
    [35.896, -18.842], [35.198, -19.553], [34.786, -19.784], [34.702, -20.497], [35.176, -21.254], [35.386, -22.14], [35.563, -22.09], [35.534, -23.071],
    [35.372, -23.535], [35.607, -23.706], [35.459, -24.123], [35.041, -24.478], [33.013, -25.357], [32.575, -25.727], [32.66, -26.148], [32.916, -26.216],
    [32.58, -27.47], [32.462, -28.301], [32.203, -28.752], [31.326, -29.402], [30.056, -31.14], [28.22, -32.772], [27.465, -33.227], [26.419, -33.615],
    [25.91, -33.667], [25.781, -33.945], [25.173, -33.797], [24.678, -33.987], [23.594, -33.794], [22.988, -33.916], [22.574, -33.864], [21.543, -34.259],
    [20.689, -34.417], [20.071, -34.795], [19.617, -34.819], [19.193, -34.463], [18.855, -34.444], [18.425, -33.998], [18.378, -34.136], [18.245, -33.868],
    [18.25, -33.281], [17.925, -32.611], [18.248, -32.429], [18.222, -31.662], [17.567, -30.726], [16.345, -28.577], [15.602, -27.821], [15.211, -27.091],
    [14.408, -23.853], [14.386, -22.657], [14.258, -22.111], [13.869, -21.699], [13.352, -20.873], [12.609, -19.045], [11.795, -18.069], [11.64, -16.673],
    [11.779, -15.794], [12.5, -13.548], [13.634, -12.039], [13.739, -11.298], [13.687, -10.731], [13.387, -10.374], [12.875, -9.167], [12.929, -8.959],
    [13.237, -8.563], [12.728, -6.927], [12.227, -6.294], [12.323, -6.1], [11.915, -5.038], [11.094, -3.979], [10.066, -2.969], [9.405, -2.144],
    [8.798, -1.111], [8.83, -0.779], [9.049, -0.459], [9.493, 1.01], [9.306, 1.161], [9.795, 3.073], [9.404, 3.734], [8.948, 3.904],
    [8.745, 4.352], [8.489, 4.496], [8.5, 4.772], [7.462, 4.412], [7.083, 4.465], [6.698, 4.241], [5.898, 4.263], [5.363, 4.888],
    [5.034, 5.612], [4.326, 6.271], [2.692, 6.259], [1.865, 6.142], [-0.508, 5.344], [-1.064, 5.0], [-1.965, 4.711], [-2.856, 4.995],
    [-3.311, 4.984], [-4.009, 5.18], [-4.65, 5.168], [-5.834, 4.994], [-7.519, 4.338], [-7.974, 4.356], [-9.005, 4.833], [-9.913, 5.594],
    [-10.765, 6.141], [-11.439, 6.786], [-12.428, 7.263], [-12.949, 7.799], [-13.124, 8.164], [-13.247, 8.903], [-14.074, 9.886], [-14.58, 10.214],
    [-14.839, 10.877], [-15.664, 11.458], [-16.085, 11.525], [-16.315, 11.807], [-16.309, 11.959], [-16.614, 12.171], [-16.841, 13.151], [-16.714, 13.595],
    [-17.126, 14.373], [-17.625, 14.73], [-17.185, 14.919], [-16.463, 16.135], [-16.55, 16.674], [-16.271, 17.167], [-16.146, 18.109], [-16.378, 19.594],
    [-16.278, 20.093], [-16.536, 20.568], [-17.063, 21.0], [-16.973, 21.886], [-16.589, 22.158], [-16.262, 22.679], [-16.326, 23.018], [-15.983, 23.724],
    [-15.426, 24.359], [-15.089, 24.52], [-14.825, 25.104], [-14.801, 25.636], [-14.44, 26.255], [-13.774, 26.619], [-13.14, 27.64], [-12.619, 28.038],
    [-11.689, 28.149], [-10.901, 28.832], [-10.4, 29.099], [-9.565, 29.934], [-9.815, 31.178], [-9.301, 32.565], [-8.657, 33.24], [-6.912, 34.11],
    [-5.93, 35.76], [-5.194, 35.755], [-4.591, 35.331], [-3.64, 35.4], [-2.17, 35.169], [-1.209, 35.715], [-0.127, 35.889], [0.504, 36.301],
    [1.467, 36.606], [4.816, 36.865], [5.32, 36.716], [6.262, 37.111], [7.331, 37.119], [7.737, 36.886], [8.421, 36.946], [9.51, 37.35],
    [10.21, 37.23], [10.181, 36.724], [11.029, 37.092], [11.1, 36.9], [10.6, 36.41], [10.593, 35.948], [10.94, 35.699], [10.808, 34.833],
    [10.15, 34.331], [10.34, 33.786], [10.857, 33.769], [11.109, 33.293], [11.489, 33.137], [12.663, 32.793], [13.083, 32.879], [13.919, 32.712],
    [15.246, 32.265], [15.714, 31.376], [18.021, 30.763], [19.086, 30.266], [19.574, 30.526], [20.053, 30.986], [19.82, 31.752], [20.134, 32.238],
    [20.854, 32.707], [21.543, 32.843], [22.896, 32.638], [23.237, 32.192], [24.921, 31.899], [25.165, 31.569], [26.495, 31.586], [28.914, 30.87],
    [29.683, 31.187], [30.095, 31.474], [30.977, 31.556], [31.688, 31.43], [31.961, 30.934], [32.193, 31.26], [32.994, 31.024], [33.773, 30.968],
    [34.266, 31.219], [34.557, 31.549], [34.488, 31.606], [34.753, 32.073], [34.956, 32.828], [35.482, 33.906], [35.998, 34.645], [35.905, 35.41],
    [36.15, 35.821], [35.782, 36.275], [36.161, 36.651], [35.551, 36.565], [34.714, 36.795], [34.027, 36.22], [32.509, 36.107], [31.7, 36.644],
    [30.622, 36.678], [30.391, 36.263], [29.7, 36.144], [28.733, 36.677], [27.641, 36.659], [27.049, 37.654], [26.318, 38.208], [26.805, 38.986],
    [26.171, 39.464], [27.28, 40.42], [28.82, 40.46], [29.24, 41.22], [31.146, 41.088], [32.348, 41.736], [33.513, 42.019], [35.168, 42.04],
    [36.913, 41.336], [38.348, 40.949], [39.513, 41.103], [40.373, 41.014], [41.554, 41.536], [41.703, 41.963], [41.453, 42.645], [40.875, 43.014],
    [40.321, 43.129], [38.68, 44.28], [37.539, 44.657], [36.675, 45.245], [37.403, 45.404], [38.233, 46.241], [37.674, 46.637], [39.148, 47.045],
    [39.121, 47.263], [37.425, 47.022], [36.76, 46.699], [35.824, 46.646], [34.962, 46.273], [35.021, 45.651], [35.51, 45.41], [36.53, 45.47],
    [36.335, 45.113], [35.24, 44.94], [33.883, 44.362], [33.326, 44.565], [33.547, 45.035], [32.454, 45.328], [32.631, 45.519], [33.588, 45.852],
    [33.299, 46.081], [31.744, 46.333], [31.675, 46.706], [30.749, 46.583], [30.378, 46.032], [29.603, 45.293], [29.627, 45.036], [29.142, 44.82],
    [28.838, 44.914], [28.558, 43.708], [28.039, 43.293], [27.674, 42.578], [28.115, 41.623], [28.989, 41.3], [28.807, 41.055], [27.619, 41.0],
    [26.358, 40.152], [26.043, 40.618], [26.057, 40.824], [24.926, 40.947], [23.715, 40.687], [24.408, 40.125], [23.9, 39.962], [23.343, 39.961],
    [22.814, 40.476], [22.626, 40.257], [22.85, 39.659], [23.35, 39.19], [22.973, 38.971], [24.025, 38.22], [24.04, 37.655], [23.115, 37.92],
    [23.41, 37.41], [22.775, 37.305], [23.154, 36.422], [22.49, 36.41], [21.67, 36.845], [21.295, 37.645], [21.12, 38.31], [20.218, 39.34],
    [20.15, 39.625], [19.98, 39.695], [19.96, 39.915], [19.406, 40.251], [19.319, 40.727], [19.404, 41.409], [19.54, 41.72], [19.162, 41.955],
    [18.882, 42.281], [17.51, 42.85], [16.93, 43.21], [16.016, 43.507], [15.174, 44.243], [15.376, 44.318], [14.92, 44.739], [14.902, 45.076],
    [14.259, 45.234], [13.952, 44.802], [13.657, 45.137], [13.68, 45.484], [13.938, 45.591], [13.142, 45.737], [12.329, 45.382], [12.384, 44.885],
    [12.261, 44.601], [12.589, 44.091], [13.527, 43.588], [14.03, 42.761], [15.143, 41.955], [15.926, 41.961], [16.17, 41.74], [15.889, 41.541],
    [17.519, 40.877], [18.377, 40.356], [18.48, 40.169], [18.294, 39.811], [17.739, 40.278], [16.87, 40.442], [16.449, 39.795], [17.172, 39.425],
    [17.053, 38.903], [16.635, 38.844], [16.101, 37.986], [15.684, 37.909], [15.688, 38.215], [15.892, 38.751], [16.109, 38.964], [15.414, 40.048],
    [14.998, 40.173], [14.703, 40.605], [14.061, 40.786], [13.628, 41.188], [12.888, 41.253], [12.107, 41.705], [10.512, 42.932], [10.2, 43.92],
    [8.889, 44.366], [8.429, 44.231], [7.851, 43.767], [7.435, 43.694], [6.529, 43.129], [4.557, 43.4], [3.101, 43.075], [2.986, 42.473],
    [3.039, 41.892], [2.092, 41.226], [0.81, 41.015], [0.721, 40.678], [0.107, 40.124], [-0.279, 39.31], [0.111, 38.739], [-0.467, 38.292],
    [-0.683, 37.642], [-1.438, 37.443], [-2.146, 36.674], [-4.369, 36.678], [-4.995, 36.325], [-5.377, 35.947], [-5.866, 36.03], [-6.237, 36.368],
    [-6.52, 36.943], [-7.454, 37.098], [-7.856, 36.838], [-8.383, 36.979], [-8.899, 36.869], [-8.746, 37.651], [-8.84, 38.266], [-9.287, 38.359],
    [-9.526, 38.737], [-9.447, 39.392], [-9.048, 39.755], [-8.769, 40.761], [-8.791, 41.184], [-8.991, 41.544], [-9.035, 41.881], [-8.984, 42.593],
    [-9.393, 43.027], [-7.978, 43.748], [-6.755, 43.568], [-5.412, 43.574], [-4.348, 43.404], [-1.901, 43.423], [-1.384, 44.023], [-1.194, 46.015],
    [-2.226, 47.065], [-2.963, 47.57], [-4.492, 47.955], [-4.592, 48.684], [-3.296, 48.902], [-1.617, 48.644], [-1.933, 49.776], [-0.989, 49.347],
    [1.339, 50.127], [1.639, 50.947], [3.315, 51.346], [3.83, 51.62], [4.706, 53.092], [6.074, 53.51], [6.905, 53.482], [7.101, 53.694],
    [7.936, 53.748], [8.122, 53.528], [8.801, 54.021], [8.572, 54.396], [8.526, 54.963], [8.12, 55.518], [8.09, 56.54], [8.544, 57.11],
    [9.424, 57.172], [9.776, 57.448], [10.58, 57.73], [10.546, 57.216], [10.25, 56.89], [10.37, 56.61], [10.912, 56.459], [10.668, 56.081],
    [10.37, 56.19], [9.65, 55.47], [9.922, 54.983], [9.94, 54.597], [10.95, 54.364], [10.94, 54.009], [11.956, 54.196], [12.518, 54.471],
    [13.648, 54.076], [14.12, 53.757], [14.803, 54.051], [17.623, 54.852], [18.621, 54.683], [18.696, 54.439], [19.661, 54.426], [19.888, 54.866],
    [21.268, 55.19], [21.056, 56.031], [21.091, 56.784], [21.582, 57.412], [22.524, 57.753], [23.318, 57.006], [24.121, 57.026], [24.429, 58.383],
    [24.061, 58.258], [23.427, 58.613], [23.34, 59.187], [24.604, 59.466], [25.864, 59.611], [26.949, 59.446], [27.981, 59.476], [29.118, 60.028],
    [28.07, 60.503], [26.255, 60.424], [24.497, 60.057], [22.87, 59.846], [22.291, 60.392], [21.322, 60.72], [21.545, 61.705], [21.059, 62.607],
    [21.536, 63.19], [22.443, 63.818], [24.731, 64.902], [25.398, 65.112], [25.294, 65.534], [23.904, 66.007], [22.183, 65.724], [21.214, 65.026],
    [21.37, 64.414], [17.848, 62.75], [17.12, 61.341], [17.831, 60.637], [18.788, 60.082], [17.869, 58.954], [16.829, 58.72], [16.448, 57.041],
    [15.88, 56.104], [14.667, 56.201], [14.101, 55.408], [12.943, 55.362], [12.625, 56.307], [11.788, 57.442], [11.027, 58.856], [10.357, 59.47],
    [8.382, 58.313], [7.049, 58.079], [5.666, 58.588], [5.308, 59.663], [4.992, 61.971], [5.913, 62.615], [8.554, 63.454], [10.528, 64.486],
    [14.761, 67.811], [19.184, 69.818], [21.378, 70.255], [23.024, 70.202], [24.547, 71.031], [26.37, 70.986], [28.166, 71.185], [31.294, 70.454],
    [30.005, 70.186], [31.101, 69.558], [32.133, 69.906], [33.776, 69.302], [36.514, 69.063], [40.292, 67.932], [41.06, 67.457], [41.126, 66.792],
    [40.016, 66.266], [38.383, 66.0], [33.919, 66.76], [33.185, 66.633], [34.815, 65.9], [34.944, 64.414], [37.013, 63.85], [37.142, 64.335],
    [36.518, 64.78], [37.176, 65.143], [39.594, 64.521], [40.436, 64.765], [39.763, 65.497], [42.093, 66.476], [43.016, 66.419], [43.95, 66.069],
    [44.532, 66.756], [43.698, 67.352], [44.188, 67.951], [43.453, 68.571], [46.25, 68.25], [46.821, 67.69], [45.555, 67.567], [45.562, 67.01],
    [46.349, 66.668], [47.894, 66.885], [48.139, 67.523], [53.718, 68.857], [54.472, 68.808], [53.486, 68.201], [54.726, 68.097], [55.443, 68.439],
    [57.317, 68.466], [58.802, 68.881], [59.942, 68.279], [61.078, 68.941], [60.03, 69.52], [60.55, 69.85], [63.504, 69.547], [64.888, 69.235],
    [68.512, 68.092], [69.181, 68.616], [68.164, 69.144], [68.135, 69.357], [66.93, 69.455], [67.26, 69.929], [66.725, 70.709], [66.695, 71.029],
    [68.54, 71.935], [69.196, 72.844], [69.94, 73.04], [72.588, 72.776], [72.796, 72.22], [71.848, 71.409], [72.47, 71.09], [72.792, 70.391],
    [72.565, 69.021], [73.668, 68.408], [73.239, 67.74], [71.28, 66.32], [72.423, 66.173], [72.821, 66.533], [73.921, 66.789], [74.187, 67.284],
    [75.052, 67.76], [74.469, 68.329], [74.936, 68.989], [73.842, 69.071], [73.602, 69.628], [74.4, 70.632], [73.101, 71.447], [74.891, 72.121],
    [74.659, 72.832], [75.158, 72.855], [75.683, 72.3], [75.289, 71.336], [76.359, 71.153], [75.903, 71.874], [77.577, 72.267], [79.652, 72.32],
    [81.5, 71.75], [80.611, 72.583], [80.511, 73.648], [82.25, 73.85], [84.655, 73.806], [86.822, 73.937], [86.01, 74.46], [87.167, 75.117],
    [88.316, 75.144], [90.26, 75.64], [92.901, 75.773], [93.234, 76.047], [95.86, 76.14], [96.678, 75.916], [98.922, 76.447], [100.76, 76.43],
    [101.035, 76.862], [101.991, 77.287], [104.352, 77.698], [106.067, 77.374], [104.705, 77.128], [106.97, 76.974]
  ] as [number, number][],

  australia: [
    [143.562, -13.764], [143.922, -14.548], [144.564, -14.171], [144.895, -14.594], [145.375, -14.985], [145.272, -15.428], [145.485, -16.286], [145.637, -16.785],
    [145.889, -16.907], [146.16, -17.762], [146.064, -18.28], [146.387, -18.958], [147.471, -19.481], [148.848, -20.391], [148.717, -20.633], [149.289, -21.261],
    [149.678, -22.343], [150.077, -22.123], [150.483, -22.556], [150.727, -22.402], [150.9, -23.462], [152.074, -24.458], [152.855, -25.268], [153.136, -26.071],
    [153.162, -26.641], [153.093, -27.26], [153.569, -28.11], [153.512, -28.995], [153.069, -30.35], [153.09, -30.924], [152.892, -31.64], [152.45, -32.55],
    [151.709, -33.041], [151.344, -33.816], [151.011, -34.31], [150.714, -35.173], [150.328, -35.672], [150.075, -36.42], [149.946, -37.109], [149.997, -37.425],
    [149.424, -37.773], [148.305, -37.809], [147.382, -38.219], [146.318, -39.036], [145.49, -38.594], [144.877, -38.417], [145.032, -37.896], [144.486, -38.085],
    [143.61, -38.809], [142.178, -38.38], [141.607, -38.309], [140.639, -38.019], [139.992, -37.403], [139.807, -36.644], [139.574, -36.138], [139.083, -35.733],
    [138.121, -35.612], [138.449, -35.127], [138.208, -34.385], [137.719, -35.077], [136.829, -35.261], [137.352, -34.707], [137.504, -34.13], [137.89, -33.64],
    [137.81, -32.9], [136.997, -33.753], [136.372, -34.095], [135.989, -34.89], [135.208, -34.479], [135.239, -33.948], [134.613, -33.223], [134.086, -32.848],
    [134.274, -32.617], [132.991, -32.011], [132.288, -31.983], [131.326, -31.496], [129.536, -31.59], [127.103, -32.282], [126.149, -32.216], [125.089, -32.729],
    [124.222, -32.959], [124.029, -33.484], [123.66, -33.89], [122.811, -33.914], [122.183, -34.003], [121.299, -33.821], [119.894, -33.976], [119.299, -34.509],
    [119.007, -34.464], [118.025, -35.065], [116.625, -35.025], [115.564, -34.386], [115.027, -34.197], [115.049, -33.623], [115.545, -33.487], [115.715, -33.26],
    [115.679, -32.9], [115.802, -32.205], [115.69, -31.612], [115.161, -30.602], [114.997, -30.031], [115.04, -29.461], [114.642, -28.81], [114.616, -28.516],
    [114.174, -28.118], [114.049, -27.335], [113.477, -26.543], [113.339, -26.117], [113.778, -26.549], [113.441, -25.621], [113.937, -25.911], [114.233, -26.298],
    [114.216, -25.786], [113.721, -24.999], [113.625, -24.684], [113.394, -24.385], [113.502, -23.806], [113.707, -23.56], [113.843, -23.06], [113.737, -22.475],
    [114.15, -21.756], [114.225, -22.517], [114.648, -21.83], [115.46, -21.495], [115.947, -21.069], [116.712, -20.702], [117.166, -20.624], [117.442, -20.747],
    [118.23, -20.374], [118.836, -20.263], [118.988, -20.044], [119.252, -19.953], [119.805, -19.977], [120.856, -19.684], [121.4, -19.24], [121.655, -18.705],
    [122.242, -18.198], [122.313, -17.255], [123.013, -16.405], [123.434, -17.269], [123.859, -17.069], [123.503, -16.597], [123.817, -16.111], [124.258, -16.328],
    [124.38, -15.567], [124.926, -15.075], [125.167, -14.68], [125.67, -14.51], [125.686, -14.231], [126.125, -14.347], [126.143, -14.096], [127.066, -13.818],
    [127.805, -14.277], [128.36, -14.869], [128.986, -14.876], [129.621, -14.97], [129.41, -14.421], [129.889, -13.619], [130.339, -13.357], [130.184, -13.108],
    [130.618, -12.536], [131.223, -12.184], [131.735, -12.302], [132.575, -12.114], [132.557, -11.603], [131.825, -11.274], [132.357, -11.129], [133.02, -11.376],
    [133.551, -11.787], [134.393, -12.042], [134.679, -11.941], [135.298, -12.249], [135.883, -11.962], [136.258, -12.049], [136.492, -11.857], [136.952, -12.352],
    [136.685, -12.887], [136.305, -13.291], [135.962, -13.325], [136.078, -13.724], [135.429, -14.715], [135.5, -14.998], [136.295, -15.55], [137.065, -15.871],
    [137.58, -16.215], [138.303, -16.808], [138.585, -16.807], [139.109, -17.063], [139.261, -17.372], [140.215, -17.711], [140.875, -17.369], [141.274, -16.389],
    [141.398, -15.841], [141.702, -15.045], [141.563, -14.561], [141.636, -14.27], [141.52, -13.698], [141.651, -12.945], [141.843, -12.742], [141.687, -12.408],
    [142.118, -11.328], [142.144, -11.043], [142.515, -10.668], [142.797, -11.157], [142.867, -11.785], [143.116, -11.906], [143.159, -12.326], [143.522, -12.834],
    [143.597, -13.4], [143.562, -13.764]
  ] as [number, number][],

  greenland: [
    [-27.1, 83.52], [-20.845, 82.727], [-22.692, 82.342], [-31.9, 82.2], [-31.396, 82.022], [-27.857, 82.132], [-24.844, 81.787], [-22.903, 82.093],
    [-22.072, 81.734], [-23.17, 81.153], [-20.624, 81.525], [-15.768, 81.912], [-12.77, 81.719], [-12.209, 81.292], [-16.285, 80.58], [-16.85, 80.35],
    [-20.046, 80.177], [-17.73, 80.129], [-18.9, 79.4], [-19.705, 78.751], [-19.674, 77.639], [-18.473, 76.986], [-20.035, 76.944], [-21.679, 76.628],
    [-19.834, 76.098], [-19.599, 75.248], [-20.668, 75.156], [-19.373, 74.296], [-21.594, 74.224], [-20.435, 73.817], [-20.762, 73.464], [-22.172, 73.31],
    [-23.566, 73.307], [-22.313, 72.629], [-22.3, 72.184], [-24.278, 72.598], [-24.793, 72.33], [-23.443, 72.08], [-22.133, 71.469], [-21.754, 70.664],
    [-23.536, 70.471], [-25.543, 71.431], [-25.201, 70.752], [-26.363, 70.226], [-22.349, 70.129], [-27.747, 68.47], [-30.674, 68.125], [-31.777, 68.121],
    [-32.811, 67.735], [-34.202, 66.68], [-36.353, 65.979], [-37.044, 65.938], [-39.812, 65.458], [-40.669, 64.84], [-40.683, 64.139], [-41.189, 63.482],
    [-42.819, 62.682], [-42.417, 61.901], [-43.378, 60.098], [-44.788, 60.037], [-46.264, 60.853], [-48.263, 60.858], [-49.233, 61.407], [-49.9, 62.383],
    [-51.633, 63.627], [-52.14, 64.278], [-52.277, 65.177], [-53.662, 66.1], [-53.302, 66.837], [-53.969, 67.189], [-52.98, 68.358], [-51.475, 68.73],
    [-51.08, 69.148], [-50.871, 69.929], [-52.558, 69.426], [-53.456, 69.284], [-54.683, 69.61], [-54.75, 70.289], [-54.359, 70.821], [-53.431, 70.836],
    [-51.39, 70.57], [-54.004, 71.547], [-55.0, 71.407], [-55.835, 71.654], [-54.718, 72.586], [-55.326, 72.959], [-57.324, 74.71], [-58.597, 75.099],
    [-58.585, 75.517], [-61.269, 76.102], [-63.392, 76.175], [-68.504, 76.061], [-69.665, 76.38], [-71.403, 77.009], [-68.777, 77.323], [-66.764, 77.376],
    [-71.043, 77.636], [-73.297, 78.044], [-73.159, 78.433], [-65.711, 79.394], [-65.324, 79.758], [-68.023, 80.117], [-67.151, 80.516], [-63.689, 81.214],
    [-62.234, 81.321], [-62.651, 81.77], [-60.282, 82.034], [-57.207, 82.191], [-54.134, 82.2], [-53.043, 81.888], [-50.391, 82.439], [-48.004, 82.065],
    [-46.6, 81.986], [-44.523, 81.661], [-46.901, 82.2], [-46.764, 82.628], [-43.406, 83.225], [-39.898, 83.18], [-38.622, 83.549], [-35.088, 83.645],
    [-27.1, 83.52]
  ] as [number, number][],

  madagascar: [
    [50.057, -13.556], [50.217, -14.759], [50.477, -15.227], [50.377, -15.706], [50.2, -16.0], [49.861, -15.414], [49.673, -15.71], [49.863, -16.451],
    [49.775, -16.875], [49.499, -17.106], [49.436, -17.953], [48.549, -20.497], [47.931, -22.392], [47.548, -23.782], [47.096, -24.942], [46.282, -25.178],
    [45.41, -25.601], [44.04, -24.988], [43.764, -24.461], [43.698, -23.574], [43.346, -22.777], [43.254, -22.057], [43.433, -21.336], [43.894, -21.163],
    [43.896, -20.83], [44.374, -20.072], [44.464, -19.435], [44.232, -18.962], [44.043, -18.331], [43.963, -17.41], [44.312, -16.85], [44.447, -16.216],
    [44.945, -16.179], [45.503, -15.974], [45.873, -15.793], [46.312, -15.78], [46.882, -15.21], [47.705, -14.594], [48.005, -14.091], [47.869, -13.664],
    [48.294, -13.784], [48.845, -13.089], [48.864, -12.488], [49.195, -12.041], [49.544, -12.47], [49.809, -12.895], [50.057, -13.556]
  ] as [number, number][],

  greatBritain: [
    [-3.005, 58.635], [-4.074, 57.553], [-3.055, 57.69], [-1.959, 57.685], [-2.22, 56.87], [-3.119, 55.974], [-2.085, 55.91], [-1.115, 54.625],
    [-0.43, 54.464], [0.185, 53.325], [0.47, 52.93], [1.682, 52.74], [1.56, 52.1], [1.051, 51.807], [1.45, 51.289], [0.55, 50.766],
    [-0.788, 50.775], [-2.49, 50.5], [-2.956, 50.697], [-3.617, 50.228], [-4.543, 50.342], [-5.245, 49.96], [-5.777, 50.16], [-4.31, 51.21],
    [-3.415, 51.426], [-4.984, 51.593], [-5.267, 51.991], [-4.222, 52.301], [-4.77, 52.84], [-4.58, 53.495], [-3.092, 53.404], [-2.945, 53.985],
    [-3.63, 54.615], [-4.844, 54.791], [-5.083, 55.062], [-4.719, 55.508], [-5.048, 55.784], [-5.586, 55.311], [-5.645, 56.275], [-6.15, 56.785],
    [-5.787, 57.819], [-5.01, 58.63], [-4.211, 58.551], [-3.005, 58.635]
  ] as [number, number][],

  japan: [
    [140.976, 37.142], [140.6, 36.344], [140.774, 35.843], [140.253, 35.138], [138.976, 34.668], [137.218, 34.606], [135.793, 33.465], [135.121, 33.849],
    [135.079, 34.597], [133.34, 34.376], [132.157, 33.905], [130.986, 33.886], [132.0, 33.15], [131.333, 31.45], [130.686, 31.03], [130.202, 31.418],
    [130.448, 32.319], [129.815, 32.61], [129.408, 33.296], [130.354, 33.604], [130.878, 34.233], [131.884, 34.75], [132.618, 35.433], [134.608, 35.732],
    [135.678, 35.527], [136.724, 37.305], [137.391, 36.827], [139.426, 38.216], [140.055, 39.439], [139.883, 40.563], [140.306, 41.195], [141.369, 41.379],
    [141.914, 39.992], [141.885, 39.181], [140.959, 38.174], [140.976, 37.142]
  ] as [number, number][],

  newZealand: [
    [173.02, -40.919], [173.247, -41.332], [173.958, -40.927], [174.248, -41.349], [174.249, -41.77], [173.223, -42.97], [172.711, -43.372], [173.08, -43.853],
    [172.309, -43.866], [171.453, -44.243], [171.185, -44.897], [170.617, -45.909], [169.332, -46.641], [168.411, -46.62], [167.764, -46.29], [166.677, -46.22],
    [166.509, -45.853], [167.046, -45.111], [168.304, -44.124], [168.949, -43.936], [169.668, -43.555], [170.525, -43.032], [171.125, -42.513], [171.57, -41.767],
    [171.949, -41.514], [172.097, -40.956], [172.799, -40.494], [173.02, -40.919], [174.612, -36.156], [175.337, -37.209], [175.358, -36.526], [175.809, -36.799],
    [175.958, -37.555], [176.763, -37.881], [177.439, -37.961], [178.01, -37.58], [178.517, -37.695], [178.275, -38.583], [177.97, -39.166], [177.207, -39.146],
    [176.94, -39.45], [177.033, -39.88], [176.012, -41.29], [175.24, -41.688], [175.068, -41.426], [174.651, -41.282], [175.228, -40.459], [174.9, -39.909],
    [173.824, -39.509], [173.852, -39.147], [174.575, -38.798], [174.743, -38.028], [174.697, -37.381], [174.292, -36.711], [174.319, -36.535], [173.841, -36.122],
    [173.054, -35.237], [172.636, -34.529], [173.007, -34.451], [173.551, -35.006], [174.329, -35.265], [174.612, -36.156]
  ] as [number, number][],

}
// Pre-calculate bounding boxes for each polygon to enable high-performance isLand queries
const POLYGON_BBOXES = (() => {
  const bboxes: Record<string, { minLng: number; maxLng: number; minLat: number; maxLat: number }> = {}
  for (const [key, vs] of Object.entries(POLYGONS)) {
    let minLng = Infinity, maxLng = -Infinity
    let minLat = Infinity, maxLat = -Infinity
    for (const [lng, lat] of vs) {
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
    bboxes[key] = { minLng, maxLng, minLat, maxLat }
  }
  return bboxes
})()

function inside(lng: number, lat: number, vs: [number, number][]) {
  let insidePolygon = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1]
    const xj = vs[j][0], yj = vs[j][1]
    
    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
    if (intersect) insidePolygon = !insidePolygon
  }
  return insidePolygon
}

function insideBBox(lng: number, lat: number, bbox: { minLng: number; maxLng: number; minLat: number; maxLat: number }) {
  return lng >= bbox.minLng && lng <= bbox.maxLng && lat >= bbox.minLat && lat <= bbox.maxLat
}

function isLand(lat: number, lng: number): boolean {
  if (lat < -60) return true // Antarctica
  
  for (const key of Object.keys(POLYGONS)) {
    const bbox = POLYGON_BBOXES[key]
    if (insideBBox(lng, lat, bbox)) {
      if (inside(lng, lat, POLYGONS[key as keyof typeof POLYGONS])) {
        return true
      }
    }
  }
  return false
}

// 3D Cartesian coordinates helper
const getCartesian = (lat: number, lng: number) => {
  const radLat = (lat * Math.PI) / 180
  const radLng = (lng * Math.PI) / 180
  return {
    x: Math.cos(radLat) * Math.sin(radLng),
    y: Math.sin(radLat),
    z: Math.cos(radLat) * Math.cos(radLng),
  }
}

// Arc Routes definition
interface ArcRoute {
  fromId: number
  toId: number
  color: string
  heightFactor?: number // Custom height factor to avoid overlapping curves
  mode: 'MARITIMO' | 'AEREO'
}

const GLOBE_ROUTES: ArcRoute[] = [
  // 70% China (Shanghai) -> Guarulhos (São Paulo)
  { fromId: 1, toId: 2, color: 'rgba(52, 211, 153, 0.8)', heightFactor: 0.14, mode: 'MARITIMO' }, // Maritime route (emerald green, slow)
  { fromId: 1, toId: 2, color: 'rgba(167, 139, 250, 0.8)', heightFactor: 0.22, mode: 'AEREO' }, // Air route (purple, fast)

  // 20% USA (Miami) -> Itajaí
  { fromId: 4, toId: 3, color: 'rgba(167, 139, 250, 0.8)', heightFactor: 0.20, mode: 'AEREO' }, // Air route (purple, fast)
  { fromId: 4, toId: 3, color: 'rgba(52, 211, 153, 0.8)', heightFactor: 0.13, mode: 'MARITIMO' }, // Maritime route (emerald green, slow)

  // 10% Argentina (Buenos Aires) -> Recife
  { fromId: 5, toId: 6, color: 'rgba(52, 211, 153, 0.8)', heightFactor: 0.15, mode: 'MARITIMO' }, // Maritime route (emerald green, slow)
  { fromId: 5, toId: 6, color: 'rgba(167, 139, 250, 0.8)', heightFactor: 0.24, mode: 'AEREO' }, // Air route (purple, fast)
]

interface RouteDetail {
  fromPort: string
  fromFlag: string
  toPort: string
  toFlag: string
  mode: 'MARITIMO' | 'AEREO'
  bids: number
  bestPrice: number
  saving: number
  transitTime: number
  supplier: string
}

const PORT_CONNECTIONS: Record<number, RouteDetail[]> = {
  1: [
    { fromPort: 'Shanghai (CNSHA)', fromFlag: '🇨🇳', toPort: 'Santos (BRSSZ)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 56, bestPrice: 12400, saving: 23.4, transitTime: 28, supplier: 'Pacific Cargo (E96)' },
    { fromPort: 'Shanghai (CNSHA)', fromFlag: '🇨🇳', toPort: 'Guarulhos (BRGRU)', toFlag: '🇧🇷', mode: 'AEREO', bids: 84, bestPrice: 18200, saving: 19.1, transitTime: 3, supplier: 'Delta Cargo' },
    { fromPort: 'Shanghai (CNSHA)', fromFlag: '🇨🇳', toPort: 'Itajaí (BRITI)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 32, bestPrice: 13100, saving: 20.5, transitTime: 30, supplier: 'EuroFreight Corp' }
  ],
  2: [
    { fromPort: 'Shanghai (CNSHA)', fromFlag: '🇨🇳', toPort: 'Guarulhos (BRGRU)', toFlag: '🇧🇷', mode: 'AEREO', bids: 84, bestPrice: 18200, saving: 19.1, transitTime: 3, supplier: 'Delta Cargo' },
    { fromPort: 'Miami (USMIA)', fromFlag: '🇺🇸', toPort: 'Guarulhos (BRGRU)', toFlag: '🇧🇷', mode: 'AEREO', bids: 48, bestPrice: 8400, saving: 15.6, transitTime: 2, supplier: 'Delta Cargo' }
  ],
  3: [
    { fromPort: 'Shanghai (CNSHA)', fromFlag: '🇨🇳', toPort: 'Itajaí (BRITI)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 32, bestPrice: 13100, saving: 20.5, transitTime: 30, supplier: 'EuroFreight Corp' },
    { fromPort: 'Miami (USMIA)', fromFlag: '🇺🇸', toPort: 'Itajaí (BRITI)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 24, bestPrice: 9500, saving: 17.2, transitTime: 18, supplier: 'Hamburg Süd' }
  ],
  4: [
    { fromPort: 'Miami (USMIA)', fromFlag: '🇺🇸', toPort: 'Guarulhos (BRGRU)', toFlag: '🇧🇷', mode: 'AEREO', bids: 48, bestPrice: 8400, saving: 15.6, transitTime: 2, supplier: 'Delta Cargo' },
    { fromPort: 'Miami (USMIA)', fromFlag: '🇺🇸', toPort: 'Itajaí (BRITI)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 24, bestPrice: 9500, saving: 17.2, transitTime: 18, supplier: 'Hamburg Süd' }
  ],
  5: [
    { fromPort: 'Buenos Aires (ARBUE)', fromFlag: '🇦🇷', toPort: 'Recife (BRREC)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 20, bestPrice: 15300, saving: 18.8, transitTime: 8, supplier: 'Merlion Shipping' },
    { fromPort: 'Buenos Aires (ARBUE)', fromFlag: '🇦🇷', toPort: 'Santos (BRSSZ)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 15, bestPrice: 7200, saving: 16.4, transitTime: 4, supplier: 'MSC Line' }
  ],
  6: [
    { fromPort: 'Buenos Aires (ARBUE)', fromFlag: '🇦🇷', toPort: 'Recife (BRREC)', toFlag: '🇧🇷', mode: 'MARITIMO', bids: 20, bestPrice: 15300, saving: 18.8, transitTime: 8, supplier: 'Merlion Shipping' },
    { fromPort: 'Miami (USMIA)', fromFlag: '🇺🇸', toPort: 'Recife (BRREC)', toFlag: '🇧🇷', mode: 'AEREO', bids: 12, bestPrice: 11200, saving: 14.5, transitTime: 3, supplier: 'PacAnchor Logistics' }
  ]
}

// ─── Infográficos & HUD Rankings (Top 10) ────────────────────────────────────────

const TOP_ORIGENS = [
  { rank: 1, name: 'Shanghai', code: 'CNSHA', flag: '🇨🇳', count: 140, pct: 70, pinId: 1 },
  { rank: 2, name: 'Miami', code: 'USMIA', flag: '🇺🇸', count: 40, pct: 20, pinId: 4 },
  { rank: 3, name: 'Buenos Aires', code: 'ARBUE', flag: '🇦🇷', count: 20, pct: 10, pinId: 5 },
  { rank: 4, name: 'Rotterdam', code: 'NLRTM', flag: '🇳🇱', count: 12, pct: 6, pinId: null },
  { rank: 5, name: 'Singapura', code: 'SGSIN', flag: '🇸🇬', count: 10, pct: 5, pinId: null },
  { rank: 6, name: 'Hamburgo', code: 'DEHAM', flag: '🇩🇪', count: 8, pct: 4, pinId: null },
  { rank: 7, name: 'Houston', code: 'USHOU', flag: '🇺🇸', count: 7, pct: 3.5, pinId: null },
  { rank: 8, name: 'Santos', code: 'BRSSZ', flag: '🇧🇷', count: 5, pct: 2.5, pinId: null },
  { rank: 9, name: 'Tóquio', code: 'JPTYO', flag: '🇯🇵', count: 4, pct: 2, pinId: null },
  { rank: 10, name: 'Antuérpia', code: 'BEANT', flag: '🇧🇪', count: 3, pct: 1.5, pinId: null },
]

const TOP_DESTINOS = [
  { rank: 1, name: 'Guarulhos', code: 'BRGRU', flag: '🇧🇷', count: 140, pct: 70, pinId: 2 },
  { rank: 2, name: 'Itajaí', code: 'BRITI', flag: '🇧🇷', count: 40, pct: 20, pinId: 3 },
  { rank: 3, name: 'Recife', code: 'BRREC', flag: '🇧🇷', count: 20, pct: 10, pinId: 6 },
  { rank: 4, name: 'Santos', code: 'BRSSZ', flag: '🇧🇷', count: 15, pct: 7.5, pinId: null },
  { rank: 5, name: 'Paranaguá', code: 'BRPNG', flag: '🇧🇷', count: 12, pct: 6, pinId: null },
  { rank: 6, name: 'Rio de Janeiro', code: 'BRRIO', flag: '🇧🇷', count: 10, pct: 5, pinId: null },
  { rank: 7, name: 'Manaus', code: 'BRMAO', flag: '🇧🇷', count: 8, pct: 4, pinId: null },
  { rank: 8, name: 'Viracopos', code: 'BRVCP', flag: '🇧🇷', count: 6, pct: 3, pinId: null },
  { rank: 9, name: 'Suape', code: 'BRSUA', flag: '🇧🇷', count: 4, pct: 2, pinId: null },
  { rank: 10, name: 'Rio Grande', code: 'BRRIG', flag: '🇧🇷', count: 3, pct: 1.5, pinId: null },
]

const MOEDAS_INFO = [
  { moeda_operacao: 'USD', label: 'Dólar (USD)', count: 280, pct: 52, cor: '#06b6d4' },
  { moeda_operacao: 'EUR', label: 'Euro (EUR)', count: 140, pct: 26, cor: '#a78bfa' },
  { moeda_operacao: 'GBP', label: 'Libra (GBP)', count: 65, pct: 12, cor: '#fbbf24' },
]

// ─── Visão Geral Global (Globo 3D Interativo Premium) ───────────────────────────

function VisaoGeralMapa() {
  const [activeTab, setActiveTab] = useState<'origens' | 'destinos' | 'moeda_operacao'>('origens')
  const [hoveredPin, setHoveredPin] = useState<number | null>(null)
  const [selectedPinForModal, setSelectedPinForModal] = useState<number | null>(null)
  
  const hoveredPinRef = useRef<number | null>(null)
  useEffect(() => {
    hoveredPinRef.current = hoveredPin
  }, [hoveredPin])
  
  // State for React overlays
  const [projectedPins, setProjectedPins] = useState<(MapPin & { px: number; py: number; opacity: number })[]>([])
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Dragging and Rotation state refs
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0.28, y: -1.25 }) // Starting rotation to show continents nicely
  const velocityRef = useRef({ x: 0, y: 0 })
  const isRotationPausedRef = useRef(false)
  const zoomRef = useRef(1.0)

  // React state and ref for play/pause control of auto-rotation
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const isAutoRotatingRef = useRef(true)

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating
    isRotationPausedRef.current = !isAutoRotating
  }, [isAutoRotating])

  const toggleRotation = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAutoRotating(prev => !prev)
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    zoomRef.current = Math.min(2.5, zoomRef.current + 0.15)
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    zoomRef.current = Math.max(0.5, zoomRef.current - 0.15)
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    zoomRef.current = 1.0
    rotationRef.current = { x: 0.28, y: -1.25 }
    velocityRef.current = { x: 0, y: 0 }
    isRotationPausedRef.current = !isAutoRotatingRef.current
  }
  
  // Generate 5500 Fibonacci points on the sphere for ultra-high-definition realistic mapping
  const samples = 16000
  const fibonacciPoints = useMemo(() => {
    const pts: { x: number; y: number; z: number }[] = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < samples; i++) {
      const y = 1 - (i / (samples - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius
      
      const lat = Math.asin(y) * (180 / Math.PI)
      const lng = Math.atan2(x, z) * (180 / Math.PI)
      
      if (isLand(lat, lng)) {
        pts.push({ x, y, z })
      }
    }
    return pts
  }, [])

  const activePoints = fibonacciPoints // Always use our mathematically precise vector polygon map coordinates for maximum realism and stability

  
  // Frame render loop
  useEffect(() => {
    let animId: number
    
    const renderFrame = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        animId = requestAnimationFrame(renderFrame)
        return
      }
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animId = requestAnimationFrame(renderFrame)
        return
      }
      
      // Update dimensions responsive
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      
      const isWide = w > 850
      const cx = isWide ? (w / 2 - 120) : (w / 2)
      const cy = h / 2
      const R = Math.min(w, h) * 0.42 * zoomRef.current
      const pulseTime = Date.now() / 2400
      
       // Physics: inertially decay dragging or add auto-rotation
      if (!isDraggingRef.current) {
        if (!isRotationPausedRef.current) {
          rotationRef.current.y += 0.0012 // slow auto-rotate Y
          rotationRef.current.x += (0.28 - rotationRef.current.x) * 0.03 // gently spring-tilt X to 0.28 rad
        }
        
        // Decay any leftover flick velocity
        rotationRef.current.y += velocityRef.current.y
        rotationRef.current.x += velocityRef.current.x
        velocityRef.current.y *= 0.95
        velocityRef.current.x *= 0.95
      } else {
        rotationRef.current.y += velocityRef.current.y
        rotationRef.current.x += velocityRef.current.x
        // decay rapidly when user holds/drags to avoid jitter
        velocityRef.current.y *= 0.8
        velocityRef.current.x *= 0.8
      }
      
      // Clamp X rotation to avoid flipping upside down
      rotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationRef.current.x))
      
      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)
      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)
      
      // Clear
      ctx.clearRect(0, 0, w, h)
      
      // 1. Draw Deep Space Background Glow Behind Globe (Premium Volumetric Aura)
      const bgGlow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.3)
      bgGlow.addColorStop(0, 'rgba(16, 28, 48, 0.45)') // Soft midnight blue core
      bgGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)') // Faded blue core shading
      bgGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0)') // Fades out completely to let the card bg take over
      ctx.fillStyle = bgGlow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2)
      ctx.fill()
      
      // 2. Draw 3D Grid Meridian & Parallels (back layer)
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      
      // Latitude parallels (draw simple horizontal projected lines)
      const parallels = [-0.6, -0.3, 0, 0.3, 0.6]
      parallels.forEach(py => {
        const radiusAtY = Math.sqrt(1 - py * py)
        ctx.beginPath()
        for (let th = 0; th <= Math.PI * 2; th += 0.1) {
          const px = Math.cos(th) * radiusAtY
          const pz = Math.sin(th) * radiusAtY
          
          let rx1 = px * cosY - pz * sinY
          let rz1 = px * sinY + pz * cosY
          let ry2 = py * cosX + rz1 * sinX
          let rz2 = -py * sinX + rz1 * cosX
          
          const sx = cx + rx1 * R
          const sy = cy - ry2 * R
          
          if (th === 0) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        }
        ctx.closePath()
        ctx.stroke()
      })
      
      // Longitude meridians
      const meridians = [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3]
      meridians.forEach(th => {
        ctx.beginPath()
        for (let latVal = -Math.PI / 2; latVal <= Math.PI / 2; latVal += 0.05) {
          const py = Math.sin(latVal)
          const radiusAtY = Math.cos(latVal)
          const px = Math.cos(th) * radiusAtY
          const pz = Math.sin(th) * radiusAtY
          
          let rx1 = px * cosY - pz * sinY
          let rz1 = px * sinY + pz * cosY
          let ry2 = py * cosX + rz1 * sinX
          let rz2 = -py * sinX + rz1 * cosX
          
          const sx = cx + rx1 * R
          const sy = cy - ry2 * R
          
          if (latVal === -Math.PI / 2) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        }
        ctx.stroke()
      })
      
      // 3. Draw Real World Map Land Points with depth separating styling
      activePoints.forEach(p => {
        // Rotate Y
        let rx1 = p.x * cosY - p.z * sinY
        let rz1 = p.x * sinY + p.z * cosY
        
        // Rotate X
        let ry2 = p.y * cosX + rz1 * sinX
        let rz2 = -p.y * sinX + rz1 * cosX
        
        const sx = cx + rx1 * R
        const sy = cy - ry2 * R
        
        // Depth check: z2 < 0 is back, z2 >= 0 is front
        if (rz2 < 0) {
          // Slightly more visible dots for the back hemisphere to give structural context
          ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
          ctx.fillRect(sx - 0.5, sy - 0.5, 1.0, 1.0)
        } else {
          // Bright, highly defined neon dots for the front hemisphere (sharper countries)
          const normalizedDepth = Math.max(0, Math.min(1, rz2)) // 1 at front, 0 at edge
          ctx.fillStyle = `rgba(6, 182, 212, ${0.30 + normalizedDepth * 0.60})`
          const size = 1.1 + normalizedDepth * 0.9 // optimized for higher density scan
          ctx.beginPath()
          ctx.arc(sx, sy, size, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      
      // 4. Draw Atmospheric Cyber Glass Rim Glow & Futuristic Holographic Ring
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(6, 182, 212, 0.2)'
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0 // Reset
      
      // Fine-lined rotating futuristic coordinates ring (outer tech orbit)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 15])
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.08, pulseTime * 0.15, pulseTime * 0.15 + Math.PI * 2)
      ctx.stroke()
      
      // Secondary reverse-rotating orbit
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'
      ctx.setLineDash([2, 25])
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.13, -pulseTime * 0.08, -pulseTime * 0.08 + Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([]) // Reset
      
      // 5. Draw 3D curved Logistics Arc Routes & cargo pulses
      
      GLOBE_ROUTES.forEach((route, routeIdx) => {
        const fromPin = MAP_PINS.find(p => p.id === route.fromId)
        const toPin = MAP_PINS.find(p => p.id === route.toId)
        if (!fromPin || !toPin) return
        
        const p1 = getCartesian(fromPin.geoLat, fromPin.geoLng)
        const p2 = getCartesian(toPin.geoLat, toPin.geoLng)
        
        // Trace curved arc
        const segmentsCount = 36
        const pathPoints: { sx: number; sy: number; rz2: number }[] = []
        let avgDepth = 0
        
        for (let j = 0; j <= segmentsCount; j++) {
          const t = j / segmentsCount
          
          // LERP + Normalize (Spherical arch approximation)
          let px = p1.x * (1 - t) + p2.x * t
          let py = p1.y * (1 - t) + p2.y * t
          let pz = p1.z * (1 - t) + p2.z * t
          const len = Math.sqrt(px * px + py * py + pz * pz)
          px /= len
          py /= len
          pz /= len
          
          // Dome height factor
          const hFactor = route.heightFactor || 0.16
          const height = 1 + hFactor * Math.sin(t * Math.PI)
          px *= height
          py *= height
          pz *= height
          
          // Rotate Y
          let rx1 = px * cosY - pz * sinY
          let rz1 = px * sinY + pz * cosY
          
          // Rotate X
          let ry2 = py * cosX + rz1 * sinX
          let rz2 = -py * sinX + rz1 * cosX
          
          const sx = cx + rx1 * R
          const sy = cy - ry2 * R
          
          pathPoints.push({ sx, sy, rz2 })
          avgDepth += rz2
        }
        
        avgDepth /= segmentsCount
        
        // Draw the arc path
        const isBack = avgDepth < -0.05
        ctx.strokeStyle = route.color
        
        const currentHovered = hoveredPinRef.current
        const isRouteDirectSource = currentHovered !== null && (route.fromId === currentHovered || route.toId === currentHovered)
        
        if (currentHovered !== null) {
          if (isRouteDirectSource) {
            ctx.lineWidth = isBack ? 1.0 : 3.0
            ctx.globalAlpha = isBack ? 0.15 : 0.8
          } else {
            ctx.lineWidth = isBack ? 0.3 : 0.5
            ctx.globalAlpha = isBack ? 0.01 : 0.05
          }
        } else {
          ctx.lineWidth = isBack ? 0.75 : 1.5
          ctx.globalAlpha = isBack ? 0.08 : 0.25 // subtle background route line
        }
        
        ctx.beginPath()
        ctx.moveTo(pathPoints[0].sx, pathPoints[0].sy)
        for (let j = 1; j < pathPoints.length; j++) {
          ctx.lineTo(pathPoints[j].sx, pathPoints[j].sy)
        }
        ctx.stroke()
        ctx.globalAlpha = 1.0 // Reset
        
        // Draw animated marching-ants dashed line on top for clear flow direction
        if (!isBack && (currentHovered === null || isRouteDirectSource)) {
          ctx.strokeStyle = route.color
          ctx.lineWidth = isRouteDirectSource ? 3.5 : 2.0
          ctx.setLineDash([5, 8])
          // Negative offset moves the dash pattern from start to end (fromId -> toId)
          const isMaritime = route.mode === 'MARITIMO'
          ctx.lineDashOffset = -(Date.now() / (isMaritime ? 320 : 32)) % 100
          
          ctx.beginPath()
          ctx.moveTo(pathPoints[0].sx, pathPoints[0].sy)
          for (let j = 1; j < pathPoints.length; j++) {
            ctx.lineTo(pathPoints[j].sx, pathPoints[j].sy)
          }
          ctx.stroke()
          ctx.setLineDash([]) // Reset
        }

        // Draw elegant glowing directional chevrons directly along the curve
        if (!isBack && (currentHovered === null || isRouteDirectSource)) {
          const chevronIndices = [Math.floor(segmentsCount * 0.3), Math.floor(segmentsCount * 0.7)]
          chevronIndices.forEach(idx => {
            const p1 = pathPoints[idx]
            const p2 = pathPoints[idx + 1]
            if (p1 && p2 && p1.rz2 >= -0.15) {
              const angle = Math.atan2(p2.sy - p1.sy, p2.sx - p1.sx)
              ctx.save()
              ctx.translate(p1.sx, p1.sy)
              ctx.rotate(angle)
              ctx.strokeStyle = route.mode === 'AEREO' ? '#c084fc' : '#34d399'
              ctx.lineWidth = isRouteDirectSource ? 3.0 : 2.0
              ctx.lineCap = 'round'
              ctx.lineJoin = 'round'
              ctx.shadowBlur = isRouteDirectSource ? 14 : 8
              ctx.shadowColor = ctx.strokeStyle
              ctx.beginPath()
              ctx.moveTo(-5, -4)
              ctx.lineTo(1, 0)
              ctx.lineTo(-5, 4)
              ctx.stroke()
              ctx.restore()
            }
          })
        }
        
        // Draw cargo moving pulses with beautiful fading neon trails (comet effect)
        if (!isBack && (currentHovered === null || isRouteDirectSource)) {
          // Draw 2 staggered pulses per route so direction is immediately obvious
          [0.0, 0.5].forEach((offset) => {
            const isMaritime = route.mode === 'MARITIMO'
            const routePulseTime = Date.now() / (isMaritime ? 24000 : 2400)
            const tPulse = (routePulseTime + routeIdx * 0.22 + offset) % 1.0
            const rawIdx = tPulse * segmentsCount
            
            // Draw trail
            const trailLength = 8 // longer trail for speed feel
            for (let k = trailLength - 1; k >= 0; k--) {
              const currentRawIdx = rawIdx - k * 0.6
              if (currentRawIdx < 0) continue
              
              const idx = Math.floor(currentRawIdx)
              const nextIdx = Math.min(segmentsCount, idx + 1)
              const interp = currentRawIdx - idx
              
              const pCurrent = pathPoints[idx]
              const pNext = pathPoints[nextIdx]
              
              if (pCurrent && pNext) {
                const pulseSx = pCurrent.sx * (1 - interp) + pNext.sx * interp
                const pulseSy = pCurrent.sy * (1 - interp) + pNext.sy * interp
                const pulseDepth = pCurrent.rz2 * (1 - interp) + pNext.rz2 * interp
                
                if (pulseDepth >= -0.15) {
                  const trailRatio = 1 - k / trailLength // 1 for head, 0 for tail end
                  const size = (isRouteDirectSource ? 1.6 : 1.2) + trailRatio * (isRouteDirectSource ? 3.0 : 2.2)
                  const opacity = trailRatio * 0.95 // Head is bright, tail fades out
                  
                  if (k === 0) {
                    ctx.save()
                    ctx.translate(pulseSx, pulseSy)
                    
                    // Calculate vector angle for rotation pointing along trajectory
                    const angle = Math.atan2(pNext.sy - pCurrent.sy, pNext.sx - pCurrent.sx)
                    ctx.rotate(angle)
                    
                    if (isRouteDirectSource) {
                      ctx.scale(1.35, 1.35)
                    }
                    
                    ctx.beginPath()
                    if (isMaritime) {
                      // Draw sleek top-down cargo ship hull
                      ctx.moveTo(8, 0)
                      ctx.lineTo(4, 3)
                      ctx.lineTo(-6, 3)
                      ctx.lineTo(-7, 1.5)
                      ctx.lineTo(-7, -1.5)
                      ctx.lineTo(-6, -3)
                      ctx.lineTo(4, -3)
                      ctx.closePath()
                    } else {
                      // Draw sleek top-down airplane fuselage & wings
                      ctx.moveTo(8, 0)
                      ctx.lineTo(-4, 6)
                      ctx.lineTo(-2, 2)
                      ctx.lineTo(-8, 3)
                      ctx.lineTo(-6, 0)
                      ctx.lineTo(-8, -3)
                      ctx.lineTo(-2, -2)
                      ctx.lineTo(-4, -6)
                      ctx.closePath()
                    }
                    
                    ctx.fillStyle = '#ffffff'
                    ctx.shadowBlur = isRouteDirectSource ? 16 : 12
                    ctx.shadowColor = isMaritime ? '#34d399' : '#c084fc'
                    ctx.fill()
                    
                    // Draw a tiny colorful inner core/cabin for maximum luxury detail
                    ctx.beginPath()
                    if (isMaritime) {
                      ctx.rect(-2, -1.5, 3, 3)
                      ctx.fillStyle = '#34d399' // green core for ship containers
                    } else {
                      ctx.arc(1, 0, 1.5, 0, Math.PI * 2)
                      ctx.fillStyle = '#a78bfa' // purple core for plane cockpit
                    }
                    ctx.shadowBlur = 0
                    ctx.fill()
                    
                    ctx.restore()
                  } else {
                    ctx.beginPath()
                    ctx.arc(pulseSx, pulseSy, size, 0, Math.PI * 2)
                    ctx.fillStyle = route.color.replace('0.8', (opacity * 0.85).toString())
                    ctx.shadowBlur = 0
                    ctx.globalAlpha = opacity
                    ctx.fill()
                    ctx.shadowBlur = 0
                    ctx.globalAlpha = 1.0 // Reset
                  }
                }
              }
            }
          })
        }
      })
      
      // 6. Project and Slipped-In Map Pins Overlay Coordinates
      const offsetX = canvas.offsetLeft || 0
      const offsetY = canvas.offsetTop || 0

      const tempPins = MAP_PINS.map(pin => {
        const p = getCartesian(pin.geoLat, pin.geoLng)
        
        // Rotate Y
        let rx1 = p.x * cosY - p.z * sinY
        let rz1 = p.x * sinY + p.z * cosY
        
        // Rotate X
        let ry2 = p.y * cosX + rz1 * sinX
        let rz2 = -p.y * sinX + rz1 * cosX
        
        const sx = cx + rx1 * R
        const sy = cy - ry2 * R
        
        const opacity = rz2 < -0.15 ? 0 : Math.max(0, Math.min(1, (rz2 + 0.15) / 0.3))
        
        return {
          ...pin,
          px: sx + offsetX,
          py: sy + offsetY,
          opacity: opacity,
        }
      })
      
      setProjectedPins(tempPins)
      
      // 7. Atmospheric Top Shine Glass overlay
      const glassGlow = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R)
      glassGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
      glassGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)')
      glassGlow.addColorStop(0.85, 'rgba(11, 14, 20, 0.2)')
      glassGlow.addColorStop(1, 'rgba(11, 14, 20, 0.95)')
      ctx.fillStyle = glassGlow
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()
      
      animId = requestAnimationFrame(renderFrame)
    }
    
    animId = requestAnimationFrame(renderFrame)
    return () => cancelAnimationFrame(animId)
  }, [activePoints])
  
  // Drag physics mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    isRotationPausedRef.current = true
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    velocityRef.current = { x: 0, y: 0 }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    
    rotationRef.current.y -= dx * 0.0055
    rotationRef.current.x += dy * 0.0055
    rotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationRef.current.x))
    
    velocityRef.current.y = -dx * 0.0055
    velocityRef.current.x = dy * 0.0055
    
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }
  
  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
    isRotationPausedRef.current = !isAutoRotatingRef.current
  }
  
  // Mobile Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return
    isDraggingRef.current = true
    isRotationPausedRef.current = true
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    velocityRef.current = { x: 0, y: 0 }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    
    rotationRef.current.y -= dx * 0.0055
    rotationRef.current.x += dy * 0.0055
    rotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationRef.current.x))
    
    velocityRef.current.y = -dx * 0.0055
    velocityRef.current.x = dy * 0.0055
    
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  
  return (
      <div className="bcc-card bcc-map-card">
      <div className="bcc-map-card__header">
        <div>
          <span className="bcc-card__title" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>Visão Geral Global de Cotações</span>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 400, letterSpacing: '0.015em', lineHeight: 1.5 }}>Localizações estratégicas, bids ativos e saving acumulado por terminal (Arrastar para Girar)</span>
        </div>
        <div className="bcc-map-legend">
          <span className="bcc-map-legend__item">
            <CurrencyDollar size={15} weight="bold" style={{ color: '#34d399' }} /> Compra
          </span>
          <span className="bcc-map-legend__item">
            <CurrencyEur size={15} weight="bold" style={{ color: '#a78bfa' }} /> Venda
          </span>
        </div>
      </div>
      
      <div 
        className="bcc-map-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
      >
        {/* The high-performance 3D Canvas */}
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        
        {/* HUD de Cotações Globais */}
        <div className={`bcc-map-right-panel bcc-map-right-panel--${activeTab}`}>
          <div className="bcc-map-panel__header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="bcc-map-panel__title">HUD de Cotações Globais</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="bcc-map-panel__live-dot" />
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>LIVE FEED</span>
              </div>
            </div>
            <span className="bcc-map-panel__subtitle">Rankings em tempo real • 200 bids</span>
          </div>
          
          {/* Tabs */}
          <div className="bcc-map-panel__tabs">
            <button 
              className={`bcc-map-panel__tab tab-origens ${activeTab === 'origens' ? 'is-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('origens'); }}
            >
              <Globe size={13} weight="bold" /> Origens
            </button>
            <button 
              className={`bcc-map-panel__tab tab-destinos ${activeTab === 'destinos' ? 'is-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('destinos'); }}
            >
              <MapPin size={13} weight="bold" /> Destinos
            </button>
            <button 
              className={`bcc-map-panel__tab tab-moeda_operacao ${activeTab === 'moeda_operacao' ? 'is-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('moeda_operacao'); }}
            >
              <List size={13} weight="bold" /> Moedas
            </button>
          </div>
          
          {/* List Content */}
          <div className="bcc-map-panel__list">
            {activeTab === 'origens' && TOP_ORIGENS.map(item => {
              const hasLink = item.pinId !== null
              const isHighlighted = hoveredPin === item.pinId && hasLink
              
              return (
                <div 
                  key={item.rank}
                  className={`bcc-map-panel__row ${hasLink ? 'has-link' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => {
                    if (item.pinId) {
                      setHoveredPin(item.pinId)
                      isRotationPausedRef.current = true
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.pinId) {
                      setHoveredPin(null)
                      isRotationPausedRef.current = false
                    }
                  }}
                  onClick={(e) => {
                    if (item.pinId) {
                      e.stopPropagation()
                      setSelectedPinForModal(item.pinId)
                      isRotationPausedRef.current = true
                    }
                  }}
                >
                  <span className={`bcc-map-panel__rank bcc-map-panel__rank--${item.rank}`}>
                    {item.rank}
                  </span>
                  <span className="bcc-map-panel__row-flag">{item.flag}</span>
                  <div className="bcc-map-panel__info-wrap">
                    <div className="bcc-map-panel__row-header">
                      <span className="bcc-map-panel__row-name">{item.name} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{item.code}</span></span>
                      <span className="bcc-map-panel__row-stats" style={{ color: '#06b6d4' }}>{item.count} bids</span>
                    </div>
                    <div className="bcc-map-panel__row-bar-wrap">
                      <div 
                        className="bcc-map-panel__row-bar-fill" 
                        style={{ 
                          width: `${item.pct}%`, 
                          background: item.rank === 1 
                            ? 'linear-gradient(90deg, #06b6d4, #0891b2)' 
                            : 'linear-gradient(90deg, rgba(6, 182, 212, 0.8), rgba(6, 182, 212, 0.4))',
                          boxShadow: item.rank === 1 ? '0 0 6px rgba(6, 182, 212, 0.4)' : 'none'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            
            {activeTab === 'destinos' && TOP_DESTINOS.map(item => {
              const hasLink = item.pinId !== null
              const isHighlighted = hoveredPin === item.pinId && hasLink
              
              return (
                <div 
                  key={item.rank}
                  className={`bcc-map-panel__row ${hasLink ? 'has-link' : ''} ${isHighlighted ? 'is-highlighted-dest' : ''}`}
                  onMouseEnter={() => {
                    if (item.pinId) {
                      setHoveredPin(item.pinId)
                      isRotationPausedRef.current = true
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.pinId) {
                      setHoveredPin(null)
                      isRotationPausedRef.current = false
                    }
                  }}
                  onClick={(e) => {
                    if (item.pinId) {
                      e.stopPropagation()
                      setSelectedPinForModal(item.pinId)
                      isRotationPausedRef.current = true
                    }
                  }}
                >
                  <span className={`bcc-map-panel__rank bcc-map-panel__rank--${item.rank}`}>
                    {item.rank}
                  </span>
                  <span className="bcc-map-panel__row-flag">{item.flag}</span>
                  <div className="bcc-map-panel__info-wrap">
                    <div className="bcc-map-panel__row-header">
                      <span className="bcc-map-panel__row-name">{item.name} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{item.code}</span></span>
                      <span className="bcc-map-panel__row-stats" style={{ color: '#a78bfa' }}>{item.count} bids</span>
                    </div>
                    <div className="bcc-map-panel__row-bar-wrap">
                      <div 
                        className="bcc-map-panel__row-bar-fill" 
                        style={{ 
                          width: `${item.pct}%`, 
                          background: item.rank === 1 
                            ? 'linear-gradient(90deg, #a78bfa, #7c3aed)' 
                            : 'linear-gradient(90deg, rgba(167, 139, 250, 0.8), rgba(124, 58, 237, 0.4))',
                          boxShadow: item.rank === 1 ? '0 0 6px rgba(167, 139, 250, 0.4)' : 'none'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            
            {activeTab === 'moeda_operacao' && (
              <div className="bcc-map-panel__modal-wrap">
                {MOEDAS_INFO.map(item => {
                  const MoedaIcon = MOEDA_ICONS[item.moeda_operacao] || <Globe size={14} />
                  return (
                    <div key={item.moeda_operacao} className="bcc-map-panel__modal-item" style={{ borderLeft: `3px solid ${item.cor}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {/* Modern Radial Meter */}
                        <svg width="40" height="40" viewBox="0 0 40 40" style={{ overflow: 'visible', flexShrink: 0 }}>
                          <circle cx={20} cy={20} r={16} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                          <circle
                            cx={20} cy={20} r={16}
                            fill="none"
                            stroke={item.cor}
                            strokeWidth="3.5"
                            strokeDasharray={100.5}
                            strokeDashoffset={100.5 - (item.pct / 100) * 100.5}
                            strokeLinecap="round"
                            style={{
                              filter: `drop-shadow(0 0 4px ${item.cor}60)`,
                              transform: 'rotate(-90deg)',
                              transformOrigin: '20px 20px',
                              transition: 'stroke-dashoffset 0.8s ease-out'
                            }}
                          />
                          <g style={{ transform: 'translate(12px, 12px)', color: item.cor }}>
                            {MoedaIcon}
                          </g>
                        </svg>

                        {/* Moeda Info */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>{item.label}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: item.cor }}>{item.count} ops</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 500 }}>Representa {item.pct}% das operações</span>
                        </div>
                      </div>

                      {/* Stats Breakdown */}
                      <div className="bcc-map-panel__modal-stats-grid">
                        <div className="bcc-map-panel__modal-stat-box">
                          <span className="bcc-map-panel__modal-stat-lbl">Melhor Taxa</span>
                          <span className="bcc-map-panel__modal-stat-num" style={{ color: '#ffffff' }}>
                            R$ {item.moeda_operacao === 'USD' ? '5,08' : item.moeda_operacao === 'EUR' ? '5,62' : '6,38'}
                          </span>
                        </div>
                        <div className="bcc-map-panel__modal-stat-box">
                          <span className="bcc-map-panel__modal-stat-lbl">Saving Médio</span>
                          <span className="bcc-map-panel__modal-stat-num" style={{ color: '#06b6d4' }}>
                            {item.moeda_operacao === 'USD' ? '+15.2%' : item.moeda_operacao === 'EUR' ? '+12.8%' : '+10.5%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Zoom & Control Panel */}
        <div className="bcc-map-controls">
          <button 
            onClick={handleZoomIn} 
            title="Aumentar Zoom" 
            className="bcc-map-control-btn"
          >
            <Plus size={16} weight="bold" />
          </button>
          
          <button 
            onClick={handleZoomOut} 
            title="Diminuir Zoom" 
            className="bcc-map-control-btn"
          >
            <Minus size={16} weight="bold" />
          </button>

          <button 
            onClick={handleReset} 
            title="Restaurar Globo" 
            className="bcc-map-control-btn"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
          </button>

          <button 
            onClick={toggleRotation} 
            title={isAutoRotating ? "Pausar Rotação" : "Iniciar Rotação"} 
            className="bcc-map-control-btn"
          >
            {isAutoRotating ? <Pause size={16} weight="bold" /> : <Play size={16} weight="bold" />}
          </button>
        </div>
        
        {/* Dynamic HTML Overlay Pins */}
        {projectedPins.map(pin => {
          if (pin.opacity <= 0.05) return null
          
          const isHovered = hoveredPin === pin.id
          const Icon = MOEDA_ICONS[pin.mode] || <Globe size={12} />
          
          return (
            <div
              key={pin.id}
              className={`bcc-map-pin-wrapper ${isHovered ? 'is-active' : ''}`}
              style={{ 
                top: `${pin.py}px`, 
                left: `${pin.px}px`,
                opacity: pin.opacity,
                pointerEvents: pin.opacity < 0.65 ? 'none' : 'auto'
              }}
              onMouseEnter={() => {
                setHoveredPin(pin.id)
                isRotationPausedRef.current = true
              }}
              onMouseLeave={() => {
                setHoveredPin(null)
                isRotationPausedRef.current = false
              }}
              onClick={(e) => {
                e.stopPropagation() // Avoid triggering map drag
                isRotationPausedRef.current = true
                setSelectedPinForModal(pin.id)
              }}
            >
              {/* Outer pulsing ring */}
              <div className="bcc-map-pin__glow" style={{ borderColor: pin.mode === 'AEREO' ? '#a78bfa' : '#34d399' }} />
              
              {/* Glowing pin dot */}
              <div 
                className="bcc-map-pin__dot" 
                style={{ 
                  backgroundColor: pin.mode === 'AEREO' ? '#a78bfa' : '#34d399',
                  boxShadow: pin.mode === 'AEREO' ? '0 0 10px rgba(167, 139, 250, 0.6)' : '0 0 10px rgba(52, 211, 153, 0.6)'
                }}
              >
                <span className="bcc-map-pin__icon-inner">{Icon}</span>
              </div>
              
              {/* Tooltip */}
              {isHovered && pin.opacity > 0.7 && (
                <div className="bcc-map-tooltip">
                  <div className="bcc-map-tooltip__header">
                    <span className="bcc-map-tooltip__flag">{pin.flag}</span>
                    <div className="bcc-map-tooltip__title-wrap">
                      <span className="bcc-map-tooltip__title">{pin.label}</span>
                      <span className="bcc-map-tooltip__subtitle">{pin.portCode} • {pin.country}</span>
                    </div>
                    <span className="bcc-map-tooltip__mode-icon" style={{ color: pin.mode === 'AEREO' ? '#a78bfa' : '#34d399' }}>
                      {Icon}
                    </span>
                  </div>
                  
                  <div className="bcc-map-tooltip__body">
                    <div className="bcc-map-tooltip__stat">
                      <span className="bcc-map-tooltip__stat-label">Bids Ativos</span>
                      <span className="bcc-map-tooltip__stat-val">{pin.activeBids} cotações</span>
                    </div>
                    <div className="bcc-map-tooltip__stat">
                      <span className="bcc-map-tooltip__stat-label">Melhor Preço</span>
                      <span className="bcc-map-tooltip__stat-val" style={{ color: '#ffffff' }}>
                        USD {fmtMoeda(pin.bestPrice)}
                      </span>
                    </div>
                    <div className="bcc-map-tooltip__stat">
                      <span className="bcc-map-tooltip__stat-label">Saving Médio</span>
                      <span className="bcc-map-tooltip__stat-val" style={{ color: pin.mode === 'AEREO' ? '#a78bfa' : '#34d399', fontWeight: 700 }}>
                        +{pin.savingPct}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bcc-map-tooltip__footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="bcc-map-tooltip__supplier" style={{ fontSize: '0.78rem' }}>
                        Forn: <strong>{pin.supplier}</strong>
                      </span>
                    </div>
                    <div className="bcc-map-tooltip__hint">👉 Clique para ver rotas</div>
                  </div>
                  <div className="bcc-map-tooltip__after" />
                </div>
              )}
            </div>
          )
        })}

        {/* Premium Detail Modal Overlay */}
        {selectedPinForModal !== null && (() => {
          const pin = MAP_PINS.find(p => p.id === selectedPinForModal)
          if (!pin) return null
          const connections = PORT_CONNECTIONS[selectedPinForModal] || []
          
          return (
            <div className="bcc-moeda_operacao-overlay" onClick={() => setSelectedPinForModal(null)}>
              <div className="bcc-moeda_operacao-card" onClick={e => e.stopPropagation()}>
                <div className="bcc-moeda_operacao-header">
                  <div className="bcc-moeda_operacao-title-group">
                    <span className="bcc-moeda_operacao-flag-large">{pin.flag}</span>
                    <div>
                      <h2 className="bcc-moeda_operacao-title">Rotas Ativas: {pin.label}</h2>
                      <span className="bcc-moeda_operacao-subtitle">{pin.portCode} • {pin.country}</span>
                    </div>
                  </div>
                  <button className="bcc-moeda_operacao-close-btn" onClick={() => setSelectedPinForModal(null)}>✕</button>
                </div>
                
                <div className="bcc-moeda_operacao-body">
                  {connections.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                      Nenhuma rota ativa cadastrada para este terminal.
                    </div>
                  ) : (
                    connections.map((route, idx) => {
                      const isAir = route.mode === 'AEREO'
                      const modeColor = isAir ? '#a78bfa' : '#34d399'
                      const modeIcon = isAir ? <CurrencyEur size={14} weight="bold" /> : <CurrencyDollar size={14} weight="bold" />
                      const badgeClass = isAir ? 'bcc-route-badge bcc-route-badge--aereo' : 'bcc-route-badge bcc-route-badge--maritimo'
                      const cardClass = isAir ? 'bcc-route-card bcc-route-card--aereo' : 'bcc-route-card bcc-route-card--maritimo'
                      
                      // High-quality loop motion path details
                      const pathD = "M 10,15 Q 120,-5 230,15"
                      const speed = isAir ? "3.2s" : "6.5s"
                      
                      return (
                        <div key={idx} className={cardClass}>
                          <div className="bcc-route-header">
                            <div className="bcc-route-ports">
                              <span className="bcc-route-port-flag">{route.fromFlag}</span>
                              <span className="bcc-route-port-name">{route.fromPort}</span>
                              <span className="bcc-route-arrow-icon">➔</span>
                              <span className="bcc-route-port-flag">{route.toFlag}</span>
                              <span className="bcc-route-port-name">{route.toPort}</span>
                            </div>
                            
                            <span className={badgeClass} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {modeIcon} {route.mode}
                            </span>
                          </div>
                          
                          {/* Animated SVG Path with native animateMotion */}
                          <div className="bcc-route-svg-container">
                            <svg width="100%" height="30" viewBox="0 0 240 30" style={{ overflow: 'visible' }}>
                              {/* Base dotted connection line */}
                              <path 
                                d={pathD} 
                                fill="none" 
                                stroke="rgba(255, 255, 255, 0.12)" 
                                strokeWidth="2" 
                                strokeDasharray="4,4" 
                              />
                              {/* Glowing animate line trail */}
                              <path 
                                d={pathD} 
                                fill="none" 
                                stroke={modeColor} 
                                strokeWidth="1.5" 
                                strokeDasharray="20, 220" 
                                opacity="0.8"
                              >
                                <animate 
                                  attributeName="stroke-dashoffset" 
                                  values="240;0" 
                                  dur={speed} 
                                  repeatCount="indefinite" 
                                />
                              </path>
                              {/* High-fidelity moving ship or plane */}
                              <g>
                                {isAir ? (
                                  // High quality mini plane shape facing right
                                  <path 
                                    d="M-7,-2 L-2,-2 L1,-6 L3,-6 L2,-2 L6,-1 L8,0 L6,1 L2,2 L3,6 L1,6 L-2,2 L-7,2 Z" 
                                    fill="#a78bfa" 
                                    style={{ filter: 'drop-shadow(0 0 3px rgba(167, 139, 250, 0.6))' }}
                                  />
                                ) : (
                                  // High quality mini cargo ship shape facing right
                                  <path 
                                    d="M-8,-2 L4,-2 L8,0 L4,2 L-8,2 Z M-5,-2 L-5,-4 L-2,-4 L-2,-2 Z" 
                                    fill="#34d399" 
                                    style={{ filter: 'drop-shadow(0 0 3px rgba(52, 211, 153, 0.6))' }}
                                  />
                                )}
                                <animateMotion 
                                  path={pathD} 
                                  dur={speed} 
                                  repeatCount="indefinite" 
                                  rotate="auto" 
                                />
                              </g>
                            </svg>
                          </div>
                          
                          <div className="bcc-route-stats">
                            <div className="bcc-route-stat-item">
                              <span className="bcc-route-stat-label">Bids Ativos</span>
                              <span className="bcc-route-stat-value">{route.bids} bids</span>
                            </div>
                            <div className="bcc-route-stat-item">
                              <span className="bcc-route-stat-label">Melhor Preço</span>
                              <span className="bcc-route-stat-value" style={{ color: '#ffffff' }}>USD {fmtMoeda(route.bestPrice)}</span>
                            </div>
                            <div className="bcc-route-stat-item">
                              <span className="bcc-route-stat-label">Saving</span>
                              <span className="bcc-route-stat-value" style={{ color: isAir ? '#a78bfa' : '#34d399' }}>+{route.saving}%</span>
                            </div>
                            <div className="bcc-route-stat-item">
                              <span className="bcc-route-stat-label">Transit Time</span>
                              <span className="bcc-route-stat-value">{route.transitTime} dias</span>
                            </div>
                          </div>
                          
                          <div style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '0.5rem' }}>
                            <span>Forn. Líder: <strong>{route.supplier}</strong></span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                
                <div className="bcc-moeda_operacao-footer">
                  <button className="bcc-moeda_operacao-close-action" onClick={() => setSelectedPinForModal(null)}>Fechar</button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default function VisaoGeral() {
  const navigate = useNavigate()
  const kpis = DEMO_KPIS_CAMBIO
  const alertas = DEMO_CALENDARIO_CAMBIO
  const andamentoSpark = [8, 10, 14, 12, 16, 18, 22]
  const savingSpark = [10, 12, 11, 15, 14, 17, 19]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<Compass weight="duotone" size={22} />}
          titulo="Visão Geral"
          subtitulo="Resumo das operações de câmbio"
          acoes={
            <BotaoGlobal variante="primario" icone={<ArrowsLeftRight weight="bold" size={15} />} onClick={() => navigate('/produto/bid-cambio/cotacoes/nova')}>
              Nova Cotação
            </BotaoGlobal>
          }
        />
      }
    >
    <div className="bcc-dashboard">
      <style>{`
        .bcc-dashboard {
          padding: 0 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
          letter-spacing: 0.015em;
          color: #f1f5f9;
        }

        /* ── Header ──────────────────────────────────────────────── */
        .bcc-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; }
        .bcc-header__left h1 { font-size: 1.65rem; font-weight: 700; color: #ffffff; letter-spacing: -0.005em; margin: 0; }
        .bcc-header__left p {
          font-size: 0.95rem;
          color: #f1f5f9;
          font-weight: 500;
          letter-spacing: 0.025em;
          line-height: 1.6;
          margin: 0.45rem 0 0;
        }
        .bcc-header__actions { display: flex; align-items: center; gap: 0.75rem; transform: translateY(40px); }
        .bcc-header__icon-btn {
          width: 38px; height: 38px; border-radius: 8px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); color: #cbd5e1;
          transition: all 0.2s;
        }
        .bcc-header__icon-btn:hover { background: rgba(255,255,255,0.12); color: #ffffff; }

        /* ── KPI Grid ────────────────────────────────────────────── */
        .bcc-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .bcc-kpi {
          background: rgba(255,255,255,0.04); border-radius: 14px; padding: 1.5rem 1.75rem;
          border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 0.65rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bcc-kpi:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
        }
        
        .bcc-kpi--destacado {
          border: 1px solid #06b6d4 !important;
          background: rgba(6, 182, 212, 0.08) !important;
          box-shadow: 0 0 18px rgba(6, 182, 212, 0.15);
        }
        .bcc-kpi--destacado:hover {
          background: rgba(6, 182, 212, 0.12) !important;
          box-shadow: 0 0 24px rgba(6, 182, 212, 0.25);
        }

        .bcc-kpi--action {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          text-align: center;
        }
        .bcc-kpi--action:hover {
          transform: translateY(-5px) !important;
          filter: brightness(1.1);
          box-shadow: 0 10px 22px rgba(6, 182, 212, 0.25);
        }

        .bcc-kpi__header { display: flex; align-items: center; gap: 0.6rem; }
        .bcc-kpi__icon { color: #cbd5e1; display: flex; }
        .bcc-kpi__label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: #cbd5e1; }
        .bcc-kpi__row { display: flex; align-items: baseline; gap: 0.65rem; }
        .bcc-kpi__value { font-size: 2.2rem; font-weight: 700; color: #ffffff; line-height: 1.1; letter-spacing: -0.01em; }
        .bcc-kpi__badge {
          font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem;
          border-radius: 6px; letter-spacing: 0.02em;
        }
        .bcc-kpi__sub { font-size: 0.85rem; color: #e2e8f0; font-weight: 500; letter-spacing: 0.02em; line-height: 1.5; }
        .bcc-kpi__spark { display: flex; align-items: flex-end; gap: 4px; height: 32px; margin: 0.35rem 0; }
        .bcc-kpi__spark-bar { flex: 1; border-radius: 2px; min-width: 8px; transition: height 0.3s; }
        .bcc-kpi__spark-line { display: flex; align-items: center; height: 32px; margin: 0.35rem 0; width: 100%; }
        .bcc-kpi__progress-wrap { display: flex; align-items: center; height: 32px; margin: 0.35rem 0; width: 100%; }
        .bcc-kpi__progress-bg { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; width: 100%; }
        .bcc-kpi__progress-fill { height: 100%; background: #06b6d4; border-radius: 3px; }

        /* ── Base Cards and Containers ───────────────────────────── */
        .bcc-card {
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
        .bcc-card__title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }
        .bcc-map-card {
          padding: 1.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
        }
        .bcc-map-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bcc-map-legend {
          display: flex;
          gap: 1.25rem;
        }
        .bcc-map-legend__item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #cbd5e1;
          letter-spacing: 0.02em;
          font-weight: 600;
        }
        .bcc-map-container {
          position: relative;
          height: 440px;
          border-radius: 12px;
          overflow: visible;
          background: transparent;
        }

        /* ── HUD Right Panel ─────────────────────────────────────── */
        .bcc-map-right-panel {
          position: absolute;
          right: 1.25rem;
          top: 1.25rem;
          bottom: 1.25rem;
          width: 310px;
          background: rgba(11, 14, 20, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          z-index: 20;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .bcc-map-right-panel--origens {
          border-color: rgba(6, 182, 212, 0.25);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 15px rgba(6, 182, 212, 0.1);
        }
        .bcc-map-right-panel--destinos {
          border-color: rgba(167, 139, 250, 0.25);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 15px rgba(167, 139, 250, 0.1);
        }
        .bcc-map-right-panel--moeda_operacao {
          border-color: rgba(251, 191, 36, 0.25);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 15px rgba(251, 191, 36, 0.1);
        }
        .bcc-map-panel__live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #06b6d4;
          box-shadow: 0 0 8px #06b6d4, 0 0 12px #06b6d4;
          animation: bfdLaserPulse 1.8s infinite alternate ease-in-out;
        }
        @keyframes bfdLaserPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
            box-shadow: 0 0 4px #06b6d4, 0 0 6px #06b6d4;
          }
          100% {
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 10px #06b6d4, 0 0 16px #06b6d4;
          }
        }
        .bcc-map-panel__modal-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .bcc-map-panel__modal-stat-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 0.4rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bcc-map-panel__modal-stat-lbl {
          font-size: 0.62rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .bcc-map-panel__modal-stat-num {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.01em;
        }
        .bcc-map-panel__header {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .bcc-map-panel__title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
        }
        .bcc-map-panel__subtitle {
          font-size: 0.75rem;
          color: #cbd5e1;
          letter-spacing: 0.015em;
        }
        .bcc-map-panel__tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 2px;
          gap: 2px;
        }
        .bcc-map-panel__tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #94a3b8;
          background: transparent;
          border: none;
          border-radius: 6px;
          padding: 6px 2px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bcc-map-panel__tab:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.03);
        }
        .bcc-map-panel__tab.is-active {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        .bcc-map-panel__tab.is-active.tab-origens {
          color: #06b6d4;
          border-color: rgba(6, 182, 212, 0.2);
          background: rgba(6, 182, 212, 0.08);
        }
        .bcc-map-panel__tab.is-active.tab-destinos {
          color: #a78bfa;
          border-color: rgba(167, 139, 250, 0.2);
          background: rgba(167, 139, 250, 0.08);
        }
        .bcc-map-panel__tab.is-active.tab-moeda_operacao {
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.2);
          background: rgba(251, 191, 36, 0.08);
        }
        
        .bcc-map-panel__list {
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-right: 0.25rem;
        }
        /* Custom scrollbar */
        .bcc-map-panel__list::-webkit-scrollbar {
          width: 4px;
        }
        .bcc-map-panel__list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .bcc-map-panel__list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .bcc-map-panel__list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .bcc-map-panel__row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.45rem 0.55rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }
        .bcc-map-panel__row.has-link {
          cursor: pointer;
        }
        .bcc-map-panel__row:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .bcc-map-panel__row.is-highlighted {
          background: rgba(6, 182, 212, 0.08);
          border-color: rgba(6, 182, 212, 0.25);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.15);
        }
        .bcc-map-panel__row.is-highlighted-dest {
          background: rgba(167, 139, 250, 0.08);
          border-color: rgba(167, 139, 250, 0.25);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.15);
        }
        
        .bcc-map-panel__rank {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .bcc-map-panel__rank--1 {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #ffffff;
          border: none;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.35);
        }
        .bcc-map-panel__rank--2 {
          background: linear-gradient(135deg, #94a3b8, #64748b);
          color: #ffffff;
          border: none;
          box-shadow: 0 0 8px rgba(148, 163, 184, 0.3);
        }
        .bcc-map-panel__rank--3 {
          background: linear-gradient(135deg, #b45309, #78350f);
          color: #ffffff;
          border: none;
          box-shadow: 0 0 8px rgba(180, 83, 9, 0.3);
        }
        
        .bcc-map-panel__row-flag {
          font-size: 1rem;
          line-height: 1;
        }
        
        .bcc-map-panel__info-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .bcc-map-panel__row-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .bcc-map-panel__row-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
        }
        
        .bcc-map-panel__row-stats {
          font-size: 0.72rem;
          font-weight: 600;
        }
        
        .bcc-map-panel__row-bar-wrap {
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1.5px;
          overflow: hidden;
          width: 100%;
        }
        .bcc-map-panel__row-bar-fill {
          height: 100%;
          border-radius: 1.5px;
          transition: width 0.5s ease-out;
        }

        .bcc-map-panel__modal-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 0.2rem 0;
        }
        .bcc-map-panel__modal-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .bcc-map-panel__modal-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .bcc-map-panel__modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bcc-map-panel__modal-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .bcc-map-panel__modal-count {
          font-size: 0.8rem;
          font-weight: 700;
        }
        .bcc-map-panel__modal-bar-wrap {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          overflow: hidden;
          width: 100%;
        }
        .bcc-map-panel__modal-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bcc-map-panel__modal-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: #cbd5e1;
          font-weight: 500;
        }
        .bcc-map-panel__terminal-list {
          overflow-y: auto;
          flex: 1;
        }
        .bcc-map-panel__terminal-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 0.55rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bcc-map-panel__terminal-item:hover, .bcc-map-panel__terminal-item.is-hovered {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateX(4px);
        }
        .bcc-map-panel__terminal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bcc-map-panel__terminal-name {
          font-size: 0.8rem;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .bcc-map-panel__terminal-flag {
          font-size: 0.95rem;
        }
        .bcc-map-panel__terminal-saving {
          font-size: 0.8rem;
          font-weight: 700;
          color: #06b6d4;
        }
        .bcc-map-panel__progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          overflow: hidden;
        }
        .bcc-map-panel__progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .bcc-map-panel__terminal-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #cbd5e1;
          font-weight: 500;
        }
        @media (max-width: 1023px) {
          .bcc-map-right-panel {
            display: none !important;
          }
        }
        .bcc-map-controls {
          position: absolute;
          bottom: 1.25rem;
          left: calc(50% - 120px);
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 30;
          transition: left 0.3s ease, transform 0.3s ease;
        }
        .bcc-map-control-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        .bcc-map-control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        @media (max-width: 1023px) {
          .bcc-map-controls {
            left: 50%;
          }
        }
        .bcc-map-bg {
          position: absolute; inset: 0;
          background-position: center; background-repeat: no-repeat;
          background-size: cover; opacity: 0.55; border-radius: 12px; pointer-events: none;
        }

        .bcc-map-pin-wrapper {
          position: absolute; transform: translate3d(-50%, -50%, 0); cursor: pointer; z-index: 10;
          will-change: transform;
        }
        .bcc-map-pin-wrapper.is-active { z-index: 100; }

        .bcc-map-pin__glow {
          position: absolute; inset: -8px; border-radius: 50%; border: 1.5px solid #06b6d4;
          opacity: 0; animation: pinPulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; pointer-events: none;
        }
        .bcc-map-pin__dot {
          width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; color: #000000; box-shadow: 0 0 10px rgba(6,182,212,0.4);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
        }
        .bcc-map-pin-wrapper:hover .bcc-map-pin__dot {
          transform: scale(1.2); box-shadow: 0 0 15px rgba(255,255,255,0.7);
        }
        .bcc-map-pin__icon-inner { display: flex; }
        .bcc-map-pin__icon-inner svg { width: 13px; height: 13px; }

        /* ── World Map Tooltip ───────────────────────────────────── */
        .bcc-map-tooltip {
          position: absolute; bottom: 36px; left: 50%; transform: translate3d(-50%, 0, 0);
          width: 290px; background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 1.1rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15);
          display: flex; flex-direction: column; gap: 0.8rem; pointer-events: none;
          animation: tooltipFadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .bcc-map-tooltip__after {
          content: ''; position: absolute; bottom: -6px; left: 50%; transform: translate3d(-50%, 0, 0) rotate(45deg);
          width: 10px; height: 10px; background: rgba(15, 23, 42, 0.94);
          border-right: 1px solid rgba(255, 255, 255, 0.12); border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .bcc-map-tooltip__header { display: flex; align-items: center; gap: 0.6rem; }
        .bcc-map-tooltip__flag { font-size: 1.25rem; }
        .bcc-map-tooltip__title-wrap { flex: 1; display: flex; flex-direction: column; }
        .bcc-map-tooltip__title { font-size: 0.95rem; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: 0.02em; }
        .bcc-map-tooltip__subtitle { font-size: 0.8rem; color: #cbd5e1; font-weight: 500; letter-spacing: 0.02em; }
        .bcc-map-tooltip__mode-icon { display: flex; align-items: center; }

        .bcc-map-tooltip__body {
          display: flex; flex-direction: column; gap: 0.5rem; padding: 0.6rem 0;
          border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .bcc-map-tooltip__stat { display: flex; justify-content: space-between; align-items: center; }
        .bcc-map-tooltip__stat-label { font-size: 0.8rem; color: #cbd5e1; font-weight: 500; letter-spacing: 0.02em; }
        .bcc-map-tooltip__stat-val { font-size: 0.82rem; font-weight: 700; color: #ffffff; letter-spacing: 0.025em; }

        .bcc-map-tooltip__footer { display: flex; justify-content: space-between; align-items: center; }
        .bcc-map-tooltip__supplier { font-size: 0.8rem; color: #cbd5e1; letter-spacing: 0.02em; }
        .bcc-map-tooltip__supplier strong { color: #ffffff; font-weight: 600; }
        
        @keyframes bfdBlink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .bcc-map-tooltip__hint {
          font-size: 0.72rem;
          color: #fbbf24;
          font-weight: 700;
          text-align: center;
          margin-top: 0.2rem;
          animation: bfdBlink 1.8s infinite;
          letter-spacing: 0.03em;
        }

        /* ── Premium Modal overlay ───────────────────────────────── */
        .bcc-moeda_operacao-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 10, 18, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: bfdModalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          padding: 1rem;
        }
        @keyframes bfdModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .bcc-moeda_operacao-card {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          background: rgba(15, 23, 42, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: bfdModalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes bfdModalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bcc-moeda_operacao-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bcc-moeda_operacao-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .bcc-moeda_operacao-flag-large {
          font-size: 2.2rem;
          line-height: 1;
        }
        .bcc-moeda_operacao-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .bcc-moeda_operacao-subtitle {
          font-size: 0.82rem;
          color: #cbd5e1;
          margin-top: 0.15rem;
          display: block;
          font-weight: 500;
        }
        .bcc-moeda_operacao-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bcc-moeda_operacao-close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          transform: rotate(90deg);
        }

        .bcc-moeda_operacao-body {
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .bcc-route-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .bcc-route-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        .bcc-route-card--maritimo {
          border-left: 3px solid #34d399;
        }
        .bcc-route-card--aereo {
          border-left: 3px solid #a78bfa;
        }

        .bcc-route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .bcc-route-ports {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .bcc-route-port-flag {
          font-size: 1.15rem;
        }
        .bcc-route-port-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
        }
        
        .bcc-route-arrow-icon {
          color: rgba(255, 255, 255, 0.4);
          font-weight: 700;
          font-size: 0.85rem;
        }
        
        .bcc-route-badge {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .bcc-route-badge--maritimo {
          background: rgba(52, 211, 153, 0.12);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .bcc-route-badge--aereo {
          background: rgba(167, 139, 250, 0.12);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.2);
        }

        .bcc-route-svg-container {
          margin: 0.25rem 0;
          width: 100%;
          height: 30px;
        }

        .bcc-route-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }
        .bcc-route-stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .bcc-route-stat-label {
          font-size: 0.68rem;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .bcc-route-stat-value {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
        }

        .bcc-moeda_operacao-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: flex-end;
          background: rgba(11, 15, 28, 0.5);
        }
        .bcc-moeda_operacao-close-action {
          padding: 0.5rem 1.25rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bcc-moeda_operacao-close-action:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* ── Globe Map + Câmbio Row ───────────────────────────────── */
        .bcc-globe-row {
          display: grid;
          grid-template-columns: 2.15fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 1200px) {
          .bcc-globe-row {
            grid-template-columns: 1fr;
          }
        }

        /* ── Charts Grid ─────────────────────────────────────────── */
        .bcc-charts-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 1.25rem; }
        .bcc-chart-svg { width: 100%; height: auto; }
        .bcc-chart__legend { display: flex; gap: 1.25rem; margin-top: auto; padding-top: 0.75rem; justify-content: center; }
        .bcc-chart__legend span { font-size: 0.85rem; color: #cbd5e1; letter-spacing: 0.02em; display: flex; align-items: center; gap: 8px; font-weight: 500; }
        .bcc-chart__legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .bcc-chart__subtitle { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.02em; text-align: right; margin-bottom: 0.5rem; font-weight: 500; }

        /* ── Column Chart Hovers ─────────────────────────────────── */
        .bcc-chart-bar-group {
          cursor: pointer;
          transform-origin: bottom;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bcc-chart-bar-group:hover {
          transform: translateY(-4px);
        }
        .bcc-chart-bar-group text {
          transition: fill 0.2s ease, font-size 0.2s ease;
        }
        .bcc-chart-bar-group:hover .bcc-chart-total-text {
          fill: #ffffff;
          font-weight: 800;
        }
        .bcc-chart-svg:has(.bcc-chart-bar-group:hover) .bcc-chart-bar-group:not(:hover) {
          opacity: 0.35;
        }

        /* ── Câmbio ──────────────────────────────────────────────── */
        .bcc-cambio { display: flex; flex-direction: column; gap: 0; margin-top: auto; }
        .bcc-cambio__row {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .bcc-cambio__row:last-child { border-bottom: none; }
        .bcc-cambio__code { font-size: 0.85rem; font-weight: 700; color: #ffffff; min-width: 44px; letter-spacing: 0.02em; }
        .bcc-cambio__val { font-size: 0.85rem; color: #cbd5e1; flex: 1; letter-spacing: 0.02em; font-weight: 600; }
        .bcc-cambio__var {
          font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; letter-spacing: 0.01em;
        }

        /* ── Insights Grid ───────────────────────────────────────── */
        .bcc-insights-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.25rem; }

        /* ── Melhor cotação ──────────────────────────────────────── */
        .bcc-best { display: flex; flex-direction: column; gap: 0.85rem; }
        .bcc-best__route { display: flex; align-items: center; justify-content: space-between; }
        .bcc-best__port { text-align: center; }
        .bcc-best__port-flag { font-size: 1.1rem; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; }
        .bcc-best__port-code { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 600; }
        .bcc-best__arrow { display: flex; align-items: center; gap: 0.25rem; color: #cbd5e1; flex: 1; justify-content: center; }
        .bcc-best__arrow-line { height: 1px; flex: 1; background: rgba(255,255,255,0.15); max-width: 120px; }
        .bcc-best__arrow-tt { font-size: 0.78rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 600; }
        .bcc-best__saving {
          display: flex; align-items: center; gap: 0.75rem;
        }
        .bcc-best__saving-badge {
          font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 6px;
          background: rgba(6, 182, 212, 0.12); color: #06b6d4; display: flex; align-items: center; gap: 4px;
          letter-spacing: 0.01em;
        }
        .bcc-best__saving-val { font-size: 1.45rem; font-weight: 800; color: #06b6d4; letter-spacing: 0.02em; }
        .bcc-best__meta { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 500; line-height: 1.5; }

        /* ── Donut ───────────────────────────────────────────────── */
        .bcc-donut { display: flex; align-items: center; gap: 1.75rem; }
        .bcc-donut__legend { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
        .bcc-donut__legend-row { display: flex; align-items: center; gap: 0.6rem; }
        .bcc-donut__legend-icon { color: #cbd5e1; display: flex; }
        .bcc-donut__legend-label { font-size: 0.85rem; color: #cbd5e1; min-width: 80px; letter-spacing: 0.02em; font-weight: 600; }
        .bcc-donut__legend-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .bcc-donut__legend-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
        .bcc-donut__legend-count { font-size: 0.88rem; font-weight: 700; min-width: 28px; text-align: right; color: #ffffff; }
        .bcc-donut__legend-pct { font-size: 0.82rem; color: #cbd5e1; min-width: 32px; text-align: right; letter-spacing: 0.02em; font-weight: 500; }

        /* ── Funil ───────────────────────────────────────────────── */
        .bcc-funil { display: flex; flex-direction: column; gap: 0.55rem; }
        .bcc-funil__row { display: flex; align-items: center; gap: 0.6rem; }
        .bcc-funil__label { font-size: 0.85rem; color: #cbd5e1; min-width: 155px; white-space: nowrap; letter-spacing: 0.02em; font-weight: 600; }
        .bcc-funil__bar-wrap { flex: 1; height: 14px; background: rgba(255,255,255,0.04); border-radius: 4px; overflow: hidden; }
        .bcc-funil__bar { height: 100%; border-radius: 4px; transition: width 0.4s; }
        .bcc-funil__count { font-size: 0.88rem; font-weight: 700; color: #ffffff; min-width: 24px; text-align: right; }
        .bcc-funil__pct { font-size: 0.82rem; color: #cbd5e1; min-width: 32px; text-align: right; letter-spacing: 0.02em; font-weight: 500; }

        /* ── Top Incoterms ───────────────────────────────────────── */
        .bcc-incoterms { display: flex; flex-direction: column; gap: 0.45rem; }
        .bcc-incoterms__row { display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0; }
        .bcc-incoterms__code { font-size: 0.88rem; font-weight: 700; color: #ffffff; letter-spacing: 0.03em; }
        .bcc-incoterms__count { font-size: 0.85rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 600; }

        /* ── Bottom Grid ─────────────────────────────────────────── */
        .bcc-bottom-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }

        /* ── Taxa ────────────────────────────────────────────────── */
        .bcc-taxa { display: flex; align-items: center; gap: 1.25rem; }
        .bcc-taxa__legend { display: flex; flex-direction: column; gap: 0.5rem; }
        .bcc-taxa__legend-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: #cbd5e1; font-weight: 600; letter-spacing: 0.02em; line-height: 1.5; }
        .bcc-taxa__dot { width: 8px; height: 8px; border-radius: 50%; }

        /* ── Alertas ─────────────────────────────────────────────── */
        .bcc-alertas { display: flex; flex-direction: column; gap: 0.85rem; }
        .bcc-alertas__nav { display: flex; align-items: center; gap: 0.6rem; justify-content: flex-end; margin-bottom: 0.5rem; }
        .bcc-alertas__nav button {
          background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; transition: color 0.15s;
        }
        .bcc-alertas__nav button:hover { color: #ffffff; }
        .bcc-alertas__nav span { font-size: 0.82rem; color: #cbd5e1; font-weight: 600; letter-spacing: 0.02em; }
        .bcc-alertas__pills { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .bcc-alertas__pill {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1rem;
          border-radius: 8px; font-size: 0.85rem; color: #cbd5e1; font-weight: 600; letter-spacing: 0.02em;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        }
        .bcc-alertas__pill-count { font-weight: 800; font-size: 0.9rem; }

        /* ── Footer ──────────────────────────────────────────────── */
        .bcc-footer { text-align: center; font-size: 0.8rem; color: #cbd5e1; padding: 0.75rem 0; opacity: 0.8; letter-spacing: 0.02em; font-weight: 500; }

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
          .bcc-kpi-grid { grid-template-columns: repeat(3, 1fr); }
          .bcc-charts-grid { grid-template-columns: 1fr; }
          .bcc-insights-grid { grid-template-columns: 1fr; }
          .bcc-bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .bcc-kpi-grid { grid-template-columns: repeat(1, 1fr); }
        }
      `}</style>


      {/* KPIs Grid (5 columns now) */}
      <div className="bcc-kpi-grid">
        <KpiCard
          icon={<Timer weight="duotone" size={18} />}
          label="Operações em aberto"
          value={String(kpis.operacoes_abertas)}
          badge="+5 semana"
          badgeColor="#06b6d4"
          sparkData={andamentoSpark}
          sparkType="line"
          sub={`USD ${fmtMoeda(kpis.valor_aberto_usd)} em aberto`}
        />
        <KpiCard
          icon={<TrendUp weight="duotone" size={18} />}
          label="Operações fechadas"
          value={String(kpis.operacoes_fechadas)}
          badge="+12% mes"
          badgeColor="#06b6d4"
          sparkData={DEMO_MENSAL_CAMBIO.map(d => d.fechadas)}
          sparkType="bar"
          destacado={true}
          sub={`USD ${fmtMoeda(kpis.valor_fechado_usd)} total`}
        />
        <KpiCard
          icon={<TrendUp weight="duotone" size={18} />}
          label="Saving medio"
          value={`${kpis.saving.media_saving_percentual}%`}
          badge="+2.3pp"
          badgeColor="#06b6d4"
          sparkData={savingSpark}
          sparkType="line"
          sub={`USD ${fmtMoeda(kpis.saving.total_saving_usd)} acumulado`}
        />
        <KpiCard
          icon={<Timer weight="duotone" size={18} />}
          label="Tempo medio resp."
          value="1.8 di."
          badge="-0.5d"
          badgeColor="#06b6d4"
          sparkType="progress"
          sub="Meta: 2 dias"
        />
      </div>

      {/* Row 2: Globe Map + Right Column (Alertas on top, Funil de Operações on bottom) */}
      <div className="bcc-globe-row">
        {/* Global World Map Overview Section */}
        <VisaoGeralMapa />

        {/* Right Column Stacking Alertas + Funil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', minHeight: 0 }}>
          {/* Alertas */}
          <div className="bcc-card bcc-alertas" style={{ flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span className="bcc-card__title" style={{ marginBottom: 0, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.02em' }}>Alertas</span>
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
                  glowColor = 'rgba(6, 182, 212, 0.15)'
                  textColor = '#06b6d4'
                  borderLeftColor = '#06b6d4'
                  itemBg = 'rgba(6, 182, 212, 0.04)'
                }

                return (
                  <div
                    key={i}
                    className="bcc-alertas__glow-card"
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
          <div className="bcc-card" style={{ flex: 1, padding: '1.25rem 1.5rem' }}>
            <span className="bcc-card__title" style={{ marginBottom: '1.05rem', fontSize: '1rem' }}>Funil de Operações</span>
            <FunilStatus />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="bcc-charts-grid">
        {/* Barras mensal */}
        <div className="bcc-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="bcc-card__title" style={{ marginBottom: 0 }}>Operações por Mês</span>
            <span className="bcc-chart__subtitle">Últimos 6 meses</span>
          </div>
          <GraficoBarrasMensalCambio />
          <div className="bcc-chart__legend">
            <span><span className="bcc-chart__legend-dot" style={{ background: '#06b6d4' }} /> Fechadas</span>
            <span><span className="bcc-chart__legend-dot" style={{ background: '#8b5cf6' }} /> Em andamento</span>
            <span><span className="bcc-chart__legend-dot" style={{ background: '#f87171' }} /> Canceladas</span>
          </div>
        </div>

        {/* Donut moeda */}
        <div className="bcc-card">
          <span className="bcc-card__title">Distribuição por Moeda</span>
          <GraficoDonutMoeda />
        </div>

        {/* Câmbio */}
        <div className="bcc-card" style={{ height: '100%', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="bcc-card__title" style={{ marginBottom: 0 }}>Câmbio do Dia</span>
            <TrendUp size={16} weight="bold" style={{ color: '#cbd5e1' }} />
          </div>
          <div className="bcc-cambio" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {kpis.moedas.map(m => (
              <div key={m.codigo} className="bcc-cambio__row" style={{ padding: '0.68rem 0' }}>
                <span className="bcc-cambio__code" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', minWidth: '44px' }}>{m.codigo}</span>
                <span className="bcc-cambio__val" style={{ fontSize: '0.85rem', color: '#cbd5e1', flex: 1, fontWeight: 600 }}>R$ {m.valor_brl.toFixed(2).replace('.', ',')}</span>
                <span
                  className="bcc-cambio__var"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
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
      </div>

      {/* Insights Row */}
      <div className="bcc-insights-grid">
        {/* Melhor operação */}
        <div className="bcc-card">
          <span className="bcc-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy weight="duotone" size={18} style={{ color: '#fbbf24' }} />Melhor Operação do Mês</span>
          <div className="bcc-best">
            <div className="bcc-best__route" style={{ margin: '0.35rem 0 0.75rem' }}>
              <div className="bcc-best__port">
                <div className="bcc-best__port-flag">🇺🇸</div>
                <div className="bcc-best__port-code">{DEMO_MELHOR_OPERACAO.origem}</div>
              </div>

              <div className="bcc-best__arrow" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 0.5rem' }}>
                <span className="bcc-best__arrow-tt" style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.02em', marginBottom: '4px', fontWeight: 500 }}>
                  {DEMO_MELHOR_OPERACAO.prazo}
                </span>
                <svg width="100%" height="20" viewBox="0 0 160 20" style={{ overflow: 'visible' }}>
                  <line x1="0" y1="10" x2="160" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4,4" />
                  <circle cx="80" cy="10" r="10" fill="rgba(6,182,212,0.15)" />
                  <circle cx="80" cy="10" r="3.5" fill="#06b6d4" />
                  <g transform="translate(73, 3)">
                    <ArrowsLeftRight size={14} weight="bold" style={{ color: '#06b6d4' }} />
                  </g>
                </svg>
              </div>

              <div className="bcc-best__port">
                <div className="bcc-best__port-flag">🇧🇷</div>
                <div className="bcc-best__port-code">{DEMO_MELHOR_OPERACAO.destino}</div>
              </div>
            </div>
            <div className="bcc-best__saving">
              <span className="bcc-best__saving-badge">
                <TrendUp size={12} /> {DEMO_MELHOR_OPERACAO.saving_pct}% saving
              </span>
              <span className="bcc-best__saving-val">USD {fmtMoeda(DEMO_MELHOR_OPERACAO.valor_saving)}</span>
            </div>
            <div className="bcc-best__meta">
              {DEMO_MELHOR_OPERACAO.referencia} | {DEMO_MELHOR_OPERACAO.corretora} | USD {fmtMoeda(DEMO_MELHOR_OPERACAO.valor_operacao)}
            </div>
          </div>
        </div>

        {/* Top Corretoras */}
        <div className="bcc-card">
          <span className="bcc-card__title">Top Corretoras</span>
          <div className="bcc-incoterms">
            {DEMO_TOP_CORRETORAS.map(cor => (
              <div key={cor.nome} className="bcc-incoterms__row" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.4rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="bcc-incoterms__code">{cor.nome}</span>
                  <span className="bcc-incoterms__count" style={{ fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>
                    {cor.count} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>({cor.pct}%)</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${cor.pct}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #0891b2)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bcc-bottom-grid">
        {/* Taxa aprovação */}
        <div className="bcc-card">
          <span className="bcc-card__title">Taxa de Resposta</span>
          <TaxaResposta />
        </div>
      </div>

      <div className="bcc-footer">
        ⚙ Dados demonstrativos — conecte o backend para dados reais
      </div>
    </div>
    </PaginaGlobal>
  )
}
