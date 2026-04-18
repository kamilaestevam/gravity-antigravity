/**
 * PrismaClient interno do SDK.
 *
 * INVARIANTE CRÍTICA: este símbolo NÃO é exportado em `index.ts`.
 * Qualquer tentativa de importá-lo de fora do pacote deve falhar em build (CI).
 *
 * O cliente é único por processo (singleton lazy). Conexão real ao Postgres é
 * via PgBouncer em modo `transaction` (ADR-001) — toda query que toca o banco
 * PRECISA estar dentro de `$transaction` com `SET LOCAL search_path`
 * (vide `with-tenant.ts`).
 *
 * Decisão Sprint 1 (Líder): consome `process.env.DATABASE_URL` direto. Cada
 * serviço host define sua própria env apontando pro próprio banco. Sem
 * `prismaInstance` opcional. Sem override por config.
 */

import { PrismaClient } from '@prisma/client';

let _instance: PrismaClient | null = null;

/**
 * Resolve a URL do banco a partir de env, com mensagem clara se faltar.
 */
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url || url.length === 0) {
    throw new Error(
      '[@gravity/tenant-resolver] DATABASE_URL não definido — ' +
        'PrismaClient não pode ser instanciado. Veja ADR-001.',
    );
  }
  return url;
}

/**
 * Acesso ao singleton do PrismaClient. Lazy init — só instancia na primeira
 * chamada, evitando custo no import (relevante para testes que mockam tudo).
 *
 * NÃO exportar de `index.ts` — estritamente interno.
 * NÃO usar `getInternalPrisma().<modelo>` direto: use `withTenant` /
 * `withTenantContext`.
 */
export function getInternalPrisma(): PrismaClient {
  if (_instance === null) {
    _instance = new PrismaClient({
      datasources: {
        db: { url: resolveDatabaseUrl() },
      },
    });
  }
  return _instance;
}

/**
 * Reset interno do singleton — uso EXCLUSIVO em testes que precisam re-inicializar
 * a conexão (ex.: testcontainers que sobem novo banco entre suites). Não exportar
 * em `index.ts`.
 */
export async function _resetInternalPrismaForTests(): Promise<void> {
  if (_instance !== null) {
    await _instance.$disconnect();
    _instance = null;
  }
}
