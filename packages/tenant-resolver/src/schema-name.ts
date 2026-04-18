/**
 * Cálculo e validação determinística de `schemaName`.
 *
 * Implementa SPEC §"Validação de schemaName" e ADR-002 §3.
 *
 * Padrão de ID: CUID v1 gerado pelo Prisma (@default(cuid())).
 * Formato: 'c' + 24 chars [a-z0-9], total 25 chars. Ex: cmngiwl0n00011097dok8jcmo
 *
 * Defesa contra SQL injection: `_internalPrisma.$executeRawUnsafe` recebe
 * o nome do schema gerado aqui. O regex `^tenant_c[a-z0-9]{24}$` REJEITA
 * qualquer entrada que não seja exatamente um CUID válido com prefixo `tenant_`.
 *
 * NÃO exportar no `index.ts` — uso interno do SDK.
 */

import { AppError } from './errors.js';

/** Regex canônico de schema válido. CUID com prefixo tenant_. */
export const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/;

/** CUID v1: começa com 'c', 25 chars, lowercase alphanumeric. */
const CUID_REGEX = /^c[a-z0-9]{24}$/;

/**
 * Constrói o schemaName a partir do tenantId (CUID).
 *
 * - Aceita apenas CUIDs válidos (padrão Prisma @default(cuid())).
 * - Rejeita UUIDs, IDs manuais e qualquer formato fora do padrão.
 *
 * @throws AppError(400, 'INVALID_TENANT_ID') se a entrada não for CUID válido.
 */
export function buildSchemaName(tenantId: string): string {
  if (typeof tenantId !== 'string' || tenantId.length === 0) {
    throw new AppError('Tenant ID vazio ou inválido', 400, 'INVALID_TENANT_ID');
  }

  if (!CUID_REGEX.test(tenantId)) {
    throw new AppError('Tenant ID não é um CUID válido', 400, 'INVALID_TENANT_ID');
  }

  const name = `tenant_${tenantId}`;

  if (!SCHEMA_NAME_REGEX.test(name)) {
    // Defense-in-depth: se CUID_REGEX deixou passar algo, regex final segura.
    throw new AppError(
      'Schema name resultante inválido',
      400,
      'INVALID_TENANT_ID',
    );
  }

  return name;
}

/**
 * Valida um schemaName já construído (uso em logs, métricas, validação cruzada).
 */
export function isValidSchemaName(schemaName: string): boolean {
  return typeof schemaName === 'string' && SCHEMA_NAME_REGEX.test(schemaName);
}
