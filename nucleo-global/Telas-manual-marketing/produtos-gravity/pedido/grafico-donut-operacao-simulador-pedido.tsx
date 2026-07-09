import { ChartPie } from '@phosphor-icons/react'
import {
  TooltipGraficoInsightsSimulador,
  formatarPercentualTooltipInsightsSimulador,
  useHoverTooltipInsightsSimulador,
} from '../smart-doc/tooltip-grafico-insights-simulador'
import type { DistribuicaoOperacaoPedidoSimulador } from './dados-insights-simulador-pedido'
import './grafico-donut-operacao-simulador-pedido.css'

type Props = {
  dados: DistribuicaoOperacaoPedidoSimulador[]
}

export function GraficoDonutOperacaoSimuladorPedido({ dados }: Props) {
  const donutTooltip = useHoverTooltipInsightsSimulador<DistribuicaoOperacaoPedidoSimulador>()

  const total = dados.reduce((soma, item) => soma + item.valor, 0)
  const cx = 80
  const cy = 80
  const r = 58
  const stroke = 16
  const circ = 2 * Math.PI * r

  let offset = 0
  const arcs = dados.map((item) => {
    const pct = total > 0 ? item.valor / total : 0
    const dashLen = pct * circ
    const arc = { ...item, dashLen, dashOffset: -offset }
    offset += dashLen
    return arc
  })

  return (
    <section
      className="pds-grafico-donut-operacao pds-insights-card pds-insights-card--com-tooltip"
      aria-label="Distribuição por tipo de operação"
    >
      <div className="pds-grafico-donut-operacao__header">
        <span className="pds-grafico-donut-operacao__icone" aria-hidden>
          <ChartPie weight="duotone" size={14} style={{ color: '#34d399' }} />
        </span>
        <h3 className="pds-grafico-donut-operacao__titulo">Distribuição por Tipo de Operação</h3>
      </div>

      <div className="pds-grafico-donut-operacao__corpo">
        <svg viewBox="0 0 160 160" width="100" height="100" className="pds-grafico-donut-operacao__svg" aria-hidden>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth={stroke} />
          {arcs.map((arc) => (
            <circle
              key={arc.rotulo}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.cor}
              strokeWidth={stroke}
              strokeDasharray={`${arc.dashLen} ${circ - arc.dashLen}`}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
            />
          ))}
          <text
            x={cx}
            y={cy - 3}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="22"
            fontWeight="800"
            style={{ letterSpacing: '0.02em' }}
          >
            {total.toLocaleString('pt-BR')}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="9"
            fontWeight="600"
            style={{ letterSpacing: '0.04em' }}
          >
            pedidos
          </text>
        </svg>

        <div className="sr-insights-tt-host pds-grafico-donut-operacao__legenda-wrap" ref={donutTooltip.containerRef}>
          <div className="pds-grafico-donut-operacao__legenda">
            {dados.map((item) => (
              <div
                key={item.rotulo}
                className="pds-grafico-donut-operacao__legenda-row"
                onMouseEnter={(e) => donutTooltip.aoEntrar(e, item)}
                onMouseLeave={donutTooltip.aoSair}
              >
                <span className="pds-grafico-donut-operacao__legenda-dot" style={{ background: item.cor }} />
                <span className="pds-grafico-donut-operacao__legenda-label">{item.rotulo}</span>
                <div className="pds-grafico-donut-operacao__legenda-bar">
                  <div
                    className="pds-grafico-donut-operacao__legenda-bar-fill"
                    style={{ width: `${item.pct}%`, background: item.cor }}
                  />
                </div>
                <span className="pds-grafico-donut-operacao__legenda-count" style={{ color: item.cor }}>
                  {item.valor}
                </span>
                <span className="pds-grafico-donut-operacao__legenda-pct">{item.pct}%</span>
              </div>
            ))}
          </div>

          {donutTooltip.estado && (
            <TooltipGraficoInsightsSimulador
              ancora={donutTooltip.estado.ancora}
              containerRef={donutTooltip.containerRef}
              conteudo={{
                titulo: donutTooltip.estado.dados.rotulo,
                total: donutTooltip.estado.dados.valor,
                totalRotulo: 'pedidos',
                linhas: [
                  {
                    cor: donutTooltip.estado.dados.cor,
                    rotulo: 'Participação',
                    valor: formatarPercentualTooltipInsightsSimulador(donutTooltip.estado.dados.pct),
                  },
                ],
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
