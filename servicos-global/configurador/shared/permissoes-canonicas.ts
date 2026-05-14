// shared/permissoes-canonicas.ts
//
// Constantes e helpers PUROS da convenção `<slug_produto>:<secao>:<acao>`.
// Importadas pelo backend (service) E frontend (modal + api-client).
// FONTE ÚNICA DE VERDADE — Mandamento 07 (sincronia front+back).
//
// Sem deps de Node, Prisma, Zod ou React. Pode rodar em qualquer JS engine.

/** Seções fixas que existem em todo produto Gravity. */
export const SECOES_PRODUTO = ['dashboard', 'kanban', 'lista', 'configuracao', 'relatorios', 'historico'] as const
export type SecaoProduto = typeof SECOES_PRODUTO[number]

/** Ações fixas para cada (produto, seção). */
export const ACOES_PRODUTO = ['ver', 'editar'] as const
export type AcaoProduto = typeof ACOES_PRODUTO[number]

/** Total de toggles disponíveis por produto: 6 seções × 2 ações = 12. */
export const TOGGLES_POR_PRODUTO = SECOES_PRODUTO.length * ACOES_PRODUTO.length

// ─────────────────────────────────────────────────────────────────────────────
// Portão 3 — Acesso usuário × produto Gravity (Cadeia 2 grosseira)
//
// Antes da Cadeia 2 granular (seção:ação dentro do produto), existe um portão
// mais grosso: o usuário tem o direito de ABRIR o produto?
//
// Convenção: linha em `usuario_permissao` com
//   permissao_usuario = `<slug>:acesso_usuario_produtos_gravity:permitido`
//
// Ausência da linha → não pode abrir (deny-by-default, Mand. 08).
// Master/SuperAdmin/Admin: bypass total (Mand. 04 — Limbo).
//
// Travado com dono em 2026-05-12.
// ─────────────────────────────────────────────────────────────────────────────

/** Seção sentinela do Portão 3 — fora das 6 seções granulares. */
export const SECAO_ACESSO_PRODUTO = 'acesso_usuario_produtos_gravity' as const

/** Ação única do Portão 3 — quando linha existe, está permitido. */
export const ACAO_ACESSO_PERMITIDO = 'permitido' as const

/** Constrói a chave canônica do Portão 3 para um produto. */
export function buildAcessoUsuarioProdutosGravityString(slug: string): string {
  return `${slug}:${SECAO_ACESSO_PRODUTO}:${ACAO_ACESSO_PERMITIDO}`
}

/** Verifica se uma string `permissao_usuario` é uma chave de Portão 3. */
export function ehPermissaoAcessoUsuarioProdutoGravity(permissao: string): boolean {
  return permissao.endsWith(`:${SECAO_ACESSO_PRODUTO}:${ACAO_ACESSO_PERMITIDO}`)
}

/**
 * Extrai o slug do produto de qualquer string canônica de permissão
 * (granular OU Portão 3). Retorna null se a string for inválida.
 */
export function extrairSlugDaPermissao(permissao: string): string | null {
  if (!new RegExp(PERMISSAO_REGEX_PATTERN).test(permissao)) return null
  const [slug] = permissao.split(':')
  return slug
}

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
 *
 * Aceita 2 famílias de chave:
 *   1. Granular (Cadeia 2 fina):   `<slug>:<secao>:<acao>` (ex: pedido:lista:editar)
 *   2. Portão 3 (acesso ao prod):  `<slug>:acesso_usuario_produtos_gravity:permitido`
 */
export const PERMISSAO_REGEX_PATTERN =
  `^[a-z][a-z0-9-]*:((${SECOES_PRODUTO.join('|')}):(${ACOES_PRODUTO.join('|')})|${SECAO_ACESSO_PRODUTO}:${ACAO_ACESSO_PERMITIDO})$`

/** Constrói uma string canônica `<slug>:<secao>:<acao>`. */
export function buildPermissaoString(
  slug: string,
  secao: SecaoProduto,
  acao: AcaoProduto,
): string {
  return `${slug}:${secao}:${acao}`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGRA — Defaults granulares por (produto × tipo_usuario)
//
// Aplicados automaticamente quando um Standard/Fornecedor é vinculado a um
// workspace que tem o produto contratado (Portão 1 + Portão 2 satisfeitos).
//
// Decisão dono 2026-05-13:
//   - PADRAO (operador interno):
//       mínimo operacional: só Lista (ver). Master refina depois.
//   - FORNECEDOR (externo, escopo restrito):
//       só consulta Lista + Dashboard + Histórico (read-only)
//
// Master pode refinar via modal Editar Usuário > Permissões depois do convite.
// Master/SAdmin/Admin não passam por aqui (bypass natural — Mand. 04 LIMBO).
//
// Convenção: produto AUSENTE deste mapa = sem defaults granulares (só Portão 3).
// Adicionar entrada conforme cada produto for "ligando" permissões granulares
// na UI (vide PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS).
// ─────────────────────────────────────────────────────────────────────────────

/** Tipo de usuário que recebe defaults granulares (Master/SAdmin/Admin = bypass). */
export type TipoUsuarioComGranular = 'PADRAO' | 'FORNECEDOR'

/** Par (secao, acao) — usado nas tabelas de defaults pra evitar strings soltas. */
export interface PermissaoGranular {
  secao: SecaoProduto
  acao: AcaoProduto
}

export const DEFAULTS_GRANULARES_POR_PRODUTO: Record<
  string,
  Record<TipoUsuarioComGranular, ReadonlyArray<PermissaoGranular>>
> = {
  pedido: {
    PADRAO: [
      { secao: 'lista',        acao: 'ver' },
    ],
    FORNECEDOR: [
      { secao: 'dashboard', acao: 'ver' },
      { secao: 'lista',     acao: 'ver' },
      { secao: 'historico', acao: 'ver' },
    ],
  },
}

/**
 * Retorna as chaves canônicas que devem ser inseridas em UsuarioPermissao
 * quando o usuário do tipo X é vinculado ao workspace que tem o produto Y.
 *
 * Inclui APENAS as chaves granulares — o Portão 3
 * (`<slug>:acesso_usuario_produtos_gravity:permitido`) é responsabilidade
 * separada do auto-sync do Portão 3 (sincronizar-acesso-usuario-produtos-service).
 *
 * Retorna [] quando:
 *   - O produto não está em DEFAULTS_GRANULARES_POR_PRODUTO (sem regra granular)
 *   - O tipo_usuario não está no mapa (Master/SAdmin/Admin)
 */
export function chavesDefaultGranulares(
  slug: string,
  tipo_usuario: string,
): string[] {
  const porProduto = DEFAULTS_GRANULARES_POR_PRODUTO[slug]
  if (!porProduto) return []
  if (tipo_usuario !== 'PADRAO' && tipo_usuario !== 'FORNECEDOR') return []
  const pares = porProduto[tipo_usuario]
  return pares.map(p => buildPermissaoString(slug, p.secao, p.acao))
}

/**
 * Parseia uma string canônica granular `<slug>:<secao>:<acao>`.
 * Retorna null se inválida OU se for chave de Portão 3 (acesso ao produto).
 *
 * Para detectar Portão 3, use `ehPermissaoAcessoUsuarioProdutoGravity()`.
 */
export function parsePermissaoString(
  permissao: string,
): { slug: string; secao: SecaoProduto; acao: AcaoProduto } | null {
  if (ehPermissaoAcessoUsuarioProdutoGravity(permissao)) return null
  // Regex granular original — sem o ramo de Portão 3
  const granularPattern = `^[a-z][a-z0-9-]*:(${SECOES_PRODUTO.join('|')}):(${ACOES_PRODUTO.join('|')})$`
  const match = new RegExp(granularPattern).exec(permissao)
  if (!match) return null
  const [, secao, acao] = match
  const [slug] = permissao.split(':')
  return { slug, secao: secao as SecaoProduto, acao: acao as AcaoProduto }
}
