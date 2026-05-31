/**
 * Grade de colocação por eixo — ranking combate (frete total, trânsito, rota, prazo).
 */

import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Trophy } from '@phosphor-icons/react'
import type { PropostaRankingBidFreteInternacional } from './types'
import {
  formatarMoedaBidFrete,
  rankPropostaPorValor,
} from './exibir-taxas-proposta-bid-frete-internacional'
import {
  montarBarrasComparativoDePropostas,
  type BarraComparativoInsight,
} from './infograficos-fluxo-cotacao-bid-frete-internacional'
import { TooltipAnaliseMetricaSparkPortal } from './graficos-insights-cotacao-bid-frete-internacional'

export type IdEixoColocacaoCombate =
  | 'frete_total'
  | 'transit_time'
  | 'rota'
  | 'prazo_pagamento'

export interface EixoColocacaoCombate {
  id: IdEixoColocacaoCombate
  rotulo: string
  valorExibicao: string
  rank: number
  total: number
  disponivel: boolean
  melhorMenor: boolean
  rotuloMetrica: string
  barras: BarraComparativoInsight[]
  formatarValor: (valor: number) => string
}

function rankPropostaComValorDefinido(
  propostas: PropostaRankingBidFreteInternacional[],
  idProposta: string,
  valorDe: (p: PropostaRankingBidFreteInternacional) => number | null | undefined,
  melhorMenor: boolean,
): { rank: number; total: number; disponivel: boolean } {
  const comValor = propostas.filter((p) => {
    const v = valorDe(p)
    return v != null && Number.isFinite(v)
  })
  if (comValor.length === 0) {
    return { rank: 0, total: 0, disponivel: false }
  }
  const ordenado = [...comValor].sort((a, b) => {
    const va = valorDe(a) as number
    const vb = valorDe(b) as number
    return melhorMenor ? va - vb : vb - va
  })
  const idx = ordenado.findIndex(
    (p) => p.id_proposta_bid_frete_internacional === idProposta,
  )
  return {
    rank: idx >= 0 ? idx + 1 : ordenado.length,
    total: comValor.length,
    disponivel: idx >= 0,
  }
}

function formatarValorRota(
  proposta: PropostaRankingBidFreteInternacional,
  t: TFunction,
): string {
  const escalas = proposta.quantidade_escala_proposta_bid_frete_internacional
  const transbordos = proposta.quantidade_transbordo_proposta_bid_frete_internacional
  if (escalas === 0 && transbordos === 0) {
    return t('bidfrete.comparativo.direto', 'Direto')
  }
  const partes: string[] = []
  if (escalas > 0) {
    partes.push(
      t('bidfrete.detalhe_cotacao.colocacao_escalas_n', '{{n}} escala(s)', { n: escalas }),
    )
  }
  if (transbordos > 0) {
    partes.push(
      t('bidfrete.detalhe_cotacao.colocacao_transbordos_n', '{{n}} transbordo(s)', {
        n: transbordos,
      }),
    )
  }
  return partes.join(' · ')
}

/** Rank da rota: menos escalas/transbordos = melhor; desempate por transbordo depois escala. */
function rankPropostaRota(
  propostas: PropostaRankingBidFreteInternacional[],
  idProposta: string,
): { rank: number; total: number } {
  const ordenado = [...propostas].sort((a, b) => {
    const escA = a.quantidade_escala_proposta_bid_frete_internacional
    const escB = b.quantidade_escala_proposta_bid_frete_internacional
    if (escA !== escB) return escA - escB
    return (
      a.quantidade_transbordo_proposta_bid_frete_internacional
      - b.quantidade_transbordo_proposta_bid_frete_internacional
    )
  })
  const idx = ordenado.findIndex(
    (p) => p.id_proposta_bid_frete_internacional === idProposta,
  )
  return {
    rank: idx >= 0 ? idx + 1 : propostas.length,
    total: propostas.length,
  }
}

export function calcularEixosColocacaoCombate(
  proposta: PropostaRankingBidFreteInternacional,
  propostasTodas: PropostaRankingBidFreteInternacional[],
  t: TFunction,
): EixoColocacaoCombate[] {
  const idProposta = proposta.id_proposta_bid_frete_internacional
  const moeda = proposta.moeda_proposta_bid_frete_internacional
  const diasLabel = t('bidfrete.detalhe_cotacao.dias', 'dias')
  const fmtMoeda = (v: number) => formatarMoedaBidFrete(v, moeda)
  const fmtDias = (v: number) => `${v} ${diasLabel}`
  const fmtEscala = (v: number) =>
    (v === 0 ? t('bidfrete.comparativo.direto', 'Direto') : String(v))
  const total = propostasTodas.length

  const rankFrete = rankPropostaPorValor(
    propostasTodas,
    idProposta,
    (p) => p.valor_total_proposta_bid_frete_internacional,
  )
  const rankTransit = rankPropostaPorValor(
    propostasTodas,
    idProposta,
    (p) => p.dias_transito_proposta_bid_frete_internacional,
  )
  const rankRota = rankPropostaRota(propostasTodas, idProposta)
  const rankPrazo = rankPropostaComValorDefinido(
    propostasTodas,
    idProposta,
    (p) => p.dias_prazo_pagamento_proposta_bid_frete_internacional,
    false,
  )

  const rotuloFreteTotal = t(
    'bidfrete.detalhe_cotacao.colocacao_eixo_frete_total',
    'Frete total',
  )
  const rotuloTransit = t(
    'bidfrete.detalhe_cotacao.colocacao_eixo_transit',
    'Transit time',
  )
  const rotuloRota = t(
    'bidfrete.detalhe_cotacao.colocacao_eixo_rota',
    'Escala / transbordo',
  )
  const rotuloPrazo = t(
    'bidfrete.detalhe_cotacao.colocacao_eixo_prazo',
    'Prazo pagamento',
  )

  const barrasFrete =
    total >= 2
      ? montarBarrasComparativoDePropostas(
        propostasTodas,
        idProposta,
        (p) => p.valor_total_proposta_bid_frete_internacional,
        true,
      )
      : []
  const barrasTransit =
    total >= 2
      ? montarBarrasComparativoDePropostas(
        propostasTodas,
        idProposta,
        (p) => p.dias_transito_proposta_bid_frete_internacional,
        true,
      )
      : []
  const barrasRota =
    total >= 2
      ? montarBarrasComparativoDePropostas(
        propostasTodas,
        idProposta,
        (p) => p.quantidade_escala_proposta_bid_frete_internacional,
        true,
      )
      : []
  const barrasPrazo =
    total >= 2
      ? montarBarrasComparativoDePropostas(
        propostasTodas.filter(
          (p) => p.dias_prazo_pagamento_proposta_bid_frete_internacional != null,
        ),
        idProposta,
        (p) => p.dias_prazo_pagamento_proposta_bid_frete_internacional ?? 0,
        false,
      )
      : []

  const prazoDias = proposta.dias_prazo_pagamento_proposta_bid_frete_internacional

  return [
    {
      id: 'frete_total',
      rotulo: rotuloFreteTotal,
      valorExibicao: fmtMoeda(proposta.valor_total_proposta_bid_frete_internacional),
      rank: rankFrete,
      total,
      disponivel: true,
      melhorMenor: true,
      rotuloMetrica: rotuloFreteTotal,
      barras: barrasFrete,
      formatarValor: fmtMoeda,
    },
    {
      id: 'transit_time',
      rotulo: rotuloTransit,
      valorExibicao: fmtDias(proposta.dias_transito_proposta_bid_frete_internacional),
      rank: rankTransit,
      total,
      disponivel: true,
      melhorMenor: true,
      rotuloMetrica: rotuloTransit,
      barras: barrasTransit,
      formatarValor: fmtDias,
    },
    {
      id: 'rota',
      rotulo: rotuloRota,
      valorExibicao: formatarValorRota(proposta, t),
      rank: rankRota.rank,
      total: rankRota.total,
      disponivel: true,
      melhorMenor: true,
      rotuloMetrica: rotuloRota,
      barras: barrasRota,
      formatarValor: fmtEscala,
    },
    {
      id: 'prazo_pagamento',
      rotulo: rotuloPrazo,
      valorExibicao:
        prazoDias != null
          ? fmtDias(prazoDias)
          : t('bidfrete.detalhe_cotacao.colocacao_sem_dado', '—'),
      rank: rankPrazo.rank,
      total: rankPrazo.total,
      disponivel: rankPrazo.disponivel,
      melhorMenor: false,
      rotuloMetrica: rotuloPrazo,
      barras: barrasPrazo,
      formatarValor: fmtDias,
    },
  ]
}

function coresBadgeColocacao(rank: number): { bg: string; color: string; border: string } {
  const texto = '#f8fafc'
  if (rank === 1) return { bg: 'rgba(52, 211, 153, 0.2)', color: '#6ee7b7', border: 'rgba(52, 211, 153, 0.45)' }
  if (rank === 2) return { bg: 'rgba(148, 163, 184, 0.16)', color: texto, border: 'rgba(148, 163, 184, 0.35)' }
  if (rank === 3) return { bg: 'rgba(180, 83, 9, 0.16)', color: '#fcd34d', border: 'rgba(180, 83, 9, 0.35)' }
  return { bg: 'rgba(100, 116, 139, 0.14)', color: '#cbd5e1', border: 'rgba(100, 116, 139, 0.28)' }
}

function CelulaColocacaoEixo({
  eixo,
  t,
}: {
  eixo: EixoColocacaoCombate
  t: TFunction
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [ancora, setAncora] = useState<{ left: number; top: number } | null>(null)
  const barra = eixo.barras.find((b) => b.destaque)
  const comAnalise = eixo.disponivel && eixo.barras.length >= 2 && barra != null
  const valorReferencia = eixo.barras.find((b) => b.destaque)?.valor ?? eixo.barras[0]?.valor ?? 0

  const rankCores = eixo.disponivel && eixo.rank > 0
    ? coresBadgeColocacao(eixo.rank)
    : null
  const ehMelhor = eixo.disponivel && eixo.rank === 1
  const textoColocacao = !eixo.disponivel
    ? t('bidfrete.detalhe_cotacao.colocacao_sem_dado', '—')
    : ehMelhor
      ? t('bidfrete.detalhe_cotacao.barra_metrica_melhor', 'Melhor')
      : t('bidfrete.detalhe_cotacao.colocacao_eixo_de_total', '{{rank}}º de {{total}}', {
        rank: eixo.rank,
        total: eixo.total,
      })

  const definirAncora = () => {
    if (!comAnalise) return
    const el = rowRef.current
    if (el == null) return
    const rect = el.getBoundingClientRect()
    setAncora({ left: rect.left + rect.width / 2, top: rect.bottom })
  }

  return (
    <>
      <div
        ref={rowRef}
        className={[
          'dc-prop-colocacao-celula',
          ehMelhor ? 'dc-prop-colocacao-celula--lider' : '',
          comAnalise ? 'dc-prop-colocacao-celula--analise' : '',
        ].filter(Boolean).join(' ')}
        onMouseEnter={definirAncora}
        onMouseLeave={() => setAncora(null)}
      >
        <span className="dc-prop-colocacao-rotulo">{eixo.rotulo}</span>
        <span className="dc-prop-colocacao-valor" title={eixo.valorExibicao}>
          {eixo.valorExibicao}
        </span>
        <span
          className={[
            'dc-prop-colocacao-badge',
            ehMelhor ? 'dc-prop-colocacao-badge--melhor' : '',
          ].filter(Boolean).join(' ')}
          style={
            rankCores != null
              ? {
                background: rankCores.bg,
                color: rankCores.color,
                border: `1px solid ${rankCores.border}`,
              }
              : undefined
          }
        >
          {ehMelhor && <Trophy weight="duotone" size={12} aria-hidden />}
          {textoColocacao}
        </span>
      </div>
      {ancora != null && comAnalise && barra != null && (
        <TooltipAnaliseMetricaSparkPortal
          barra={barra}
          barras={eixo.barras}
          valorReferencia={valorReferencia}
          melhorMenor={eixo.melhorMenor}
          rotuloMetrica={eixo.rotuloMetrica}
          formatarValor={eixo.formatarValor}
          ancora={ancora}
        />
      )}
    </>
  )
}

export interface GradeColocacaoEixosCombateProps {
  proposta: PropostaRankingBidFreteInternacional
  propostasTodas: PropostaRankingBidFreteInternacional[]
}

export function GradeColocacaoEixosCombate({
  proposta,
  propostasTodas,
}: GradeColocacaoEixosCombateProps) {
  const { t } = useTranslation()
  const eixos = useMemo(
    () => calcularEixosColocacaoCombate(proposta, propostasTodas, t),
    [proposta, propostasTodas, t],
  )

  if (propostasTodas.length === 0) return null

  return (
    <section
      className="dc-prop-colocacao-grade"
      aria-label={t(
        'bidfrete.detalhe_cotacao.colocacao_grade_titulo',
        'Colocação por eixo',
      )}
    >
      <header className="dc-prop-colocacao-grade-head">
        {t(
          'bidfrete.detalhe_cotacao.colocacao_grade_titulo',
          'Colocação por eixo',
        )}
      </header>
      <div className="dc-prop-colocacao-grid" role="list">
        {eixos.map((eixo) => (
          <CelulaColocacaoEixo key={eixo.id} eixo={eixo} t={t} />
        ))}
      </div>
    </section>
  )
}
