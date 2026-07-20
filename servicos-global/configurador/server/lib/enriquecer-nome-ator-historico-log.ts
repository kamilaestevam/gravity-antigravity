/** Quando o log gravou id técnico no lugar do nome, corrige na leitura via cadastro do usuário. */

export interface UsuarioAtorHistoricoLookup {
  nome_usuario: string
  email_usuario: string
}

export function pareceIdentificadorTecnicoAtor(valor: string): boolean {
  const texto = valor.trim()
  if (!texto) return false
  if (texto.startsWith('user_') || texto.startsWith('usr_')) return true
  if (texto.includes('@')) return false
  return /^[a-z0-9_-]{14,}$/i.test(texto)
}

export function resolverNomeAtorHistoricoParaExibicao(
  log: { id_ator_historico_log: string; nome_ator_historico_log: string | null },
  usuario: UsuarioAtorHistoricoLookup | undefined,
): string | null {
  const armazenado = log.nome_ator_historico_log?.trim() || null
  const nomeDb = usuario?.nome_usuario?.trim()
  if (!nomeDb) return armazenado
  if (!armazenado) return nomeDb
  if (armazenado === log.id_ator_historico_log) return nomeDb
  if (armazenado === usuario?.email_usuario) return nomeDb
  if (pareceIdentificadorTecnicoAtor(armazenado) && armazenado !== nomeDb) return nomeDb
  return armazenado
}
