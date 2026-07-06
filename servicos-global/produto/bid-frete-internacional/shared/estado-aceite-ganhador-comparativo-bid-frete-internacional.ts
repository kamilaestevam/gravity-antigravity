/** Estado do aceite do ganhador no comparativo (pós-aprovação). */

export type EstadoAceiteGanhadorComparativoBidFreteInternacional =
  | 'nao_aplicavel'
  | 'aguardando_aceite'
  | 'aceite_confirmado'
  | 'fechada'

export type PropostaGanhadoraEstadoAceiteBidFreteInternacional = {
  status_proposta_bid_frete_internacional?: string | null
  data_aceite_aprovacao_proposta_bid_frete_internacional?: string | Date | null
  fornecedor?: { nome_fornecedor_bid_frete_internacional?: string | null } | null
  fornecedor_nome?: string | null
}

export function resolverPropostaGanhadoraCotacaoBidFreteInternacional<T extends PropostaGanhadoraEstadoAceiteBidFreteInternacional>(
  propostas: T[] | null | undefined,
  id_fornecedor_vencedor?: string | null,
): T | null {
  if (!propostas?.length) return null
  if (id_fornecedor_vencedor) {
    const porVencedor = propostas.find(
      (p) => (p as { id_fornecedor_bid_frete_internacional?: string }).id_fornecedor_bid_frete_internacional
        === id_fornecedor_vencedor,
    )
    if (porVencedor) return porVencedor
  }
  return (
    propostas.find((p) => p.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA')
    ?? propostas.find((p) => p.status_proposta_bid_frete_internacional === 'APROVADA')
    ?? null
  )
}

export function resolverEstadoAceiteGanhadorComparativoBidFreteInternacional(input: {
  status_cotacao_bid_frete_internacional?: string | null
  proposta_ganhadora?: PropostaGanhadoraEstadoAceiteBidFreteInternacional | null
}): EstadoAceiteGanhadorComparativoBidFreteInternacional {
  const statusCotacao = input.status_cotacao_bid_frete_internacional
  if (statusCotacao === 'FECHADA') return 'fechada'
  if (statusCotacao !== 'APROVADA') return 'nao_aplicavel'

  const statusProposta = input.proposta_ganhadora?.status_proposta_bid_frete_internacional
  if (statusProposta === 'APROVACAO_RECEBIDA') return 'aceite_confirmado'
  if (statusProposta === 'APROVADA') return 'aguardando_aceite'
  return 'nao_aplicavel'
}

export function nomeFornecedorGanhadorEstadoAceiteBidFreteInternacional(
  proposta?: PropostaGanhadoraEstadoAceiteBidFreteInternacional | null,
): string {
  return (
    proposta?.fornecedor_nome
    ?? proposta?.fornecedor?.nome_fornecedor_bid_frete_internacional
    ?? 'Fornecedor'
  )
}
