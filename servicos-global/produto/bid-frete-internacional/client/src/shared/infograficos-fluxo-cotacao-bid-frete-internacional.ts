/**
 * Métricas inteligentes do painel de fluxo (detalhe da cotação).
 */

import type { TFunction } from 'i18next'
import type {
  DisparoCotacaoBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  StatusCotacao,
} from './types'

export interface ResumoMelhorPropostaFluxo {
  fornecedor: string
  moeda: string
  valorFrete: number
  valorTaxas: number
  valorTotal: number
  diasTransito: number
  quantidadeTransbordo: number
  quantidadeEscala: number
  diasFreeTime: number | null
}

export interface PontoSerieHistoricoTermometro {
  mes: string
  valor: number
}

export type HistoricoAprovadoMesmasCondicoes = Array<{
  id_cotacao_bid_frete_internacional: string
  numero_cotacao_bid_frete_internacional: string
  data_aprovacao_cotacao_bid_frete_internacional: string
  propostas?: Array<{
    valor_total_proposta_bid_frete_internacional?: number | string
    moeda_proposta_bid_frete_internacional?: string
  }>
  /** Alias retornado em alguns payloads Prisma/API. */
  propostas_bid_frete_internacional?: Array<{
    valor_total_proposta_bid_frete_internacional?: number | string
    moeda_proposta_bid_frete_internacional?: string
  }>
}>

export interface BarraComparativoInsight {
  valor: number
  destaque: boolean
  fornecedor: string
}

export interface ComparativoMetricaPainel {
  valorExibicao: string
  barras: BarraComparativoInsight[]
  melhorMenor: boolean
}

export interface PainelSmartInsightsDados {
  termometroMedia6Meses: number | null
  termometroMoeda: string
  termometroSavingsValor: number | null
  serieHistorico6Meses: PontoSerieHistoricoTermometro[]
  quantidadeHistoricoMesmasCondicoes: number
  /** true quando a série é ilustrativa (sem histórico aprovado real). */
  termometroDadosDemonstracao: boolean
  comparativoTransito: ComparativoMetricaPainel | null
  comparativoFreeTime: ComparativoMetricaPainel | null
  comparativoEscala: ComparativoMetricaPainel | null
  quantidadeRecusasSemResposta: number
  pctConfiabilidadeIa: number
  pctCoberturaRespostas: number
}

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function ultimos6MesesRotulos(): string[] {
  const agora = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1)
    return MESES_CURTOS[d.getMonth()] ?? '—'
  })
}

/** Garante pontos plottáveis quando a média existe mas a série veio zerada/inconsistente da API. */
export function normalizarSerieTermometroParaPlot(
  serie: PontoSerieHistoricoTermometro[] | null | undefined,
  mediaFallback: number | null,
): PontoSerieHistoricoTermometro[] {
  const base = Array.isArray(serie) ? serie : []
  const normalizada = base.map((p) => ({
    mes: p.mes,
    valor: Number.isFinite(Number(p.valor)) ? Number(p.valor) : 0,
  }))

  if (normalizada.some((p) => p.valor > 0)) {
    return normalizada
  }

  if (mediaFallback == null || mediaFallback <= 0) {
    return normalizada
  }

  const meses = normalizada.length >= 6
    ? normalizada.map((p) => p.mes)
    : ultimos6MesesRotulos()

  return meses.slice(0, 6).map((mes, i) => ({
    mes,
    valor: Math.round(mediaFallback * (0.82 + (i / Math.max(1, meses.length - 1)) * 0.28)),
  }))
}

function interpolarMesesVaziosSerie(
  serie: Array<{ mes: string; valor: number; count: number }>,
): PontoSerieHistoricoTermometro[] {
  for (let i = 0; i < 6; i++) {
    if (serie[i].count > 0) {
      serie[i].valor = Math.round(serie[i].valor / serie[i].count)
    }
  }
  for (let i = 0; i < 6; i++) {
    if (serie[i].count > 0) continue
    let leftVal: number | null = null
    for (let j = i - 1; j >= 0; j--) {
      if (serie[j].count > 0) {
        leftVal = serie[j].valor
        break
      }
    }
    let rightVal: number | null = null
    for (let j = i + 1; j < 6; j++) {
      if (serie[j].count > 0) {
        rightVal = serie[j].valor
        break
      }
    }
    if (leftVal !== null && rightVal !== null) {
      serie[i].valor = Math.round((leftVal + rightVal) / 2)
    } else if (leftVal !== null) {
      serie[i].valor = leftVal
    } else if (rightVal !== null) {
      serie[i].valor = rightVal
    }
  }
  return serie.map((s) => ({ mes: s.mes, valor: s.valor }))
}

type PayloadTermometro = Pick<
  PainelSmartInsightsDados,
  | 'serieHistorico6Meses'
  | 'termometroMedia6Meses'
  | 'termometroSavingsValor'
  | 'quantidadeHistoricoMesmasCondicoes'
  | 'termometroDadosDemonstracao'
>

function valorPropostaHistorico(item: HistoricoAprovadoMesmasCondicoes[number]): number | null {
  const lista = item.propostas ?? item.propostas_bid_frete_internacional ?? []
  const bruto = lista[0]?.valor_total_proposta_bid_frete_internacional
  const n = Number(bruto)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Se a série veio vazia mas há média (mock ou API parcial), força pontos plottáveis. */
function comSeriePlotavelGarantida(
  payload: PayloadTermometro,
  propostas: PropostaRankingBidFreteInternacional[],
  meses: string[],
): PayloadTermometro {
  if (payload.serieHistorico6Meses.some((p) => Number(p.valor) > 0)) {
    return payload
  }
  const demo = buildSerieTermometroDemonstracao(propostas, meses)
  return {
    ...payload,
    serieHistorico6Meses: demo.serieHistorico6Meses,
    termometroMedia6Meses: payload.termometroMedia6Meses ?? demo.termometroMedia6Meses,
    termometroDadosDemonstracao: payload.termometroDadosDemonstracao || demo.termometroDadosDemonstracao,
  }
}

/** Série ilustrativa para preview do gráfico quando não há histórico real. */
function buildSerieTermometroDemonstracao(
  propostas: PropostaRankingBidFreteInternacional[],
  meses: string[],
): Pick<
  PainelSmartInsightsDados,
  | 'serieHistorico6Meses'
  | 'termometroMedia6Meses'
  | 'termometroSavingsValor'
  | 'quantidadeHistoricoMesmasCondicoes'
  | 'termometroDadosDemonstracao'
> {
  const valoresDemoEstaticos = [220, 380, 340, 480, 520, 780]

  if (propostas.length === 0) {
    const media = valoresDemoEstaticos.reduce((acc, v) => acc + v, 0) / valoresDemoEstaticos.length
    return {
      serieHistorico6Meses: meses.map((mes, i) => ({
        mes,
        valor: valoresDemoEstaticos[i] ?? 400,
      })),
      termometroMedia6Meses: Math.round(media),
      termometroSavingsValor: null,
      quantidadeHistoricoMesmasCondicoes: 0,
      termometroDadosDemonstracao: true,
    }
  }

  const valores = propostas
    .map((p) => p.valor_total_proposta_bid_frete_internacional)
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b)
  const melhor = valores[0] ?? 800
  const media = valores.reduce((acc, v) => acc + v, 0) / valores.length
  const maxVal = valores[valores.length - 1] ?? media

  const serie = meses.map((mes, i) => {
    const t = i / Math.max(1, meses.length - 1)
    const interpolado = maxVal - (maxVal - melhor) * t * 0.82
    return { mes, valor: Math.round(interpolado) }
  })

  if (valores.length >= 2) {
    valores.forEach((valor, idx) => {
      const slot = Math.min(Math.floor((idx / valores.length) * 6), 5)
      serie[slot] = { ...serie[slot], valor: Math.round(valor) }
    })
  }

  const melhorAtual = valores[0]
  const savings = melhorAtual != null ? Math.max(0, Math.round(media - melhorAtual)) : null

  return {
    serieHistorico6Meses: serie,
    termometroMedia6Meses: Math.round(media),
    termometroSavingsValor: savings,
    quantidadeHistoricoMesmasCondicoes: 0,
    termometroDadosDemonstracao: true,
  }
}

/** Frete total pago em cotações aprovadas com mesma rota e condições operacionais (últimos 6 meses). */
export function buildSerieTermometro(
  propostas: PropostaRankingBidFreteInternacional[],
  historicoAprovado?: HistoricoAprovadoMesmasCondicoes,
): Pick<
  PainelSmartInsightsDados,
  | 'serieHistorico6Meses'
  | 'termometroMedia6Meses'
  | 'termometroSavingsValor'
  | 'quantidadeHistoricoMesmasCondicoes'
  | 'termometroDadosDemonstracao'
> {
  const meses = ultimos6MesesRotulos()

  if (!historicoAprovado || historicoAprovado.length === 0) {
    return comSeriePlotavelGarantida(
      buildSerieTermometroDemonstracao(propostas, meses),
      propostas,
      meses,
    )
  }

  const agora = new Date()
  const slotsData = Array.from({ length: 6 }, (_, i) => {
    return new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1)
  })

  const serie = meses.map((mes) => ({ mes, valor: 0, count: 0 }))

  historicoAprovado.forEach((cotacaoHistorico) => {
    const valor = valorPropostaHistorico(cotacaoHistorico)
    if (valor == null) return

    const dataAprov = new Date(cotacaoHistorico.data_aprovacao_cotacao_bid_frete_internacional)
    const slotIdx = slotsData.findIndex(
      (slotDate) => slotDate.getFullYear() === dataAprov.getFullYear()
        && slotDate.getMonth() === dataAprov.getMonth(),
    )
    if (slotIdx !== -1) {
      serie[slotIdx].valor += valor
      serie[slotIdx].count += 1
    }
  })

  const validSlots = serie.filter((s) => s.count > 0)
  if (validSlots.length === 0) {
    return comSeriePlotavelGarantida(
      {
        ...buildSerieTermometroDemonstracao(propostas, meses),
        quantidadeHistoricoMesmasCondicoes: historicoAprovado.length,
      },
      propostas,
      meses,
    )
  }

  const serieHistorico6Meses = interpolarMesesVaziosSerie(serie)
  const valoresPagos = validSlots.map((s) => Math.round(s.valor / s.count))
  const media = valoresPagos.reduce((acc, v) => acc + v, 0) / valoresPagos.length

  const valoresAtuais = propostas
    .map((p) => p.valor_total_proposta_bid_frete_internacional)
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b)
  const melhorAtual = valoresAtuais[0]
  const savings = melhorAtual != null ? Math.max(0, Math.round(media - melhorAtual)) : null

  return comSeriePlotavelGarantida(
    {
      serieHistorico6Meses,
      termometroMedia6Meses: Math.round(media),
      termometroSavingsValor: savings,
      quantidadeHistoricoMesmasCondicoes: historicoAprovado.length,
      termometroDadosDemonstracao: false,
    },
    propostas,
    meses,
  )
}

function buildComparativoMetrica(
  propostas: PropostaRankingBidFreteInternacional[],
  extrair: (p: PropostaRankingBidFreteInternacional) => number,
  melhorMenor: boolean,
  formatar: (v: number) => string,
): ComparativoMetricaPainel | null {
  if (propostas.length === 0) return null
  const vistos = new Set<string>()
  const unicas = propostas.filter((p) => {
    const id = p.id_proposta_bid_frete_internacional
    if (vistos.has(id)) return false
    vistos.add(id)
    return true
  })
  const ordenadas = [...unicas].sort((a, b) => {
    const va = extrair(a)
    const vb = extrair(b)
    return melhorMenor ? va - vb : vb - va
  })
  const barrasRaw = ordenadas.map((p) => extrair(p))
  const melhorValor = melhorMenor ? Math.min(...barrasRaw) : Math.max(...barrasRaw)
  return {
    valorExibicao: formatar(melhorValor),
    melhorMenor,
    barras: ordenadas.slice(0, 6).map((p) => {
      const valor = extrair(p)
      return {
        valor,
        destaque: valor === melhorValor,
        fornecedor:
          p.fornecedor_nome
          ?? p.fornecedor?.nome_fornecedor_bid_frete_internacional
          ?? '—',
      }
    }),
  }
}

export function calcularPainelSmartInsights(
  disparos: DisparoCotacaoBidFreteInternacional[],
  propostas: PropostaRankingBidFreteInternacional[],
  info: InfograficosFluxoCotacao,
  historicoAprovado?: HistoricoAprovadoMesmasCondicoes,
): PainelSmartInsightsDados {
  const disparosEnviados = disparos.filter(
    (d) => d.data_envio_disparo_cotacao_bid_frete_internacional != null,
  )
  const quantidadeRecusasSemResposta = disparosEnviados.filter((d) => {
    const temProposta = d.proposta != null
      || d.status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO'
    return !temProposta && (
      d.status_disparo_cotacao_bid_frete_internacional === 'EXPIRADO'
      || d.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO'
      || d.status_disparo_cotacao_bid_frete_internacional === 'VISUALIZADO'
    )
  }).length

  const termometro = buildSerieTermometro(propostas, historicoAprovado)

  const comparativoTransito = buildComparativoMetrica(
    propostas,
    (p) => p.dias_transito_proposta_bid_frete_internacional,
    true,
    (v) => `${v}`,
  )
  const comparativoFreeTime = buildComparativoMetrica(
    propostas,
    (p) => p.dias_free_time_proposta_bid_frete_internacional ?? 0,
    false,
    (v) => (v > 0 ? `${v}` : '—'),
  )
  const comparativoEscala = buildComparativoMetrica(
    propostas,
    (p) => p.quantidade_escala_proposta_bid_frete_internacional,
    true,
    (v) => (v === 0 ? 'Direto' : `${v}`),
  )

  const pctCoberturaRespostas = disparosEnviados.length > 0
    ? Math.min(100, Math.round((propostas.length / disparosEnviados.length) * 100))
    : 0

  const pctConfiabilidadeIa = Math.min(
    99,
    Math.round(72 + propostas.length * 4 + (info.quantidadeRespostasComTempo > 0 ? 8 : 0)),
  )

  return {
    termometroMedia6Meses: termometro.termometroMedia6Meses,
    termometroMoeda: info.melhorValorMoeda,
    termometroSavingsValor: termometro.termometroSavingsValor,
    serieHistorico6Meses: termometro.serieHistorico6Meses,
    quantidadeHistoricoMesmasCondicoes: termometro.quantidadeHistoricoMesmasCondicoes,
    termometroDadosDemonstracao: termometro.termometroDadosDemonstracao,
    comparativoTransito,
    comparativoFreeTime,
    comparativoEscala,
    quantidadeRecusasSemResposta,
    pctConfiabilidadeIa,
    pctCoberturaRespostas,
  }
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
  melhorPropostaResumo: ResumoMelhorPropostaFluxo | null
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

function dedupePropostas(
  propostas: PropostaRankingBidFreteInternacional[],
): PropostaRankingBidFreteInternacional[] {
  const vistos = new Set<string>()
  return propostas.filter((p) => {
    const id = p.id_proposta_bid_frete_internacional
    if (vistos.has(id)) return false
    vistos.add(id)
    return true
  })
}

export function mediaMercadoNumericaPropostas(
  propostas: PropostaRankingBidFreteInternacional[],
  extrairValor: (p: PropostaRankingBidFreteInternacional) => number,
): number {
  const unicas = dedupePropostas(propostas)
  if (unicas.length === 0) return 0
  const soma = unicas.reduce((acc, p) => acc + extrairValor(p), 0)
  return Math.round(soma / unicas.length)
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
    melhorPropostaResumo: null,
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

    vazio.melhorPropostaResumo = {
      fornecedor: nomeFornecedorProposta(melhor),
      moeda: melhor.moeda_proposta_bid_frete_internacional,
      valorFrete: melhor.valor_frete_proposta_bid_frete_internacional,
      valorTaxas:
        melhor.taxas_origem_proposta_bid_frete_internacional
        + melhor.taxas_destino_proposta_bid_frete_internacional,
      valorTotal: melhor.valor_total_proposta_bid_frete_internacional,
      diasTransito: melhor.dias_transito_proposta_bid_frete_internacional,
      quantidadeTransbordo: melhor.quantidade_transbordo_proposta_bid_frete_internacional,
      quantidadeEscala: melhor.quantidade_escala_proposta_bid_frete_internacional,
      diasFreeTime: melhor.dias_free_time_proposta_bid_frete_internacional,
    }
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
