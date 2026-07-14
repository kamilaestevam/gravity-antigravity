/**
 * Métricas inteligentes do painel de fluxo (detalhe da cotação).
 */

import type { TFunction } from 'i18next'
import type {
  DisparoCotacaoBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  StatusCotacao,
  Cotacao,
} from './types'
import {
  type ComponentePrecoTermometro,
  type SelecaoComponentesTermometro,
  type ItemHistoricoTermometro,
  type TipoBaseTermometroHistorico,
  dataReferenciaHistoricoTermometro,
  melhorValorComponentePropostas,
  valorHistoricoCotacaoTermometro,
} from '../../../shared/filtro-historico-termometro-bid-frete-internacional'

export interface ResumoMelhorPropostaFluxo {
  id_proposta_bid_frete_internacional: string
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

export type HistoricoAprovadoMesmasCondicoes = ItemHistoricoTermometro[]

export type { TipoBaseTermometroHistorico, ComponentePrecoTermometro, SelecaoComponentesTermometro }

export type CotacaoHistoricoTermometroMesmasCondicoes = ItemHistoricoTermometro[]

export interface BarraComparativoInsight {
  valor: number
  destaque: boolean
  fornecedor: string
  /** Posição neste comparativo (1 = melhor na métrica). */
  posicao_comparativo_metrica?: number
  ranking_geral_proposta?: number
  moeda_proposta_bid_frete_internacional?: string
  valor_total_proposta_bid_frete_internacional?: number
  dias_transito_proposta_bid_frete_internacional?: number
  dias_free_time_proposta_bid_frete_internacional?: number | null
  quantidade_escala_proposta_bid_frete_internacional?: number
}

export interface ComparativoMetricaPainel {
  valorExibicao: string
  barras: BarraComparativoInsight[]
  melhorMenor: boolean
}

export interface ResultadoSerieTermometro {
  serieHistorico6Meses: PontoSerieHistoricoTermometro[]
  termometroMedia6Meses: number | null
  termometroValorDele: number | null
  termometroSavingsValor: number | null
  quantidadeHistoricoMesmasCondicoes: number
  termometroDadosDemonstracao: boolean
}

export interface PainelSmartInsightsDados {
  termometroMedia6Meses: number | null
  termometroMoeda: string
  termometroSavingsValor: number | null
  serieHistorico6Meses: PontoSerieHistoricoTermometro[]
  quantidadeHistoricoMesmasCondicoes: number
  termometroDadosDemonstracao: boolean
  comparativoTransito: ComparativoMetricaPainel | null
  comparativoFreeTime: ComparativoMetricaPainel | null
  comparativoEscala: ComparativoMetricaPainel | null
  quantidadeRecusasSemResposta: number
  pctConfiabilidadeIa: number
  pctCoberturaRespostas: number
}

export type VarianteAvisoGraficosInsights = 'rascunho' | 'aguardando' | 'comparativo_parcial'

export interface ConteudoAvisoGraficosInsights {
  variante: VarianteAvisoGraficosInsights
  titulo: string
  texto: string
  passos: string[]
}

/** Textos do banner quando gráficos comparativos ainda não estão disponíveis. */
export function montarConteudoAvisoGraficosInsights(
  status: StatusCotacao | null | undefined,
  quantidadePropostas: number,
  quantidadeDisparosEnviados: number,
  t: TFunction,
): ConteudoAvisoGraficosInsights | null {
  if (status === 'APROVADA') return null

  if (quantidadePropostas >= 2) return null

  if (quantidadePropostas === 1) {
    return {
      variante: 'comparativo_parcial',
      titulo: t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_titulo_parcial',
        'Comparativo visual quase pronto',
      ),
      texto: t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_texto_parcial',
        'Já existe 1 proposta. Os mini-gráficos de Transit Time, Free Time e Escala aparecem quando houver pelo menos 2 respostas para comparar.',
      ),
      passos: [
        t(
          'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_parcial_1',
          'Aguarde mais uma resposta ou convide fornecedores adicionais.',
        ),
        t(
          'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_parcial_2',
          'Com 2+ propostas, o ranking e a Melhor proposta exibem barras comparativas.',
        ),
      ],
    }
  }

  const ehRascunho = status === 'RASCUNHO' || status == null

  if (ehRascunho && quantidadeDisparosEnviados === 0) {
    return {
      variante: 'rascunho',
      titulo: t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_titulo_rascunho',
        'Gráficos liberados após o disparo',
      ),
      texto: t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_texto_rascunho',
        'Esta cotação ainda está em rascunho. Envie aos fornecedores para iniciar o leilão e popular o painel.',
      ),
      passos: [
        t(
          'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_rascunho_1',
          'Finalize os dados e dispare a cotação.',
        ),
        t(
          'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_rascunho_2',
          'Com as respostas, liberamos Melhor proposta, ranking e mini-gráficos.',
        ),
        t(
          'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_rascunho_3',
          'O termômetro histórico usa dados reais após aprovações na mesma rota.',
        ),
      ],
    }
  }

  if (quantidadeDisparosEnviados > 0) {
    return {
      variante: 'aguardando',
      titulo: t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_titulo_aguardando',
        'Aguardando propostas dos fornecedores',
      ),
      texto: t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_texto_aguardando',
        '{{n}} disparo(s) enviado(s). Os gráficos comparativos aparecem assim que chegar a primeira resposta.',
        { n: quantidadeDisparosEnviados },
      ),
      passos: [
        t(
          'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_aguardando_1',
          'Melhor proposta e métricas Transit / Free Time / Escala dependem de propostas recebidas.',
        ),
        t(
          'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_aguardando_2',
          'Com 2 ou mais respostas, as barras comparativas são exibidas em todos os cards.',
        ),
      ],
    }
  }

  return {
    variante: 'rascunho',
    titulo: t(
      'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_titulo_sem_dados',
      'Sem dados para gráficos ainda',
    ),
    texto: t(
      'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_texto_sem_dados',
      'Não há propostas nesta cotação. Dispare ou aguarde respostas para ativar os insights visuais.',
    ),
    passos: [
      t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_sem_dados_1',
        'Envie a cotação aos fornecedores cadastrados.',
      ),
      t(
        'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_passo_sem_dados_2',
        'Os mini-gráficos só comparam valores entre propostas recebidas.',
      ),
    ],
  }
}

const MESES_ABREV_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const

/** Rótulo do eixo X do termômetro — ex.: `dez/25`, `jan/26`. */
export function rotuloMesAnoTermometro(data: Date): string {
  const mes = MESES_ABREV_PT[data.getMonth()]
  if (mes == null) return '—'
  const ano = String(data.getFullYear()).slice(-2)
  return `${mes}/${ano}`
}

function ultimos6MesesRotulos(): string[] {
  const agora = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1)
    return rotuloMesAnoTermometro(d)
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
  ResultadoSerieTermometro,
  | 'serieHistorico6Meses'
  | 'termometroMedia6Meses'
  | 'termometroValorDele'
  | 'termometroSavingsValor'
  | 'quantidadeHistoricoMesmasCondicoes'
  | 'termometroDadosDemonstracao'
>

/** Se a série veio vazia mas há média (mock ou API parcial), força pontos plottáveis. */
function comSeriePlotavelGarantida(
  payload: PayloadTermometro,
  propostas: PropostaRankingBidFreteInternacional[],
  meses: string[],
): PayloadTermometro {
  if (payload.serieHistorico6Meses.some((p) => Number(p.valor) > 0)) {
    return payload
  }
  if (payload.termometroDadosDemonstracao) {
    return payload
  }
  if (payload.termometroMedia6Meses != null && payload.termometroMedia6Meses > 0) {
    return {
      ...payload,
      serieHistorico6Meses: normalizarSerieTermometroParaPlot(
        payload.serieHistorico6Meses,
        payload.termometroMedia6Meses,
      ),
    }
  }
  return payload
}

/** Sem histórico real — card exibe estado aguardando dados (sem série ilustrativa). */
function buildSerieTermometroDemonstracao(
  _propostas: PropostaRankingBidFreteInternacional[],
  meses: string[],
): ResultadoSerieTermometro {
  return {
    serieHistorico6Meses: meses.map((mes) => ({ mes, valor: 0 })),
    termometroMedia6Meses: null,
    termometroValorDele: null,
    termometroSavingsValor: null,
    quantidadeHistoricoMesmasCondicoes: 0,
    termometroDadosDemonstracao: true,
  }
}

function resolverValorDeleTermometro(
  propostas: PropostaRankingBidFreteInternacional[],
  componente: SelecaoComponentesTermometro,
): number | null {
  return melhorValorComponentePropostas(
    propostas as ItemHistoricoTermometro['propostas'],
    componente,
    'PROPOSTAS_RECEBIDAS',
  )
}

/** Uma base do termômetro (Contratado ou Propostas) com seu histórico já filtrado. */
export type EntradaBaseTermometro = {
  tipoBase: TipoBaseTermometroHistorico
  historico?: HistoricoAprovadoMesmasCondicoes
}

/** Histórico de mercado vs valor Dele (últimos 6 meses) — base única. */
export function buildSerieTermometro(
  propostas: PropostaRankingBidFreteInternacional[],
  historicoMesmasCondicoes?: HistoricoAprovadoMesmasCondicoes,
  tipoBase: TipoBaseTermometroHistorico = 'CONTRATADO',
  componente: SelecaoComponentesTermometro = 'FRETE_BASE',
): ResultadoSerieTermometro {
  return buildSerieTermometroBases(
    propostas,
    [{ tipoBase, historico: historicoMesmasCondicoes }],
    componente,
  )
}

/**
 * Histórico de mercado vs valor Dele (últimos 6 meses) — aceita múltiplas bases.
 * Cotação presente em mais de uma base conta uma vez só (primeira entrada vence,
 * ex.: aprovada vale pela regra do Contratado, não pela melhor proposta).
 */
export function buildSerieTermometroBases(
  propostas: PropostaRankingBidFreteInternacional[],
  entradas: EntradaBaseTermometro[],
  componente: SelecaoComponentesTermometro = 'FRETE_BASE',
): ResultadoSerieTermometro {
  const meses = ultimos6MesesRotulos()

  const idsVistos = new Set<string>()
  const itensPorBase = entradas.map((entrada) => {
    const itens = (entrada.historico ?? []).filter((item) => {
      const id = item.id_cotacao_bid_frete_internacional
      if (idsVistos.has(id)) return false
      idsVistos.add(id)
      return true
    })
    return { tipoBase: entrada.tipoBase, itens }
  })

  const totalHistorico = itensPorBase.reduce((acc, b) => acc + b.itens.length, 0)
  if (totalHistorico === 0) {
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

  itensPorBase.forEach(({ tipoBase, itens }) => {
    itens.forEach((cotacaoHistorico) => {
      const valor = valorHistoricoCotacaoTermometro(cotacaoHistorico, tipoBase, componente)
      if (valor == null) return

      const dataReferencia = dataReferenciaHistoricoTermometro(cotacaoHistorico, tipoBase)
      if (dataReferencia == null) return

      const slotIdx = slotsData.findIndex(
        (slotDate) => slotDate.getFullYear() === dataReferencia.getFullYear()
          && slotDate.getMonth() === dataReferencia.getMonth(),
      )
      if (slotIdx !== -1) {
        serie[slotIdx].valor += valor
        serie[slotIdx].count += 1
      }
    })
  })

  const validSlots = serie.filter((s) => s.count > 0)
  if (validSlots.length === 0) {
    return comSeriePlotavelGarantida(
      {
        ...buildSerieTermometroDemonstracao(propostas, meses),
        quantidadeHistoricoMesmasCondicoes: totalHistorico,
      },
      propostas,
      meses,
    )
  }

  // Média ANTES de interpolar — interpolarMesesVaziosSerie muta `serie` dividindo
  // valor por count; dividir de novo aqui reduziria a média pela metade (ou mais)
  // em meses com 2+ cotações.
  const valoresReferencia = validSlots.map((s) => Math.round(s.valor / s.count))
  const media = valoresReferencia.reduce((acc, v) => acc + v, 0) / valoresReferencia.length
  const serieHistorico6Meses = interpolarMesesVaziosSerie(serie)

  const valorDeleBruto = resolverValorDeleTermometro(propostas, componente)
  const valorDele = valorDeleBruto != null ? Math.round(valorDeleBruto) : null
  const savings = valorDele != null ? Math.max(0, Math.round(media - valorDele)) : null

  return comSeriePlotavelGarantida(
    {
      serieHistorico6Meses,
      termometroMedia6Meses: Math.round(media),
      termometroValorDele: valorDele,
      termometroSavingsValor: savings,
      quantidadeHistoricoMesmasCondicoes: totalHistorico,
      termometroDadosDemonstracao: false,
    },
    propostas,
    meses,
  )
}

export function buildComparativoMetrica(
  propostas: PropostaRankingBidFreteInternacional[],
  extrair: (p: PropostaRankingBidFreteInternacional) => number,
  melhorMenor: boolean,
  formatar: (v: number) => string,
  id_proposta_destaque?: string,
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
    barras: ordenadas.slice(0, 6).map((p, indice) => {
      const valor = extrair(p)
      const id = p.id_proposta_bid_frete_internacional
      const destaque = id_proposta_destaque != null
        ? id === id_proposta_destaque
        : valor === melhorValor
      return {
        valor,
        destaque,
        fornecedor:
          p.fornecedor_nome
          ?? p.fornecedor?.nome_fornecedor_bid_frete_internacional
          ?? '—',
        posicao_comparativo_metrica: indice + 1,
        ranking_geral_proposta: p.ranking_geral,
        moeda_proposta_bid_frete_internacional: p.moeda_proposta_bid_frete_internacional,
        valor_total_proposta_bid_frete_internacional: p.valor_total_proposta_bid_frete_internacional,
        dias_transito_proposta_bid_frete_internacional: p.dias_transito_proposta_bid_frete_internacional,
        dias_free_time_proposta_bid_frete_internacional: p.dias_free_time_proposta_bid_frete_internacional,
        quantidade_escala_proposta_bid_frete_internacional: p.quantidade_escala_proposta_bid_frete_internacional,
      }
    }),
  }
}

/** Barras comparativas para tooltip de análise (ranking / barras de progresso). */
export function montarBarrasComparativoDePropostas(
  propostas: PropostaRankingBidFreteInternacional[],
  id_proposta_destaque: string,
  extrair: (p: PropostaRankingBidFreteInternacional) => number,
  melhorMenor: boolean,
): BarraComparativoInsight[] {
  const comparativo = buildComparativoMetrica(
    propostas,
    extrair,
    melhorMenor,
    (v) => String(v),
    id_proposta_destaque,
  )
  return comparativo?.barras ?? []
}

/** Comparativo com barras iguais ao painel Melhor proposta, destacando a proposta do card. */
export function buildComparativoMetricaParaProposta(
  propostas: PropostaRankingBidFreteInternacional[],
  propostaAtual: PropostaRankingBidFreteInternacional,
  extrair: (p: PropostaRankingBidFreteInternacional) => number,
  melhorMenor: boolean,
  formatar: (v: number) => string,
): ComparativoMetricaPainel | null {
  if (propostas.length < 2) return null
  const comparativo = buildComparativoMetrica(
    propostas,
    extrair,
    melhorMenor,
    formatar,
    propostaAtual.id_proposta_bid_frete_internacional,
  )
  if (comparativo == null) return null
  return {
    ...comparativo,
    valorExibicao: formatar(extrair(propostaAtual)),
  }
}

/** Disparo enviado sem proposta (conta como recusa no painel). */
export function isDisparoRecusaSemResposta(
  disparo: DisparoCotacaoBidFreteInternacional,
): boolean {
  if (disparo.data_envio_disparo_cotacao_bid_frete_internacional == null) return false
  const temProposta = disparo.proposta != null
    || disparo.status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO'
  return !temProposta && (
    disparo.status_disparo_cotacao_bid_frete_internacional === 'EXPIRADO'
    || disparo.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO'
    || disparo.status_disparo_cotacao_bid_frete_internacional === 'VISUALIZADO'
  )
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
  const quantidadeRecusasSemResposta = disparosEnviados.filter(isDisparoRecusaSemResposta).length

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
      id_proposta_bid_frete_internacional: melhor.id_proposta_bid_frete_internacional,
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
  { indice: 4, labelKey: 'bidfrete.detalhe_cotacao.timeline_fornecedor_concordou' },
  { indice: 5, labelKey: 'bidfrete.detalhe_cotacao.timeline_aprovada' },
]

export function resolverPropostaGanhadoraFluxoTimeline(
  propostasRanking?: PropostaRankingBidFreteInternacional[],
  id_fornecedor_vencedor?: string | null,
): PropostaRankingBidFreteInternacional | null {
  if (!propostasRanking?.length) return null
  return (
    propostasRanking.find(
      (p) => id_fornecedor_vencedor != null
        && p.id_fornecedor_bid_frete_internacional === id_fornecedor_vencedor,
    )
    ?? propostasRanking.find((p) => p.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA')
    ?? propostasRanking.find((p) => p.status_proposta_bid_frete_internacional === 'APROVADA')
    ?? null
  )
}

/** Rótulo dinâmico — etapa 4 alterna entre aguardando aceite e fornecedor concordou. */
export function rotuloEtapaTimelineFluxoCotacao(
  etapa: { indice: number; labelKey: string },
  input: {
    indiceAtual: number
    statusPropostaGanhadora?: string | null
  },
  t: (key: string, defaultValue?: string) => string,
): string {
  if (etapa.indice === 4) {
    const aguardandoAceite =
      input.indiceAtual === 4 && input.statusPropostaGanhadora === 'APROVADA'
    if (aguardandoAceite) {
      return t(
        'bidfrete.detalhe_cotacao.timeline_aguardando_fornecedor_concordar',
        'Aguard. fornecedor',
      )
    }
    if (
      input.statusPropostaGanhadora === 'APROVACAO_RECEBIDA'
      || input.indiceAtual > 4
    ) {
      return t('bidfrete.detalhe_cotacao.timeline_fornecedor_concordou', 'Fornecedor concordou')
    }
  }
  return t(etapa.labelKey)
}

export function indiceFluxoPorStatus(status: StatusCotacao): number {
  const mapa: Partial<Record<StatusCotacao, number>> = {
    RASCUNHO: 0,
    FALTA_INFORMACAO: 0,
    ENVIADA_FORNECEDORES: 1,
    EM_COTACAO: 2,
    AGUARDANDO_APROVACAO: 3,
    APROVADA: 4,
    FECHADA: 5,
    REPROVADA: 3,
    CANCELADA: 0,
    EXPIRADA: 2,
  }
  return mapa[status] ?? 0
}

/** Índice da timeline compacta considerando aceite do fornecedor ganhador. */
export function indiceFluxoResumidoCotacao(
  status: StatusCotacao,
  propostasRanking?: PropostaRankingBidFreteInternacional[],
  id_fornecedor_vencedor?: string | null,
): number {
  if (status === 'FECHADA') return 5

  if (status === 'APROVADA' && propostasRanking != null) {
    const propostaGanhadora = resolverPropostaGanhadoraFluxoTimeline(
      propostasRanking,
      id_fornecedor_vencedor,
    )

    const statusProposta = propostaGanhadora?.status_proposta_bid_frete_internacional
    if (statusProposta === 'APROVACAO_RECEBIDA') return 5
    if (statusProposta === 'APROVADA') return 4
  }

  return indiceFluxoPorStatus(status)
}

export function formatarMoedaInsightsBidFrete(valor: number, moeda: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

/** Nome do agente/fornecedor ganhador da cotação aprovada. */
export function resolverNomeGanhadorCotacao(
  cotacao: Cotacao,
  propostasRanking: PropostaRankingBidFreteInternacional[],
): string | null {
  const propostaRankingGanhador = propostasRanking.find(
    (p) => p.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA',
  ) ?? propostasRanking.find(
    (p) => p.status_proposta_bid_frete_internacional === 'APROVADA',
  )
  if (propostaRankingGanhador) {
    return nomeFornecedorProposta(propostaRankingGanhador)
  }

  const propostas = cotacao.propostas_bid_frete_internacional ?? []
  const propostaAprovada = propostas.find(
    (p) => p.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA',
  ) ?? propostas.find((p) => p.status_proposta_bid_frete_internacional === 'APROVADA')
  if (propostaAprovada?.fornecedor?.nome_fornecedor_bid_frete_internacional) {
    return propostaAprovada.fornecedor.nome_fornecedor_bid_frete_internacional
  }

  const idVencedor = cotacao.id_fornecedor_vencedor_cotacao_bid_frete_internacional
  if (idVencedor) {
    const porProposta = propostas.find((p) => p.id_fornecedor_bid_frete_internacional === idVencedor)
    if (porProposta?.fornecedor?.nome_fornecedor_bid_frete_internacional) {
      return porProposta.fornecedor.nome_fornecedor_bid_frete_internacional
    }
    const disparo = cotacao.disparo_cotacao_bid_frete_internacional?.find(
      (d) => d.id_fornecedor_bid_frete_internacional === idVencedor,
    )
    if (disparo?.fornecedor?.nome_fornecedor_bid_frete_internacional) {
      return disparo.fornecedor.nome_fornecedor_bid_frete_internacional
    }
  }

  return null
}
