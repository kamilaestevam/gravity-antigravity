import { useId } from 'react'
import { ChartBar } from '@phosphor-icons/react'
import {
  TooltipGraficoInsightsSimulador,
  useHoverTooltipInsightsSimulador,
} from '../smart-doc/tooltip-grafico-insights-simulador'
import type { PedidoMesSimulador } from './dados-insights-simulador-pedido'
import './grafico-barras-mensal-simulador-pedido.css'

type Props = {
  dados: PedidoMesSimulador[]
}

export function GraficoBarrasMensalSimuladorPedido({ dados }: Props) {
  const uid = useId().replace(/:/g, '')
  const mesTooltip = useHoverTooltipInsightsSimulador<PedidoMesSimulador>()

  const W = 520
  const H = 220
  const pad = { top: 28, right: 16, bottom: 32, left: 36 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const barW = dados.length > 0 ? innerW / dados.length : innerW

  const maxMonthlyTotal = Math.max(0, ...dados.map((item) => item.total))
  const maxVal = maxMonthlyTotal > 0 ? maxMonthlyTotal * 1.1 : 100
  const gridTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <section className="pds-grafico-barras-mes pds-insights-card pds-insights-card--com-tooltip" aria-label="Pedidos por mês">
      <div className="pds-grafico-barras-mes__header">
        <div className="pds-grafico-barras-mes__titulo-wrap">
          <span className="pds-grafico-barras-mes__icone" aria-hidden>
            <ChartBar weight="duotone" size={14} style={{ color: '#3b82f6' }} />
          </span>
          <h3 className="pds-grafico-barras-mes__titulo">Pedidos por Mês</h3>
        </div>
        <span className="pds-grafico-barras-mes__subtitulo">Últimos 6 meses</span>
      </div>

      <div className="sr-insights-tt-host pds-grafico-barras-mes__chart-wrap" ref={mesTooltip.containerRef}>
        <svg viewBox={`0 0 ${W} ${H}`} className="pds-grafico-barras-mes__svg" aria-hidden>
          <defs>
            <linearGradient id={`grad-aprov-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id={`grad-and-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id={`grad-rec-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id={`col-shadow-${uid}`} x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {gridTicks.map((tick, idx) => {
            const y = pad.top + tick * innerH
            const val = Math.round((1 - tick) * maxVal)
            return (
              <g key={idx}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={W - pad.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray={tick === 1 ? undefined : '4, 4'}
                />
                <text
                  x={pad.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="13"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {dados.map((item, i) => {
            const total = item.total
            const w = barW * 0.45
            const x = pad.left + i * barW + (barW - w) / 2

            if (total === 0) {
              return (
                <g key={item.mes}>
                  <text x={x + w / 2} y={H - 10} textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="600">
                    {item.mes}
                  </text>
                </g>
              )
            }

            const fullH = (total / maxVal) * innerH
            const hAprov = (item.aprovadas / total) * fullH
            const hAnd = (item.emAndamento / total) * fullH
            const hRec = (item.recusadas / total) * fullH
            const yTop = pad.top + innerH - fullH

            const hTopDraw = Math.max(2, hAprov - 1)
            const hMidDraw = Math.max(2, hAnd - 2)
            const hBotDraw = Math.max(2, hRec - 1)

            const yTopSeg = yTop
            const yMidSeg = yTop + hAprov + 1
            const yBotSeg = yTop + hAprov + hAnd + 1

            const r = Math.min(5, hBotDraw / 2, w / 2)
            const botPath = `M ${x} ${yBotSeg} L ${x + w} ${yBotSeg} L ${x + w} ${yBotSeg + hBotDraw - r} A ${r} ${r} 0 0 1 ${x + w - r} ${yBotSeg + hBotDraw} L ${x + r} ${yBotSeg + hBotDraw} A ${r} ${r} 0 0 1 ${x} ${yBotSeg + hBotDraw - r} Z`

            return (
              <g key={item.mes} className="pds-grafico-barras-mes__bar-group" filter={`url(#col-shadow-${uid})`}>
                <rect
                  x={pad.left + i * barW}
                  y={pad.top}
                  width={barW}
                  height={innerH}
                  fill="transparent"
                  className="pds-grafico-barras-mes__hit"
                  onMouseEnter={(e) => mesTooltip.aoEntrar(e, item)}
                  onMouseLeave={mesTooltip.aoSair}
                />
                {item.aprovadas > 0 && (
                  <rect
                    x={x}
                    y={yTopSeg}
                    width={w}
                    height={hTopDraw}
                    rx={5}
                    ry={5}
                    fill={`url(#grad-aprov-${uid})`}
                  />
                )}
                {item.emAndamento > 0 && (
                  <rect x={x} y={yMidSeg} width={w} height={hMidDraw} fill={`url(#grad-and-${uid})`} />
                )}
                {item.recusadas > 0 && <path d={botPath} fill={`url(#grad-rec-${uid})`} />}
                <text
                  x={x + w / 2}
                  y={yTop - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="700"
                  className="pds-grafico-barras-mes__total"
                >
                  {total}
                </text>
                <text x={x + w / 2} y={H - 10} textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="600">
                  {item.mes}
                </text>
              </g>
            )
          })}
        </svg>

        {mesTooltip.estado && (
          <TooltipGraficoInsightsSimulador
            ancora={mesTooltip.estado.ancora}
            containerRef={mesTooltip.containerRef}
            conteudo={{
              titulo: mesTooltip.estado.dados.mes,
              total: mesTooltip.estado.dados.total,
              totalRotulo: 'pedidos',
              barra: [
                {
                  cor: '#f59e0b',
                  pct: (mesTooltip.estado.dados.aprovadas / Math.max(1, mesTooltip.estado.dados.total)) * 100,
                },
                {
                  cor: '#8b5cf6',
                  pct: (mesTooltip.estado.dados.emAndamento / Math.max(1, mesTooltip.estado.dados.total)) * 100,
                },
                {
                  cor: '#f87171',
                  pct: (mesTooltip.estado.dados.recusadas / Math.max(1, mesTooltip.estado.dados.total)) * 100,
                },
              ],
              linhas: [
                { cor: '#f59e0b', rotulo: 'Aprovadas', valor: mesTooltip.estado.dados.aprovadas },
                { cor: '#8b5cf6', rotulo: 'Em andamento', valor: mesTooltip.estado.dados.emAndamento },
                { cor: '#f87171', rotulo: 'Recusadas', valor: mesTooltip.estado.dados.recusadas },
              ],
            }}
          />
        )}
      </div>

      <div className="pds-grafico-barras-mes__legenda">
        <span>
          <span className="pds-grafico-barras-mes__legenda-dot" style={{ background: '#f59e0b' }} />
          Aprovadas
        </span>
        <span>
          <span className="pds-grafico-barras-mes__legenda-dot" style={{ background: '#8b5cf6' }} />
          Em andamento
        </span>
        <span>
          <span className="pds-grafico-barras-mes__legenda-dot" style={{ background: '#f87171' }} />
          Recusadas
        </span>
      </div>
    </section>
  )
}
