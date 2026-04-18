/**
 * `withTenant` e `withTenantContext` — única forma permitida de tocar o banco.
 *
 * PADRÃO OBRIGATÓRIO (ADR-001 §"Modelo de Conexão" + ADR-002 §3):
 *
 *   _internalPrisma.$transaction(async (tx) => {
 *     await tx.$executeRawUnsafe(
 *       `SET LOCAL search_path TO "${ctx.schemaName}", public`
 *     );
 *     return fn(tx);
 *   }, { timeout: 10_000, isolationLevel: 'ReadCommitted' });
 *
 * Por quê:
 * - PgBouncer roda em modo `transaction` para densidade de pool.
 * - `SET LOCAL` faz o Postgres RESETAR o search_path automaticamente no
 *   COMMIT/ROLLBACK. A garantia é DO BANCO, não da aplicação.
 * - Se o handler crashar, der OOM, der timeout — o pool não vaza.
 *
 * NÃO altere esse padrão sem novo ADR. NÃO adicione caminho alternativo.
 */

import type { Request } from 'express';
import { Prisma } from '@prisma/client';
import type { TenantContext, TenantDatabase } from './types.js';
import { getInternalPrisma } from './internal-prisma.js';
import { resolveTenantById } from './configurador-client.js';
import { buildSchemaName, isValidSchemaName } from './schema-name.js';
import { AppError } from './errors.js';
import { getLogger, recordSpan } from './observability.js';

/** Timeout (ms) padrão para transações originadas em request HTTP. */
const HTTP_TX_TIMEOUT_MS = 10_000;
/** Timeout (ms) padrão para transações originadas em CRON/worker. */
const WORKER_TX_TIMEOUT_MS = 30_000;

/**
 * Executa `fn` dentro de uma transação Prisma com `SET LOCAL search_path`
 * apontando para o schema do tenant da request.
 *
 * @throws AppError(500, 'TENANT_MISSING') se `req.tenant` não foi resolvido
 *         pelo middleware `tenantResolver`.
 * @throws AppError(400, 'INVALID_TENANT_ID') se o `schemaName` não passa
 *         pelo regex de segurança (defense-in-depth).
 */
export async function withTenant<T>(
  req: Request,
  fn: (db: TenantDatabase) => Promise<T>,
): Promise<T> {
  const ctx = req.tenant;
  if (!ctx) {
    throw new AppError(
      'Tenant não resolvido — middleware tenantResolver não rodou ou não populou req.tenant',
      500,
      'TENANT_MISSING',
    );
  }
  return runInTenantTransaction(ctx, fn, HTTP_TX_TIMEOUT_MS);
}

/**
 * Variante para CRON jobs / workers — sem `req`.
 * Resolve o tenant pelo ID, abre transação e chama `fn(ctx, db)`.
 *
 * Cada chamada abre UMA transação isolada. NUNCA reutilize `db` fora do
 * callback nem aninhe contextos diferentes — vide skill `sdk-tenant-resolver`
 * §"Cuidados em loops multi-tenant".
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: (ctx: TenantContext, db: TenantDatabase) => Promise<T>,
): Promise<T> {
  const ctx = await resolveTenantById(tenantId);

  // Defense-in-depth: confere que schemaName retornado bate com o que
  // construiríamos a partir do tenantId. Se divergir, há corrupção de dado
  // ou ataque de spoofing no Configurador — falha rápido.
  const expected = buildSchemaName(ctx.tenantId);
  if (ctx.schemaName !== expected) {
    throw new AppError(
      'schemaName retornado pelo Configurador não bate com o tenantId',
      500,
      'TENANT_SCHEMA_MISMATCH',
    );
  }

  return runInTenantTransaction(
    ctx,
    (db) => fn(ctx, db),
    WORKER_TX_TIMEOUT_MS,
  );
}

/**
 * Núcleo compartilhado: abre $transaction, aplica SET LOCAL, executa fn.
 * Privado — não exportado em `index.ts`.
 */
async function runInTenantTransaction<T>(
  ctx: TenantContext,
  fn: (db: TenantDatabase) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  // Defense-in-depth final antes de SQL: rejeita schemaName fora do regex.
  if (!isValidSchemaName(ctx.schemaName)) {
    throw new AppError(
      `schemaName inválido: "${ctx.schemaName}"`,
      400,
      'INVALID_TENANT_ID',
    );
  }

  const log = getLogger();
  const prisma = getInternalPrisma();
  const startedAt = Date.now();

  try {
    return await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const setLocalStart = Date.now();
        await tx.$executeRawUnsafe(
          `SET LOCAL search_path TO "${ctx.schemaName}", public`,
        );
        recordSpan('tenant_resolver.set_local', {
          tenantId: ctx.tenantId,
          schemaName: ctx.schemaName,
          correlationId: ctx.correlationId,
        }, Date.now() - setLocalStart);

        // O `tx` do Prisma já é `Prisma.TransactionClient`. O cast para
        // `TenantDatabase` apenas remove métodos de engine da superfície
        // exposta ao consumidor — sem custo em runtime.
        return await fn(tx as unknown as TenantDatabase);
      },
      {
        timeout: timeoutMs,
        isolationLevel: 'ReadCommitted',
      },
    );
  } catch (err) {
    log.error(
      {
        err,
        tenantId: ctx.tenantId,
        schemaName: ctx.schemaName,
        correlationId: ctx.correlationId,
        durationMs: Date.now() - startedAt,
      },
      'withTenant transaction failed',
    );
    throw err;
  } finally {
    recordSpan(
      'tenant_resolver.with_tenant',
      {
        tenantId: ctx.tenantId,
        schemaName: ctx.schemaName,
        correlationId: ctx.correlationId,
      },
      Date.now() - startedAt,
    );
  }
}
