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
import { buildSchemaName, isValidSchemaName } from './schema-name.js';

// ---------------------------------------------------------------------------
// Override de organização (admin Gravity)
// ---------------------------------------------------------------------------

/**
 * CUID v1 (Prisma `@default(cuid())`): `c` + 24 chars [a-z0-9], 25 chars total.
 * Mesmo formato usado em `id_organizacao` no Configurador.
 */
const OrganizacaoOverrideHeaderSchema = z
  .string()
  .regex(/^c[a-z0-9]{24}$/, 'id_organizacao inválido (esperado CUID)');

const TIPOS_ADMIN_OVERRIDE = new Set(['SUPER_ADMIN', 'ADMIN']);

/** Header HTTP customizado para override admin. kebab-case PT-BR (DDD). */
const HEADER_OVERRIDE = 'x-organizacao-override';

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

  // Cliente Prisma injetado pelo produto (ADR-0003). Quando presente, o SDK
  // usa este client — gerado a partir do schema do próprio produto — em vez do
  // `@prisma/client` da raiz, que pode conter os models de outro produto.
  const prismaClienteInjetado = config.prismaClient;

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
      // urlBanco e prismaInterno capturados no boot (roteamento de banco e
      // client injetado — monolito-sidecar / ADR-0003)
      ctx = {
        ...ctx,
        idCorrelacao,
        urlBanco: urlBancoBoot,
        prismaInterno: prismaClienteInjetado,
      };

      // Passo 8.5 — Override de organização (admin Gravity)
      // ------------------------------------------------------------------
      // SUPER_ADMIN/ADMIN podem visualizar qualquer organização da plataforma
      // via header `x-organizacao-override`. O override:
      //   - SÓ é aceito se ator é SUPER_ADMIN ou ADMIN (Mandamento 04 + database-
      //     governance Regra de Ouro). Não-admin com header → 403 ruidoso.
      //   - Substitui `idOrganizacao` + `nomeSchema` no contexto, MANTÉM
      //     `tipoUsuario`, `idUsuario` e `tiposUsuario` (admin continua admin).
      //   - Preserva `idOrganizacaoOriginal` para audit log distinguir "ator"
      //     de "alvo".
      //   - Valida org alvo via `resolveOrganizacaoById` (reusa endpoint
      //     existente `/api/v1/internal/organizacoes/:id`). Org INATIVA ou
      //     inexistente → 403/404.
      // ------------------------------------------------------------------
      const overrideHeaderRaw = req.headers[HEADER_OVERRIDE];
      if (typeof overrideHeaderRaw === 'string' && overrideHeaderRaw.length > 0) {
        const ehAdmin = ctx.tiposUsuario.some((t) => TIPOS_ADMIN_OVERRIDE.has(t));
        if (!ehAdmin) {
          log.warn(
            {
              idUsuario,
              tiposUsuario: ctx.tiposUsuario,
              idOrganizacaoOverrideTentado: overrideHeaderRaw,
              idCorrelacao,
            },
            'Tentativa de override de organização por usuário não-admin — bloqueada',
          );
          throw new AppError(
            'Override de organização só permitido para SUPER_ADMIN/ADMIN',
            403,
            'OVERRIDE_NAO_AUTORIZADO',
          );
        }

        const parsedOverride = OrganizacaoOverrideHeaderSchema.safeParse(overrideHeaderRaw);
        if (!parsedOverride.success) {
          throw new AppError(
            `Header ${HEADER_OVERRIDE} com formato inválido`,
            400,
            'OVERRIDE_FORMATO_INVALIDO',
          );
        }

        const idOrganizacaoAlvo = parsedOverride.data;

        // Idempotência: se admin tentou "trocar" para a própria org, pula.
        if (idOrganizacaoAlvo !== ctx.idOrganizacao) {
          let ctxAlvo;
          try {
            ctxAlvo = await configuradorClient.resolveOrganizacaoById(
              idOrganizacaoAlvo,
              idCorrelacao,
            );
          } catch (err) {
            // resolveOrganizacaoById já lança AppError com 404/403/503 conforme caso.
            log.warn(
              {
                idUsuario,
                idOrganizacaoOverrideTentado: idOrganizacaoAlvo,
                err: err instanceof Error ? err.message : String(err),
                idCorrelacao,
              },
              'Override de organização rejeitado pelo Configurador',
            );
            throw err;
          }

          const nomeSchemaAlvo = buildSchemaName(idOrganizacaoAlvo);
          if (!isValidSchemaName(nomeSchemaAlvo) || nomeSchemaAlvo !== ctxAlvo.nomeSchema) {
            throw new AppError(
              'nomeSchema do override divergiu do esperado (possível corrupção)',
              500,
              'OVERRIDE_SCHEMA_MISMATCH',
            );
          }

          log.info(
            {
              idUsuario,
              tiposUsuario: ctx.tiposUsuario,
              idOrganizacaoOriginal: ctx.idOrganizacao,
              idOrganizacaoAlvo,
              nomeSchemaAlvo,
              idCorrelacao,
            },
            'Override de organização aceito (admin Gravity)',
          );

          ctx = {
            ...ctx,
            idOrganizacaoOriginal: ctx.idOrganizacao,
            idOrganizacao: idOrganizacaoAlvo,
            nomeSchema: nomeSchemaAlvo,
            // Sob override, descarta workspace ativo do contexto original — o
            // admin escolherá um novo no /hub da org alvo.
            idWorkspace: undefined,
          };
        }
      }

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
