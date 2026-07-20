import type { Cotacao, PropostaBidFreteInternacional } from './types'

function propostasDaCotacaoLista(cotacao: Cotacao): PropostaBidFreteInternacional[] {
  return cotacao.propostas_bid_frete_internacional ?? cotacao.propostas ?? []
}

/** Proposta cujos valores monetários aparecem na linha da cotação (aprovada / vencedora). */
export function propostaExibicaoListaCotacao(
  cotacao: Cotacao,
): PropostaBidFreteInternacional | null {
  const propostas = propostasDaCotacaoLista(cotacao)
  if (propostas.length === 0) return null

  const aprovada = propostas.find(
    p => p.status_proposta_bid_frete_internacional === 'APROVADA',
  )
  if (aprovada) return aprovada

  const idVencedor = cotacao.id_fornecedor_vencedor_cotacao_bid_frete_internacional
  if (idVencedor) {
    const vencedora = propostas.find(
      p => p.id_fornecedor_bid_frete_internacional === idVencedor,
    )
    if (vencedora) return vencedora
  }

  if (cotacao.status_cotacao_bid_frete_internacional === 'APROVADA') {
    const ordenadas = [...propostas].sort(
      (a, b) =>
        a.valor_total_proposta_bid_frete_internacional
        - b.valor_total_proposta_bid_frete_internacional,
    )
    return ordenadas[0] ?? null
  }

  return null
}
