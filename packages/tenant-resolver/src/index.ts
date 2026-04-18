/**
 * @gravity/tenant-resolver — SDK obrigatório de isolamento Schema-per-Tenant.
 *
 * ÚNICA porta de entrada permitida ao banco de produtos da plataforma Gravity.
 * Implementa ADR-001 (Schema-per-Tenant) e ADR-002 (Contrato do SDK).
 *
 * EXPORTS PÚBLICOS — APENAS o que está abaixo. Nada mais.
 *
 * NÃO É EXPORTADO (e qualquer tentativa de import é violação grave):
 *   - PrismaClient (`@prisma/client`)
 *   - _internalPrisma
 *   - buildSchemaName / SCHEMA_NAME_REGEX (uso interno)
 *   - TenantCache (uso interno)
 *   - configurador-client (uso interno)
 *
 * Veja README.md e ADR-002 §6 para a lista completa de proibições.
 */

// Funções públicas
export { tenantResolver } from './middleware.js';
export { withTenant, withTenantContext } from './with-tenant.js';

// Tipos públicos
export type {
  TenantContext,
  ResolverConfig,
  ProductKey,
  PrismaTransactionClient,
} from './types.js';

// Erro tipado — produtos podem usar `instanceof AppError` no error handler global
export { AppError } from './errors.js';
