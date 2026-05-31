/**
 * Faixa Transit / Free Time / Escala com mini-barras (modelo Melhor proposta) nos cards de ranking.
 */

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  buildComparativoMetricaParaProposta,
  type ComparativoMetricaPainel,
  type BarraComparativoInsight,
} from './infograficos-fluxo-cotacao-bid-frete-internacional'
import type { PropostaRankingBidFreteInternacional } from './types'
import {
  SPARK_SLOT_CARD_RANKING_PX,
  SPARK_VIEW_CARD_RANKING,
  SparkBarrasComparativo,
} from './graficos-insights-cotacao-bid-frete-internacional'

export interface ComparativosMetricasCardProposta {
  comparativoTransito: ComparativoMetricaPainel | null
  comparativoFreeTime: ComparativoMetricaPainel | null
  comparativoEscala: ComparativoMetricaPainel | null
}

export function calcularComparativosMetricasCardProposta(
  propostas: PropostaRankingBidFreteInternacional[],
  propostaAtual: PropostaRankingBidFreteInternacional,
  t: TFunction,
): ComparativosMetricasCardProposta {
  const diasLabel = t('bidfrete.detalhe_cotacao.dias', 'dias')
  const fmtDias = (v: number) => `${v} ${diasLabel}`
  const fmtEscala = (v: number) => (v === 0 ? t('bidfrete.comparativo.direto', 'Direto') : String(v))

  return {
    comparativoTransito: buildComparativoMetricaParaProposta(
      propostas,
      propostaAtual,
      (p) => p.dias_transito_proposta_bid_frete_internacional,
      true,
      fmtDias,
    ),
    comparativoFreeTime: buildComparativoMetricaParaProposta(
      propostas,
      propostaAtual,
      (p) => p.dias_free_time_proposta_bid_frete_internacional ?? 0,
      false,
      (v) => (v > 0 ? fmtDias(v) : '—'),
    ),
    comparativoEscala: buildComparativoMetricaParaProposta(
      propostas,
      propostaAtual,
      (p) => p.quantidade_escala_proposta_bid_frete_internacional,
      true,
      fmtEscala,
    ),
  }
}

function criarTextoVsGanhador(
  t: TFunction,
  melhorMenor: boolean,
  sufixoDiff: string,
): (barra: BarraComparativoInsight, valorGanhador: number) => string {
  return (barra, valorGanhador) => {
    if (barra.destaque) {
      return t('bidfrete.detalhe_cotacao.spark_esta_proposta', 'Esta proposta')
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

function CelulaMetricaSparkCard({
  label,
  valor,
  comparativo,
  rotuloMetrica,
  formatarValor,
  sufixoDiff = '',
}: {
  label: string
  valor: string
  comparativo: ComparativoMetricaPainel | null
  rotuloMetrica: string
  formatarValor: (v: number) => string
  sufixoDiff?: string
}) {
  const { t } = useTranslation()
  const textoVsGanhador = comparativo != null
    ? criarTextoVsGanhador(t, comparativo.melhorMenor, sufixoDiff)
    : () => ''

  if (comparativo == null || comparativo.barras.length === 0) {
    return (
      <div className="dc-prop-metrica-col">
        <span className="dc-prop-metrica-label">{label}</span>
        <span className="dc-prop-metrica-valor">{valor}</span>
      </div>
    )
  }

  return (
    <div className="dc-prop-metrica-col dc-prop-metrica-col--spark">
      <div className="dc-prop-metrica-col-texto">
        <span className="dc-prop-metrica-label">{label}</span>
        <span className="dc-prop-metrica-valor">{valor}</span>
      </div>
      <div className="dc-prop-metrica-spark">
        <SparkBarrasComparativo
          barras={comparativo.barras}
          melhorMenor={comparativo.melhorMenor}
          variante="indigo"
          rotuloMetrica={rotuloMetrica}
          formatarValor={formatarValor}
          textoVsGanhador={textoVsGanhador}
          dimensoesView={SPARK_VIEW_CARD_RANKING}
          ancoraBarras="base"
          esticarVertical
        />
      </div>
    </div>
  )
}

export interface FaixaMetricasComparativoSparkPropostaProps {
  proposta: PropostaRankingBidFreteInternacional
  propostas: PropostaRankingBidFreteInternacional[]
}

export function FaixaMetricasComparativoSparkProposta({
  proposta,
  propostas,
}: FaixaMetricasComparativoSparkPropostaProps) {
  const { t } = useTranslation()
  const comparativos = useMemo(
    () => calcularComparativosMetricasCardProposta(propostas, proposta, t),
    [propostas, proposta, t],
  )

  const diasLabel = t('bidfrete.detalhe_cotacao.dias', 'dias')
  const transitValor = `${proposta.dias_transito_proposta_bid_frete_internacional} ${diasLabel}`
  const freeTimeValor =
    proposta.dias_free_time_proposta_bid_frete_internacional != null
      ? `${proposta.dias_free_time_proposta_bid_frete_internacional} ${diasLabel}`
      : '—'
  const escalaValor =
    proposta.quantidade_escala_proposta_bid_frete_internacional === 0
      ? t('bidfrete.comparativo.direto', 'Direto')
      : String(proposta.quantidade_escala_proposta_bid_frete_internacional)

  const rotuloTransit = t('bidfrete.detalhe_cotacao.cockpit_transit_time', 'Transit Time')
  const rotuloFree = t('bidfrete.detalhe_cotacao.info_free_time', 'Free Time')
  const rotuloEscala = t('bidfrete.detalhe_cotacao.cockpit_escala', 'Escala')
  const fmtDias = (v: number) => `${v} ${diasLabel}`
  const fmtEscala = (v: number) => (v === 0 ? t('bidfrete.comparativo.direto', 'Direto') : String(v))

  return (
    <div
      className="dc-prop-metricas-spark-row"
      style={{ '--dc-prop-metrica-spark-h': `${SPARK_SLOT_CARD_RANKING_PX}px` } as React.CSSProperties}
      role="group"
      aria-label={t('bidfrete.detalhe_cotacao.resposta_metricas_comparativo', 'Comparativo entre propostas')}
    >
      <CelulaMetricaSparkCard
        label={rotuloTransit}
        valor={transitValor}
        comparativo={comparativos.comparativoTransito}
        rotuloMetrica={rotuloTransit}
        formatarValor={fmtDias}
        sufixoDiff={diasLabel}
      />
      <CelulaMetricaSparkCard
        label={rotuloFree}
        valor={freeTimeValor}
        comparativo={comparativos.comparativoFreeTime}
        rotuloMetrica={rotuloFree}
        formatarValor={fmtDias}
        sufixoDiff={diasLabel}
      />
      <CelulaMetricaSparkCard
        label={rotuloEscala}
        valor={escalaValor}
        comparativo={comparativos.comparativoEscala}
        rotuloMetrica={rotuloEscala}
        formatarValor={fmtEscala}
        sufixoDiff={t('bidfrete.detalhe_cotacao.spark_sufixo_escala', 'escala(s)')}
      />
    </div>
  )
}
