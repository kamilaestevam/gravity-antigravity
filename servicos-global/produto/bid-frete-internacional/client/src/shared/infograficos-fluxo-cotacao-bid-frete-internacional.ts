/**
 * Métricas inteligentes do painel de fluxo (detalhe da cotação).
 */

import type { TFunction } from 'i18next'
import type {
  DisparoCotacaoBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  StatusCotacao,
} from './types'

export interface ItemBarraTransito {
  id: string
  nome: string
  dias: number
  percentualLargura: number
  ehMelhor: boolean
}

export interface InfograficosFluxoCotacao {
  tempoRespostaMediaHoras: number | null
  tempoRespostaMaisRapidoHoras: number | null
  tempoRespostaMaisRapidoFornecedor: string | null
  quantidadeRespostasComTempo: number
  quantidadeDisparosEnviados: number
  melhorValor: number | null
  melhorValorMoeda: string
  melhorValorFornecedor: string | null
  economiaVsSegundoPercentual: number | null
  liderFornecedor: string | null
  liderScore: number | null
  transitoMinDias: number | null
  transitoMaxDias: number | null
  barrasTransito: ItemBarraTransito[]
}

function horasEntre(inicioIso: string, fimIso: string): number {
  const ms = new Date(fimIso).getTime() - new Date(inicioIso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return 0
  return ms / (1000 * 60 * 60)
}

function nomeFornecedorProposta(p: PropostaRankingBidFreteInternacional): string {
  return (
    p.fornecedor_nome
    ?? p.fornecedor?.nome_fornecedor_bid_frete_internacional
    ?? '—'
  )
}

function nomeFornecedorDisparo(d: DisparoCotacaoBidFreteInternacional): string {
  return d.fornecedor?.nome_fornecedor_bid_frete_internacional ?? '—'
}

export function calcularInfograficosFluxoCotacao(
  disparos: DisparoCotacaoBidFreteInternacional[],
  propostas: PropostaRankingBidFreteInternacional[],
): InfograficosFluxoCotacao {
  const vazio: InfograficosFluxoCotacao = {
    tempoRespostaMediaHoras: null,
    tempoRespostaMaisRapidoHoras: null,
    tempoRespostaMaisRapidoFornecedor: null,
    quantidadeRespostasComTempo: 0,
    quantidadeDisparosEnviados: 0,
    melhorValor: null,
    melhorValorMoeda: 'USD',
    melhorValorFornecedor: null,
    economiaVsSegundoPercentual: null,
    liderFornecedor: null,
    liderScore: null,
    transitoMinDias: null,
    transitoMaxDias: null,
    barrasTransito: [],
  }

  const disparosEnviados = disparos.filter(
    (d) => d.data_envio_disparo_cotacao_bid_frete_internacional != null,
  )
  vazio.quantidadeDisparosEnviados = disparosEnviados.length

  const temposResposta: { horas: number; nome: string }[] = []
  for (const disparo of disparosEnviados) {
    const envio = disparo.data_envio_disparo_cotacao_bid_frete_internacional
    if (!envio) continue

    const respostaDisparo = disparo.data_resposta_disparo_cotacao_bid_frete_internacional
    const respostaProposta = disparo.proposta?.data_criacao_proposta_bid_frete_internacional
    const fim = respostaDisparo ?? respostaProposta
    if (!fim) continue

    temposResposta.push({
      horas: horasEntre(envio, fim),
      nome: nomeFornecedorDisparo(disparo),
    })
  }

  if (temposResposta.length > 0) {
    const soma = temposResposta.reduce((acc, t) => acc + t.horas, 0)
    vazio.tempoRespostaMediaHoras = soma / temposResposta.length
    vazio.quantidadeRespostasComTempo = temposResposta.length
    const maisRapido = [...temposResposta].sort((a, b) => a.horas - b.horas)[0]
    vazio.tempoRespostaMaisRapidoHoras = maisRapido.horas
    vazio.tempoRespostaMaisRapidoFornecedor = maisRapido.nome
  }

  if (propostas.length > 0) {
    const porPreco = [...propostas].sort(
      (a, b) => a.valor_total_proposta_bid_frete_internacional - b.valor_total_proposta_bid_frete_internacional,
    )
    const melhor = porPreco[0]
    vazio.melhorValor = melhor.valor_total_proposta_bid_frete_internacional
    vazio.melhorValorMoeda = melhor.moeda_proposta_bid_frete_internacional
    vazio.melhorValorFornecedor = nomeFornecedorProposta(melhor)

    if (porPreco.length > 1) {
      const segundo = porPreco[1].valor_total_proposta_bid_frete_internacional
      if (segundo > 0) {
        vazio.economiaVsSegundoPercentual =
          ((segundo - melhor.valor_total_proposta_bid_frete_internacional) / segundo) * 100
      }
    }

    const porRanking = [...propostas].sort(
      (a, b) => (a.ranking_geral ?? 999) - (b.ranking_geral ?? 999),
    )
    const lider = porRanking[0]
    vazio.liderFornecedor = nomeFornecedorProposta(lider)
    vazio.liderScore = lider.ranking_geral ?? null

    const diasLista = propostas.map((p) => p.dias_transito_proposta_bid_frete_internacional)
    const minD = Math.min(...diasLista)
    const maxD = Math.max(...diasLista)
    vazio.transitoMinDias = minD
    vazio.transitoMaxDias = maxD

    const escala = maxD > 0 ? maxD : 1
    vazio.barrasTransito = propostas
      .map((p) => ({
        id: p.id_proposta_bid_frete_internacional,
        nome: nomeFornecedorProposta(p),
        dias: p.dias_transito_proposta_bid_frete_internacional,
        percentualLargura: Math.round((p.dias_transito_proposta_bid_frete_internacional / escala) * 100),
        ehMelhor: p.dias_transito_proposta_bid_frete_internacional === minD,
      }))
      .sort((a, b) => a.dias - b.dias)
  }

  return vazio
}

export function formatarHorasResposta(horas: number, t: TFunction): string {
  if (horas < 1) {
    const min = Math.round(horas * 60)
    return `${min} ${t('bidfrete.detalhe_cotacao.info_minutos', 'min')}`
  }
  if (horas < 48) {
    return `${horas.toFixed(1)} ${t('bidfrete.detalhe_cotacao.info_horas', 'h')}`
  }
  const dias = horas / 24
  return `${dias.toFixed(1)} ${t('bidfrete.detalhe_cotacao.dias', 'dias')}`
}

export const FLUXO_ETAPAS_RESUMIDAS: { indice: number; labelKey: string }[] = [
  { indice: 0, labelKey: 'bidfrete.detalhe_cotacao.timeline_rascunho' },
  { indice: 1, labelKey: 'bidfrete.detalhe_cotacao.timeline_enviada' },
  { indice: 2, labelKey: 'bidfrete.detalhe_cotacao.timeline_em_cotacao' },
  { indice: 3, labelKey: 'bidfrete.detalhe_cotacao.timeline_aguardando' },
  { indice: 4, labelKey: 'bidfrete.detalhe_cotacao.timeline_aprovada' },
]

export function indiceFluxoPorStatus(status: StatusCotacao): number {
  const mapa: Partial<Record<StatusCotacao, number>> = {
    RASCUNHO: 0,
    FALTA_INFORMACAO: 0,
    ENVIADA_FORNECEDORES: 1,
    EM_COTACAO: 2,
    AGUARDANDO_APROVACAO: 3,
    APROVADA: 4,
    REPROVADA: 3,
    CANCELADA: 0,
    EXPIRADA: 2,
  }
  return mapa[status] ?? 0
}
