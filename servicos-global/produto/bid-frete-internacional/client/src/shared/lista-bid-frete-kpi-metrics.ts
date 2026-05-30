import type { Cotacao, StatusCotacao } from './types'

/** Status em que o prazo de resposta ainda é relevante (paridade dashboard fora_prazo). */
export const STATUS_COTACAO_ABERTA_PRAZO_RESPOSTA: StatusCotacao[] = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
]

/** Cotação em atraso: prazo de resposta já passou e ainda aguarda retorno. */
export function cotacaoEmAtrasoPrazoResposta(
  cotacao: Cotacao,
  agoraMs = Date.now(),
): boolean {
  if (!STATUS_COTACAO_ABERTA_PRAZO_RESPOSTA.includes(cotacao.status_cotacao_bid_frete_internacional)) {
    return false
  }
  const limite = cotacao.data_limite_resposta_cotacao_bid_frete_internacional
  if (!limite) return false
  const limiteMs = new Date(limite).getTime()
  if (!Number.isFinite(limiteMs)) return false
  return limiteMs < agoraMs
}

export function contarCotacoesEmAtrasoPrazoResposta(
  cotacoes: Cotacao[],
  agoraMs = Date.now(),
): number {
  return cotacoes.filter(c => cotacaoEmAtrasoPrazoResposta(c, agoraMs)).length
}

export type SituacaoPrazoRespostaCotacao = 'sem_prazo' | 'no_prazo' | 'fora_prazo'

export interface AvaliacaoPrazoRespostaCotacao {
  situacao: SituacaoPrazoRespostaCotacao
  dataLimite: string | null
  /** Exibe badge no prazo / fora do prazo (oculto em rascunho sem envio). */
  exibirBadge: boolean
}

/** Situação do prazo para resposta no detalhe e badges (paridade KPI em atraso + expirada). */
export function avaliarPrazoRespostaCotacao(
  cotacao: Cotacao,
  agoraMs = Date.now(),
): AvaliacaoPrazoRespostaCotacao {
  const limite = cotacao.data_limite_resposta_cotacao_bid_frete_internacional
  if (!limite) {
    return { situacao: 'sem_prazo', dataLimite: null, exibirBadge: false }
  }

  const limiteMs = new Date(limite).getTime()
  if (!Number.isFinite(limiteMs)) {
    return { situacao: 'sem_prazo', dataLimite: null, exibirBadge: false }
  }

  const status = cotacao.status_cotacao_bid_frete_internacional

  if (status === 'EXPIRADA') {
    return { situacao: 'fora_prazo', dataLimite: limite, exibirBadge: true }
  }

  if (cotacaoEmAtrasoPrazoResposta(cotacao, agoraMs)) {
    return { situacao: 'fora_prazo', dataLimite: limite, exibirBadge: true }
  }

  if (status === 'AGUARDANDO_APROVACAO' && limiteMs < agoraMs) {
    return { situacao: 'fora_prazo', dataLimite: limite, exibirBadge: true }
  }

  const situacao: SituacaoPrazoRespostaCotacao = limiteMs < agoraMs ? 'fora_prazo' : 'no_prazo'
  const exibirBadge = status !== 'RASCUNHO' && status !== 'FALTA_INFORMACAO'

  return { situacao, dataLimite: limite, exibirBadge }
}

export interface ListaBidFreteKpiStats {
  total: number
  emAndamento: number
  enviadaFornecedores: number
  emCotacao: number
  aguardandoAprovacao: number
  aguardandoValorMeta: number
  aguardandoPropostas: number
  aguardandoTempoMedioEsperaHoras: number | null
  expiradas: number
  expiradasSemProposta: number
  cotacoesEmAtraso: number
  savingTotal: number
  cotacoesComSaving: number
  valorTotalFrete: number
  propostas: number
  tempoMedioRespostaHoras: number | null
  fechadas: number
}

/** Soma frete aprovado: propostas APROVADA ou valor_aprovado_ganho da cotação. */
export function somarValorTotalFreteAprovado(cotacoes: Cotacao[]): number {
  return cotacoes.reduce((acc, cotacao) => {
    const propostasAprovadas = cotacao.propostas_bid_frete_internacional?.filter(
      proposta => proposta.status_proposta_bid_frete_internacional === 'APROVADA',
    ) ?? []

    if (propostasAprovadas.length > 0) {
      return acc + propostasAprovadas.reduce(
        (total, proposta) => total + (Number(proposta.valor_total_proposta_bid_frete_internacional) || 0),
        0,
      )
    }

    return acc + (Number(cotacao.valor_aprovado_ganho_bid_frete_internacional) || 0)
  }, 0)
}

/** Média em horas entre envio e resposta dos disparos; null se não houver pares válidos. */
export function calcularTempoMedioRespostaHoras(cotacoes: Cotacao[]): number | null {
  const tempos = cotacoes.flatMap(cotacao =>
    (cotacao.disparo_cotacao_bid_frete_internacional ?? []).flatMap(disparo => {
      const dataEnvio = disparo.data_envio_disparo_cotacao_bid_frete_internacional
      const dataResposta = disparo.data_resposta_disparo_cotacao_bid_frete_internacional
      if (!dataEnvio || !dataResposta) return []

      const envioMs = new Date(dataEnvio).getTime()
      const respostaMs = new Date(dataResposta).getTime()
      if (!Number.isFinite(envioMs) || !Number.isFinite(respostaMs) || respostaMs < envioMs) return []

      return [(respostaMs - envioMs) / (1000 * 60 * 60)]
    }),
  )

  if (tempos.length === 0) return null
  return tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length
}

function calcularTempoMedioEsperaAprovacaoHoras(
  cotacoes: Cotacao[],
  agoraMs = Date.now(),
): number | null {
  const tempos = cotacoes
    .filter(c => c.status_cotacao_bid_frete_internacional === 'AGUARDANDO_APROVACAO')
    .flatMap(c => {
      const limite = c.data_limite_resposta_cotacao_bid_frete_internacional
      if (!limite) return []
      const limiteMs = new Date(limite).getTime()
      if (!Number.isFinite(limiteMs) || limiteMs <= agoraMs) return []
      return [(limiteMs - agoraMs) / (1000 * 60 * 60)]
    })

  if (tempos.length === 0) return null
  return tempos.reduce((acc, t) => acc + t, 0) / tempos.length
}

export function calcularStatsListaBidFrete(
  cotacoes: Cotacao[],
  agoraMs = Date.now(),
): ListaBidFreteKpiStats {
  const total = cotacoes.length
  const enviadaFornecedores = cotacoes.filter(
    c => c.status_cotacao_bid_frete_internacional === 'ENVIADA_FORNECEDORES',
  ).length
  const emCotacao = cotacoes.filter(
    c => c.status_cotacao_bid_frete_internacional === 'EM_COTACAO',
  ).length
  const emAndamento = enviadaFornecedores + emCotacao
  const aguardando = cotacoes.filter(
    c => c.status_cotacao_bid_frete_internacional === 'AGUARDANDO_APROVACAO',
  )
  const aguardandoAprovacao = aguardando.length
  const aguardandoValorMeta = aguardando.reduce(
    (acc, c) => acc + (c.valor_meta_cotacao_bid_frete_internacional ?? 0),
    0,
  )
  const expiradasLista = cotacoes.filter(
    c => c.status_cotacao_bid_frete_internacional === 'EXPIRADA',
  )
  const expiradas = expiradasLista.length
  const expiradasSemProposta = expiradasLista.filter(
    c => (c.propostas_bid_frete_internacional?.length ?? 0) === 0,
  ).length
  const savingTotal = cotacoes.reduce(
    (acc, c) => acc + (c.ganho_valor_cotacao_bid_frete_internacional ?? 0),
    0,
  )
  const cotacoesComSaving = cotacoes.filter(
    c => (c.ganho_valor_cotacao_bid_frete_internacional ?? 0) > 0,
  ).length
  const fechadas = total - emAndamento - aguardandoAprovacao - expiradas
  const cotacoesEmAtraso = contarCotacoesEmAtrasoPrazoResposta(cotacoes, agoraMs)

  return {
    total,
    emAndamento,
    enviadaFornecedores,
    emCotacao,
    aguardandoAprovacao,
    aguardandoValorMeta,
    aguardandoPropostas: aguardando.reduce(
      (acc, c) => acc + (c.propostas_bid_frete_internacional?.length ?? 0),
      0,
    ),
    aguardandoTempoMedioEsperaHoras: calcularTempoMedioEsperaAprovacaoHoras(cotacoes, agoraMs),
    expiradas,
    expiradasSemProposta,
    cotacoesEmAtraso,
    savingTotal,
    cotacoesComSaving,
    valorTotalFrete: somarValorTotalFreteAprovado(cotacoes),
    propostas: cotacoes.reduce(
      (acc, c) => acc + (c.propostas_bid_frete_internacional?.length ?? 0),
      0,
    ),
    tempoMedioRespostaHoras: calcularTempoMedioRespostaHoras(cotacoes),
    fechadas: Math.max(0, fechadas),
  }
}
