/**
 * @gravity/resolver-organizacao — SDK obrigatório de isolamento Schema-per-Organização.
 *
 * ÚNICA porta de entrada permitida ao banco de produtos da plataforma Gravity.
 * Implementa ADR-001 (Schema-per-Organização) e ADR-002 (Contrato do SDK).
 *
 * EXPORTS PÚBLICOS — APENAS o que está abaixo. Nada mais.
 *
 * NÃO É EXPORTADO (e qualquer tentativa de import é violação grave):
 *   - PrismaClient (`@prisma/client`)
 *   - _internalPrisma
 *   - buildSchemaName / SCHEMA_NAME_REGEX (uso interno)
 *   - CacheOrganizacao (uso interno)
 *   - configurador-client (uso interno)
 *
 * Veja README.md e ADR-002 §6 para a lista completa de proibições.
 */

// Funções públicas
export { resolverOrganizacao } from './middleware.js';
export { verificarAcessoProduto } from './verificar-acesso-produto.js';
export { withOrganizacao, withOrganizacaoContext } from './with-tenant.js';
export { obterWorkspacesHabilitadosDoUsuario } from './obter-workspaces-habilitados.js';
export type {
  ObterWorkspacesHabilitadosInput,
  ObterWorkspacesHabilitadosOutput,
} from './obter-workspaces-habilitados.js';
export { obterWorkspaces } from './obter-workspaces.js';
export type {
  ObterWorkspacesInput,
  WorkspaceLookupItem,
} from './obter-workspaces.js';

// Tipos públicos
export type {
  ContextoOrganizacao,
  ConfigResolverOrganizacao,
  ChaveProduto,
  BancoOrganizacao,
} from './types.js';

// Erro tipado — produtos podem usar `instanceof AppError` no error handler global
export { AppError } from './errors.js';
