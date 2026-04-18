/**
 * Middleware Express `tenantResolver(config)`.
 *
 * Fluxo de 10 passos (ADR-002 §5):
 *  1. Extrai JWT do header Authorization.
 *  2. Valida JWT via @clerk/backend verifyToken.
 *  3. Extrai userId do payload (sub).
 *  4. Consulta cache por userId.
 *  5. Se cache miss → GET /api/internal/users/:userId no Configurador.
 *  6. Valida que tenant está active (feito no configurador-client).
 *  7. Valida schemaName contra regex de segurança (defense-in-depth).
 *  8. Gera correlationId (UUID v4 por request).
 *  9. Anexa req.tenant: TenantContext.
 * 10. Emite span OTel + chama next().
 */

import { randomUUID } from 'crypto';
import { verifyToken } from '@clerk/backend';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { ResolverConfig } from './types.js';
import { TenantCache } from './cache.js';
import { createConfiguradorClient } from './configurador-client.js';
import { AppError } from './errors.js';
import { getLogger, recordSpan } from './observability.js';
import { isValidSchemaName } from './schema-name.js';

// ---------------------------------------------------------------------------
// Validação da config no boot (falha rápido, não em runtime)
// ---------------------------------------------------------------------------

const ResolverConfigSchema = z.object({
  productKey: z.string().min(1),
  configuradorBaseUrl: z.string().url(),
  internalKey: z.string().min(16),
  cacheTtlMs: z.number().int().positive().optional(),
  configuradorTimeoutMs: z.number().int().positive().optional(),
  configuradorRetries: z.number().int().min(1).max(5).optional(),
  clerkSecretKey: z.string().optional(),
  redisUrl: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Cria o middleware Express de resolução de tenant.
 *
 * Deve ser instanciado UMA VEZ no boot do servidor e reutilizado em todas
 * as requests. Cria internamente: TenantCache, ConfiguradorClient.
 *
 * @throws Error se `config` for inválida — falha no boot, não em runtime.
 */
export function tenantResolver(config: ResolverConfig): RequestHandler {
  // Valida config no boot
  const parsed = ResolverConfigSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `[@gravity/tenant-resolver] Configuração inválida:\n${parsed.error.toString()}`,
    );
  }

  const clerkSecretKey =
    config.clerkSecretKey ?? process.env.CLERK_SECRET_KEY ?? '';

  if (!clerkSecretKey) {
    throw new Error(
      '[@gravity/tenant-resolver] clerkSecretKey ausente — defina CLERK_SECRET_KEY ou passe em config.',
    );
  }

  const cache = new TenantCache({ ttlMs: config.cacheTtlMs });

  const configuradorClient = createConfiguradorClient({
    baseUrl: config.configuradorBaseUrl,
    internalKey: config.internalKey,
    timeoutMs: config.configuradorTimeoutMs,
    retries: config.configuradorRetries,
  });

  const log = getLogger();

  return async (req, _res, next) => {
    const startedAt = Date.now();
    const correlationId = randomUUID();

    try {
      // Passo 1 — JWT
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(
          'Header Authorization ausente ou malformado',
          401,
          'UNAUTHENTICATED',
        );
      }
      const token = authHeader.slice(7);

      // Passo 2 — Verificação Clerk
      let userId: string;
      try {
        const payload = await verifyToken(token, { secretKey: clerkSecretKey });
        userId = payload.sub;
      } catch {
        throw new AppError('Token JWT inválido ou expirado', 401, 'UNAUTHENTICATED');
      }

      if (!userId) {
        throw new AppError('Token JWT sem sub (userId)', 401, 'UNAUTHENTICATED');
      }

      // Passos 3-4 — Cache
      let ctx = cache.get(userId);

      // Passo 5 — Configurador (cache miss)
      if (ctx === null) {
        ctx = await configuradorClient.resolveTenantByUserId(userId, correlationId);
        cache.set(userId, ctx);
      }

      // Passo 8 — correlationId único por request (sobrepõe o do cache)
      ctx = { ...ctx, correlationId };

      // Passo 7 — Defense-in-depth: revalida schemaName
      if (!isValidSchemaName(ctx.schemaName)) {
        log.error(
          { userId, tenantId: ctx.tenantId, schemaName: ctx.schemaName, correlationId },
          'schemaName inválido após resolução — possível corrupção',
        );
        throw new AppError(
          'schemaName inválido pós-resolução',
          500,
          'INVALID_TENANT_ID',
        );
      }

      // Passo 9 — Anexa ao req
      req.tenant = ctx;

      // Passo 10 — Span + next
      recordSpan(
        'tenant_resolver.resolve',
        {
          tenantId: ctx.tenantId,
          userId,
          schemaName: ctx.schemaName,
          correlationId,
        },
        Date.now() - startedAt,
      );

      next();
    } catch (err) {
      next(err);
    }
  };
}
