/**
 * Cálculo e validação determinística de `nomeSchema`.
 *
 * Implementa SPEC §"Validação de nomeSchema" e ADR-002 §3.
 *
 * Padrão de ID: CUID gerado pelo Prisma (@default(cuid())).
 *   - CUID v1 (Prisma ≤4): 'c' + 24 chars [a-z0-9], total 25 chars.
 *   - CUID v2 (Prisma 5+): [a-z] + 23 chars [a-z0-9], total 24 chars.
 *
 * Defesa contra SQL injection: `_internalPrisma.$executeRawUnsafe` recebe
 * o nome do schema gerado aqui. O regex REJEITA qualquer entrada que não
 * seja exatamente um CUID válido (v1 ou v2) com prefixo `tenant_`.
 *
 * NOTA: o prefixo físico `tenant_` no nome do schema PostgreSQL é mantido
 * como blindagem da arquitetura schema-per-organização (decisão do Tech Lead).
 * O conceito de domínio é Organização — apenas o nome físico do schema PG
 * preserva o prefixo `tenant_` legado.
 *
 * NÃO exportar no `index.ts` — uso interno do SDK.
 */

import { AppError } from './errors.js';

/** Regex canônico de schema válido. CUID (v1 ou v2) com prefixo tenant_ (blindagem física). */
export const SCHEMA_NAME_REGEX = /^tenant_[a-z][a-z0-9]{22,24}$/;

/** CUID v1 (25 chars) ou v2 (24 chars): começa com letra minúscula, lowercase alphanumeric. */
const CUID_REGEX = /^[a-z][a-z0-9]{22,24}$/;

/**
 * Constrói o nomeSchema a partir do idOrganizacao (CUID).
 *
 * - Aceita CUID v1 (25 chars) e v2 (24 chars) — padrão Prisma @default(cuid()).
 * - Rejeita SUIDs não-CUID, IDs manuais e qualquer formato fora do padrão.
 *
 * @throws AppError(400, 'INVALID_ORGANIZACAO_ID') se a entrada não for CUID válido.
 */
export function buildSchemaName(idOrganizacao: string): string {
  if (typeof idOrganizacao !== 'string' || idOrganizacao.length === 0) {
    throw new AppError('idOrganizacao vazio ou inválido', 400, 'INVALID_ORGANIZACAO_ID');
  }

  if (!CUID_REGEX.test(idOrganizacao)) {
    throw new AppError('idOrganizacao não é um CUID válido', 400, 'INVALID_ORGANIZACAO_ID');
  }

  const name = `tenant_${idOrganizacao}`;

  if (!SCHEMA_NAME_REGEX.test(name)) {
    // Defense-in-depth: se CUID_REGEX deixou passar algo, regex final segura.
    throw new AppError(
      'nomeSchema resultante inválido',
      400,
      'INVALID_ORGANIZACAO_ID',
    );
  }

  return name;
}

/**
 * Valida um nomeSchema já construído (uso em logs, métricas, validação cruzada).
 */
export function isValidSchemaName(nomeSchema: string): boolean {
  return typeof nomeSchema === 'string' && SCHEMA_NAME_REGEX.test(nomeSchema);
}
