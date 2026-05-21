/**
 * Dashboard.tsx — Dashboard Premium do BID Frete
 *
 * Layout glassmorphism com KPIs + sparklines, gráficos SVG,
 * funil com percentuais, donut com progress bars, câmbio do dia.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import darkWorldMap from '../../public/dark_world_map.png'
import { useNavigate } from 'react-router-dom'
import { BotaoGlobal } from '@nucleo/botao-global'
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
} from '@phosphor-icons/react'

import { DEMO_KPIS, DEMO_CALENDARIO, DEMO_MENSAL, DEMO_MODAL, DEMO_MELHOR_COTACAO, DEMO_INCOTERMS } from '../shared/demo-data'
import { STATUS_LABELS, MODAL_LABELS } from '../shared/types'
import type { StatusCotacao } from '../shared/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const MODAL_ICONS: Record<string, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={16} />,
  AEREO: <AirplaneTilt weight="duotone" size={16} />,
  RODOVIARIO: <Truck weight="duotone" size={16} />,
}

// ─── Map Pin Data ──────────────────────────────────────────────────────────

interface MapPin {
  id: number
  label: string
  portCode: string
  country: string
  lat: number // Percentage from top (legacy)
  lng: number // Percentage from left (legacy)
  geoLat: number // Latitude (-90 to +90)
  geoLng: number // Longitude (-180 to +180)
  activeBids: number
  bestPrice: number
  savingPct: number
  mode: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  supplier: string
  flag: string
}

const MAP_PINS: MapPin[] = [
  {
    id: 1,
    label: 'Shanghai',
    portCode: 'CNSHA',
    country: 'China',
    lat: 40,
    lng: 82,
    geoLat: 31.2,
    geoLng: 121.5,
    activeBids: 12,
    bestPrice: 80480,
    savingPct: 23.4,
    mode: 'MARITIMO',
    supplier: 'Paclcffic Cargo (E96)',
    flag: '🇨🇳'
  },
  {
    id: 2,
    label: 'Santos',
    portCode: 'BRSSZ',
    country: 'Brasil',
    lat: 74,
    lng: 39,
    geoLat: -23.9,
    geoLng: -46.3,
    activeBids: 8,
    bestPrice: 18200,
    savingPct: 19.1,
    mode: 'MARITIMO',
    supplier: 'Transatlantico SA',
    flag: '🇧🇷'
  },
  {
    id: 3,
    label: 'Rotterdam',
    portCode: 'NLRTM',
    country: 'Holanda',
    lat: 28,
    lng: 50,
    geoLat: 51.9,
    geoLng: 4.5,
    activeBids: 15,
    bestPrice: 24500,
    savingPct: 21.0,
    mode: 'MARITIMO',
    supplier: 'EuroFreight Corp',
    flag: '🇳🇱'
  },
  {
    id: 4,
    label: 'Miami',
    portCode: 'USMIA',
    country: 'EUA',
    lat: 44,
    lng: 29,
    geoLat: 25.8,
    geoLng: -80.2,
    activeBids: 5,
    bestPrice: 8400,
    savingPct: 15.6,
    mode: 'AEREO',
    supplier: 'Delta Cargo',
    flag: '🇺🇸'
  },
  {
    id: 5,
    label: 'Singapore',
    portCode: 'SGSIN',
    country: 'Singapura',
    lat: 56,
    lng: 78,
    geoLat: 1.35,
    geoLng: 103.8,
    activeBids: 9,
    bestPrice: 15300,
    savingPct: 18.8,
    mode: 'MARITIMO',
    supplier: 'Merlion Shipping',
    flag: '🇸🇬'
  },
  {
    id: 6,
    label: 'Los Angeles',
    portCode: 'USLAX',
    country: 'EUA',
    lat: 38,
    lng: 15,
    geoLat: 34.05,
    geoLng: -118.24,
    activeBids: 6,
    bestPrice: 12100,
    savingPct: 14.5,
    mode: 'MARITIMO',
    supplier: 'PacAnchor Logistics',
    flag: '🇺🇸'
  },
  {
    id: 7,
    label: 'Frankfurt',
    portCode: 'DEFRA',
    country: 'Alemanha',
    lat: 31,
    lng: 52,
    geoLat: 50.11,
    geoLng: 8.68,
    activeBids: 4,
    bestPrice: 7200,
    savingPct: 12.2,
    mode: 'AEREO',
    supplier: 'Lufthansa Cargo',
    flag: '🇩🇪'
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
    <div className={`bfd-kpi ${destacado ? 'bfd-kpi--destacado' : ''}`}>
      <div className="bfd-kpi__header">
        <span className="bfd-kpi__icon" style={{ color: destacado ? '#52d69b' : '#cbd5e1' }}>{icon}</span>
        <span className="bfd-kpi__label" style={{ color: destacado ? '#ffffff' : '#94a3b8' }}>{label}</span>
      </div>
      <div className="bfd-kpi__row">
        <span className="bfd-kpi__value" style={{ color: destacado ? '#ffffff' : '#ffffff' }}>{value}</span>
        {badge && (
          <span
            className="bfd-kpi__badge"
            style={{
              color: destacado ? '#ffffff' : (badgeColor || '#34d399'),
              background: destacado ? 'rgba(82,214,155,0.25)' : 'rgba(52,211,153,0.12)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      
      {sparkData && sparkType === 'bar' && (
        <div className="bfd-kpi__spark">
          {sparkData.map((d, i) => (
            <div
              key={i}
              className="bfd-kpi__spark-bar"
              style={{
                height: `${(d / maxSpark) * 100}%`,
                background: destacado ? '#52d69b' : `rgba(99,91,255,${0.3 + (i / sparkData.length) * 0.7})`,
              }}
            />
          ))}
        </div>
      )}

      {sparkData && sparkType === 'line' && (
        <div className="bfd-kpi__spark-line">
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
                  <linearGradient id="sparkline-grad-green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#52d69b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#52d69b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={fillPath} fill="url(#sparkline-grad-green)" />
                <path d={linePath} fill="none" stroke="#52d69b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )
          })()}
        </div>
      )}

      {sparkType === 'progress' && (
        <div className="bfd-kpi__progress-wrap">
          <div className="bfd-kpi__progress-bg">
            <div className="bfd-kpi__progress-fill" style={{ width: '80%' }} />
          </div>
        </div>
      )}

      <span className="bfd-kpi__sub" style={{ color: destacado ? '#ffffff' : '#cbd5e1' }}>{sub}</span>
    </div>
  )
}

// ─── Gráfico de Barras Mensal (SVG) ─────────────────────────────────────────

function GraficoBarrasMensal() {
  const W = 520
  const H = 280
  const pad = { top: 35, right: 15, bottom: 40, left: 15 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const barW = innerW / DEMO_MENSAL.length
  
  // We set maxVal a bit higher than the tallest total (51) to leave elegant spacing at the top
  const maxVal = 56

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bfd-chart-svg" style={{ overflow: 'visible' }}>
      {DEMO_MENSAL.map((d, i) => {
        const total = d.aprovadas + d.andamento + d.recusadas
        const x = pad.left + i * barW + barW * 0.15
        const w = barW * 0.7
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
          <g key={i} className="bfd-chart-bar-group">
            {/* Top Segment: Mint Green Capsule */}
            <rect
              x={x}
              y={yTopSeg}
              width={w}
              height={hTopDraw}
              rx={6}
              ry={6}
              fill="#52d69b"
            />
            
            {/* Middle Segment: Slate Blue Rect */}
            <rect
              x={x}
              y={yMidSeg}
              width={w}
              height={hMidDraw}
              fill="#568cb8"
            />
            
            {/* Bottom Segment: Rose Red Rounded Bottom */}
            <path
              d={botPath}
              fill="#a26b6b"
            />
            
            {/* Total value text above the bar */}
            <text
              x={x + w / 2}
              y={yTop - 10}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="16"
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
              fill="#94a3b8"
              fontSize="14"
              fontWeight="500"
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
          <div key={m.modal} className="bfd-donut__legend-row">
            <span className="bfd-donut__legend-icon" style={{ color: m.cor }}>{MODAL_ICONS[m.modal]}</span>
            <span className="bfd-donut__legend-label">{MODAL_LABELS[m.modal as keyof typeof MODAL_LABELS] ?? m.modal}</span>
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

// ─── Funil ──────────────────────────────────────────────────────────────────

function FunilStatus() {
  const localFunil = [
    { label: 'Draft', count: 5, color: '#94a3b8' },
    { label: 'Resurit ae fornecedor', count: 8, color: '#60a5fa' },
    { label: 'Aprovacao', count: 12, color: '#818cf8' },
    { label: 'Aprovacao pendente', count: 7, color: '#fbbf24' },
    { label: 'Recvede', count: 42, color: '#34d399' },
    { label: 'Aprovada', count: 6, color: '#f87171' },
    { label: 'Esploda', count: 3, color: '#64748b' },
  ]
  const total = localFunil.reduce((s, f) => s + f.count, 0)
  const maxCount = Math.max(...localFunil.map(f => f.count))
  
  return (
    <div className="bfd-funil">
      {localFunil.map(f => {
        const pct = total ? Math.round((f.count / total) * 100) : 0
        const barW = maxCount ? (f.count / maxCount) * 100 : 0
        return (
          <div key={f.label} className="bfd-funil__row">
            <span className="bfd-funil__label">{f.label}</span>
            <div className="bfd-funil__bar-wrap">
              <div
                className="bfd-funil__bar"
                style={{ width: `${barW}%`, background: f.color }}
              />
            </div>
            <span className="bfd-funil__count">{f.count}</span>
            <span className="bfd-funil__pct">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Taxa Aprovação (donut) ──────────────────────────────────────────────────

function TaxaAprovacao() {
  const { percentual_em_tempo, percentual_atraso, nao_respondidas } = DEMO_KPIS.aprovacao
  const cx = 55
  const cy = 55
  const r = 42
  const stroke = 10
  const circ = 2 * Math.PI * r

  const segments = [
    { pct: percentual_em_tempo, cor: '#34d399', label: `Em tempo: ${percentual_em_tempo}%` },
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

// ─── 3D Globe Helpers & Data ────────────────────────────────────────────────

// Geographic bounds checker to approximate continent layouts for tech grid points
function isLand(lat: number, lng: number): boolean {
  // Antarctica
  if (lat < -60) return true
  
  // South America
  if (lat > -56 && lat < 12 && lng > -82 && lng < -34) {
    if (lat > 5 && lng > -50) return false
    return true
  }
  
  // North America
  if (lat >= 12 && lat < 72 && lng > -170 && lng < -50) {
    if (lat < 20 && lng > -90 && lng < -80) return true
    if (lat < 30 && lng > -80) return false
    return true
  }
  
  // Africa
  if (lat > -35 && lat < 37 && lng > -18 && lng < 51) {
    if (lat > 20 && lng < -10) return false
    if (lat > 10 && lat < 30 && lng > 35) return false
    return true
  }
  
  // Eurasia (Europe + Asia)
  if (lat > 5 && lat < 75 && lng > -20 && lng < 180) {
    if (lat < 10 && lng > 95 && lng < 142) return true
    if (lat < 35 && lng < 45) {
      if (lng > 35) return true
      return false 
    }
    if (lat < 10 && lng < 95) return false
    return true
  }
  
  // Australia
  if (lat > -45 && lat < -10 && lng > 113 && lng < 155) {
    return true
  }
  
  // Greenland
  if (lat > 60 && lat < 83 && lng > -73 && lng < -10) {
    return true
  }
  
  // Madagascar
  if (lat > -26 && lat < -12 && lng > 43 && lng < 51) {
    return true
  }

  // Japan
  if (lat > 30 && lat < 45 && lng > 130 && lng < 146) {
    return true
  }

  // Great Britain & Ireland
  if (lat > 50 && lat < 60 && lng > -10 && lng < 2) {
    return true
  }

  // New Zealand
  if (lat > -47 && lat < -34 && lng > 166 && lng < 179) {
    return true
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
}

const GLOBE_ROUTES: ArcRoute[] = [
  { fromId: 1, toId: 2, color: 'rgba(82, 214, 155, 0.8)' }, // Shanghai -> Santos (maritime green)
  { fromId: 1, toId: 6, color: 'rgba(82, 214, 155, 0.8)' }, // Shanghai -> Los Angeles (maritime green)
  { fromId: 3, toId: 2, color: 'rgba(82, 214, 155, 0.8)' }, // Rotterdam -> Santos (maritime green)
  { fromId: 5, toId: 3, color: 'rgba(82, 214, 155, 0.8)' }, // Singapore -> Rotterdam (maritime green)
  { fromId: 4, toId: 7, color: 'rgba(167, 139, 250, 0.8)' }, // Miami -> Frankfurt (air purple)
  { fromId: 6, toId: 4, color: 'rgba(167, 139, 250, 0.8)' }, // Los Angeles -> Miami (air purple)
]

// ─── Visão Geral Global (Globo 3D Interativo Premium) ───────────────────────────

function VisaoGeralMapa() {
  const [hoveredPin, setHoveredPin] = useState<number | null>(null)
  
  // State for React overlays
  const [projectedPins, setProjectedPins] = useState<(MapPin & { px: number; py: number; opacity: number })[]>([])
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Dragging and Rotation state refs
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0.28, y: -1.25 }) // Starting rotation to show continents nicely
  const velocityRef = useRef({ x: 0, y: 0 })
  
  // Generate 1400 Fibonacci points on the sphere as dynamic fallback
  const samples = 1400
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

  // State for loaded real world map points from image texture
  const [worldPoints, setWorldPoints] = useState<{ x: number; y: number; z: number }[]>([])
  
  useEffect(() => {
    const img = new Image()
    img.src = darkWorldMap
    img.onload = () => {
      const scanW = 180
      const scanH = 90
      const offscreen = document.createElement('canvas')
      offscreen.width = scanW
      offscreen.height = scanH
      const octx = offscreen.getContext('2d')
      if (!octx) return
      
      octx.imageSmoothingEnabled = true
      octx.drawImage(img, 0, 0, scanW, scanH)
      const imgData = octx.getImageData(0, 0, scanW, scanH)
      const data = imgData.data
      
      const pts: { x: number; y: number; z: number }[] = []
      
      for (let y = 0; y < scanH; y++) {
        for (let x = 0; x < scanW; x++) {
          const idx = (y * scanW + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const val = (r + g + b) / 3
          
          if (val > 50) {
            const lng = (x / scanW) * 360 - 180
            const lat = 90 - (y / scanH) * 180
            
            const radLat = (lat * Math.PI) / 180
            const radLng = (lng * Math.PI) / 180
            
            pts.push({
              x: Math.cos(radLat) * Math.sin(radLng),
              y: Math.sin(radLat),
              z: Math.cos(radLat) * Math.cos(radLng),
            })
          }
        }
      }
      setWorldPoints(pts)
    }
  }, [])

  const activePoints = useMemo(() => {
    return worldPoints.length > 0 ? worldPoints : fibonacciPoints
  }, [worldPoints, fibonacciPoints])
  
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
      
      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) * 0.42
      const pulseTime = Date.now() / 2400
      
      // Physics: inertially decay dragging or add auto-rotation
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.0012 // slow auto-rotate Y
        rotationRef.current.x += (0.28 - rotationRef.current.x) * 0.03 // gently spring-tilt X to 0.28 rad
        
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
      
      // 1. Draw Deep Space Background Glow Behind Globe
      const bgGlow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.3)
      bgGlow.addColorStop(0, 'rgba(16, 28, 48, 0.45)')
      bgGlow.addColorStop(0.5, 'rgba(82, 214, 155, 0.03)')
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
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
        
        // Depth check: z2 > 0 is back, z2 <= 0 is front
        if (rz2 > 0) {
          // Subtle dots for the back hemisphere
          ctx.fillStyle = 'rgba(82, 214, 155, 0.08)'
          ctx.fillRect(sx - 0.4, sy - 0.4, 0.8, 0.8)
        } else {
          // Bright neon dots for the front hemisphere
          const normalizedDepth = Math.max(0, Math.min(1, (rz2 + 1) / 1)) // 1 at front, 0 at edge
          ctx.fillStyle = `rgba(82, 214, 155, ${0.15 + normalizedDepth * 0.55})`
          const size = 1.1 + normalizedDepth * 0.7
          ctx.beginPath()
          ctx.arc(sx, sy, size, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      
      // 4. Draw Atmospheric Cyber Glass Rim Glow & Futuristic Holographic Ring
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(82, 214, 155, 0.2)'
      ctx.strokeStyle = 'rgba(82, 214, 155, 0.18)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0 // Reset
      
      // Fine-lined rotating futuristic coordinates ring (outer tech orbit)
      ctx.strokeStyle = 'rgba(82, 214, 155, 0.12)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 15])
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.08, pulseTime * 0.15, pulseTime * 0.15 + Math.PI * 2)
      ctx.stroke()
      
      // Secondary reverse-rotating orbit
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.1)'
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
          const height = 1 + 0.16 * Math.sin(t * Math.PI)
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
        const isBack = avgDepth > 0.05
        ctx.strokeStyle = route.color
        ctx.lineWidth = isBack ? 0.75 : 1.5
        ctx.globalAlpha = isBack ? 0.08 : 0.45
        
        ctx.beginPath()
        ctx.moveTo(pathPoints[0].sx, pathPoints[0].sy)
        for (let j = 1; j < pathPoints.length; j++) {
          ctx.lineTo(pathPoints[j].sx, pathPoints[j].sy)
        }
        ctx.stroke()
        ctx.globalAlpha = 1.0 // Reset
        
        // Draw cargo moving pulse with beautiful fading neon trails (comet effect)
        if (!isBack) {
          const tPulse = (pulseTime + routeIdx * 0.22) % 1.0
          const rawIdx = tPulse * segmentsCount
          
          // Draw trail
          const trailLength = 6
          for (let k = trailLength - 1; k >= 0; k--) {
            const currentRawIdx = rawIdx - k * 0.7
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
              
              if (pulseDepth <= 0.15) {
                const trailRatio = 1 - k / trailLength // 1 for head, 0 for tail end
                const size = 1.0 + trailRatio * 1.5 // Head is 2.5px, tail goes down to 1px
                const opacity = trailRatio * 0.9 // Head is bright, tail fades out
                
                ctx.beginPath()
                ctx.arc(pulseSx, pulseSy, size, 0, Math.PI * 2)
                
                if (k === 0) {
                  ctx.fillStyle = '#ffffff'
                  ctx.shadowBlur = 10
                  ctx.shadowColor = route.color === 'rgba(167, 139, 250, 0.8)' ? '#c084fc' : '#34d399'
                } else {
                  ctx.fillStyle = route.color.replace('0.8', (opacity * 0.85).toString())
                  ctx.shadowBlur = 0
                }
                
                ctx.globalAlpha = opacity
                ctx.fill()
                ctx.shadowBlur = 0
                ctx.globalAlpha = 1.0 // Reset
              }
            }
          }
        }
      })
      
      // 6. Project and Slipped-In Map Pins Overlay Coordinates
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
        
        const opacity = rz2 > 0.15 ? 0 : Math.max(0, Math.min(1, 1 - (rz2 + 0.15) / 0.3))
        
        return {
          ...pin,
          px: sx,
          py: sy,
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
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    velocityRef.current = { x: 0, y: 0 }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    
    rotationRef.current.y += dx * 0.0055
    rotationRef.current.x += dy * 0.0055
    rotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationRef.current.x))
    
    velocityRef.current.y = dx * 0.0055
    velocityRef.current.x = dy * 0.0055
    
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }
  
  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
  }
  
  // Mobile Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return
    isDraggingRef.current = true
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    velocityRef.current = { x: 0, y: 0 }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    
    rotationRef.current.y += dx * 0.0055
    rotationRef.current.x += dy * 0.0055
    rotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationRef.current.x))
    
    velocityRef.current.y = dx * 0.0055
    velocityRef.current.x = dy * 0.0055
    
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  
  return (
      <div className="bfd-card bfd-map-card">
      <div className="bfd-map-card__header">
        <div>
          <span className="bfd-card__title" style={{ marginBottom: '0.4rem', display: 'block', fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>Visão Geral Global de Cotações</span>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 400, letterSpacing: '0.015em', lineHeight: 1.5 }}>Localizações estratégicas, bids ativos e saving acumulado por terminal (Arrastar para Girar)</span>
        </div>
        <div className="bfd-map-legend">
          <span className="bfd-map-legend__item">
            <span className="bfd-map-legend__dot bfd-map-legend__dot--maritimo" /> Marítimo
          </span>
          <span className="bfd-map-legend__item">
            <span className="bfd-map-legend__dot bfd-map-legend__dot--aereo" /> Aéreo
          </span>
        </div>
      </div>
      
      <div 
        className="bfd-map-container"
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
        
        {/* Dynamic HTML Overlay Pins */}
        {projectedPins.map(pin => {
          if (pin.opacity <= 0.05) return null
          
          const isHovered = hoveredPin === pin.id
          const Icon = MODAL_ICONS[pin.mode] || <Anchor size={12} />
          
          return (
            <div
              key={pin.id}
              className={`bfd-map-pin-wrapper ${isHovered ? 'is-active' : ''}`}
              style={{ 
                top: `${pin.py}px`, 
                left: `${pin.px}px`,
                opacity: pin.opacity,
                pointerEvents: pin.opacity < 0.65 ? 'none' : 'auto'
              }}
              onMouseEnter={() => setHoveredPin(pin.id)}
              onMouseLeave={() => setHoveredPin(null)}
            >
              {/* Outer pulsing ring */}
              <div className="bfd-map-pin__glow" style={{ borderColor: pin.mode === 'AEREO' ? '#a78bfa' : '#52d69b' }} />
              
              {/* Glowing pin dot */}
              <div className="bfd-map-pin__dot" style={{ backgroundColor: pin.mode === 'AEREO' ? '#a78bfa' : '#52d69b' }}>
                <span className="bfd-map-pin__icon-inner">{Icon}</span>
              </div>
              
              {/* Tooltip */}
              {isHovered && pin.opacity > 0.7 && (
                <div className="bfd-map-tooltip">
                  <div className="bfd-map-tooltip__header">
                    <span className="bfd-map-tooltip__flag">{pin.flag}</span>
                    <div className="bfd-map-tooltip__title-wrap">
                      <span className="bfd-map-tooltip__title">{pin.label}</span>
                      <span className="bfd-map-tooltip__subtitle">{pin.portCode} • {pin.country}</span>
                    </div>
                    <span className="bfd-map-tooltip__mode-icon" style={{ color: pin.mode === 'AEREO' ? '#a78bfa' : '#52d69b' }}>
                      {Icon}
                    </span>
                  </div>
                  
                  <div className="bfd-map-tooltip__body">
                    <div className="bfd-map-tooltip__stat">
                      <span className="bfd-map-tooltip__stat-label">Bids Ativos</span>
                      <span className="bfd-map-tooltip__stat-val">{pin.activeBids} cotações</span>
                    </div>
                    <div className="bfd-map-tooltip__stat">
                      <span className="bfd-map-tooltip__stat-label">Melhor Preço</span>
                      <span className="bfd-map-tooltip__stat-val" style={{ color: '#ffffff' }}>
                        USD {fmtMoeda(pin.bestPrice)}
                      </span>
                    </div>
                    <div className="bfd-map-tooltip__stat">
                      <span className="bfd-map-tooltip__stat-label">Saving Médio</span>
                      <span className="bfd-map-tooltip__stat-val" style={{ color: '#52d69b', fontWeight: 700 }}>
                        +{pin.savingPct}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bfd-map-tooltip__footer">
                    <span className="bfd-map-tooltip__supplier">
                      Forn: <strong>{pin.supplier}</strong>
                    </span>
                  </div>
                  <div className="bfd-map-tooltip__after" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const kpis = DEMO_KPIS
  const alertas = DEMO_CALENDARIO
  const andamentoSpark = [12, 14, 18, 15, 20, 22, 25]
  const savingSpark = [15, 18, 16, 21, 19, 23, 24]

  return (
    <div className="bfd-dashboard">
      <style>{`
        .bfd-dashboard {
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
        .bfd-header__actions { display: flex; align-items: center; gap: 0.75rem; }
        .bfd-header__icon-btn {
          width: 38px; height: 38px; border-radius: 8px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); color: #cbd5e1;
          transition: all 0.2s;
        }
        .bfd-header__icon-btn:hover { background: rgba(255,255,255,0.12); color: #ffffff; }

        /* ── KPI Grid ────────────────────────────────────────────── */
        .bfd-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; }
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
          border: 1px solid #52d69b !important;
          background: rgba(82, 214, 155, 0.08) !important;
          box-shadow: 0 0 18px rgba(82, 214, 155, 0.15);
        }
        .bfd-kpi--destacado:hover {
          background: rgba(82, 214, 155, 0.12) !important;
          box-shadow: 0 0 24px rgba(82, 214, 155, 0.25);
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
        .bfd-kpi__progress-fill { height: 100%; background: #52d69b; border-radius: 3px; }

        /* ── Card genérico ───────────────────────────────────────── */
        .bfd-card {
          background: rgba(255,255,255,0.04); border-radius: 14px; padding: 1.5rem 1.75rem;
          border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column;
        }
        .bfd-card__title { font-size: 1.1rem; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; margin-bottom: 1.25rem; line-height: 1.4; }

        /* ── World Map Card ──────────────────────────────────────── */
        .bfd-map-card { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .bfd-map-card__header { display: flex; justify-content: space-between; align-items: center; }
        .bfd-map-legend { display: flex; gap: 1.25rem; }
        .bfd-map-legend__item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #e2e8f0; letter-spacing: 0.02em; font-weight: 600; }
        .bfd-map-legend__dot { width: 9px; height: 9px; border-radius: 50%; }
        .bfd-map-legend__dot--maritimo { background: #52d69b; }
        .bfd-map-legend__dot--aereo { background: #a78bfa; }

        .bfd-map-container {
          position: relative; height: 380px; border-radius: 12px; overflow: visible;
          border: 1px solid rgba(255,255,255,0.06); background: #0b0e14;
        }
        .bfd-map-bg {
          position: absolute; inset: 0;
          background-position: center; background-repeat: no-repeat;
          background-size: cover; opacity: 0.55; border-radius: 12px; pointer-events: none;
        }

        .bfd-map-pin-wrapper {
          position: absolute; transform: translate3d(-50%, -50%, 0); cursor: pointer; z-index: 10;
          will-change: transform;
        }
        .bfd-map-pin-wrapper.is-active { z-index: 100; }

        .bfd-map-pin__glow {
          position: absolute; inset: -8px; border-radius: 50%; border: 1.5px solid #52d69b;
          opacity: 0; animation: pinPulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; pointer-events: none;
        }
        .bfd-map-pin__dot {
          width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; color: #000000; box-shadow: 0 0 10px rgba(82,214,155,0.4);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
        }
        .bfd-map-pin-wrapper:hover .bfd-map-pin__dot {
          transform: scale(1.2); box-shadow: 0 0 15px rgba(255,255,255,0.7);
        }
        .bfd-map-pin__icon-inner { display: flex; }
        .bfd-map-pin__icon-inner svg { width: 13px; height: 13px; }

        /* ── World Map Tooltip ───────────────────────────────────── */
        .bfd-map-tooltip {
          position: absolute; bottom: 36px; left: 50%; transform: translate3d(-50%, 0, 0);
          width: 280px; background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 12px; padding: 1.1rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.2);
          display: flex; flex-direction: column; gap: 0.8rem; pointer-events: none;
          animation: tooltipFadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .bfd-map-tooltip__after {
          content: ''; position: absolute; bottom: -6px; left: 50%; transform: translate3d(-50%, 0, 0) rotate(45deg);
          width: 10px; height: 10px; background: rgba(15, 23, 42, 0.96);
          border-right: 1px solid rgba(255, 255, 255, 0.16); border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }

        .bfd-map-tooltip__header { display: flex; align-items: center; gap: 0.6rem; }
        .bfd-map-tooltip__flag { font-size: 1.25rem; }
        .bfd-map-tooltip__title-wrap { flex: 1; display: flex; flex-direction: column; }
        .bfd-map-tooltip__title { font-size: 0.95rem; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: 0.02em; }
        .bfd-map-tooltip__subtitle { font-size: 0.8rem; color: #cbd5e1; font-weight: 500; letter-spacing: 0.02em; }
        .bfd-map-tooltip__mode-icon { display: flex; align-items: center; }

        .bfd-map-tooltip__body {
          display: flex; flex-direction: column; gap: 0.5rem; padding: 0.6rem 0;
          border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .bfd-map-tooltip__stat { display: flex; justify-content: space-between; align-items: center; }
        .bfd-map-tooltip__stat-label { font-size: 0.8rem; color: #cbd5e1; font-weight: 500; letter-spacing: 0.02em; }
        .bfd-map-tooltip__stat-val { font-size: 0.82rem; font-weight: 700; color: #ffffff; letter-spacing: 0.025em; }

        .bfd-map-tooltip__footer { display: flex; justify-content: space-between; align-items: center; }
        .bfd-map-tooltip__supplier { font-size: 0.8rem; color: #cbd5e1; letter-spacing: 0.02em; }
        .bfd-map-tooltip__supplier strong { color: #ffffff; font-weight: 600; }

        /* ── Charts Grid ─────────────────────────────────────────── */
        .bfd-charts-grid { display: grid; grid-template-columns: 1.3fr 1fr 0.8fr; gap: 1.25rem; }
        .bfd-chart-svg { width: 100%; height: auto; }
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
        .bfd-cambio { display: flex; flex-direction: column; gap: 0; margin-top: auto; }
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
        .bfd-insights-grid { display: grid; grid-template-columns: 1.1fr 1.2fr 0.7fr; gap: 1.25rem; }

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
          background: rgba(52,211,153,0.12); color: #34d399; display: flex; align-items: center; gap: 4px;
          letter-spacing: 0.01em;
        }
        .bfd-best__saving-val { font-size: 1.45rem; font-weight: 800; color: #52d69b; letter-spacing: 0.02em; }
        .bfd-best__meta { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.02em; font-weight: 500; line-height: 1.5; }

        /* ── Donut ───────────────────────────────────────────────── */
        .bfd-donut { display: flex; align-items: center; gap: 1.75rem; }
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
        .bfd-bottom-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1.25rem; }

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

      {/* Header */}
      <div className="bfd-header">
        <div className="bfd-header__left">
          <h1>Dashboard BID Frete</h1>
          <p>Visão geral das cotações de frete</p>
        </div>
        <div className="bfd-header__actions">
          <button className="bfd-header__icon-btn" title="Exportar"><Export weight="bold" size={18} /></button>
          <button className="bfd-header__icon-btn" title="Download"><DownloadSimple weight="bold" size={18} /></button>
        </div>
      </div>

      {/* KPIs Grid (5 columns now) */}
      <div className="bfd-kpi-grid">
        <KpiCard
          icon={<Timer weight="duotone" size={18} />}
          label="Em andamento"
          value={String(kpis.cotacoes_andamento)}
          badge="+3 semana"
          badgeColor="#52d69b"
          sparkData={andamentoSpark}
          sparkType="line"
          sub={`USD ${fmtMoeda(kpis.valor_andamento_usd)} em aberto`}
        />
        <KpiCard
          icon={<TrendUp weight="duotone" size={18} />}
          label="Aprovadas"
          value={String(kpis.cotacoes_passadas)}
          badge="+12% mes"
          badgeColor="#52d69b"
          sparkData={DEMO_MENSAL.map(d => d.aprovadas)}
          sparkType="bar"
          destacado={true}
          sub={`USD ${fmtMoeda(kpis.valor_aprovado_usd)} total`}
        />
        <KpiCard
          icon={<TrendUp weight="duotone" size={18} />}
          label="Saving medio"
          value={`${kpis.savings.media_saving_percentual}%`}
          badge="+2.3pp"
          badgeColor="#52d69b"
          sparkData={savingSpark}
          sparkType="line"
          sub={`USD ${fmtMoeda(kpis.savings.total_saving_usd)} acumulado`}
        />
        <KpiCard
          icon={<Timer weight="duotone" size={18} />}
          label="Tempo medio resp."
          value="2.4 di."
          badge="-0.8d"
          badgeColor="#52d69b"
          sparkType="progress"
          sub="Meta: 3 dias"
        />

        {/* 5th Column: Blue "Buscar frete" Action Card */}
        <div
          className="bfd-kpi bfd-kpi--action"
          onClick={() => navigate('/produto/bid-frete/cotacoes/nova')}
          style={{
            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <MagnifyingGlass weight="bold" size={22} />
          </div>
          <span style={{
            fontSize: '0.92rem',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '0.02em',
            marginTop: '0.25rem'
          }}>
            Buscar frete
          </span>
        </div>
      </div>

      {/* Global World Map Overview Section */}
      <VisaoGeralMapa />

      {/* Charts Row */}
      <div className="bfd-charts-grid">
        {/* Barras mensal */}
        <div className="bfd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="bfd-card__title" style={{ marginBottom: 0 }}>Cotações por Mês</span>
            <span className="bfd-chart__subtitle">Últimos 6 meses</span>
          </div>
          <GraficoBarrasMensal />
          <div className="bfd-chart__legend">
            <span><span className="bfd-chart__legend-dot" style={{ background: '#52d69b' }} /> Aprovadas</span>
            <span><span className="bfd-chart__legend-dot" style={{ background: '#568cb8' }} /> Em andamento</span>
            <span><span className="bfd-chart__legend-dot" style={{ background: '#a26b6b' }} /> Recusadas</span>
          </div>
        </div>

        {/* Donut modal */}
        <div className="bfd-card">
          <span className="bfd-card__title">Distribuição por Modal</span>
          <GraficoDonutModal />
        </div>

        {/* Câmbio */}
        <div className="bfd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="bfd-card__title" style={{ marginBottom: 0 }}>Câmbio do Dia</span>
            <TrendUp size={16} weight="bold" style={{ color: '#cbd5e1' }} />
          </div>
          <div className="bfd-cambio">
            {kpis.moedas.map(m => (
              <div key={m.codigo} className="bfd-cambio__row">
                <span className="bfd-cambio__code">{m.codigo}</span>
                <span className="bfd-cambio__val">R$ {m.valor_brl.toFixed(2).replace('.', ',')}</span>
                <span
                  className="bfd-cambio__var"
                  style={{
                    color: m.variacao >= 0 ? '#52d69b' : '#f87171',
                    background: m.variacao >= 0 ? 'rgba(82,214,155,0.1)' : 'rgba(248,113,113,0.1)',
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
      <div className="bfd-insights-grid">
        {/* Melhor cotação */}
        <div className="bfd-card">
          <span className="bfd-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy weight="duotone" size={18} style={{ color: '#fbbf24' }} />Melhor Cotação do Mês</span>
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
                  <circle cx="80" cy="10" r="10" fill="rgba(82,214,155,0.15)" />
                  <circle cx="80" cy="10" r="3.5" fill="#52d69b" />
                  <g transform="translate(73, 3)">
                    <Anchor size={14} weight="bold" style={{ color: '#52d69b' }} />
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
              <span className="bfd-best__saving-val">USD {fmtMoeda(DEMO_MELHOR_COTACAO.saving_valor)}</span>
            </div>
            <div className="bfd-best__meta">
              {DEMO_MELHOR_COTACAO.numero} | {DEMO_MELHOR_COTACAO.fornecedor} | USD {fmtMoeda(DEMO_MELHOR_COTACAO.valor_aprovado)}
            </div>
          </div>
        </div>

        {/* Funil */}
        <div className="bfd-card">
          <span className="bfd-card__title">Funil de Cotações</span>
          <FunilStatus />
        </div>

        {/* Top Incoterms */}
        <div className="bfd-card">
          <span className="bfd-card__title">Top Incoterms</span>
          <div className="bfd-incoterms">
            {DEMO_INCOTERMS.map(inc => (
              <div key={inc.incoterm} className="bfd-incoterms__row" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.4rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="bfd-incoterms__code">{inc.incoterm}</span>
                  <span className="bfd-incoterms__count" style={{ fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>
                    {inc.count} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>({inc.pct}%)</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${inc.pct}%`, height: '100%', background: 'linear-gradient(90deg, #568cb8, #52d69b)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bfd-bottom-grid">
        {/* Taxa aprovação */}
        <div className="bfd-card">
          <span className="bfd-card__title">Taxa de Aprovação</span>
          <TaxaAprovacao />
        </div>

        {/* Alertas */}
        <div className="bfd-card bfd-alertas">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bfd-card__title" style={{ marginBottom: 0 }}>Alertas</span>
            <div className="bfd-alertas__nav">
              <button><CaretLeft size={14} /></button>
              <span>Hoje</span>
              <button><CaretRight size={14} /></button>
              <span style={{ marginLeft: 8 }}>Amanha</span>
            </div>
          </div>
          <div className="bfd-alertas__pills">
            {alertas.map((a, i) => {
              const pillColors: Record<string, string> = { red: '#f87171', orange: '#fbbf24', yellow: '#eab308', green: '#52d69b' }
              return (
                <div key={i} className="bfd-alertas__pill">
                  <span className="bfd-alertas__pill-count" style={{ color: pillColors[a.cor] || '#60a5fa' }}>{a.count}</span>
                  <span>{a.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bfd-footer">
        ⚙ Dados demonstrativos — conecte o backend para dados reais
      </div>
    </div>
  )
}
