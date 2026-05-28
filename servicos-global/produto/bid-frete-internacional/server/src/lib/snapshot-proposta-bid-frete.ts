/**
 * Snapshots de id_workspace e id_bid da cotação ao criar proposta.
 */
export function snapshotPropostaFromCotacao(cotacao: {
  id_workspace?: string | null
  id_bid_bid_frete_internacional?: string | null
}): {
  id_workspace?: string
  id_bid_bid_frete_internacional?: string
} {
  const id_workspace =
    typeof cotacao.id_workspace === 'string' && cotacao.id_workspace.length > 0
      ? cotacao.id_workspace
      : undefined

  const id_bid_bid_frete_internacional =
    typeof cotacao.id_bid_bid_frete_internacional === 'string' &&
    cotacao.id_bid_bid_frete_internacional.length > 0
      ? cotacao.id_bid_bid_frete_internacional
      : undefined

  return {
    ...(id_workspace ? { id_workspace } : {}),
    ...(id_bid_bid_frete_internacional ? { id_bid_bid_frete_internacional } : {}),
  }
}
