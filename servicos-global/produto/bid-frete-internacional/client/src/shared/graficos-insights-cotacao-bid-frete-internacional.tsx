/**
 * Gráficos SVG do Painel Smart Insights (detalhe da cotação).
 */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BarraComparativoInsight, PontoSerieHistoricoTermometro } from './infograficos-fluxo-cotacao-bid-frete-internacional'

function formatarValorTermometro(valor: number, moeda: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

const SPARK_VIEW_W = 88
const SPARK_VIEW_H = 52
const TOOLTIP_LARGURA_ESTIMADA = 168
const TOOLTIP_ALTURA_ESTIMADA = 92

type VarianteSparkBarras = 'azul' | 'amber' | 'indigo'

const GRADIENTE_SPARK: Record<
  VarianteSparkBarras,
  { normal: readonly [string, string]; destaque: readonly [string, string] }
> = {
  indigo: {
    normal: ['rgba(99, 102, 241, 0.25)', 'rgba(99, 102, 241, 0.4)'],
    destaque: ['#818cf8', '#6366f1'],
  },
  amber: {
    normal: ['#f59e0b', '#d97706'],
    destaque: ['#fbbf24', '#f59e0b'],
  },
  azul: {
    normal: ['#818cf8', '#4f46e5'],
    destaque: ['#4ade80', '#22c55e'],
  },
}

interface LayoutSparkBarras {
  gap: number
  barW: number
  startX: number
}

interface AncoraViewport {
  left: number
  top: number
}

interface PosicaoTooltipFixa {
  left: number
  top: number
  transform: string
}

export interface SparkBarrasComparativoProps {
  barras: BarraComparativoInsight[]
  /** Mantido no contrato do painel; comparação vs ganhador vem de `textoVsGanhador`. */
  melhorMenor: boolean
  variante?: VarianteSparkBarras
  rotuloMetrica?: string
  formatarValor?: (valor: number) => string
  textoVsGanhador: (barra: BarraComparativoInsight, valorGanhador: number) => string
}

function calcularAlturasRelativas(barras: BarraComparativoInsight[]): number[] {
  if (barras.length === 0) return []
  if (barras.length === 1) {
    return [barras[0].destaque ? 0.9 : 0.72]
  }

  const valores = barras.map((b) => b.valor)
  const max = Math.max(...valores, 1)
  const min = Math.min(...valores)
  if (max === min) {
    return barras.map((b) => (b.destaque ? 0.92 : 0.65))
  }

  const span = max - min
  return barras.map((b) => 0.4 + ((b.valor - min) / span) * 0.52)
}

function calcularLayoutBarras(quantidade: number): LayoutSparkBarras {
  const n = Math.max(quantidade, 1)
  const gap = n <= 2 ? 6 : n <= 4 ? 4 : 3
  const barW = Math.min(
    n <= 2 ? 22 : n <= 4 ? 16 : 10,
    Math.max(6, (SPARK_VIEW_W - gap * (n - 1)) / n),
  )
  const totalW = n * barW + (n - 1) * gap
  const startX = Math.max(0, (SPARK_VIEW_W - totalW) / 2)
  return { gap, barW, startX }
}

function calcularAncoraBarra(rect: DOMRect, indice: number, layout: LayoutSparkBarras): AncoraViewport {
  const escalaX = rect.width / SPARK_VIEW_W
  const escalaY = rect.height / SPARK_VIEW_H
  const centroX = layout.startX + indice * (layout.barW + layout.gap) + layout.barW / 2
  return {
    left: rect.left + centroX * escalaX,
    top: rect.top + SPARK_VIEW_H * escalaY,
  }
}

function calcularPosicaoTooltipFixa(ancora: AncoraViewport): PosicaoTooltipFixa {
  const margem = 10
  const left = Math.min(
    window.innerWidth - TOOLTIP_LARGURA_ESTIMADA / 2 - margem,
    Math.max(TOOLTIP_LARGURA_ESTIMADA / 2 + margem, ancora.left),
  )
  const espacoAbaixo = window.innerHeight - ancora.top - margem
  if (espacoAbaixo >= TOOLTIP_ALTURA_ESTIMADA) {
    return { left, top: ancora.top + 8, transform: 'translateX(-50%)' }
  }
  return { left, top: ancora.top - 8, transform: 'translate(-50%, -100%)' }
}

function SparkBarraTooltipPortal({
  barra,
  valorGanhador,
  rotuloMetrica,
  formatarValor,
  textoVsGanhador,
  ancora,
}: {
  barra: BarraComparativoInsight
  valorGanhador: number
  rotuloMetrica: string
  formatarValor: (valor: number) => string
  textoVsGanhador: (barra: BarraComparativoInsight, valorGanhador: number) => string
  ancora: AncoraViewport
}) {
  const [pos, setPos] = useState(() => calcularPosicaoTooltipFixa(ancora))

  useLayoutEffect(() => {
    setPos(calcularPosicaoTooltipFixa(ancora))
  }, [ancora.left, ancora.top])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="dc-spark-bar-tooltip dc-spark-bar-tooltip--portal"
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        transform: pos.transform,
      }}
      role="tooltip"
    >
      <p className="dc-spark-bar-tooltip-empresa" title={barra.fornecedor}>
        {barra.fornecedor}
      </p>
      <div className="dc-spark-bar-tooltip-linha">
        <span className="dc-spark-bar-tooltip-label">{rotuloMetrica}</span>
        <span className="dc-spark-bar-tooltip-valor">{formatarValor(barra.valor)}</span>
      </div>
      <p className="dc-spark-bar-tooltip-vs">{textoVsGanhador(barra, valorGanhador)}</p>
    </div>,
    document.body,
  )
}

export function SparkBarrasComparativo({
  barras,
  melhorMenor: _melhorMenor,
  variante = 'azul',
  rotuloMetrica = 'Valor',
  formatarValor = (v: number) => String(v),
  textoVsGanhador,
}: SparkBarrasComparativoProps) {
  const uid = useId().replace(/:/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const [indiceHover, setIndiceHover] = useState<number | null>(null)

  const layout = useMemo(() => calcularLayoutBarras(barras.length), [barras.length])
  const alturas = useMemo(() => calcularAlturasRelativas(barras), [barras])
  const gradiente = GRADIENTE_SPARK[variante]

  const valorGanhador = useMemo(() => {
    const ganhador = barras.find((b) => b.destaque)
    return ganhador?.valor ?? barras[0]?.valor ?? 0
  }, [barras])

  const barraHover = indiceHover != null ? barras[indiceHover] : null

  const [ancoraHover, setAncoraHover] = useState<AncoraViewport | null>(null)

  const definirHover = useCallback((indice: number | null) => {
    setIndiceHover(indice)
    const root = rootRef.current
    if (indice == null || root == null) {
      setAncoraHover(null)
      return
    }
    setAncoraHover(calcularAncoraBarra(root.getBoundingClientRect(), indice, layout))
  }, [layout])

  useEffect(() => {
    if (indiceHover == null) return undefined
    const reposicionar = () => {
      const root = rootRef.current
      if (root == null) return
      setAncoraHover(calcularAncoraBarra(root.getBoundingClientRect(), indiceHover, layout))
    }
    window.addEventListener('scroll', reposicionar, true)
    window.addEventListener('resize', reposicionar)
    return () => {
      window.removeEventListener('scroll', reposicionar, true)
      window.removeEventListener('resize', reposicionar)
    }
  }, [indiceHover, layout])

  if (barras.length === 0) return null

  return (
    <>
      <div
        ref={rootRef}
        className="dc-spark-bar-wrap"
        onMouseLeave={() => definirHover(null)}
      >
        <svg
          viewBox={`0 0 ${SPARK_VIEW_W} ${SPARK_VIEW_H}`}
          className="dc-smart-spark-barras"
          role="img"
          aria-label={rotuloMetrica}
        >
          <defs>
            <linearGradient id={`spark-bar-n-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradiente.normal[0]} />
              <stop offset="100%" stopColor={gradiente.normal[1]} />
            </linearGradient>
            <linearGradient id={`spark-bar-d-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradiente.destaque[0]} />
              <stop offset="100%" stopColor={gradiente.destaque[1]} />
            </linearGradient>
          </defs>

          {barras.map((barra, indice) => {
            const alturaPx = alturas[indice] * (SPARK_VIEW_H - 4)
            const x = layout.startX + indice * (layout.barW + layout.gap)
            const y = SPARK_VIEW_H - alturaPx
            const emHover = indiceHover === indice
            const fillUrl = barra.destaque ? `url(#spark-bar-d-${uid})` : `url(#spark-bar-n-${uid})`

            return (
              <g
                key={`${barra.fornecedor}-${indice}`}
                onMouseEnter={() => definirHover(indice)}
              >
                <rect
                  x={x - 2}
                  y={0}
                  width={layout.barW + 4}
                  height={SPARK_VIEW_H}
                  fill="transparent"
                />
                <rect
                  x={x}
                  y={y}
                  width={layout.barW}
                  height={alturaPx}
                  rx={3}
                  fill={fillUrl}
                  opacity={barra.destaque || emHover ? 1 : 0.55}
                  stroke={emHover ? '#a5b4fc' : barra.destaque ? '#818cf8' : 'transparent'}
                  strokeWidth={emHover ? 1.25 : barra.destaque ? 0.75 : 0}
                  className={barra.destaque ? 'dc-smart-spark-bar--best' : undefined}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {barraHover != null && ancoraHover != null && (
        <SparkBarraTooltipPortal
          barra={barraHover}
          valorGanhador={valorGanhador}
          rotuloMetrica={rotuloMetrica}
          formatarValor={formatarValor}
          textoVsGanhador={textoVsGanhador}
          ancora={ancoraHover}
        />
      )}
    </>
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
  const H = 28
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

const TERMOMETRO_VIEW = { w: 400, h: 200 }
const TERMOMETRO_PAD = { top: 14, right: 20, bottom: 24, left: 20 }

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
    const pontosValidos = serie.filter((p) => Number.isFinite(Number(p.valor)) && Number(p.valor) > 0)
    if (pontosValidos.length === 0) return []

    const valores = pontosValidos.map((p) => Number(p.valor))
    const maxVal = Math.max(...valores, 1) * 1.1
    const minVal = Math.min(...valores, 0)
    const span = Math.max(maxVal - minVal, 1)

    return serie.map((p, i) => {
      const valor = Number(p.valor) || 0
      const x = pad.left + (i / Math.max(serie.length - 1, 1)) * innerW
      const y = valor > 0
        ? pad.top + (1 - (valor - minVal) / span) * innerH
        : pad.top + innerH
      return { x, y, valor, mes: p.mes, indice: i }
    })
  }, [serie, innerW, innerH, pad.left, pad.top])

  const maxVal = useMemo(
    () => (coords.length > 0 ? Math.max(...coords.map((c) => c.valor), 1) * 1.1 : 1),
    [coords],
  )
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  const linePath = coords
    .filter((c) => c.valor > 0)
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`)
    .join(' ')
  const pontosComValor = coords.filter((c) => c.valor > 0)
  const areaPath =
    pontosComValor.length > 0
      ? `${linePath} L${pontosComValor[pontosComValor.length - 1].x},${pad.top + innerH} L${pontosComValor[0].x},${pad.top + innerH} Z`
      : ''

  const indiceHover = indiceAtivo
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
      const idx = indicePorPosicaoX((clientX - rect.left) / rect.width)
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

  const temDados = coords.some((c) => c.valor > 0)

  if (!temDados) {
    return (
      <div
        className="dc-term-chart-wrap dc-term-chart-wrap--vazio"
        aria-hidden
      />
    )
  }

  return (
    <div
      className="dc-term-chart-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIndiceAtivo(null)}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIndiceAtivo(null)}
      role="img"
      aria-label="Histórico de frete pago nas mesmas condições operacionais"
    >
      {pontoAtivo != null && pontoAtivo.valor > 0 && (
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
        height="100%"
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
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.5)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.15)" />
          </linearGradient>
          <linearGradient id={`dc-term-line-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
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
            stroke={`url(#dc-term-line-${uid})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {pontoAtivo != null && pontoAtivo.valor > 0 && (
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
          if (c.valor <= 0) return null
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

