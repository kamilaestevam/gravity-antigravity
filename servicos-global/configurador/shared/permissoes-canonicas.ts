// shared/permissoes-canonicas.ts
//
// Constantes e helpers PUROS da convenção `<slug_produto>:<secao>:<acao>`.
// Importadas pelo backend (service) E frontend (modal + api-client).
// FONTE ÚNICA DE VERDADE — Mandamento 07 (sincronia front+back).
//
// Sem deps de Node, Prisma, Zod ou React. Pode rodar em qualquer JS engine.

/** Seções fixas que existem em todo produto Gravity. */
export const SECOES_PRODUTO = ['dashboard', 'kanban', 'lista', 'configuracao', 'relatorios'] as const
export type SecaoProduto = typeof SECOES_PRODUTO[number]

/** Ações fixas para cada (produto, seção). */
export const ACOES_PRODUTO = ['ver', 'editar'] as const
export type AcaoProduto = typeof ACOES_PRODUTO[number]

/** Total de toggles disponíveis por produto: 5 seções × 2 ações = 10. */
export const TOGGLES_POR_PRODUTO = SECOES_PRODUTO.length * ACOES_PRODUTO.length

/**
 * Set hardcoded de produtos cuja UI já tem permissões granulares ativas.
 * Produtos no catálogo que NÃO estão neste Set ficam OPACOS no modal.
 *
 * TODO[ARQ]: migrar para coluna `permissoes_granulares_habilitadas Boolean`
 * em `ProdutoGravity` quando houver janela de schema (Mand. 02 — só Coordenador).
 */
export const PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS = new Set<string>([
  'pedido',
])

/**
 * Pattern regex (string) que valida `<slug>:<secao>:<acao>`.
 * Exportado como string para ser usado tanto em RegExp do backend quanto
 * no .regex() do Zod no frontend (Mand. 09 — bilateralidade).
 */
export const PERMISSAO_REGEX_PATTERN =
  `^[a-z][a-z0-9-]*:(${SECOES_PRODUTO.join('|')}):(${ACOES_PRODUTO.join('|')})$`

/** Constrói uma string canônica `<slug>:<secao>:<acao>`. */
export function buildPermissaoString(
  slug: string,
  secao: SecaoProduto,
  acao: AcaoProduto,
): string {
  return `${slug}:${secao}:${acao}`
}

/** Parseia uma string canônica. Retorna null se inválida. */
export function parsePermissaoString(
  permissao: string,
): { slug: string; secao: SecaoProduto; acao: AcaoProduto } | null {
  const match = new RegExp(PERMISSAO_REGEX_PATTERN).exec(permissao)
  if (!match) return null
  const [, secao, acao] = match
  const [slug] = permissao.split(':')
  return { slug, secao: secao as SecaoProduto, acao: acao as AcaoProduto }
}
