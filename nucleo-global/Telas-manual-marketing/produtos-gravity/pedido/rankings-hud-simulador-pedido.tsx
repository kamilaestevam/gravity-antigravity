import { useState } from 'react'
import { Globe, List, MapPin } from '@phosphor-icons/react'
import {
  TooltipGraficoInsightsSimulador,
  useHoverTooltipInsightsSimulador,
} from '../smart-doc/tooltip-grafico-insights-simulador'
import type { HudModaisPedidoSimulador, HudRankingPedidoSimulador } from './dados-insights-simulador-pedido'
import './rankings-hud-simulador-pedido.css'

type AbaHud = 'origens' | 'destinos' | 'modais'

type Props = {
  totalPedidos: number
  origens: HudRankingPedidoSimulador[]
  destinos: HudRankingPedidoSimulador[]
  modais: HudModaisPedidoSimulador[]
}

export function RankingsHudSimuladorPedido({ totalPedidos, origens, destinos, modais }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<AbaHud>('origens')
  const rankingTooltip = useHoverTooltipInsightsSimulador<HudRankingPedidoSimulador>()
  const modalTooltip = useHoverTooltipInsightsSimulador<HudModaisPedidoSimulador>()

  const listaAtiva = abaAtiva === 'origens' ? origens : abaAtiva === 'destinos' ? destinos : []

  return (
    <section className="pds-rankings-hud pds-insights-card" aria-label="Rankings globais de pedidos">
      <div className={`pds-rankings-hud__painel pds-rankings-hud__painel--${abaAtiva}`}>
        <div className="pds-rankings-hud__header">
          <div className="pds-rankings-hud__header-topo">
            <span className="pds-rankings-hud__titulo">Rankings Globais de Pedidos</span>
            <span className="pds-rankings-hud__live">
              <span className="pds-rankings-hud__live-dot" aria-hidden />
              LIVE
            </span>
          </div>
          <span className="pds-rankings-hud__subtitulo">
            {totalPedidos.toLocaleString('pt-BR')} pedidos no escopo
          </span>
        </div>

        <div className="pds-rankings-hud__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'origens'}
            className={`pds-rankings-hud__tab pds-rankings-hud__tab--origens${abaAtiva === 'origens' ? ' is-active' : ''}`}
            onClick={() => setAbaAtiva('origens')}
          >
            <Globe size={12} weight="bold" />
            Origens
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'destinos'}
            className={`pds-rankings-hud__tab pds-rankings-hud__tab--destinos${abaAtiva === 'destinos' ? ' is-active' : ''}`}
            onClick={() => setAbaAtiva('destinos')}
          >
            <MapPin size={12} weight="bold" />
            Destinos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'modais'}
            className={`pds-rankings-hud__tab pds-rankings-hud__tab--modais${abaAtiva === 'modais' ? ' is-active' : ''}`}
            onClick={() => setAbaAtiva('modais')}
          >
            <List size={12} weight="bold" />
            Modais
          </button>
        </div>

        <div className="sr-insights-tt-host pds-rankings-hud__lista-wrap" ref={rankingTooltip.containerRef}>
          {abaAtiva !== 'modais' && (
            <div className="pds-rankings-hud__lista">
              {listaAtiva.map((item) => (
                <div
                  key={`${abaAtiva}-${item.rank}-${item.code}`}
                  className="pds-rankings-hud__row"
                  onMouseEnter={(e) => rankingTooltip.aoEntrar(e, item)}
                  onMouseLeave={rankingTooltip.aoSair}
                >
                  <span className={`pds-rankings-hud__rank${item.rank <= 2 ? ` pds-rankings-hud__rank--${item.rank}` : ''}`}>
                    {item.rank}
                  </span>
                  <span className="pds-rankings-hud__flag">{item.flag}</span>
                  <div className="pds-rankings-hud__info">
                    <span className="pds-rankings-hud__cidade">{item.name}</span>
                    <span className="pds-rankings-hud__codigo">{item.code}</span>
                  </div>
                  <span className="pds-rankings-hud__count">{item.count} pedidos</span>
                </div>
              ))}
            </div>
          )}

          {abaAtiva === 'modais' && (
            <div className="pds-rankings-hud__lista" ref={modalTooltip.containerRef}>
              {modais.map((item, index) => (
                <div
                  key={item.key}
                  className="pds-rankings-hud__row"
                  onMouseEnter={(e) => modalTooltip.aoEntrar(e, item)}
                  onMouseLeave={modalTooltip.aoSair}
                >
                  <span className={`pds-rankings-hud__rank${index === 0 ? ' pds-rankings-hud__rank--1' : ''}`}>
                    {index + 1}
                  </span>
                  <div className="pds-rankings-hud__info">
                    <span className="pds-rankings-hud__cidade">{item.label}</span>
                    <span className="pds-rankings-hud__codigo">{item.count} pedidos</span>
                  </div>
                  <span className="pds-rankings-hud__count">{item.pct}%</span>
                </div>
              ))}
            </div>
          )}

          {rankingTooltip.estado && abaAtiva !== 'modais' && (
            <TooltipGraficoInsightsSimulador
              ancora={rankingTooltip.estado.ancora}
              containerRef={rankingTooltip.containerRef}
              conteudo={{
                titulo: rankingTooltip.estado.dados.name,
                subtitulo: rankingTooltip.estado.dados.code,
                total: rankingTooltip.estado.dados.count,
                totalRotulo: 'pedidos',
                linhas: [{ cor: '#f59e0b', rotulo: 'Posição', valor: `#${rankingTooltip.estado.dados.rank}` }],
              }}
            />
          )}

          {modalTooltip.estado && abaAtiva === 'modais' && (
            <TooltipGraficoInsightsSimulador
              ancora={modalTooltip.estado.ancora}
              containerRef={modalTooltip.containerRef}
              conteudo={{
                titulo: modalTooltip.estado.dados.label,
                total: modalTooltip.estado.dados.count,
                totalRotulo: 'pedidos',
                linhas: [{ cor: '#f59e0b', rotulo: 'Participação', valor: `${modalTooltip.estado.dados.pct}%` }],
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
