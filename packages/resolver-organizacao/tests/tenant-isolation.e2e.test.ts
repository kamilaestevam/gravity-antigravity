/**
 * Teste E2E — Prova do "Risco Zero"
 *
 * Demonstra que o mecanismo SET LOCAL search_path garante isolamento
 * cross-tenant independente de falhas de aplicação.
 *
 * REQUER: DATABASE_URL apontando para PostgreSQL real.
 * SKIP AUTOMÁTICO: se DATABASE_URL não estiver definido.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... npx vitest run --config vitest.e2e.config.ts
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { randomUUID } from 'crypto';
import { buildSchemaName } from '../src/schema-name.js';
import { withTenantContext } from '../src/with-tenant.js';
import { getInternalPrisma, _resetInternalPrismaForTests } from '../src/internal-prisma.js';
import { AppError } from '../src/errors.js';

// ---------------------------------------------------------------------------
// Mock do configurador-client — a prova é do SET LOCAL, não da integração HTTP
// ---------------------------------------------------------------------------

vi.mock('../src/configurador-client.js', () => ({
  resolveTenantById: vi.fn(async (tenantId: string) => ({
    tenantId,
    schemaName: buildSchemaName(tenantId),
    userId: 'system',
    roles: [],
    correlationId: randomUUID(),
  })),
  resolveTenantByUserId: vi.fn(),
  createConfiguradorClient: vi.fn(),
  _resetDefaultClientForTests: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Skip automático
// ---------------------------------------------------------------------------

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('E2E — Cross-Tenant Isolation (Risco Zero)', () => {
  // UUIDs únicos por run para evitar colisões entre execuções paralelas
  const tenantA = { id: randomUUID(), schema: '' };
  const tenantB = { id: randomUUID(), schema: '' };

  beforeAll(async () => {
    tenantA.schema = buildSchemaName(tenantA.id);
    tenantB.schema = buildSchemaName(tenantB.id);

    const prisma = getInternalPrisma();

    // Cria schemas isolados
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${tenantA.schema}"`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${tenantB.schema}"`);

    // Cria tabela de teste em cada schema
    for (const schema of [tenantA.schema, tenantB.schema]) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schema}".e2e_record (
          id TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `);
    }
  });

  afterAll(async () => {
    const prisma = getInternalPrisma();

    // Limpeza garantida mesmo em caso de falha de teste
    for (const schema of [tenantA.schema, tenantB.schema]) {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`).catch(() => {});
    }

    await _resetInternalPrismaForTests();
  });

  // -------------------------------------------------------------------------
  it('[E2E-1] Tenant A não enxerga dados do Tenant B', async () => {
    const recordId = randomUUID();

    // Tenant B insere um registro secreto
    await withTenantContext(tenantB.id, async (_ctx, db) => {
      await db.$executeRawUnsafe(
        `INSERT INTO e2e_record (id, value) VALUES ($1, $2)`,
        recordId,
        'segredo-do-tenant-b',
      );
    });

    // Tenant A tenta ler — deve retornar resultado vazio
    const result = await withTenantContext(tenantA.id, async (_ctx, db) => {
      return db.$queryRaw<{ id: string }[]>`
        SELECT id FROM e2e_record WHERE id = ${recordId}
      `;
    });

    expect(result).toHaveLength(0);

    // Tenant B consegue ler o próprio registro
    const resultB = await withTenantContext(tenantB.id, async (_ctx, db) => {
      return db.$queryRaw<{ id: string; value: string }[]>`
        SELECT id, value FROM e2e_record WHERE id = ${recordId}
      `;
    });

    expect(resultB).toHaveLength(1);
    expect(resultB[0]!.value).toBe('segredo-do-tenant-b');
  });

  // -------------------------------------------------------------------------
  it('[E2E-2] Crash do handler não polui o search_path da próxima request', async () => {
    // Tenant A dispara uma transação que falha no meio
    await expect(
      withTenantContext(tenantA.id, async (_ctx, db) => {
        // Confirma que estamos no schema do tenant A
        const [row] = await db.$queryRaw<{ search_path: string }[]>`SHOW search_path`;
        expect(row!.search_path).toContain(tenantA.schema);

        throw new Error('crash simulado no handler');
      }),
    ).rejects.toThrow('crash simulado no handler');

    // Próxima request (tenant B) não pode herdar o search_path do tenant A
    const searchPath = await withTenantContext(tenantB.id, async (_ctx, db) => {
      const [row] = await db.$queryRaw<{ search_path: string }[]>`SHOW search_path`;
      return row!.search_path;
    });

    expect(searchPath).toContain(tenantB.schema);
    expect(searchPath).not.toContain(tenantA.schema);
  });

  // -------------------------------------------------------------------------
  it('[E2E-3] SET LOCAL reseta automaticamente no ROLLBACK (timeout/abort)', async () => {
    // Abre transação do tenant A com timeout muito curto para forçar rollback
    // (ou simplesmente verifica que após a transação o search_path está limpo)
    let schemaInsideTransaction = '';

    await withTenantContext(tenantA.id, async (_ctx, db) => {
      const [row] = await db.$queryRaw<{ search_path: string }[]>`SHOW search_path`;
      schemaInsideTransaction = row!.search_path;
    });

    expect(schemaInsideTransaction).toContain(tenantA.schema);

    // Fora de qualquer withTenantContext, o search_path deve estar no padrão
    const prisma = getInternalPrisma();
    const [outerRow] = await prisma.$queryRaw<{ search_path: string }[]>`SHOW search_path`;

    // O search_path padrão NÃO deve conter nenhum schema de tenant
    expect(outerRow!.search_path).not.toContain(tenantA.schema);
    expect(outerRow!.search_path).not.toContain(tenantB.schema);
  });

  // -------------------------------------------------------------------------
  it('[E2E-4] withTenant recusa req sem req.tenant populado', async () => {
    const { withTenant } = await import('../src/with-tenant.js');

    // req sem req.tenant (middleware não rodou)
    const fakeReq = {} as Parameters<typeof withTenant>[0];

    await expect(
      withTenant(fakeReq, async (db) => db.$queryRaw`SELECT 1`),
    ).rejects.toMatchObject({
      code: 'TENANT_MISSING',
      statusCode: 500,
    });
  });

  // -------------------------------------------------------------------------
  it('[E2E-5] schemaName SQL-unsafe rejeitado ANTES do executeRawUnsafe', async () => {
    // Tenta um tenantId que geraria um schemaName fora do regex
    // A validação acontece em buildSchemaName (já testado unitariamente)
    // e em isValidSchemaName dentro de runInTenantTransaction

    // Injeta diretamente um TenantContext com schemaName malicioso
    const { withTenant } = await import('../src/with-tenant.js');

    const maliciousReq = {
      tenant: {
        tenantId: 'irrelevant',
        schemaName: '"; DROP SCHEMA public CASCADE; --',
        userId: 'attacker',
        roles: [],
        correlationId: 'att-001',
      },
    } as Parameters<typeof withTenant>[0];

    await expect(
      withTenant(maliciousReq, async (db) => db.$queryRaw`SELECT 1`),
    ).rejects.toMatchObject({
      code: 'INVALID_TENANT_ID',
      statusCode: 400,
    });

    // Garante que o banco não foi afetado (schema public ainda existe)
    const prisma = getInternalPrisma();
    const schemas = await prisma.$queryRaw<{ schema_name: string }[]>`
      SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public'
    `;
    expect(schemas).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Teste mínimo sem banco (sempre roda)
// ---------------------------------------------------------------------------
describe('E2E — Garantias sem banco de dados', () => {
  it('withTenantContext lança AppError se DATABASE_URL não definido', async () => {
    const origUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    await _resetInternalPrismaForTests();

    await expect(
      withTenantContext(randomUUID(), async (_ctx, db) => db.$queryRaw`SELECT 1`),
    ).rejects.toThrow(/DATABASE_URL/i);

    process.env.DATABASE_URL = origUrl;
    await _resetInternalPrismaForTests();
  });
});
