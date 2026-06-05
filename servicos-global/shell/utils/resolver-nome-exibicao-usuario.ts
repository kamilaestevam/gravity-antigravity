/** Nomes de exibição fixos para contas de teste/legado (email → label amigável). */
const NOME_EXIBICAO_POR_EMAIL: Record<string, string> = {
  'dmmltda+prodmaster01@gmail.com': 'Usuário Teste Gravity',
}

/**
 * Normaliza nome para UI — remove duplicação "X X" e aplica overrides por email.
 * Fonte: /api/v1/me → usuario.nome_usuario (banco), não Clerk.
 */
export function resolverNomeExibicaoUsuario(nome: string, email = ''): string {
  const emailNorm = email.trim().toLowerCase()
  if (emailNorm && NOME_EXIBICAO_POR_EMAIL[emailNorm]) {
    return NOME_EXIBICAO_POR_EMAIL[emailNorm]
  }

  const texto = nome.trim()
  if (!texto) return texto

  const partes = texto.split(/\s+/).filter(Boolean)
  if (partes.length === 2 && partes[0] === partes[1]) {
    return partes[0]
  }

  return texto
}
