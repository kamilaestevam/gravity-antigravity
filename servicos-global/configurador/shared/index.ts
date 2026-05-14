// shared/index.ts
//
// Barrel de exports compartilhados entre client (src/) e server (server/) do Configurador.
// Apenas funções/tipos puros — sem deps de Node, sem deps de React, sem Prisma.
// Padrão alinhado com `servicos-global/cadastros/shared/`.

export { temBypassPermissao, type TipoUsuarioBypass } from './permissao-bypass.js'
export {
  SECOES_PRODUTO,
  ACOES_PRODUTO,
  TOGGLES_POR_PRODUTO,
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
  PERMISSAO_REGEX_PATTERN,
  buildPermissaoString,
  parsePermissaoString,
  SECAO_ACESSO_PRODUTO,
  ACAO_ACESSO_PERMITIDO,
  buildAcessoUsuarioProdutosGravityString,
  ehPermissaoAcessoUsuarioProdutoGravity,
  extrairSlugDaPermissao,
  DEFAULTS_GRANULARES_POR_PRODUTO,
  chavesDefaultGranulares,
  type SecaoProduto,
  type AcaoProduto,
  type TipoUsuarioComGranular,
  type PermissaoGranular,
} from './permissoes-canonicas.js'
