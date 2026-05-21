/**
 * Cálculo e validação determinística de `nomeSchema`.
 *
 * Implementa SPEC §"Validação de nomeSchema" e ADR-002 §3.
 *
 * Formatos de ID aceitos:
 *   - CUID v1 (Prisma ≤4): 'c' + 24 chars [a-z0-9], total 25 chars.
 *   - CUID v2 (Prisma 5+): [a-z] + 23 chars [a-z0-9], total 24 chars.
 *   - UUID v4: 8-4-4-4-12 hex chars com hífens (36 chars). Organizações
 *     criadas antes da convenção CUID usam este formato.
 *
 * Defesa contra SQL injection: `_internalPrisma.$executeRawUnsafe` recebe
 * o nome do schema gerado aqui. Os regexes REJEITAM qualquer entrada que
 * não case com CUID ou UUID — apenas [a-z0-9] e hífens são permitidos.
 *
 * NOTA: o prefixo físico `tenant_` no nome do schema PostgreSQL é mantido
 * como blindagem da arquitetura schema-per-organização (decisão do Tech Lead).
 * O conceito de domínio é Organização — apenas o nome físico do schema PG
 * preserva o prefixo `tenant_` legado.
 *
 * NÃO exportar no `index.ts` — uso interno do SDK.
 */

import { AppError } from './errors.js';

/** CUID v1 (25 chars) ou v2 (24 chars): começa com letra minúscula, lowercase alphanumeric. */
const CUID_REGEX = /^[a-z][a-z0-9]{22,24}$/;

/** UUID v4: 8-4-4-4-12 hex com hífens. */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Regex canônico de schema válido: tenant_ + (CUID | UUID). */
export const SCHEMA_NAME_REGEX = /^tenant_([a-z][a-z0-9]{22,24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

function isValidOrganizacaoId(id: string): boolean {
  return CUID_REGEX.test(id) || UUID_REGEX.test(id);
}

/**
 * Constrói o nomeSchema a partir do idOrganizacao (CUID ou UUID).
 *
 * @throws AppError(400, 'INVALID_ORGANIZACAO_ID') se a entrada não for ID válido.
 */
export function buildSchemaName(idOrganizacao: string): string {
  if (typeof idOrganizacao !== 'string' || idOrganizacao.length === 0) {
    throw new AppError('idOrganizacao vazio ou inválido', 400, 'INVALID_ORGANIZACAO_ID');
  }

  if (!isValidOrganizacaoId(idOrganizacao)) {
    throw new AppError('idOrganizacao não é um CUID/UUID válido', 400, 'INVALID_ORGANIZACAO_ID');
  }

  const name = `tenant_${idOrganizacao}`;

  if (!SCHEMA_NAME_REGEX.test(name)) {
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
