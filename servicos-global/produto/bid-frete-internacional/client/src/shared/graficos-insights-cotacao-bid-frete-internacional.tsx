/**
 * Gráficos SVG do Painel Smart Insights (detalhe da cotação).
 */

import { useCallback, useId, useMemo, useState, useEffect } from 'react'
import type { BarraComparativoInsight, PontoSerieHistoricoTermometro } from './infograficos-fluxo-cotacao-bid-frete-internacional'

function formatarValorTermometro(valor: number, moeda: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

function normalizarBarras(barras: BarraComparativoInsight[]): number[] {
  if (barras.length === 0) return []
  if (barras.length === 1) {
    return [barras[0].destaque ? 0.72 : 0.5]
  }
  const max = Math.max(...barras.map((b) => b.valor), 1)
  const min = Math.min(...barras.map((b) => b.valor))
  if (max === min) {
    return barras.map((b) => (b.destaque ? 0.82 : 0.48))
  }
  const span = max - min
  return barras.map((b) => 0.28 + ((b.valor - min) / span) * 0.62)
}

export function SparkBarrasComparativo({
  barras,
  melhorMenor,
  variante = 'azul',
}: {
  barras: BarraComparativoInsight[]
  melhorMenor: boolean
  variante?: 'azul' | 'amber' | 'indigo'
}) {
  const uid = useId().replace(/:/g, '')
  const alturas = normalizarBarras(barras)
  const W = 72
  const H = 36
  const gap = barras.length > 4 ? 2 : 3
  const barW = Math.max(4, (W - gap * (barras.length - 1)) / Math.max(barras.length, 1))

  const stopColorNormalStart = variante === 'indigo' ? 'rgba(99, 102, 241, 0.25)' : variante === 'amber' ? '#f59e0b' : '#818cf8'
  const stopColorNormalEnd = variante === 'indigo' ? 'rgba(99, 102, 241, 0.4)' : variante === 'amber' ? '#d97706' : '#4f46e5'
  const stopColorBestStart = variante === 'indigo' ? '#818cf8' : variante === 'amber' ? '#fbbf24' : '#4ade80'
  const stopColorBestEnd = variante === 'indigo' ? '#6366f1' : variante === 'amber' ? '#f59e0b' : '#22c55e'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="dc-smart-spark-barras"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={`dc-spark-bar-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stopColorNormalStart} />
          <stop offset="100%" stopColor={stopColorNormalEnd} />
        </linearGradient>
        <linearGradient id={`dc-spark-bar-best-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stopColorBestStart} />
          <stop offset="100%" stopColor={stopColorBestEnd} />
        </linearGradient>
      </defs>
      {barras.map((barra, i) => {
        const h = alturas[i] * (H - 4)
        const x = i * (barW + gap)
        const y = H - h
        const fill = barra.destaque ? `url(#dc-spark-bar-best-${uid})` : `url(#dc-spark-bar-${uid})`
        return (
          <rect
            key={`${barra.valor}-${i}`}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={2}
            fill={fill}
            opacity={barra.destaque ? 1 : 0.55}
            className={barra.destaque ? 'dc-smart-spark-bar--best' : undefined}
            title={melhorMenor ? String(barra.valor) : String(barra.valor)}
          />
        )
      })}
    </svg>
  )
}

export function SparkAreaMini({
  pontos,
  variante = 'azul',
}: {
  pontos: number[]
  variante?: 'azul' | 'amber' | 'indigo'
}) {
  const uid = useId().replace(/:/g, '')
  if (pontos.length < 2) return null
  const W = 72
  const H = 36
  const max = Math.max(...pontos, 1)
  const min = Math.min(...pontos)
  const span = max - min || 1
  const coords = pontos.map((v, i) => {
    const x = (i / (pontos.length - 1)) * W
    const y = H - 4 - ((v - min) / span) * (H - 8)
    return `${x},${y}`
  })
  const areaPath = `M0,${H} L${coords.join(' L')} L${W},${H} Z`
  const linePath = `M${coords.join(' L')}`

  const fillColor = variante === 'indigo' ? 'rgba(99, 102, 241, 0.45)' : variante === 'amber' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(96, 165, 250, 0.45)'
  const strokeColor = variante === 'indigo' ? '#818cf8' : variante === 'amber' ? '#fbbf24' : '#60a5fa'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dc-smart-spark-area" aria-hidden>
      <defs>
        <linearGradient id={`dc-spark-area-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} />
          <stop offset="100%" stopColor="rgba(96, 165, 250, 0)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#dc-spark-area-fill-${uid})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Altura fixa em px — NUNCA usar height:100% no SVG (quebra quando o pai não tem altura explícita). */
export const TERMOMETRO_GRAFICO_ALTURA_PX = 220
const TERMOMETRO_VIEW = { w: 400, h: 200 }
const TERMOMETRO_PAD = { top: 16, right: 12, bottom: 28, left: 44 }

export function GraficoAreaTermometro({
  serie,
  moeda = 'USD',
}: {
  serie: PontoSerieHistoricoTermometro[]
  moeda?: string
}) {
  const uid = useId().replace(/:/g, '')
  const [indiceAtivo, setIndiceAtivo] = useState<number | null>(null)

  const { W, H } = TERMOMETRO_VIEW
  const pad = TERMOMETRO_PAD
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const coords = useMemo(() => {
    if (serie.length === 0) return []
    const valores = serie.map((p) => Number(p.valor) || 0)
    const maxVal = Math.max(...valores, 1) * 1.1
    const minVal = Math.min(...valores, 0)
    const span = Math.max(maxVal - minVal, 1)
    return serie.map((p, i) => {
      const valor = Number(p.valor) || 0
      const x = pad.left + (i / Math.max(serie.length - 1, 1)) * innerW
      const y = pad.top + (1 - (valor - minVal) / span) * innerH
      return { x, y, valor, mes: p.mes, indice: i }
    })
  }, [serie, innerW, innerH, pad.left, pad.top])

  const maxVal = useMemo(
    () => (coords.length > 0 ? Math.max(...coords.map((c) => c.valor), 1) * 1.1 : 1),
    [coords],
  )
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1].x},${pad.top + innerH} L${coords[0].x},${pad.top + innerH} Z`
      : ''

  const indiceHover = indiceAtivo ?? null
  const pontoAtivo = indiceHover != null ? coords[indiceHover] : null

  const indicePorPosicaoX = useCallback(
    (ratioX: number) => {
      if (serie.length === 0) return null
      const plotRatio = (ratioX - pad.left / W) / (innerW / W)
      const clamped = Math.max(0, Math.min(1, plotRatio))
      return Math.round(clamped * (serie.length - 1))
    },
    [serie.length, pad.left, innerW, W],
  )

  const atualizarPorEvento = useCallback(
    (clientX: number, rect: DOMRect) => {
      const ratioX = (clientX - rect.left) / rect.width
      const idx = indicePorPosicaoX(ratioX)
      setIndiceAtivo(idx)
    },
    [indicePorPosicaoX],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      atualizarPorEvento(e.clientX, e.currentTarget.getBoundingClientRect())
    },
    [atualizarPorEvento],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      if (!touch) return
      atualizarPorEvento(touch.clientX, e.currentTarget.getBoundingClientRect())
    },
    [atualizarPorEvento],
  )

  const tooltipLeftPct =
    pontoAtivo != null && serie.length > 1
      ? ((pontoAtivo.x - pad.left) / innerW) * 100
      : 50

  const serieValida = serie.filter((p) => Number.isFinite(Number(p.valor)))

  if (serieValida.length === 0) {
    return (
      <div
        className="dc-term-chart-wrap dc-term-chart-wrap--vazio"
        style={{ height: TERMOMETRO_GRAFICO_ALTURA_PX }}
        aria-hidden
      />
    )
  }

  return (
    <div
      className="dc-term-chart-wrap"
      style={{ height: TERMOMETRO_GRAFICO_ALTURA_PX }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIndiceAtivo(null)}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIndiceAtivo(null)}
      role="img"
      aria-label="Gráfico histórico de valores da cotação"
    >
      {pontoAtivo != null && (
        <div
          className="dc-term-chart-tooltip"
          style={{ left: `${tooltipLeftPct}%` }}
          role="tooltip"
        >
          <span className="dc-term-chart-tooltip-mes">{pontoAtivo.mes}</span>
          <span className="dc-term-chart-tooltip-valor">
            {formatarValorTermometro(pontoAtivo.valor, moeda)}
          </span>
        </div>
      )}
      <svg
        width="100%"
        height={TERMOMETRO_GRAFICO_ALTURA_PX}
        viewBox={`0 0 ${W} ${H}`}
        className="dc-smart-termometro-chart"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`dc-term-area-${uid}`}
            gradientUnits="userSpaceOnUse"
            x1={pad.left}
            y1={pad.top}
            x2={W - pad.right}
            y2={pad.top + innerH}
          >
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.45)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
          </linearGradient>
        </defs>
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="rgba(15, 23, 42, 0.25)"
          rx={6}
        />
        {ticks.map((t) => {
          const y = pad.top + t * innerH
          const val = Math.round((1 - t) * maxVal)
          return (
            <g key={t}>
              <line
                x1={pad.left}
                y1={y}
                x2={W - pad.right}
                y2={y}
                stroke="rgba(148, 163, 184, 0.18)"
                strokeDasharray={t === 1 ? undefined : '4,5'}
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
              >
                {val}
              </text>
            </g>
          )
        })}
        {areaPath ? (
          <path d={areaPath} fill={`url(#dc-term-area-${uid})`} className="dc-term-area-fill" />
        ) : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {pontoAtivo != null && (
          <line
            x1={pontoAtivo.x}
            y1={pad.top}
            x2={pontoAtivo.x}
            y2={pad.top + innerH}
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        )}
        {coords.map((c) => {
          const ativo = indiceHover === c.indice
          return (
            <g key={`${c.mes}-${c.indice}`}>
              <circle
                cx={c.x}
                cy={c.y}
                r={ativo ? 7 : 4}
                fill={ativo ? '#34d399' : '#60a5fa'}
                stroke={ativo ? '#ecfdf5' : '#1e293b'}
                strokeWidth={ativo ? 2 : 1}
              />
              <text
                x={c.x}
                y={H - 8}
                textAnchor="middle"
                fill={ativo ? '#f1f5f9' : '#94a3b8'}
                fontSize="10"
                fontWeight={ativo ? '700' : '600'}
              >
                {c.mes}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function AnelProgressoInsight({ pct, variante }: { pct: number; variante: 'verde' | 'ambar' }) {
  const r = 22
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100)
  return (
    <svg viewBox="0 0 56 56" className={`dc-smart-anel dc-smart-anel--${variante}`} aria-hidden>
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(71, 85, 105, 0.45)" strokeWidth="5" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 28 28)"
        className="dc-smart-anel-arco"
      />
      <text x="28" y="31" textAnchor="middle" className="dc-smart-anel-texto">
        {pct}%
      </text>
    </svg>
  )
}

export function SparkTransitTimeBarras({
  barras = [],
  mediaMercado,
  rotuloMetrica = 'Trânsito',
  formatarValor = (v: number) => `${v} dias`,
}: {
  barras?: {
    valor: number
    isVencedor: boolean
    isMelhorPreco?: boolean
    fornecedor: string
    colocacao?: number
  }[]
  mediaMercado?: number
  rotuloMetrica?: string
  formatarValor?: (valor: number) => string
}) {
  const uid = useId().replace(/:/g, '')
  const [barAtivo, setBarAtivo] = useState<{
    valor: number
    isVencedor: boolean
    fornecedor: string
    colocacao?: number
    index: number
  } | null>(null)

  useEffect(() => {
    if (barAtivo == null) return
    const handleOutsideClick = () => {
      setBarAtivo(null)
    }
    window.addEventListener('click', handleOutsideClick)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [barAtivo])

  const maxVal = useMemo(() => {
    const valores = [...barras.map((b) => b.valor), mediaMercado].filter((v) => v != null && v >= 0)
    return valores.length > 0 ? Math.max(...valores, 1) : 1
  }, [barras, mediaMercado])

  const W = 72
  const H = 36
  const n = barras.length

  const gap = n <= 2 ? 4 : n <= 4 ? 3 : 2
  const barW = n > 0
    ? Math.min(n <= 4 ? 14 : 9, Math.max(5, (W - gap * (n - 1)) / n))
    : 8

  const totalW = n * barW + (n - 1) * gap
  const startX = Math.max(0, (W - totalW) / 2)

  const scaleY = (v: number) => {
    return Math.max(4, (v / maxVal) * (H - 8))
  }

  const yMedia = mediaMercado != null ? H - scaleY(mediaMercado) : null

  return (
    <div className="dc-transit-spark-wrap" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="dc-smart-spark-transit-barras"
        role="img"
        aria-hidden
        style={{ cursor: 'pointer' }}
      >
        <defs>
          <linearGradient id={`dc-transit-bar-winner-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id={`dc-transit-bar-comp-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.22)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.38)" />
          </linearGradient>
        </defs>

        {/* Render the comparison bars */}
        {barras.map((bar, i) => {
          const h = scaleY(bar.valor)
          const x = startX + i * (barW + gap)
          const y = H - h
          const isAtivo = barAtivo?.index === i
          const fill = bar.isVencedor ? `url(#dc-transit-bar-winner-${uid})` : `url(#dc-transit-bar-comp-${uid})`
          const borderStroke = isAtivo
            ? '#34d399'
            : bar.isVencedor
              ? '#7dd3fc'
              : bar.isMelhorPreco
                ? '#a5b4fc'
                : 'transparent'

          return (
            <rect
              key={`${bar.fornecedor}-${bar.valor}-${i}`}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={2}
              fill={fill}
              stroke={borderStroke}
              strokeWidth={isAtivo ? 1.5 : bar.isVencedor || bar.isMelhorPreco ? 1 : 0}
              opacity={bar.isVencedor || isAtivo ? 1 : 0.72}
              title={`${bar.fornecedor}: ${bar.valor} dias`}
              onClick={(e) => {
                e.stopPropagation()
                setBarAtivo(isAtivo ? null : { ...bar, index: i })
              }}
            />
          )
        })}

        {/* Market average horizontal benchmark guide */}
        {yMedia != null && (
          <g>
            <line
              x1={0}
              y1={yMedia}
              x2={W}
              y2={yMedia}
              stroke="#38bdf8"
              strokeWidth="1.25"
              strokeDasharray="3,2"
              opacity={0.9}
            />
          </g>
        )}
      </svg>

      {barAtivo != null && (
        <div
          className="dc-transit-tooltip-click"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            width: '150px',
            padding: '0.45rem 0.55rem',
            borderRadius: '6px',
            background: '#1e293b',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
            color: '#f8fafc',
            fontSize: '0.6875rem',
            lineHeight: '1.4',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.15rem', marginBottom: '0.2rem' }}>
            <span style={{ fontWeight: 800, color: barAtivo.isVencedor ? '#a5b4fc' : '#cbd5e1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '110px' }} title={barAtivo.fornecedor}>
              {barAtivo.fornecedor}
            </span>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.8rem',
                lineHeight: 1,
                marginLeft: 'auto',
              }}
              onClick={(e) => {
                e.stopPropagation()
                setBarAtivo(null)
              }}
            >
              &times;
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>{rotuloMetrica}:</span>
            <span style={{ fontWeight: 700 }}>{formatarValor(barAtivo.valor)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Colocação:</span>
            <span style={{ fontWeight: 700, color: '#fbbf24' }}>{barAtivo.colocacao ?? barAtivo.index + 1}º lugar</span>
          </div>
        </div>
      )}
    </div>
  )
}
