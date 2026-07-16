/**
 * Datas reais e previsões do fluxo da cotação (timeline do detalhe).
 * Previsões: médias do histórico aprovado do cliente (mesma rota/modal).
 */

import type {
  Cotacao,
  DisparoCotacaoBidFreteInternacional,
  PropostaBidFreteInternacional,
  StatusCotacao,
} from './types'
import { FLUXO_ETAPAS_RESUMIDAS } from './infograficos-fluxo-cotacao-bid-frete-internacional'

export interface MarcosFluxoCotacaoMs {
  rascunho: number
  enviada: number | null
  emCotacao: number | null
  aguardando: number | null
  fornecedorConcordou: number | null
  aprovada: number | null
}

export interface MediasTransicaoFluxoHoras {
  rascunhoParaEnviada: number
  enviadaParaEmCotacao: number
  emCotacaoParaAguardando: number
  aguardandoParaAprovada: number
}

export interface EtapaDatasFluxoTimeline {
  indice: number
  dataRealIso: string | null
  dataPrevisaoIso: string | null
}

/** Médias padrão quando o cliente ainda não tem histórico aprovado na rota. */
export const MEDIAS_FLUXO_PADRAO_HORAS: MediasTransicaoFluxoHoras = {
  rascunhoParaEnviada: 24,
  enviadaParaEmCotacao: 48,
  emCotacaoParaAguardando: 72,
  aguardandoParaAprovada: 48,
}

export type CotacaoHistoricoTimeline = Pick<
  Cotacao,
  | 'data_criacao_cotacao_bid_frete_internacional'
  | 'data_limite_resposta_cotacao_bid_frete_internacional'
  | 'data_atualizacao_cotacao_bid_frete_internacional'
> & {
  data_aprovacao_cotacao_bid_frete_internacional?: string | null
  disparo_cotacao_bid_frete_internacional?: DisparoCotacaoBidFreteInternacional[]
  propostas_bid_frete_internacional?: PropostaBidFreteInternacional[]
}

/** Normaliza itens de `historico_aprovado` vindos da API (aliases disparos/propostas). */
export function normalizarHistoricoTimeline(
  itens: Cotacao['historico_aprovado'],
): CotacaoHistoricoTimeline[] {
  if (!itens?.length) return []
  return itens.map((item) => ({
    data_criacao_cotacao_bid_frete_internacional:
      item.data_criacao_cotacao_bid_frete_internacional ?? '',
    data_aprovacao_cotacao_bid_frete_internacional: item.data_aprovacao_cotacao_bid_frete_internacional,
    data_limite_resposta_cotacao_bid_frete_internacional:
      item.data_limite_resposta_cotacao_bid_frete_internacional ?? null,
    data_atualizacao_cotacao_bid_frete_internacional: item.data_atualizacao_cotacao_bid_frete_internacional,
    disparo_cotacao_bid_frete_internacional:
      item.disparo_cotacao_bid_frete_internacional
      ?? item.disparos_cotacao
      ?? [],
    propostas_bid_frete_internacional:
      item.propostas_bid_frete_internacional
      ?? item.propostas
      ?? [],
  }))
}

function parseMs(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? ms : null
}

function minMs(valores: Array<number | null>): number | null {
  const validos = valores.filter((v): v is number => v != null)
  if (validos.length === 0) return null
  return Math.min(...validos)
}

function mediaHorasAmostras(amostrasHoras: number[], fallback: number): number {
  if (amostrasHoras.length === 0) return fallback
  return amostrasHoras.reduce((acc, h) => acc + h, 0) / amostrasHoras.length
}

/** Extrai marcos temporais a partir de disparos, propostas e campos da cotação. */
export function extrairMarcosFluxoCotacao(
  cotacao: CotacaoHistoricoTimeline,
  disparos: DisparoCotacaoBidFreteInternacional[] = cotacao.disparo_cotacao_bid_frete_internacional ?? [],
  status: StatusCotacao = 'RASCUNHO',
): MarcosFluxoCotacaoMs {
  const rascunho = parseMs(cotacao.data_criacao_cotacao_bid_frete_internacional)
  if (rascunho == null) {
    return {
      rascunho: Date.now(),
      enviada: null,
      emCotacao: null,
      aguardando: null,
      fornecedorConcordou: null,
      aprovada: null,
    }
  }

  const enviosMs = disparos
    .map((d) => parseMs(d.data_envio_disparo_cotacao_bid_frete_internacional))
  const enviada = minMs(enviosMs)

  const propostas = cotacao.propostas_bid_frete_internacional ?? []
  const respostasMs = [
    ...disparos.map((d) => parseMs(d.data_resposta_disparo_cotacao_bid_frete_internacional)),
    ...propostas.map((p) => parseMs(p.data_criacao_proposta_bid_frete_internacional)),
  ]
  const emCotacao = minMs(respostasMs)

  const limiteMs = parseMs(cotacao.data_limite_resposta_cotacao_bid_frete_internacional)
  const aprovacaoMs = parseMs(cotacao.data_aprovacao_cotacao_bid_frete_internacional)

  let aguardando: number | null = null
  if (['AGUARDANDO_APROVACAO', 'APROVADA', 'REPROVADA'].includes(status)) {
    aguardando = emCotacao ?? limiteMs ?? parseMs(cotacao.data_atualizacao_cotacao_bid_frete_internacional)
  }

  let aprovada: number | null = aprovacaoMs
  if (aprovada == null && status === 'APROVADA') {
    aprovada = parseMs(cotacao.data_atualizacao_cotacao_bid_frete_internacional)
  }

  const propostaGanhadora = propostas.find(
    (p) => p.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA',
  ) ?? propostas.find((p) => p.status_proposta_bid_frete_internacional === 'APROVADA')
  const fornecedorConcordou = parseMs(
    propostaGanhadora?.data_aceite_aprovacao_proposta_bid_frete_internacional,
  )

  return { rascunho, enviada, emCotacao, aguardando, fornecedorConcordou, aprovada }
}

function deltaHoras(inicio: number | null, fim: number | null): number | null {
  if (inicio == null || fim == null || fim < inicio) return null
  return (fim - inicio) / (1000 * 60 * 60)
}

/** Médias de transição entre etapas com base no histórico aprovado do cliente. */
export function calcularMediasTransicaoFluxoCliente(
  historico: CotacaoHistoricoTimeline[],
): MediasTransicaoFluxoHoras {
  const d01: number[] = []
  const d12: number[] = []
  const d23: number[] = []
  const d34: number[] = []

  for (const item of historico) {
    const marcos = extrairMarcosFluxoCotacao(item, item.disparo_cotacao_bid_frete_internacional ?? [], 'APROVADA')
    const h01 = deltaHoras(marcos.rascunho, marcos.enviada)
    const h12 = deltaHoras(marcos.enviada, marcos.emCotacao)
    const h23 = deltaHoras(marcos.emCotacao, marcos.aguardando)
    const h34 = deltaHoras(marcos.aguardando, marcos.aprovada)
    if (h01 != null) d01.push(h01)
    if (h12 != null) d12.push(h12)
    if (h23 != null) d23.push(h23)
    if (h34 != null) d34.push(h34)
  }

  return {
    rascunhoParaEnviada: mediaHorasAmostras(d01, MEDIAS_FLUXO_PADRAO_HORAS.rascunhoParaEnviada),
    enviadaParaEmCotacao: mediaHorasAmostras(d12, MEDIAS_FLUXO_PADRAO_HORAS.enviadaParaEmCotacao),
    emCotacaoParaAguardando: mediaHorasAmostras(d23, MEDIAS_FLUXO_PADRAO_HORAS.emCotacaoParaAguardando),
    aguardandoParaAprovada: mediaHorasAmostras(d34, MEDIAS_FLUXO_PADRAO_HORAS.aguardandoParaAprovada),
  }
}

function somarHoras(baseMs: number, horas: number): number {
  return baseMs + horas * 60 * 60 * 1000
}

function preverCadeiaMarcos(
  marcos: MarcosFluxoCotacaoMs,
  medias: MediasTransicaoFluxoHoras,
  limiteRespostaIso: string | null,
): MarcosFluxoCotacaoMs {
  const limiteMs = parseMs(limiteRespostaIso)
  let enviada = marcos.enviada
  let emCotacao = marcos.emCotacao
  let aguardando = marcos.aguardando
  let fornecedorConcordou = marcos.fornecedorConcordou
  let aprovada = marcos.aprovada

  if (enviada == null) {
    enviada = somarHoras(marcos.rascunho, medias.rascunhoParaEnviada)
  }
  if (emCotacao == null) {
    emCotacao = somarHoras(enviada, medias.enviadaParaEmCotacao)
  }
  if (aguardando == null) {
    aguardando = limiteMs != null && limiteMs > emCotacao
      ? limiteMs
      : somarHoras(emCotacao, medias.emCotacaoParaAguardando)
  }
  if (aprovada == null) {
    aprovada = somarHoras(aguardando, medias.aguardandoParaAprovada)
  }
  if (fornecedorConcordou == null) {
    fornecedorConcordou = somarHoras(aguardando, medias.aguardandoParaAprovada * 0.55)
  }

  return { ...marcos, enviada, emCotacao, aguardando, fornecedorConcordou, aprovada }
}

const CHAVES_MARCO: (keyof MarcosFluxoCotacaoMs)[] = [
  'rascunho',
  'enviada',
  'emCotacao',
  'aguardando',
  'fornecedorConcordou',
  'aprovada',
]

/** Datas reais e previsão por etapa da timeline resumida. */
export function calcularDatasEtapasFluxoTimeline(
  cotacao: CotacaoHistoricoTimeline,
  statusAtual: StatusCotacao,
  disparos: DisparoCotacaoBidFreteInternacional[] = [],
  historicoAprovado: CotacaoHistoricoTimeline[] = [],
): EtapaDatasFluxoTimeline[] {
  const marcos = extrairMarcosFluxoCotacao(cotacao, disparos, statusAtual)
  const medias = calcularMediasTransicaoFluxoCliente(historicoAprovado)
  const previsoes = preverCadeiaMarcos(
    marcos,
    medias,
    cotacao.data_limite_resposta_cotacao_bid_frete_internacional,
  )
  return FLUXO_ETAPAS_RESUMIDAS.map((etapa) => {
    const chave = CHAVES_MARCO[etapa.indice]
    const realMs = marcos[chave]
    const prevMs = previsoes[chave]

    const dataRealIso = realMs != null ? new Date(realMs).toISOString() : null
    const dataPrevisaoIso =
      realMs == null && prevMs != null ? new Date(prevMs).toISOString() : null

    return {
      indice: etapa.indice,
      dataRealIso,
      dataPrevisaoIso,
    }
  })
}
