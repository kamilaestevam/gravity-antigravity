import { useMemo } from 'react'
import { CheckCircle, Clock, Timer, Coins } from '@phosphor-icons/react'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import { CardKpiSimulador } from '../smart-doc/card-kpi-simulador'
import {
  TooltipGraficoInsightsSimulador,
  formatarPercentualTooltipInsightsSimulador,
  useHoverTooltipInsightsSimulador,
} from '../smart-doc/tooltip-grafico-insights-simulador'
import { MapaGloboSimuladorPedido } from './mapa-globo-simulador-pedido'
import { RankingsHudSimuladorPedido } from './rankings-hud-simulador-pedido'
import { AlertasPainelSimuladorPedido } from './alertas-painel-simulador-pedido'
import { FunilPainelSimuladorPedido } from './funil-painel-simulador-pedido'
import { GraficoBarrasMensalSimuladorPedido } from './grafico-barras-mensal-simulador-pedido'
import { GraficoDonutOperacaoSimuladorPedido } from './grafico-donut-operacao-simulador-pedido'
import {
  agregarInsightsPedidosEmpresasSimulador,
  montarLinhasTooltipKpiPedido,
  type IncotermPedidoSimulador,
  type MoedaPedidoSimulador,
} from './dados-insights-simulador-pedido'
import './insights-simulador-pedido.css'

const ICONES_KPI_PEDIDO = {
  rascunho: <Clock weight="duotone" size={16} style={{ color: '#94a3b8' }} />,
  aberto: <CheckCircle weight="duotone" size={16} style={{ color: '#fbbf24' }} />,
  andamento: <Timer weight="duotone" size={16} style={{ color: '#f59e0b' }} />,
  consolidado: <Coins weight="duotone" size={16} style={{ color: '#34d399' }} />,
} as const

type Props = {
  empresasSelecionadas: PerfilEmpresaSimulador[]
}

export function InsightsSimuladorPedido({ empresasSelecionadas }: Props) {
  const insights = useMemo(
    () => agregarInsightsPedidosEmpresasSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )

  const moedaTooltip = useHoverTooltipInsightsSimulador<MoedaPedidoSimulador>()
  const incotermTooltip = useHoverTooltipInsightsSimulador<IncotermPedidoSimulador>()
  const taxaTooltip = useHoverTooltipInsightsSimulador<'emTempo' | 'atrasadas'>()

  return (
    <div className="pds-insights">
      <div className="pds-insights-kpis">
        {insights.kpis.map((kpi) => (
          <CardKpiSimulador
            key={kpi.id}
            titulo={kpi.titulo}
            valor={kpi.count.toLocaleString('pt-BR')}
            variante={kpi.variante}
            icone={ICONES_KPI_PEDIDO[kpi.id]}
            className="pds-insights-kpi-card"
            tooltip={
              <>
                {montarLinhasTooltipKpiPedido(kpi, insights.totalPedidos).map((linha) => (
                  <p key={linha.rotulo} className="cg-tooltip__row">
                    <span>{linha.rotulo}</span>
                    <strong>{linha.valor}</strong>
                  </p>
                ))}
              </>
            }
          />
        ))}
      </div>

      <div className="pds-insights-globe-row">
        <MapaGloboSimuladorPedido empresasSelecionadas={empresasSelecionadas} />

        <RankingsHudSimuladorPedido
          totalPedidos={insights.totalPedidos}
          origens={insights.hudOrigens}
          destinos={insights.hudDestinos}
          modais={insights.hudModais}
        />

        <div className="pds-insights-globe-row__coluna-direita">
          <AlertasPainelSimuladorPedido alertas={insights.alertas} />
          <FunilPainelSimuladorPedido funil={insights.funil} />
        </div>
      </div>

      <div className="pds-insights-grid-secundario">
        <GraficoBarrasMensalSimuladorPedido dados={insights.pedidosPorMes} />

        <GraficoDonutOperacaoSimuladorPedido dados={insights.distribuicaoOperacao} />

        <section className="pds-insights-card pds-insights-card--com-tooltip" aria-label="Moedas dos pedidos">
          <h3 className="pds-insights-card__titulo">Moedas dos Pedidos</h3>
          <div className="sr-insights-tt-host" ref={moedaTooltip.containerRef}>
            <ul className="pds-insights-legenda-lista">
              {insights.moedas.map((item) => (
                <li
                  key={item.moeda}
                  onMouseEnter={(e) => moedaTooltip.aoEntrar(e, item)}
                  onMouseLeave={moedaTooltip.aoSair}
                >
                  <strong>{item.moeda}</strong>
                  <span>
                    {item.pedidos} pedidos ({item.pct}%)
                  </span>
                </li>
              ))}
            </ul>
            {moedaTooltip.estado && (
              <TooltipGraficoInsightsSimulador
                ancora={moedaTooltip.estado.ancora}
                containerRef={moedaTooltip.containerRef}
                conteudo={{
                  titulo: moedaTooltip.estado.dados.moeda,
                  total: moedaTooltip.estado.dados.pedidos,
                  totalRotulo: 'pedidos',
                  linhas: [
                    {
                      cor: '#fbbf24',
                      rotulo: 'Participação',
                      valor: formatarPercentualTooltipInsightsSimulador(moedaTooltip.estado.dados.pct),
                    },
                  ],
                }}
              />
            )}
          </div>
        </section>
      </div>

      <div className="pds-insights-grid-secundario pds-insights-grid-secundario--duo">
        <section className="pds-insights-card" aria-label="Maior pedido do período">
          <h3 className="pds-insights-card__titulo">Maior Pedido do Período</h3>
          <span className="pds-insights-chip">{insights.maiorPedidoChip}</span>
          <p className="pds-insights-destaque-valor">{insights.maiorPedidoValor}</p>
          <p className="pds-insights-card__sub">
            Pedido de maior valor entre {insights.totalPedidos.toLocaleString('pt-BR')} pedidos do período.
          </p>
        </section>

        <section className="pds-insights-card pds-insights-card--com-tooltip" aria-label="Top incoterms">
          <h3 className="pds-insights-card__titulo">Top Incoterms</h3>
          <div className="sr-insights-tt-host" ref={incotermTooltip.containerRef}>
            <div className="pds-insights-incoterm">
              {insights.incoterms.map((item) => (
                <div
                  key={item.codigo}
                  className="pds-insights-incoterm__item"
                  onMouseEnter={(e) => incotermTooltip.aoEntrar(e, item)}
                  onMouseLeave={incotermTooltip.aoSair}
                >
                  <strong style={{ color: '#e2e8f0' }}>{item.codigo}</strong>
                  <div className="pds-insights-incoterm__barra">
                    <span style={{ width: `${item.pct * 4}%` }} />
                  </div>
                  <span>
                    {item.valor} ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
            {incotermTooltip.estado && (
              <TooltipGraficoInsightsSimulador
                ancora={incotermTooltip.estado.ancora}
                containerRef={incotermTooltip.containerRef}
                conteudo={{
                  titulo: incotermTooltip.estado.dados.codigo,
                  total: incotermTooltip.estado.dados.valor,
                  totalRotulo: 'pedidos',
                  linhas: [
                    {
                      cor: '#f59e0b',
                      rotulo: 'Participação',
                      valor: formatarPercentualTooltipInsightsSimulador(incotermTooltip.estado.dados.pct),
                    },
                  ],
                }}
              />
            )}
          </div>
        </section>

        <section className="pds-insights-card pds-insights-card--com-tooltip" aria-label="Taxa de aprovação">
          <h3 className="pds-insights-card__titulo">Taxa de Aprovação</h3>
          <div className="pds-insights-taxa">
            <div className="pds-insights-taxa__donut" aria-hidden>
              <strong>{insights.taxaAprovacao.emTempo}%</strong>
            </div>
            <div className="sr-insights-tt-host" ref={taxaTooltip.containerRef}>
              <ul className="pds-insights-legenda-lista">
                <li
                  onMouseEnter={(e) => taxaTooltip.aoEntrar(e, 'emTempo')}
                  onMouseLeave={taxaTooltip.aoSair}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="pds-insights-legenda-dot" style={{ background: '#34d399' }} />
                    Em tempo
                  </span>
                  <span>{insights.taxaAprovacao.emTempo}%</span>
                </li>
                <li
                  onMouseEnter={(e) => taxaTooltip.aoEntrar(e, 'atrasadas')}
                  onMouseLeave={taxaTooltip.aoSair}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="pds-insights-legenda-dot" style={{ background: '#f87171' }} />
                    Atrasadas
                  </span>
                  <span>{insights.taxaAprovacao.atrasadas}%</span>
                </li>
              </ul>
              {taxaTooltip.estado && (
                <TooltipGraficoInsightsSimulador
                  ancora={taxaTooltip.estado.ancora}
                  containerRef={taxaTooltip.containerRef}
                  conteudo={{
                    titulo: taxaTooltip.estado.dados === 'emTempo' ? 'Em tempo' : 'Atrasadas',
                    total:
                      taxaTooltip.estado.dados === 'emTempo'
                        ? `${insights.taxaAprovacao.emTempo}%`
                        : `${insights.taxaAprovacao.atrasadas}%`,
                    totalRotulo: 'do total',
                    linhas: [
                      {
                        cor: taxaTooltip.estado.dados === 'emTempo' ? '#34d399' : '#f87171',
                        rotulo: 'Sem resposta',
                        valor: `${insights.taxaAprovacao.semResposta}%`,
                      },
                    ],
                  }}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
