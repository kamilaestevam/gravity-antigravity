/**
 * InsightsSimuladorBidFrete — paridade visual com a Visão Geral (Insights)
 * do BID Frete Internacional real: KPIs fixos com tooltips ricos, mapa
 * global de cotações, alertas, funil, gráficos e câmbio do dia.
 */

import { useMemo, useState, type ReactNode } from 'react'
import { CurrencyDollar, Envelope, Timer, TrendDown, TrendUp, Trophy, Warning } from '@phosphor-icons/react'
import { CardBasicoGlobal } from '../../../Layout/card-global/src/index'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  TooltipGraficoInsightsSimulador,
  formatarPercentualTooltipInsightsSimulador,
  useHoverTooltipInsightsSimulador,
} from '../smart-doc/tooltip-grafico-insights-simulador'
import { MapaGloboSimuladorPedido } from '../pedido/mapa-globo-simulador-pedido'
import { AlertasPainelSimuladorPedido } from '../pedido/alertas-painel-simulador-pedido'
import { FunilPainelSimuladorPedido } from '../pedido/funil-painel-simulador-pedido'
import { RankingsHudSimuladorPedido } from '../pedido/rankings-hud-simulador-pedido'
import type { HudRankingPedidoSimulador } from '../pedido/dados-insights-simulador-pedido'
import { GraficoBarrasMensalSimuladorPedido } from '../pedido/grafico-barras-mensal-simulador-pedido'
import { GraficoDonutOperacaoSimuladorPedido } from '../pedido/grafico-donut-operacao-simulador-pedido'
import type { IncotermPedidoSimulador } from '../pedido/dados-insights-simulador-pedido'
import {
  agregarInsightsBidFreteEmpresasSimulador,
  formatarUsdSimuladorBidFrete,
  listarCotacoesEmpresasSimuladorBidFrete,
  montarContextoRefinarMapaBidFrete,
  montarRotasDetalhePorPinoBidFrete,
  TITULO_KPI_AGUARDANDO_APROVACAO_BID_FRETE,
  TITULO_KPI_AGUARDANDO_RESPOSTA_BID_FRETE,
  TITULO_KPI_TEMPO_MEDIO_RESPOSTA_BID_FRETE,
  type CotacaoSimuladorBidFrete,
  type PtaxSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import '../pedido/insights-simulador-pedido.css'
import './insights-simulador-bid-frete.css'
import { ModalRotasAtivasSimuladorBidFrete } from './modal-rotas-ativas-simulador-bid-frete'

type Props = {
  empresasSelecionadas: PerfilEmpresaSimulador[]
  onAbrirPainelCotacao?: (cotacao: CotacaoSimuladorBidFrete) => void
}

function contagemModalTooltip(cotacoes: CotacaoSimuladorBidFrete[], modal: string): number {
  return cotacoes.filter((c) => c.modal === modal).length
}

/** dd/mm/aa · tempo decorrido — mesmo formato do produto real. */
function formatarLinhaDataTempoTooltip(dataIso: string): string {
  const data = new Date(`${dataIso}T00:00:00`)
  if (!Number.isFinite(data.getTime())) return '—'
  const dd = String(data.getDate()).padStart(2, '0')
  const mm = String(data.getMonth() + 1).padStart(2, '0')
  const aa = String(data.getFullYear()).slice(-2)

  const diffMs = Math.max(0, Date.now() - data.getTime())
  const minutos = Math.floor(diffMs / (1000 * 60))
  let tempo: string
  if (minutos < 1) tempo = '< 1 min'
  else if (minutos < 60) tempo = `${minutos} min`
  else if (minutos < 60 * 24) tempo = `${Math.floor(minutos / 60)} h`
  else if (minutos < 60 * 24 * 30) tempo = `${Math.floor(minutos / (60 * 24))} d`
  else tempo = `${Math.floor(minutos / (60 * 24 * 30))} m`

  return `${dd}/${mm}/${aa} · ${tempo}`
}

function ResumoTooltipKpi({ volumeRotulo, volumeValor, tituloContagem, contagem, linhasExtras, cotacoes }: {
  volumeRotulo: string
  volumeValor: string
  tituloContagem: string
  contagem: number
  linhasExtras?: Array<{ rotulo: string; valor: number; cor?: string }>
  cotacoes: CotacaoSimuladorBidFrete[]
}) {
  return (
    <>
      <p className="cg-tooltip__row">
        <span>{volumeRotulo}</span>
        <strong>{volumeValor}</strong>
      </p>
      <p className="cg-tooltip__row">
        <span>{tituloContagem}</span>
        <strong>{contagem}</strong>
      </p>
      {linhasExtras?.map((linha) => (
        <p key={linha.rotulo} className="cg-tooltip__row">
          <span>{linha.rotulo}</span>
          <strong style={linha.cor ? { color: linha.cor } : undefined}>{linha.valor}</strong>
        </p>
      ))}
      <p className="cg-tooltip__row">
        <span>Marítimo</span>
        <strong style={{ color: '#34d399' }}>{contagemModalTooltip(cotacoes, 'MARITIMO')}</strong>
      </p>
      <p className="cg-tooltip__row">
        <span>Aéreo</span>
        <strong style={{ color: '#a78bfa' }}>{contagemModalTooltip(cotacoes, 'AEREO')}</strong>
      </p>
      <p className="cg-tooltip__row">
        <span>Rodoviário</span>
        <strong style={{ color: '#fbbf24' }}>{contagemModalTooltip(cotacoes, 'RODOVIARIO')}</strong>
      </p>
    </>
  )
}

function TooltipKpiCotacoes({ resumo, cotacoes, rotuloColunaData }: {
  resumo: ReactNode
  cotacoes: CotacaoSimuladorBidFrete[]
  rotuloColunaData: string
}) {
  const ordenadas = [...cotacoes].sort(
    (a, b) => new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime(),
  )
  const visiveis = ordenadas.slice(0, 6)
  const restantes = ordenadas.length - visiveis.length
  return (
    <div className="bfs-kpi-tooltip-insights">
      {resumo}
      {visiveis.length > 0 && (
        <>
          <div className="cg-tooltip__divider" style={{ margin: '0.65rem 0 0.45rem' }} />
          <div className="bfs-kpi-tooltip-insights__head">
            <span>Cotação</span>
            <span>{rotuloColunaData}</span>
          </div>
          <div className="bfs-kpi-tooltip-insights__lista">
            {visiveis.map((c) => (
              <div key={c.id} className="bfs-kpi-tooltip-insights__row">
                <span className="bfs-kpi-tooltip-insights__link">{c.numero}</span>
                <span>{formatarLinhaDataTempoTooltip(c.dataCriacao)}</span>
              </div>
            ))}
          </div>
          {restantes > 0 && (
            <p className="bfs-kpi-tooltip-insights__mais">
              {`+${restantes} cota${restantes > 1 ? 'ções' : 'ção'} não exibida${restantes > 1 ? 's' : ''}`}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export function InsightsSimuladorBidFrete({
  empresasSelecionadas,
  onAbrirPainelCotacao,
}: Props) {
  const [pinSelecionadoId, setPinSelecionadoId] = useState<number | null>(null)

  const insights = useMemo(
    () => agregarInsightsBidFreteEmpresasSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )
  const contextoMapa = useMemo(
    () => montarContextoRefinarMapaBidFrete(empresasSelecionadas),
    [empresasSelecionadas],
  )
  const rotasPorPino = useMemo(
    () => montarRotasDetalhePorPinoBidFrete(empresasSelecionadas),
    [empresasSelecionadas],
  )
  const pinSelecionado = useMemo(() => {
    if (pinSelecionadoId == null) return null
    return contextoMapa.mapaBase.pins.find((pin) => pin.id === pinSelecionadoId) ?? null
  }, [contextoMapa.mapaBase.pins, pinSelecionadoId])

  // Rankings globais por terminal (origens/destinos) e por modal — como no real
  const rankings = useMemo(() => {
    const cotacoes = listarCotacoesEmpresasSimuladorBidFrete(empresasSelecionadas)

    function rankearTerminais(
      selecionar: (c: CotacaoSimuladorBidFrete) => CotacaoSimuladorBidFrete['origem'],
    ): HudRankingPedidoSimulador[] {
      const mapa = new Map<string, Omit<HudRankingPedidoSimulador, 'rank'>>()
      for (const c of cotacoes) {
        const porto = selecionar(c)
        const atual = mapa.get(porto.codigo)
        if (atual) atual.count += 1
        else mapa.set(porto.codigo, { flag: porto.flag, name: porto.cidade, code: porto.codigo, count: 1 })
      }
      return [...mapa.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((item, i) => ({ rank: i + 1, ...item }))
    }

    return {
      total: cotacoes.length,
      origens: rankearTerminais((c) => c.origem),
      destinos: rankearTerminais((c) => c.destino),
    }
  }, [empresasSelecionadas])

  const hudModais = useMemo(
    () =>
      insights.distribuicaoModal.map((item) => ({
        key: item.rotulo,
        label: item.rotulo,
        count: item.valor,
        pct: item.pct,
      })),
    [insights.distribuicaoModal],
  )

  const incotermTooltip = useHoverTooltipInsightsSimulador<IncotermPedidoSimulador>()
  const taxaTooltip = useHoverTooltipInsightsSimulador<'emTempo' | 'atrasadas'>()
  const ptaxTooltip = useHoverTooltipInsightsSimulador<PtaxSimuladorBidFrete>()

  return (
    <div className="pds-insights bfs-insights">
      {/* KPIs fixos — paridade com o produto real */}
      <div className="pds-insights-kpis bfs-insights-kpis">
        <CardBasicoGlobal
          titulo={TITULO_KPI_AGUARDANDO_APROVACAO_BID_FRETE}
          icone={<Warning weight="duotone" size={16} style={{ color: '#818cf8' }} />}
          valor={String(insights.aguardandoAprovacao.count)}
          subtexto={`${formatarUsdSimuladorBidFrete(insights.aguardandoAprovacao.volumeAbertoUsd)} em melhores lances`}
          variante="padrao"
          className="pds-insights-kpi-card"
          tooltip={
            <TooltipKpiCotacoes
              resumo={
                <ResumoTooltipKpi
                  volumeRotulo="Volume em aberto"
                  volumeValor={formatarUsdSimuladorBidFrete(insights.aguardandoAprovacao.volumeAbertoUsd)}
                  tituloContagem={TITULO_KPI_AGUARDANDO_APROVACAO_BID_FRETE}
                  contagem={insights.aguardandoAprovacao.count}
                  cotacoes={insights.aguardandoAprovacao.cotacoes}
                />
              }
              cotacoes={insights.aguardandoAprovacao.cotacoes}
              rotuloColunaData="Respondido"
            />
          }
        />
        <CardBasicoGlobal
          titulo={TITULO_KPI_AGUARDANDO_RESPOSTA_BID_FRETE}
          icone={<Envelope weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
          valor={String(insights.aguardandoResposta.count)}
          subtexto={`${insights.aguardandoResposta.enviadas} enviadas · ${insights.aguardandoResposta.emCotacao} em cotação`}
          variante="padrao"
          className="pds-insights-kpi-card"
          tooltip={
            <TooltipKpiCotacoes
              resumo={
                <ResumoTooltipKpi
                  volumeRotulo="Volume meta (USD)"
                  volumeValor={formatarUsdSimuladorBidFrete(insights.aguardandoResposta.volumeMetaUsd)}
                  tituloContagem={TITULO_KPI_AGUARDANDO_RESPOSTA_BID_FRETE}
                  contagem={insights.aguardandoResposta.count}
                  linhasExtras={[
                    { rotulo: 'Enviada ao fornecedor', valor: insights.aguardandoResposta.enviadas },
                    { rotulo: 'Em cotação', valor: insights.aguardandoResposta.emCotacao, cor: '#34d399' },
                  ]}
                  cotacoes={insights.aguardandoResposta.cotacoes}
                />
              }
              cotacoes={insights.aguardandoResposta.cotacoes}
              rotuloColunaData="Envio"
            />
          }
        />
        <CardBasicoGlobal
          titulo={TITULO_KPI_TEMPO_MEDIO_RESPOSTA_BID_FRETE}
          icone={<Timer weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
          valor={`${insights.tempoMedioRespostaDias.toLocaleString('pt-BR')} dias`}
          subtexto="Meta: 3 dias"
          variante="padrao"
          className="pds-insights-kpi-card"
          tooltip={
            <>
              <p className="cg-tooltip__row">
                <span>Média de resposta</span>
                <strong>{insights.tempoMedioRespostaDias.toLocaleString('pt-BR')} dias</strong>
              </p>
              <p className="cg-tooltip__row">
                <span>Meta SLA</span>
                <strong>3,0 dias</strong>
              </p>
              <p className="cg-tooltip__row">
                <span>Aprovações no prazo</span>
                <strong style={{ color: '#34d399' }}>{insights.taxaAprovacao.emTempo}%</strong>
              </p>
            </>
          }
        />
      </div>

      {/* Mapa global de cotações — largura total, como no produto real */}
      <div className="pds-insights-globe-row bfs-insights-globe-row--cheia">
        <MapaGloboSimuladorPedido
          contextoRefinarOverride={contextoMapa}
          titulo="Visão Geral Global de Cotações"
          subtitulo="Origens, destinos e rotas cotadas por terminal (arraste para girar)"
          ariaLabel="Visão geral global de cotações"
          rotulosTooltipPin={{
            contagem: 'Cotações na rota',
            secundario: 'Propostas recebidas',
            receber: 'Melhor lance',
            pagar: 'Volume meta',
          }}
          rotuloExportadoresRefinar="Fornecedores"
          rotuloImportadoresRefinar="Workspaces"
          onPinClick={setPinSelecionadoId}
        />
      </div>

      <ModalRotasAtivasSimuladorBidFrete
        aberto={pinSelecionado != null}
        pin={pinSelecionado}
        rotas={pinSelecionadoId != null ? rotasPorPino[pinSelecionadoId] ?? [] : []}
        onFechar={() => setPinSelecionadoId(null)}
        onAbrirCotacao={(cotacao) => {
          setPinSelecionadoId(null)
          onAbrirPainelCotacao?.(cotacao)
        }}
      />

      {/* Rankings Globais + Alertas / Funil — abaixo do mapa, como no real */}
      <div className="bfs-insights-rankings-row">
        <RankingsHudSimuladorPedido
          totalPedidos={rankings.total}
          origens={rankings.origens}
          destinos={rankings.destinos}
          modais={hudModais}
          titulo="Rankings Globais"
          rotuloEscopo="cotações no escopo"
          rotuloContagem="bids"
        />
        <div className="bfs-insights-rankings-row__coluna-direita">
          <AlertasPainelSimuladorPedido alertas={insights.alertas} totalRotulo="cotações" />
          <FunilPainelSimuladorPedido
            funil={insights.funil}
            titulo="Funil de Cotações"
            totalRotulo="cotações"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="pds-insights-grid-secundario">
        <GraficoBarrasMensalSimuladorPedido
          dados={insights.cotacoesPorMes}
          titulo="Cotações por Mês"
          totalRotulo="cotações"
          rotulosSegmentos={{ aprovadas: 'Aprovadas', emAndamento: 'Em cotação', recusadas: 'Reprovadas' }}
        />

        <GraficoDonutOperacaoSimuladorPedido
          dados={insights.distribuicaoModal}
          titulo="Distribuição por Modal"
          totalRotulo="cotações"
        />

        <section
          className="pds-insights-card pds-insights-card--com-tooltip"
          aria-label="Câmbio do dia"
        >
          <div className="bfs-insights-card-header">
            <span className="bfs-insights-card-header__icone" aria-hidden>
              <CurrencyDollar weight="duotone" size={14} style={{ color: '#34d399' }} />
            </span>
            <h3 className="pds-insights-card__titulo">Câmbio do Dia (PTAX)</h3>
          </div>
          <div className="sr-insights-tt-host" ref={ptaxTooltip.containerRef}>
            <ul className="pds-insights-legenda-lista bfs-insights-ptax-lista">
              {insights.ptax.map((item) => (
                <li
                  key={item.moeda}
                  onMouseEnter={(e) => ptaxTooltip.aoEntrar(e, item)}
                  onMouseLeave={ptaxTooltip.aoSair}
                >
                  <strong>{item.moeda}</strong>
                  <span className="bfs-insights-ptax-valor">
                    {item.valor}
                    <span
                      className="bfs-insights-ptax-variacao"
                      style={{ color: item.variacao >= 0 ? '#34d399' : '#f87171' }}
                    >
                      {item.variacao >= 0 ? (
                        <TrendUp size={12} weight="bold" />
                      ) : (
                        <TrendDown size={12} weight="bold" />
                      )}
                      {Math.abs(item.variacao).toLocaleString('pt-BR')}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {ptaxTooltip.estado && (
              <TooltipGraficoInsightsSimulador
                ancora={ptaxTooltip.estado.ancora}
                containerRef={ptaxTooltip.containerRef}
                conteudo={{
                  titulo: `${ptaxTooltip.estado.dados.moeda} — ${ptaxTooltip.estado.dados.nome}`,
                  total: ptaxTooltip.estado.dados.valor,
                  totalRotulo: 'PTAX venda',
                  linhas: [
                    {
                      cor: ptaxTooltip.estado.dados.variacao >= 0 ? '#34d399' : '#f87171',
                      rotulo: 'Variação vs dia anterior',
                      valor: `${ptaxTooltip.estado.dados.variacao >= 0 ? '+' : ''}${ptaxTooltip.estado.dados.variacao.toLocaleString('pt-BR')}%`,
                    },
                  ],
                }}
              />
            )}
          </div>
        </section>
      </div>

      {/* Destaques */}
      <div className="pds-insights-grid-secundario pds-insights-grid-secundario--duo">
        <section className="pds-insights-card" aria-label="Melhor negociação do período">
          <div className="bfs-insights-card-header">
            <span className="bfs-insights-card-header__icone" aria-hidden>
              <Trophy weight="duotone" size={14} style={{ color: '#fbbf24' }} />
            </span>
            <h3 className="pds-insights-card__titulo">Melhor Negociação do Período</h3>
          </div>
          {insights.melhorNegociacao ? (
            <>
              <span className="pds-insights-chip">
                {insights.melhorNegociacao.numero} · {insights.melhorNegociacao.rota}
              </span>
              <p className="pds-insights-destaque-valor bfs-insights-savings-valor">
                −{formatarUsdSimuladorBidFrete(insights.melhorNegociacao.savingsUsd)}
              </p>
              <p className="pds-insights-card__sub">
                Savings de {insights.melhorNegociacao.savingsPct}% sobre a meta — lance vencedor de{' '}
                {formatarUsdSimuladorBidFrete(insights.melhorNegociacao.lanceUsd)} da{' '}
                {insights.melhorNegociacao.fornecedor}.
              </p>
            </>
          ) : (
            <p className="pds-insights-card__sub">Nenhuma cotação aprovada no período.</p>
          )}
        </section>

        <section
          className="pds-insights-card pds-insights-card--com-tooltip"
          aria-label="Top incoterms"
        >
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
                    <span style={{ width: `${Math.min(100, item.pct * 2)}%` }} />
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
                  totalRotulo: 'cotações',
                  linhas: [
                    {
                      cor: '#60a5fa',
                      rotulo: 'Participação',
                      valor: formatarPercentualTooltipInsightsSimulador(incotermTooltip.estado.dados.pct),
                    },
                  ],
                }}
              />
            )}
          </div>
        </section>

        <section
          className="pds-insights-card pds-insights-card--com-tooltip"
          aria-label="Taxa de aprovação"
        >
          <h3 className="pds-insights-card__titulo">Taxa de Aprovação</h3>
          <div className="pds-insights-taxa">
            <div className="pds-insights-taxa__donut bfs-insights-taxa__donut" aria-hidden>
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
                    No prazo
                  </span>
                  <span>{insights.taxaAprovacao.emTempo}%</span>
                </li>
                <li
                  onMouseEnter={(e) => taxaTooltip.aoEntrar(e, 'atrasadas')}
                  onMouseLeave={taxaTooltip.aoSair}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="pds-insights-legenda-dot" style={{ background: '#f87171' }} />
                    Fora do prazo
                  </span>
                  <span>{insights.taxaAprovacao.atrasadas}%</span>
                </li>
              </ul>
              {taxaTooltip.estado && (
                <TooltipGraficoInsightsSimulador
                  ancora={taxaTooltip.estado.ancora}
                  containerRef={taxaTooltip.containerRef}
                  conteudo={{
                    titulo: taxaTooltip.estado.dados === 'emTempo' ? 'No prazo' : 'Fora do prazo',
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
