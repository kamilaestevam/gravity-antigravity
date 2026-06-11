import type { Cotacao } from './types'
import type { StatusKanbanFornecedorBidFreteInternacional } from './kanban-fornecedor-bid-frete-internacional'

export type ListaFornecedorKpiStats = {
  total: number
  aguardandoResposta: number
  propostasEnviadas: number
  valorPropostasAprovadas: number
  moedaPrincipal: string
}

export function calcularStatsListaFornecedor(
  cotacoes: Cotacao[],
  funilPorCotacaoId: Map<string, StatusKanbanFornecedorBidFreteInternacional>,
): ListaFornecedorKpiStats {
  let aguardandoResposta = 0
  let propostasEnviadas = 0
  let valorPropostasAprovadas = 0
  let moedaPrincipal = 'USD'

  for (const cotacao of cotacoes) {
    const funil = funilPorCotacaoId.get(cotacao.id_cotacao_bid_frete_internacional)
    if (funil === 'AGUARDANDO_RESPOSTA') aguardandoResposta += 1

    const proposta = cotacao.propostas_bid_frete_internacional?.[0]
    if (proposta) {
      propostasEnviadas += 1
      if (funil === 'APROVADA') {
        valorPropostasAprovadas += proposta.valor_total_proposta_bid_frete_internacional ?? 0
        if (proposta.moeda_proposta_bid_frete_internacional) {
          moedaPrincipal = proposta.moeda_proposta_bid_frete_internacional
        }
      }
    }
  }

  return {
    total: cotacoes.length,
    aguardandoResposta,
    propostasEnviadas,
    valorPropostasAprovadas,
    moedaPrincipal,
  }
}
