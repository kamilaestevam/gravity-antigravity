/**
 * Middleware Express `resolverOrganizacao(config)`.
 *
 * Fluxo de 10 passos (ADR-002 §5):
 *  1. Extrai JWT do header Authorization.
 *  2. Valida JWT via @clerk/backend verifyToken.
 *  3. Extrai idUsuario do payload (sub).
 *  4. Consulta cache por idUsuario.
 *  5. Se cache miss → GET /api/v1/internal/usuarios/:id_clerk_usuario no Configurador.
 *  6. Valida que organização está active (feito no configurador-client).
 *  7. Valida nomeSchema contra regex de segurança (defense-in-depth).
 *  8. Gera idCorrelacao (SUID por request).
 *  9. Anexa req.organizacao: ContextoOrganizacao.
 * 10. Emite span OTel + chama next().
 */

import { randomUUID } from 'crypto';
import { verifyToken } from '@clerk/backend';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { ConfigResolverOrganizacao } from './types.js';
import { CacheOrganizacao } from './cache.js';
import { createConfiguradorClient } from './configurador-client.js';
import { AppError } from './errors.js';
import { getLogger, recordSpan } from './observability.js';
import { isValidSchemaName } from './schema-name.js';

// ---------------------------------------------------------------------------
// Validação da config no boot (falha rápido, não em runtime)
// ---------------------------------------------------------------------------

const ConfigResolverOrganizacaoSchema = z.object({
  chaveProduto: z.string().min(1),
  configuradorBaseUrl: z.string().url(),
  chaveInterna: z.string().min(16),
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
 * Cria o middleware Express de resolução de organização.
 *
 * Deve ser instanciado UMA VEZ no boot do servidor e reutilizado em todas
 * as requests. Cria internamente: CacheOrganizacao, ConfiguradorClient.
 *
 * @throws Error se `config` for inválida — falha no boot, não em runtime.
 */
export function resolverOrganizacao(config: ConfigResolverOrganizacao): RequestHandler {
  // Valida config no boot
  const parsed = ConfigResolverOrganizacaoSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `[@gravity/resolver-organizacao] Configuração inválida:\n${parsed.error.toString()}`,
    );
  }

  const clerkSecretKey =
    config.clerkSecretKey ?? process.env.CLERK_SECRET_KEY ?? '';

  if (!clerkSecretKey) {
    throw new Error(
      '[@gravity/resolver-organizacao] clerkSecretKey ausente — defina CLERK_SECRET_KEY ou passe em config.',
    );
  }

  // Captura a URL do banco AGORA, no boot, enquanto `process.env.DATABASE_URL`
  // ainda aponta para o banco correto deste produto. No deploy monolito-sidecar
  // o `DATABASE_URL` é mutado entre boots; em tempo de request já estaria
  // restaurado para o banco de outro produto. A URL viaja no `ContextoOrganizacao`.
  // Vide `internal-prisma.ts` (revisão 2026-05-21).
  const urlBancoBoot = process.env.DATABASE_URL;

  const cache = new CacheOrganizacao({ ttlMs: config.cacheTtlMs });

  const configuradorClient = createConfiguradorClient({
    baseUrl: config.configuradorBaseUrl,
    chaveInterna: config.chaveInterna,
    timeoutMs: config.configuradorTimeoutMs,
    retries: config.configuradorRetries,
  });

  const log = getLogger();

  return async (req, _res, next) => {
    const startedAt = Date.now();
    const idCorrelacao = randomUUID();

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
      let idUsuario: string;
      try {
        const payload = await verifyToken(token, { secretKey: clerkSecretKey });
        idUsuario = payload.sub;
      } catch {
        throw new AppError('Token JWT inválido ou expirado', 401, 'UNAUTHENTICATED');
      }

      if (!idUsuario) {
        throw new AppError('Token JWT sem sub (idUsuario)', 401, 'UNAUTHENTICATED');
      }

      // Passos 3-4 — Cache
      let ctx = cache.get(idUsuario);

      // Passo 5 — Configurador (cache miss)
      if (ctx === null) {
        ctx = await configuradorClient.resolveOrganizacaoByIdUsuario(idUsuario, idCorrelacao);
        cache.set(idUsuario, ctx);
      }

      // Passo 8 — idCorrelacao único por request (sobrepõe o do cache) +
      // urlBanco capturada no boot (roteamento de banco no monolito-sidecar)
      ctx = { ...ctx, idCorrelacao, urlBanco: urlBancoBoot };

      // Passo 7 — Defense-in-depth: revalida nomeSchema
      if (!isValidSchemaName(ctx.nomeSchema)) {
        log.error(
          { idUsuario, idOrganizacao: ctx.idOrganizacao, nomeSchema: ctx.nomeSchema, idCorrelacao },
          'nomeSchema inválido após resolução — possível corrupção',
        );
        throw new AppError(
          'nomeSchema inválido pós-resolução',
          500,
          'INVALID_ORGANIZACAO_ID',
        );
      }

      // Passo 9 — Anexa ao req
      req.organizacao = ctx;

      // Passo 10 — Span + next
      recordSpan(
        'resolver_organizacao.resolve',
        {
          idOrganizacao: ctx.idOrganizacao,
          idUsuario,
          nomeSchema: ctx.nomeSchema,
          idCorrelacao,
        },
        Date.now() - startedAt,
      );

      next();
    } catch (err) {
      next(err);
    }
  };
}
