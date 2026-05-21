/**
 * Cálculo e validação determinística de `nomeSchema`.
 *
 * Implementa SPEC §"Validação de nomeSchema" e ADR-002 §3.
 *
 * Padrão de ID: CUID v1 gerado pelo Prisma (@default(cuid())).
 * Formato: 'c' + 24 chars [a-z0-9], total 25 chars. Ex: cmngiwl0n00011097dok8jcmo
 *
 * Defesa contra SQL injection: `_internalPrisma.$executeRawUnsafe` recebe
 * o nome do schema gerado aqui. O regex `^tenant_c[a-z0-9]{24}$` REJEITA
 * qualquer entrada que não seja exatamente um CUID válido com prefixo `tenant_`.
 *
 * NOTA: o prefixo físico `tenant_` no nome do schema PostgreSQL é mantido
 * como blindagem da arquitetura schema-per-organização (decisão do Tech Lead).
 * O conceito de domínio é Organização — apenas o nome físico do schema PG
 * preserva o prefixo `tenant_` legado.
 *
 * NÃO exportar no `index.ts` — uso interno do SDK.
 */

import { AppError } from './errors.js';

/** Regex canônico de schema válido. CUID com prefixo tenant_ (blindagem física). */
export const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/;

/** CUID v1: começa com 'c', 25 chars, lowercase alphanumeric. */
const CUID_REGEX = /^c[a-z0-9]{24}$/;

/**
 * Constrói o nomeSchema a partir do idOrganizacao (CUID).
 *
 * - Aceita apenas CUIDs válidos (padrão Prisma @default(cuid())).
 * - Rejeita SUIDs não-CUID, IDs manuais e qualquer formato fora do padrão.
 *
 * @throws AppError(400, 'INVALID_ORGANIZACAO_ID') se a entrada não for CUID válido.
 */
export function buildSchemaName(idOrganizacao: string): string {
  if (typeof idOrganizacao !== 'string' || idOrganizacao.length === 0) {
    throw new AppError('idOrganizacao vazio ou inválido', 400, 'INVALID_ORGANIZACAO_ID');
  }

  if (!CUID_REGEX.test(idOrganizacao)) {
    console.error('[buildSchemaName] REJEITADO — idOrganizacao recebido:', JSON.stringify(idOrganizacao), 'length:', idOrganizacao.length, 'chars:', [...idOrganizacao].map(c => c.charCodeAt(0)))
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
