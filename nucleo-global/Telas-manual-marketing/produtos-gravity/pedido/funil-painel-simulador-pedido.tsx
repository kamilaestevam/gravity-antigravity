import { Funnel } from '@phosphor-icons/react'
import {
  TooltipGraficoInsightsSimulador,
  formatarPercentualTooltipInsightsSimulador,
  useHoverTooltipInsightsSimulador,
} from '../smart-doc/tooltip-grafico-insights-simulador'
import type { FunilPedidoSimulador } from './dados-insights-simulador-pedido'
import './funil-painel-simulador-pedido.css'

type Props = {
  funil: FunilPedidoSimulador[]
}

export function FunilPainelSimuladorPedido({ funil }: Props) {
  const funilTooltip = useHoverTooltipInsightsSimulador<FunilPedidoSimulador>()
  const maxCount = Math.max(...funil.map((item) => item.count), 1)

  return (
    <section className="pds-funil-painel pds-insights-card pds-insights-card--com-tooltip" aria-label="Funil de pedidos" data-sds-tutorial-alvo="pedido-insights-funil">
      <div className="pds-funil-painel__header">
        <span className="pds-funil-painel__icone" aria-hidden>
          <Funnel size={14} weight="duotone" style={{ color: '#818cf8' }} />
        </span>
        <h3 className="pds-funil-painel__titulo">Funil de Pedidos</h3>
      </div>

      <div className="sr-insights-tt-host pds-funil-painel__lista-wrap" ref={funilTooltip.containerRef}>
        <div className="pds-funil-painel__lista">
          {funil.map((item) => {
            const barW = (item.count / maxCount) * 100
            return (
              <div
                key={item.rotulo}
                className="pds-funil-painel__row"
                onMouseEnter={(e) => funilTooltip.aoEntrar(e, item)}
                onMouseLeave={funilTooltip.aoSair}
              >
                <span className="pds-funil-painel__label">{item.rotulo}</span>
                <div className="pds-funil-painel__bar-wrap">
                  <div className="pds-funil-painel__bar" style={{ width: `${barW}%`, background: item.cor }} />
                </div>
                <span className="pds-funil-painel__count">{item.count}</span>
                <span className="pds-funil-painel__pct">{item.pct}%</span>
              </div>
            )
          })}
        </div>

        {funilTooltip.estado && (
          <TooltipGraficoInsightsSimulador
            ancora={funilTooltip.estado.ancora}
            containerRef={funilTooltip.containerRef}
            conteudo={{
              titulo: funilTooltip.estado.dados.rotulo,
              total: funilTooltip.estado.dados.count,
              totalRotulo: 'pedidos',
              linhas: [
                {
                  cor: funilTooltip.estado.dados.cor,
                  rotulo: 'Participação',
                  valor: formatarPercentualTooltipInsightsSimulador(funilTooltip.estado.dados.pct),
                },
              ],
            }}
          />
        )}
      </div>
    </section>
  )
}
