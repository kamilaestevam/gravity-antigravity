// shared/index.ts
//
// Barrel de exports compartilhados entre client (src/) e server (server/) do Configurador.
// Apenas funções/tipos puros — sem deps de Node, sem deps de React, sem Prisma.
// Padrão alinhado com `servicos-global/cadastros/shared/`.

export {
  STACK_ORDER_PRODUTOS_GRAVITY,
  type SlugStackProdutoGravity,
} from './stack-order-produtos-gravity.js'
export { temBypassPermissao, type TipoUsuarioBypass } from './permissao-bypass.js'
export {
  tipoFornecedorOrganizacaoEnum,
  ROTULOS_TIPO_FORNECEDOR_ORGANIZACAO,
  TIPOS_FORNECEDOR_BID_FRETE,
  flagsCadastroPorTipoFornecedorOrganizacao,
  fornecedorAtendeTipoOrganizacao,
  papelInicialModalPorTipoOrganizacao,
  type FornecedorFlagsComex,
  type PapelFlagModalFornecedor,
  type TipoFornecedorOrganizacao,
} from './tipo-fornecedor-organizacao.js'
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
  chavesDefaultExtrasVinculo,
  chavesDefaultPermissoesVinculo,
  ehSlugProdutoBidFrete,
  ehPermissaoCotarFrete,
  togglesGranularesPorProduto,
  usuarioTemPermissaoGranularProduto,
  usuarioTemPermissaoCotarFrete,
  SECAO_VISAO_FORNECEDOR,
  ACAO_COTAR_FRETE,
  SLUGS_BID_FRETE,
  buildPermissaoCotarFreteString,
  type SecaoProduto,
  type AcaoProduto,
  type TipoUsuarioComGranular,
  type PermissaoGranular,
} from './permissoes-canonicas.js'
export {
  guiaGravityJornadaResponseSchema,
  concluirAulaGuiaGravityBodySchema,
  concluirAulaGuiaGravityResponseSchema,
  verificarCertificadoGuiaGravityResponseSchema,
  type GuiaGravityJornadaResponse,
  type VerificarCertificadoGuiaGravityResponse,
} from './guia-gravity/guia-gravity-jornada-schema.js'
export {
  tipoCertificadoFrontParaPrisma,
  tipoCertificadoPrismaParaFront,
  TIPOS_CERTIFICADO_GUIA_GRAVITY,
  type TipoCertificadoGuiaGravity,
} from './guia-gravity/certificado-guia-gravity.js'
export { SLUGS_AULA_POR_PRODUTO_GUIA, SLUGS_MODULO_BASICO_GUIA } from './guia-gravity/slugs-aula-por-produto.js'
export {
  montarMapaXpAulas,
  obterXpAula,
  pesoParaXp,
  PESO_AULA_GUAI,
  PESO_MODULO_GUAI,
} from './guia-gravity/pesos-academy-guia-gravity.js'
export { calcularNivelGuiaGravity, XP_POR_NIVEL_GUIA_GRAVITY } from './guia-gravity/niveis-guia-gravity.js'
