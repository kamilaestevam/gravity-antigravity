import React, { useCallback, useMemo, useState } from 'react'
import { CheckCircle, Trophy } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { BotaoGlobal } from '@nucleo/botao-global'
import '@produto/bid-frete-internacional/client/src/pages/cotacao-detalhe-cockpit.css'
import {
  SparkBarrasComparativo,
  SPARK_VIEW_MELHOR_PROPOSTA,
} from '@produto/bid-frete-internacional/client/src/shared/graficos-insights-cotacao-bid-frete-internacional'
import {
  buildComparativoMetrica,
  type BarraComparativoInsight,
  type ComparativoMetricaPainel,
} from '@produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'
import {
  CAMPOS_PAINEL_INSIGHTS_BID_FRETE,
  resolverExplicacaoPainelInsights,
  resolverSelecoesPainelInsights,
  type CampoPainelInsightsId,
} from './manual-bid-frete-guia-painel-insights-campos'
import { ManualBidFreteGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'
import {
  NC_ESTILOS_SIMULADOR_PAINEL_INSIGHTS,
  NC_ESTILOS_SIMULADOR_WIZARD_SHELL,
  NC_ESTILOS_AFFORDANCE_INTERATIVO_BID_FRETE,
} from './manual-bid-frete-estilos-nc-simulador'
import {
  FaixaDemoInterativaBidFrete,
  resolverProximoCampoAffordance,
  WrapperAlvoAffordanceBidFrete,
} from './manual-bid-frete-affordance-interativo'
import {
  NOME_AGENTE_LIDER_DEMO_PAINEL_INSIGHTS,
  ID_PROPOSTA_MELHOR_PAINEL_INSIGHTS,
  PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE,
} from './manual-bid-frete-mock-propostas-painel-insights'
import { ManualBidFreteRankingInsightsInterativo } from './manual-bid-frete-ranking-insights-interativo'
import { ManualBidFreteSimuladorTermometroInsights } from './manual-bid-frete-simulador-termometro-insights'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'

const ORDEM_AFFORDANCE_INSIGHTS = CAMPOS_PAINEL_INSIGHTS_BID_FRETE.map((c) => c.id)

const ROTULO_AFFORDANCE_CAMPO_INSIGHTS: Record<CampoPainelInsightsId, string> = {
  valor_total: 'Clique no valor',
  transit_time: 'Transit Time',
  free_time: 'Free Time',
  escala: 'Escala',
  fornecedor: 'Fornecedor',
  aprovar: 'Aprovar',
  ranking_lider: 'Líder do ranking',
  ranking_eixo_frete: 'Frete total',
  ranking_eixo_transit: 'Transit time',
  ranking_eixo_rota: 'Escala / transbordo',
  ranking_eixo_prazo: 'Prazo pagamento',
  termometro_historico: 'Termômetro histórico',
}

const CAMPOS_MELHOR_PROPOSTA = new Set<CampoPainelInsightsId>([
  'valor_total',
  'transit_time',
  'free_time',
  'escala',
  'fornecedor',
  'aprovar',
])

/** Altura do spark no manual — um pouco acima do cockpit (52px) para legibilidade na demo. */
const SPARK_SLOT_MANUAL_PX = 58

function criarTextoVsGanhador(
  t: TFunction,
  melhorMenor: boolean,
  sufixoDiff: string,
): (barra: BarraComparativoInsight, valorGanhador: number) => string {
  return (barra, valorGanhador) => {
    if (barra.destaque) {
      return t('bidfrete.detalhe_cotacao.spark_melhor_proposta', 'Melhor proposta (ganhador)')
    }
    const diff = Math.abs(barra.valor - valorGanhador)
    if (diff === 0) {
      return t('bidfrete.detalhe_cotacao.spark_igual_ganhador', 'Igual ao ganhador')
    }
    const diffFmt = sufixoDiff ? `${diff} ${sufixoDiff}` : String(diff)
    if (melhorMenor) {
      if (barra.valor > valorGanhador) {
        return t('bidfrete.detalhe_cotacao.spark_pior_vs_ganhador', '+{{diff}} vs ganhador', { diff: diffFmt })
      }
      return t('bidfrete.detalhe_cotacao.spark_melhor_vs_ganhador', '{{diff}} melhor que o ganhador', { diff: diffFmt })
    }
    if (barra.valor < valorGanhador) {
      return t('bidfrete.detalhe_cotacao.spark_pior_vs_ganhador_menos', '−{{diff}} vs ganhador', { diff: diffFmt })
    }
    return t('bidfrete.detalhe_cotacao.spark_melhor_vs_ganhador_mais', '+{{diff}} vs ganhador', { diff: diffFmt })
  }
}

function CelulaMetricaInsightsManual({
  label,
  valor,
  comparativo,
  rotuloMetrica,
  formatarValor,
  sufixoDiff = '',
  ativa,
  onSelecionar,
}: {
  label: string
  valor: string
  comparativo: ComparativoMetricaPainel | null
  rotuloMetrica: string
  formatarValor: (v: number) => string
  sufixoDiff?: string
  ativa: boolean
  onSelecionar: () => void
}) {
  const { t } = useTranslation()
  const textoVsGanhador = comparativo != null
    ? criarTextoVsGanhador(t, comparativo.melhorMenor, sufixoDiff)
    : () => ''

  const classeColuna = [
    'dc-smart-metrica-col',
    'dc-smart-metrica-col--insights-spark',
    'sim-insights-interativo',
    ativa ? 'sim-insights-interativo--ativa' : '',
  ].filter(Boolean).join(' ')

  if (comparativo == null || comparativo.barras.length === 0) {
    return (
      <button
        type="button"
        className={classeColuna}
        onClick={onSelecionar}
        aria-pressed={ativa}
      >
        <span className="dc-smart-metrica-label">{label}</span>
        <span className="dc-smart-metrica-valor">{valor}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className={classeColuna}
      onClick={onSelecionar}
      aria-pressed={ativa}
    >
      <div className="dc-smart-metrica-col-texto">
        <span className="dc-smart-metrica-label">{label}</span>
        <span className="dc-smart-metrica-valor">{valor}</span>
      </div>
      <div className="dc-smart-metrica-spark dc-smart-metrica-spark--melhor-proposta">
        <SparkBarrasComparativo
          barras={comparativo.barras}
          melhorMenor={comparativo.melhorMenor}
          variante="indigo"
          rotuloMetrica={rotuloMetrica}
          formatarValor={formatarValor}
          textoVsGanhador={textoVsGanhador}
          dimensoesView={SPARK_VIEW_MELHOR_PROPOSTA}
          ancoraBarras="base"
          preencherSlot
        />
      </div>
    </button>
  )
}

/** Manual BID Frete §7.02 — paridade cockpit (Melhor proposta + Ranking, demo interativa). */
export function ManualBidFreteSimuladorPainelInsights() {
  const { t } = useTranslation()
  const [foco, setFoco] = useState<CampoPainelInsightsId | null>(null)
  const [interagiu, setInteragiu] = useState<Partial<Record<CampoPainelInsightsId, boolean>>>({})
  const [propostaAprovada, setPropostaAprovada] = useState(false)
  const [animandoAprovacao, setAnimandoAprovacao] = useState(false)

  const marcarInteracao = useCallback((campo: CampoPainelInsightsId) => {
    setInteragiu((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
  }, [])

  const aoClicarAprovar = useCallback(() => {
    marcarInteracao('aprovar')
    if (propostaAprovada) {
      setPropostaAprovada(false)
      return
    }
    setAnimandoAprovacao(true)
    setPropostaAprovada(true)
    window.setTimeout(() => setAnimandoAprovacao(false), 520)
  }, [marcarInteracao, propostaAprovada])

  const interagiuAffordance = useMemo(
    () => ({
      ...interagiu,
      aprovar: interagiu.aprovar || propostaAprovada,
    }),
    [interagiu, propostaAprovada],
  )
  const proximoCampoAffordance = useMemo(
    () => resolverProximoCampoAffordance(ORDEM_AFFORDANCE_INSIGHTS, interagiuAffordance),
    [interagiuAffordance],
  )
  const demoAtiva = proximoCampoAffordance != null

  const propostaMelhor = useMemo(
    () => PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE.find(
      (p) => p.id_proposta_bid_frete_internacional === ID_PROPOSTA_MELHOR_PAINEL_INSIGHTS,
    ) ?? PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE[0],
    [],
  )

  const diasLabel = t('bidfrete.detalhe_cotacao.dias', 'dias')
  const fmtDias = useCallback((v: number) => `${v} ${diasLabel}`, [diasLabel])
  const fmtEscala = useCallback(
    (v: number) => (v === 0 ? t('bidfrete.comparativo.direto', 'Direto') : String(v)),
    [t],
  )

  const comparativos = useMemo(() => {
    const propostas = PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE
    const idDestaque = ID_PROPOSTA_MELHOR_PAINEL_INSIGHTS
    return {
      comparativoTransito: buildComparativoMetrica(
        propostas,
        (p) => p.dias_transito_proposta_bid_frete_internacional,
        true,
        fmtDias,
        idDestaque,
      ),
      comparativoFreeTime: buildComparativoMetrica(
        propostas,
        (p) => p.dias_free_time_proposta_bid_frete_internacional ?? 0,
        false,
        (v) => (v > 0 ? fmtDias(v) : '—'),
        idDestaque,
      ),
      comparativoEscala: buildComparativoMetrica(
        propostas,
        (p) => p.quantidade_escala_proposta_bid_frete_internacional,
        true,
        fmtEscala,
        idDestaque,
      ),
    }
  }, [fmtDias, fmtEscala])

  const valorHero = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: propostaMelhor.moeda_proposta_bid_frete_internacional,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(propostaMelhor.valor_total_proposta_bid_frete_internacional)

  const freeTime = propostaMelhor.dias_free_time_proposta_bid_frete_internacional != null
    ? `${propostaMelhor.dias_free_time_proposta_bid_frete_internacional} ${diasLabel}`
    : '—'
  const escala = propostaMelhor.quantidade_escala_proposta_bid_frete_internacional === 0
    ? t('bidfrete.comparativo.direto', 'Direto')
    : String(propostaMelhor.quantidade_escala_proposta_bid_frete_internacional)

  const rotuloTransit = t('bidfrete.detalhe_cotacao.cockpit_transit_time', 'Transit Time')
  const rotuloFree = t('bidfrete.detalhe_cotacao.info_free_time', 'Free Time')
  const rotuloEscala = t('bidfrete.detalhe_cotacao.cockpit_escala', 'Escala')
  const fornecedor = propostaMelhor.fornecedor_nome ?? NOME_AGENTE_LIDER_DEMO_PAINEL_INSIGHTS

  const destacarMelhorProposta = proximoCampoAffordance != null
    && CAMPOS_MELHOR_PROPOSTA.has(proximoCampoAffordance)
  const rotuloAffordanceCard = proximoCampoAffordance != null && destacarMelhorProposta
    ? ROTULO_AFFORDANCE_CAMPO_INSIGHTS[proximoCampoAffordance]
    : 'Clique no card'
  const rotuloAffordanceRanking = proximoCampoAffordance != null
    ? ROTULO_AFFORDANCE_CAMPO_INSIGHTS[proximoCampoAffordance]
    : 'Clique no ranking'

  const selecoesGuia = useMemo(
    () => resolverSelecoesPainelInsights(interagiuAffordance, { propostaAprovada }),
    [interagiuAffordance, propostaAprovada],
  )

  const campoGuiaAtivo = useMemo((): CampoPainelInsightsId | null => {
    if (!foco) return null
    if (!selecoesGuia.some((selecao) => selecao.id === foco)) return null
    return foco
  }, [foco, selecoesGuia])

  const explicacaoGuia = useMemo(
    () => (campoGuiaAtivo ? resolverExplicacaoPainelInsights(campoGuiaAtivo) : ''),
    [campoGuiaAtivo],
  )

  return (
    <div
      id="sim-bid-frete-painel-insights"
      className="dc-cockpit"
      style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}
    >
      <FaixaDemoInterativaBidFrete
        mensagem={
          demoAtiva && selecoesGuia.length === 0
            ? 'Demo interativa — clique nos blocos dos cards; o guia à direita registra cada escolha'
            : 'Demo interativa — clique nos blocos dos cards; passe o mouse nas células do ranking para ver tooltips'
        }
        visivel={demoAtiva}
      />
      <style>{NC_ESTILOS_SIMULADOR_WIZARD_SHELL}</style>
      <style>{NC_ESTILOS_SIMULADOR_PAINEL_INSIGHTS}</style>
      <style>{NC_ESTILOS_AFFORDANCE_INTERATIVO_BID_FRETE}</style>
      <div className="sim-modal-operacao-layout">
        <section
          className="dc-cockpit-insights-row"
          aria-label={t('bidfrete.detalhe_cotacao.cockpit_insights', 'Insights')}
          style={{ '--sim-spark-h-manual': `${SPARK_SLOT_MANUAL_PX}px` } as React.CSSProperties}
        >
          <div className="dc-smart-insights">
            <div className="dc-smart-insights-grid sim-insights-grid-manual">
            <WrapperAlvoAffordanceBidFrete
              destacado={destacarMelhorProposta}
              className={[
                'dc-smart-card',
                'dc-smart-card--melhor',
                'dc-smart-card--melhor-compacto',
                'sim-insights-card-cockpit',
                'sim-affordance-alvo--card-melhor',
              ].join(' ')}
              rotuloClique={rotuloAffordanceCard}
              cursorAlvo={destacarMelhorProposta ? proximoCampoAffordance ?? undefined : undefined}
              as="article"
            >
              <header className="dc-smart-card-head">
                <span>{t('bidfrete.detalhe_cotacao.cockpit_melhor_proposta', 'Melhor proposta')}</span>
                <Trophy weight="duotone" size={18} className="dc-smart-trophy" aria-hidden />
              </header>
              <div className="dc-smart-card-body dc-smart-card-body--melhor-proposta">
                <button
                  type="button"
                  className={`sim-insights-interativo sim-insights-interativo--valor-shell${foco === 'valor_total' ? ' sim-insights-interativo--ativa' : ''}`}
                  onClick={() => marcarInteracao('valor_total')}
                  aria-pressed={foco === 'valor_total'}
                >
                  <p className="dc-smart-valor-hero">{valorHero}</p>
                </button>
                <div
                  className="dc-smart-metricas-row dc-smart-metricas-row--melhor-proposta"
                  role="list"
                >
                  <CelulaMetricaInsightsManual
                    label={rotuloTransit}
                    valor={`${propostaMelhor.dias_transito_proposta_bid_frete_internacional} ${diasLabel}`}
                    comparativo={comparativos.comparativoTransito}
                    rotuloMetrica={rotuloTransit}
                    formatarValor={fmtDias}
                    sufixoDiff={diasLabel}
                    ativa={foco === 'transit_time'}
                    onSelecionar={() => marcarInteracao('transit_time')}
                  />
                  <CelulaMetricaInsightsManual
                    label={rotuloFree}
                    valor={freeTime}
                    comparativo={comparativos.comparativoFreeTime}
                    rotuloMetrica={rotuloFree}
                    formatarValor={fmtDias}
                    sufixoDiff={diasLabel}
                    ativa={foco === 'free_time'}
                    onSelecionar={() => marcarInteracao('free_time')}
                  />
                  <CelulaMetricaInsightsManual
                    label={rotuloEscala}
                    valor={escala}
                    comparativo={comparativos.comparativoEscala}
                    rotuloMetrica={rotuloEscala}
                    formatarValor={fmtEscala}
                    sufixoDiff={t('bidfrete.detalhe_cotacao.spark_sufixo_escala', 'escala(s)')}
                    ativa={foco === 'escala'}
                    onSelecionar={() => marcarInteracao('escala')}
                  />
                </div>
              </div>
              <footer className="dc-smart-fornecedor-foot">
                <button
                  type="button"
                  className={`sim-insights-fornecedor-btn${foco === 'fornecedor' ? ' sim-insights-interativo--ativa' : ''}`}
                  onClick={() => marcarInteracao('fornecedor')}
                  aria-pressed={foco === 'fornecedor'}
                >
                  <span className="dc-smart-fornecedor-avatar" aria-hidden>
                    {fornecedor.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="dc-smart-fornecedor-nome" title={fornecedor}>
                    {fornecedor.length > 24 ? `${fornecedor.slice(0, 22)}…` : fornecedor}
                  </span>
                </button>
                <BotaoGlobal
                  variante="secundario"
                  tamanho="pequeno"
                  className={[
                    'dc-prop-btn-aprovar',
                    'dc-smart-btn-aprovar',
                    foco === 'aprovar' ? 'sim-insights-interativo--ativa' : '',
                    animandoAprovacao ? 'sim-insights-btn-aprovar--confirmando' : '',
                    propostaAprovada ? 'sim-insights-btn-aprovar--aprovado' : '',
                  ].filter(Boolean).join(' ')}
                  icone={<CheckCircle weight={propostaAprovada ? 'fill' : 'bold'} size={14} />}
                  onClick={aoClicarAprovar}
                  aria-pressed={propostaAprovada}
                >
                  {propostaAprovada ? 'Aprovado' : t('bidfrete.comparativo.aprovar', 'Aprovar')}
                </BotaoGlobal>
              </footer>
            </WrapperAlvoAffordanceBidFrete>

            <ManualBidFreteRankingInsightsInterativo
              propostaLider={propostaMelhor}
              propostasTodas={PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE}
              foco={foco}
              proximoCampoAffordance={proximoCampoAffordance}
              rotuloAffordance={rotuloAffordanceRanking}
              onSelecionarCampo={marcarInteracao}
            />

            <ManualBidFreteSimuladorTermometroInsights
              interativo
              ativo={foco === 'termometro_historico'}
              destacarAffordance={proximoCampoAffordance === 'termometro_historico'}
              rotuloAffordance={
                proximoCampoAffordance === 'termometro_historico'
                  ? ROTULO_AFFORDANCE_CAMPO_INSIGHTS.termometro_historico
                  : 'Termômetro histórico'
              }
              onSelecionar={() => marcarInteracao('termometro_historico')}
            />
            </div>
          </div>
        </section>

        <ManualBidFreteGuiaAoVivo
          campos={CAMPOS_PAINEL_INSIGHTS_BID_FRETE}
          selecoes={selecoesGuia}
          campoAtivo={campoGuiaAtivo}
          textoContextual={explicacaoGuia}
          conviteInterativo={demoAtiva && selecoesGuia.length === 0}
        />
      </div>
    </div>
  )
}
