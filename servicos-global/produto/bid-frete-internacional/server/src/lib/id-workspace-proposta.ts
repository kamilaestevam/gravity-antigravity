/**
 * Snapshot de id_workspace da cotação ao criar proposta.
 */
export function idWorkspacePropostaFromCotacao(cotacao: { id_workspace?: string | null }): string | undefined {
  const ws = cotacao.id_workspace
  return typeof ws === 'string' && ws.length > 0 ? ws : undefined
}
