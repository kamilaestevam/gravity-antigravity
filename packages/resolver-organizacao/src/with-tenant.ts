/**
 * `withOrganizacao` e `withOrganizacaoContext` — única forma permitida de tocar o banco.
 *
 * PADRÃO OBRIGATÓRIO (ADR-001 §"Modelo de Conexão" + ADR-002 §3):
 *
 *   _internalPrisma.$transaction(async (tx) => {
 *     await tx.$executeRawUnsafe(
 *       `SET LOCAL search_path TO "${ctx.nomeSchema}", public`
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
import type { ContextoOrganizacao, BancoOrganizacao } from './types.js';
import { obterClientePrismaBoot } from './boot-prisma-client.js';
import { getInternalPrisma } from './internal-prisma.js';
import { resolveOrganizacaoById } from './configurador-client.js';
import { buildSchemaName, isValidSchemaName } from './schema-name.js';
import { AppError } from './errors.js';
import { getLogger, recordSpan } from './observability.js';

/** Timeout (ms) padrão para transações originadas em request HTTP. */
const HTTP_TX_TIMEOUT_MS = 10_000;
/** Timeout (ms) padrão para transações originadas em CRON/worker. */
const WORKER_TX_TIMEOUT_MS = 30_000;

/**
 * Executa `fn` dentro de uma transação Prisma com `SET LOCAL search_path`
 * apontando para o schema da organização da request.
 *
 * @throws AppError(500, 'ORGANIZACAO_MISSING') se `req.organizacao` não foi
 *         resolvido pelo middleware `resolverOrganizacao`.
 * @throws AppError(400, 'INVALID_ORGANIZACAO_ID') se o `nomeSchema` não passa
 *         pelo regex de segurança (defense-in-depth).
 */
export async function withOrganizacao<T>(
  req: Request,
  fn: (db: BancoOrganizacao) => Promise<T>,
  opts?: { timeoutMs?: number },
): Promise<T> {
  const ctx = req.organizacao;
  if (!ctx) {
    throw new AppError(
      'Organização não resolvida — middleware resolverOrganizacao não rodou ou não populou req.organizacao',
      500,
      'ORGANIZACAO_MISSING',
    );
  }
  return runInOrganizacaoTransaction(ctx, fn, opts?.timeoutMs ?? HTTP_TX_TIMEOUT_MS);
}

/**
 * Variante para CRON jobs / workers — sem `req`.
 * Resolve a organização pelo ID, abre transação e chama `fn(ctx, db)`.
 *
 * Cada chamada abre UMA transação isolada. NUNCA reutilize `db` fora do
 * callback nem aninhe contextos diferentes — vide skill `sdk-resolvedor-organizacao`
 * §"Cuidados em loops multi-organização".
 */
export async function withOrganizacaoContext<T>(
  idOrganizacao: string,
  fn: (ctx: ContextoOrganizacao, db: BancoOrganizacao) => Promise<T>,
): Promise<T> {
  const ctx = await resolveOrganizacaoById(idOrganizacao);

  // Defense-in-depth: confere que nomeSchema retornado bate com o que
  // construiríamos a partir do idOrganizacao. Se divergir, há corrupção de dado
  // ou ataque de spoofing no Configurador — falha rápido.
  const expected = buildSchemaName(ctx.idOrganizacao);
  if (ctx.nomeSchema !== expected) {
    throw new AppError(
      'nomeSchema retornado pelo Configurador não bate com o idOrganizacao',
      500,
      'ORGANIZACAO_SCHEMA_MISMATCH',
    );
  }

  return runInOrganizacaoTransaction(
    ctx,
    (db) => fn(ctx, db),
    WORKER_TX_TIMEOUT_MS,
  );
}

/**
 * Núcleo compartilhado: abre $transaction, aplica SET LOCAL, executa fn.
 * Privado — não exportado em `index.ts`.
 */
async function runInOrganizacaoTransaction<T>(
  ctx: ContextoOrganizacao,
  fn: (db: BancoOrganizacao) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  // Defense-in-depth final antes de SQL: rejeita nomeSchema fora do regex.
  if (!isValidSchemaName(ctx.nomeSchema)) {
    throw new AppError(
      `nomeSchema inválido: "${ctx.nomeSchema}"`,
      400,
      'INVALID_ORGANIZACAO_ID',
    );
  }

  const log = getLogger();
  // Prioridade (ADR-0003):
  //  1. `ctx.prismaInterno` — client gerado do próprio produto, injetado via
  //     `config.prismaClient` (request HTTP) ou caminho S2S manual.
  //  2. Cliente registrado no boot — cobre `withOrganizacaoContext` (webhooks,
  //     CRON, workers) quando o contexto não traz `prismaInterno`.
  //  3. Fallback `getInternalPrisma(ctx.urlBanco)` — client da raiz roteado
  //     pela URL; legado — pode não conter os models do produto no monorepo.
  const prisma =
    ctx.prismaInterno ??
    obterClientePrismaBoot() ??
    getInternalPrisma(ctx.urlBanco);
  const startedAt = Date.now();

  try {
    return await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const setLocalStart = Date.now();
        await tx.$executeRawUnsafe(
          `SET LOCAL search_path TO "${ctx.nomeSchema}", public`,
        );
        recordSpan('resolver_organizacao.set_local', {
          idOrganizacao: ctx.idOrganizacao,
          nomeSchema: ctx.nomeSchema,
          idCorrelacao: ctx.idCorrelacao,
        }, Date.now() - setLocalStart);

        // O `tx` do Prisma já é `Prisma.TransactionClient`. O cast para
        // `BancoOrganizacao` apenas remove métodos de engine da superfície
        // exposta ao consumidor — sem custo em runtime.
        return await fn(tx as unknown as BancoOrganizacao);
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
        idOrganizacao: ctx.idOrganizacao,
        nomeSchema: ctx.nomeSchema,
        idCorrelacao: ctx.idCorrelacao,
        durationMs: Date.now() - startedAt,
      },
      'withOrganizacao transaction failed',
    );
    throw err;
  } finally {
    recordSpan(
      'resolver_organizacao.with_organizacao',
      {
        idOrganizacao: ctx.idOrganizacao,
        nomeSchema: ctx.nomeSchema,
        idCorrelacao: ctx.idCorrelacao,
      },
      Date.now() - startedAt,
    );
  }
}
