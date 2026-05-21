/**
 * PrismaClient interno do SDK.
 *
 * INVARIANTE CRÍTICA: este símbolo NÃO é exportado em `index.ts`.
 * Qualquer tentativa de importá-lo de fora do pacote deve falhar em build (CI).
 *
 * O cliente é único POR URL DE BANCO no processo (mapa lazy). Conexão real ao
 * Postgres é via PgBouncer em modo `transaction` (ADR-001) — toda query que
 * toca o banco PRECISA estar dentro de `$transaction` com `SET LOCAL
 * search_path` (vide `with-tenant.ts`).
 *
 * Decisão Sprint 1 (Líder): consumia `process.env.DATABASE_URL` direto, como
 * singleton único por processo — premissa de que cada serviço host roda
 * isolado, com sua própria env apontando pro próprio banco.
 *
 * REVISÃO 2026-05-21 (Líder Técnico + Coordenador): essa premissa quebra no
 * deploy monolito-sidecar (`configurador/server/index.ts`), onde vários
 * produtos rodam no MESMO processo Node e `process.env.DATABASE_URL` é mutado
 * entre os boots. Um singleton único "congelava" no banco do primeiro produto
 * a instanciar — todos os outros consultavam o banco errado (P2021 "table
 * does not exist" em produção). Correção: o cliente passa a ser indexado pela
 * URL do banco; cada produto recebe sua URL via `ContextoOrganizacao.urlBanco`
 * (capturada no boot pelo middleware). Sem URL → fallback `DATABASE_URL`.
 */

import { PrismaClient } from '@prisma/client';

/** Um PrismaClient por URL de banco distinta no processo. */
const _instances = new Map<string, PrismaClient>();

/**
 * Resolve a URL do banco: usa a explícita (capturada no boot) ou cai no
 * `process.env.DATABASE_URL`. Mensagem clara se nenhuma estiver disponível.
 */
function resolveDatabaseUrl(explicitUrl?: string): string {
  const url = explicitUrl ?? process.env.DATABASE_URL;
  if (!url || url.length === 0) {
    throw new Error(
      '[@gravity/resolver-organizacao] URL do banco não definida — ' +
        'PrismaClient não pode ser instanciado. Esperado `urlBanco` no ' +
        'contexto ou `DATABASE_URL` no ambiente. Veja ADR-001.',
    );
  }
  return url;
}

/**
 * Acesso ao PrismaClient para uma URL de banco. Lazy init — só instancia na
 * primeira chamada para cada URL distinta, evitando custo no import.
 *
 * @param databaseUrl URL explícita do banco (vinda de `ContextoOrganizacao.urlBanco`,
 *        capturada no boot). Se omitida, usa `process.env.DATABASE_URL`.
 *
 * NÃO exportar de `index.ts` — estritamente interno.
 * NÃO usar `getInternalPrisma().<modelo>` direto: use `withOrganizacao` /
 * `withOrganizacaoContext`.
 */
export function getInternalPrisma(databaseUrl?: string): PrismaClient {
  const url = resolveDatabaseUrl(databaseUrl);
  let instance = _instances.get(url);
  if (instance === undefined) {
    instance = new PrismaClient({
      datasources: {
        db: { url },
      },
    });
    _instances.set(url, instance);
  }
  return instance;
}

/**
 * Reset interno do mapa de clientes — uso EXCLUSIVO em testes que precisam
 * re-inicializar a conexão (ex.: testcontainers que sobem novo banco entre
 * suites). Não exportar em `index.ts`.
 */
export async function _resetInternalPrismaForTests(): Promise<void> {
  for (const instance of _instances.values()) {
    await instance.$disconnect();
  }
  _instances.clear();
}
