/**
 * Gráficos SVG da tela de resultado — paridade com mockup Simula de Custo.dc.html
 */
import React, { useMemo } from 'react'
import type { NoFluxoCaixaSimulaCusto } from './derivar-dados-resultado-simula-custo'

function smoothPath(pts: Array<[number, number]>): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? pts[i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0]} ${p2[1]}`
  }
  return d
}

export function GraficoFluxoCaixaSimulaCusto({
  nos,
}: {
  nos: NoFluxoCaixaSimulaCusto[]
}) {
  const svg = useMemo(() => {
    if (nos.length === 0) return null

    const W = 820
    const top = 46
    const base = 150
    const yF = (p: number) => base - (p / 100) * (base - top)

    const count = nos.length
    const xStart = 120
    const xEnd = 700
    const step = count > 1 ? (xEnd - xStart) / (count - 1) : 0

    const nodes = nos.map((n, i) => ({
      x: count > 1 ? xStart + step * i : (xStart + xEnd) / 2,
      pct: n.pctAcumulado,
      amt: n.valorFormatado,
      cum: `${Math.round(n.pctAcumulado)}%`,
      label: n.rotulo,
      date: n.dataRotulo,
    }))

    const pts: Array<[number, number]> = [[60, yF(0)], ...nodes.map((n): [number, number] => [n.x, yF(n.pct)])]
    const line = smoothPath(pts)
    const area = `${line} L${pts[pts.length - 1][0]} ${base} L${pts[0][0]} ${base} Z`

    return (
      <svg viewBox={`0 0 ${W} 214`} className="ecc-grafico-svg" aria-hidden>
        <defs>
          <linearGradient id="ecc-cfline" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4b8bff" />
            <stop offset="100%" stopColor="#8ab4ff" />
          </linearGradient>
          <linearGradient id="ecc-cfarea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(78,139,255,0.32)" />
            <stop offset="100%" stopColor="rgba(78,139,255,0)" />
          </linearGradient>
          <filter id="ecc-cfglow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[25, 50, 75, 100].map((g) => (
          <line
            key={g}
            x1={52}
            y1={yF(g)}
            x2={772}
            y2={yF(g)}
            stroke="rgba(255,255,255,0.045)"
            strokeWidth={1}
            strokeDasharray="1 6"
          />
        ))}
        <path d={area} fill="url(#ecc-cfarea)" />
        <path
          d={line}
          fill="none"
          stroke="url(#ecc-cfline)"
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecc-cfglow)"
        />
        <line x1={52} y1={base} x2={772} y2={base} stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />
        {nodes.map((n, i) => {
          const y = yF(n.pct)
          const cw = 94
          const cx = Math.min(Math.max(n.x, 52 + cw / 2), 772 - cw / 2)
          const cy = y - 46
          return (
            <g key={i}>
              <rect
                x={cx - cw / 2}
                y={cy}
                width={cw}
                height={30}
                rx={9}
                fill="rgba(78,139,255,0.12)"
                stroke="rgba(120,160,255,0.4)"
                strokeWidth={1}
              />
              <text x={cx} y={cy + 15} textAnchor="middle" fill="#cfe0ff" fontSize={9} fontWeight={600}>
                acum. {n.cum}
              </text>
              <text x={cx} y={cy + 26} textAnchor="middle" fill="#eaf1ff" fontSize={11} fontWeight={700}>
                {n.amt}
              </text>
              <circle cx={n.x} cy={y} r={5.5} fill="#6ea0ff" stroke="#0e151f" strokeWidth={2} />
              <text x={n.x} y={base + 18} textAnchor="middle" fill="#8b98ad" fontSize={10}>
                {n.label}
              </text>
              <text x={n.x} y={base + 32} textAnchor="middle" fill="#6f7d92" fontSize={9.5}>
                {n.date}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }, [nos])

  if (!svg) {
    return (
      <div className="ecc-grafico-vazio">
        Configure o prazo de pagamento no passo Alíquotas para visualizar o fluxo.
      </div>
    )
  }

  return <div className="ecc-grafico-wrap">{svg}</div>
}

export function GraficoDolarFuturoSimulaCusto({
  serie,
  mesDestaque,
}: {
  serie: Array<{ mes: string; valor: number }>
  mesDestaque: string
}) {
  const W = 400
  const H = 160
  const pad = { l: 36, r: 16, t: 16, b: 28 }
  const min = Math.min(...serie.map((s) => s.valor)) * 0.998
  const max = Math.max(...serie.map((s) => s.valor)) * 1.002
  const xStep = (W - pad.l - pad.r) / (serie.length - 1)
  const yScale = (v: number) => pad.t + ((max - v) / (max - min)) * (H - pad.t - pad.b)
  const pts: Array<[number, number]> = serie.map((s, i) => [pad.l + i * xStep, yScale(s.valor)])
  const line = smoothPath(pts)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ecc-grafico-svg" aria-hidden>
      <path d={line} fill="none" stroke="#34d399" strokeWidth={2.2} strokeLinecap="round" />
      {serie.map((s, i) => {
        const x = pad.l + i * xStep
        const y = yScale(s.valor)
        const destaque = s.mes === mesDestaque
        return (
          <g key={s.mes}>
            <circle
              cx={x}
              cy={y}
              r={destaque ? 5 : 3}
              fill={destaque ? '#34d399' : 'transparent'}
              stroke="#34d399"
              strokeWidth={destaque ? 0 : 1.5}
            />
            {destaque ? (
              <text x={x} y={y - 10} textAnchor="middle" fill="#7ddab0" fontSize={10} fontWeight={600}>
                {s.valor.toFixed(3)}
              </text>
            ) : null}
            <text x={x} y={H - 6} textAnchor="middle" fill="#6f7d92" fontSize={9.5}>
              {s.mes}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function GraficoFatorImportacaoSimulaCusto({
  fatorAtual,
  fatorIdeal,
  valorFobAtual,
  valorFobIdeal,
}: {
  fatorAtual: number
  fatorIdeal: number
  valorFobAtual: number
  valorFobIdeal: number
}) {
  const W = 400
  const H = 170
  const pad = { l: 40, r: 20, t: 20, b: 36 }

  const fobMin = Math.min(valorFobAtual, valorFobIdeal) * 0.7
  const fobMax = Math.max(valorFobAtual, valorFobIdeal) * 1.25
  const fatMin = Math.min(fatorAtual, fatorIdeal) - 0.1
  const fatMax = Math.max(fatorAtual, fatorIdeal) + 0.1

  const xScale = (fob: number) => pad.l + ((fob - fobMin) / (fobMax - fobMin)) * (W - pad.l - pad.r)
  const yScale = (fat: number) => pad.t + ((fat - fatMin) / (fatMax - fatMin)) * (H - pad.t - pad.b)

  const pts: Array<[number, number]> = []
  for (let i = 0; i <= 20; i++) {
    const fob = fobMin + (i / 20) * (fobMax - fobMin)
    const fat = fatorAtual + (fatorIdeal - fatorAtual) * (1 - (fob - fobMin) / (fobMax - fobMin)) * 0.6
    pts.push([xScale(fob), yScale(fat)])
  }
  const line = smoothPath(pts)

  const xa = xScale(valorFobAtual)
  const ya = yScale(fatorAtual)
  const xi = xScale(valorFobIdeal)
  const yi = yScale(fatorIdeal)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ecc-grafico-svg" aria-hidden>
      <path d={line} fill="none" stroke="#f6b28a" strokeWidth={2.2} strokeLinecap="round" />
      <rect
        x={xi - 18}
        y={pad.t}
        width={36}
        height={H - pad.t - pad.b}
        fill="rgba(52,211,153,0.08)"
        rx={4}
      />
      <circle cx={xa} cy={ya} r={5} fill="#f6b28a" />
      <text x={xa} y={ya - 10} textAnchor="middle" fill="#f6b28a" fontSize={9}>
        {fatorAtual.toFixed(2)}× atual
      </text>
      <circle cx={xi} cy={yi} r={5} fill="#34d399" />
      <text x={xi} y={yi + 18} textAnchor="middle" fill="#34d399" fontSize={9}>
        {fatorIdeal.toFixed(2)}× ideal
      </text>
      {[fobMin, valorFobAtual, valorFobIdeal, fobMax].map((v, i) => (
        <text
          key={i}
          x={xScale(v)}
          y={H - 8}
          textAnchor="middle"
          fill="#6f7d92"
          fontSize={8.5}
        >
          {v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`}
        </text>
      ))}
    </svg>
  )
}
