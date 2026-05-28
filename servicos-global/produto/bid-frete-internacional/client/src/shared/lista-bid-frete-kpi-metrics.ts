import type { Cotacao } from './types'

export interface ListaBidFreteKpiStats {
  total: number
  emAndamento: number
  aguardandoAprovacao: number
  expiradas: number
  savingTotal: number
  valorTotalFrete: number
  propostas: number
  tempoMedioRespostaHoras: number | null
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

export function calcularStatsListaBidFrete(cotacoes: Cotacao[]): ListaBidFreteKpiStats {
  const total = cotacoes.length
  const emAndamento = cotacoes.filter(
    c =>
      c.status_cotacao_bid_frete_internacional === 'EM_COTACAO'
      || c.status_cotacao_bid_frete_internacional === 'ENVIADA_FORNECEDORES',
  ).length
  const aguardandoAprovacao = cotacoes.filter(
    c => c.status_cotacao_bid_frete_internacional === 'AGUARDANDO_APROVACAO',
  ).length
  const expiradas = cotacoes.filter(
    c => c.status_cotacao_bid_frete_internacional === 'EXPIRADA',
  ).length
  const savingTotal = cotacoes.reduce(
    (acc, c) => acc + (c.ganho_valor_cotacao_bid_frete_internacional ?? 0),
    0,
  )

  return {
    total,
    emAndamento,
    aguardandoAprovacao,
    expiradas,
    savingTotal,
    valorTotalFrete: somarValorTotalFreteAprovado(cotacoes),
    propostas: cotacoes.reduce(
      (acc, c) => acc + (c.propostas_bid_frete_internacional?.length ?? 0),
      0,
    ),
    tempoMedioRespostaHoras: calcularTempoMedioRespostaHoras(cotacoes),
  }
}
