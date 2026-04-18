/**
 * Cliente HTTP para o Configurador — fonte de verdade de identidade.
 *
 * Endpoints:
 *   GET /api/internal/tenants/:id   → resolve tenant por ID (CRON/worker)
 *   GET /api/internal/users/:userId → resolve tenant pelo usuário (middleware HTTP)
 *
 * Toda chamada inclui `x-internal-key`. Falhas são mapeadas para `AppError`.
 * Cache fica em `cache.ts` — este módulo faz apenas o fetch + validação Zod.
 */

import { randomUUID } from 'crypto';
import { z } from 'zod';
import type { TenantContext } from './types.js';
import { AppError } from './errors.js';
import { buildSchemaName } from './schema-name.js';

// ---------------------------------------------------------------------------
// Schemas Zod — contratos das respostas do Configurador
// ---------------------------------------------------------------------------

/**
 * GET /api/internal/tenants/:id
 * Chamado por withTenantContext (background/CRON). Retorna só o tenant.
 */
const TenantByIdSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['active', 'suspended', 'deleted']),
  workspaceId: z.string().uuid().optional().nullable(),
});

/**
 * GET /api/internal/users/:userId
 * Chamado pelo middleware (path HTTP). Retorna tenant + contexto do usuário.
 */
const TenantByUserSchema = z.object({
  tenantId: z.string().uuid(),
  status: z.enum(['active', 'suspended', 'deleted']),
  userId: z.string().min(1),
  roles: z.array(z.string()),
  workspaceId: z.string().uuid().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Fetch com retry e timeout
// ---------------------------------------------------------------------------

const RETRY_DELAYS_MS = [0, 200, 500] as const;

async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
  retries: number,
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const delay = RETRY_DELAYS_MS[attempt] ?? 500;
    if (delay > 0) await sleep(delay);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      // Último attempt — propaga como indisponibilidade
      if (attempt === retries - 1) {
        throw new AppError(
          `Configurador indisponível após ${retries} tentativa(s): ${String(err)}`,
          503,
          'CONFIGURADOR_UNAVAILABLE',
        );
      }
    }
  }
  // Unreachable, mas satisfaz o compilador
  throw new AppError('Configurador indisponível', 503, 'CONFIGURADOR_UNAVAILABLE');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Factory — clientes configuráveis (para testes e override por produto)
// ---------------------------------------------------------------------------

export interface ConfiguradorClientOptions {
  baseUrl: string;
  internalKey: string;
  timeoutMs?: number;
  retries?: number;
}

export interface ConfiguradorClient {
  resolveTenantById(tenantId: string, correlationId?: string): Promise<TenantContext>;
  resolveTenantByUserId(userId: string, correlationId?: string): Promise<TenantContext>;
}

export function createConfiguradorClient(opts: ConfiguradorClientOptions): ConfiguradorClient {
  const timeoutMs = opts.timeoutMs ?? 5_000;
  const retries = opts.retries ?? 3;

  function baseHeaders(correlationId: string): Record<string, string> {
    return {
      'x-internal-key': opts.internalKey,
      'x-correlation-id': correlationId,
      'Content-Type': 'application/json',
    };
  }

  return {
    async resolveTenantById(tenantId, correlationId = randomUUID()): Promise<TenantContext> {
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/internal/tenants/${encodeURIComponent(tenantId)}`,
        baseHeaders(correlationId),
        timeoutMs,
        retries,
      );

      if (res.status === 404) {
        throw new AppError('Tenant não encontrado', 404, 'TENANT_NOT_FOUND');
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status}`,
          503,
          'CONFIGURADOR_UNAVAILABLE',
        );
      }

      const raw: unknown = await res.json();
      const parsed = TenantByIdSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          'Resposta inválida do Configurador (tenant by ID)',
          503,
          'CONFIGURADOR_INVALID_RESPONSE',
        );
      }

      if (parsed.data.status !== 'active') {
        throw new AppError('Tenant inativo ou suspenso', 403, 'TENANT_INACTIVE');
      }

      return {
        tenantId: parsed.data.id,
        schemaName: buildSchemaName(parsed.data.id),
        workspaceId: parsed.data.workspaceId ?? undefined,
        userId: 'system', // background job — sem usuário
        roles: [],
        correlationId,
      };
    },

    async resolveTenantByUserId(userId, correlationId = randomUUID()): Promise<TenantContext> {
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/internal/users/${encodeURIComponent(userId)}`,
        baseHeaders(correlationId),
        timeoutMs,
        retries,
      );

      if (res.status === 404) {
        throw new AppError('Usuário ou tenant não encontrado', 404, 'TENANT_NOT_FOUND');
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status}`,
          503,
          'CONFIGURADOR_UNAVAILABLE',
        );
      }

      const raw: unknown = await res.json();
      const parsed = TenantByUserSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          'Resposta inválida do Configurador (tenant by user)',
          503,
          'CONFIGURADOR_INVALID_RESPONSE',
        );
      }

      if (parsed.data.status !== 'active') {
        throw new AppError('Tenant inativo ou suspenso', 403, 'TENANT_INACTIVE');
      }

      return {
        tenantId: parsed.data.tenantId,
        schemaName: buildSchemaName(parsed.data.tenantId),
        workspaceId: parsed.data.workspaceId ?? undefined,
        userId: parsed.data.userId,
        roles: parsed.data.roles,
        correlationId,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Cliente padrão — lê de env (usado por withTenantContext)
// ---------------------------------------------------------------------------

function resolveEnvConfig(): ConfiguradorClientOptions {
  const baseUrl = process.env.CONFIGURATOR_URL;
  const internalKey = process.env.INTERNAL_SERVICE_KEY;

  if (!baseUrl) {
    throw new AppError(
      '[@gravity/tenant-resolver] CONFIGURATOR_URL não definido',
      500,
      'SDK_MISCONFIGURED',
    );
  }
  if (!internalKey) {
    throw new AppError(
      '[@gravity/tenant-resolver] INTERNAL_SERVICE_KEY não definido',
      500,
      'SDK_MISCONFIGURED',
    );
  }

  return { baseUrl, internalKey };
}

/** Lazy singleton do cliente padrão — instanciado na primeira chamada. */
let _defaultClient: ConfiguradorClient | null = null;

function getDefaultClient(): ConfiguradorClient {
  if (_defaultClient === null) {
    _defaultClient = createConfiguradorClient(resolveEnvConfig());
  }
  return _defaultClient;
}

/** Reseta o singleton padrão — uso EXCLUSIVO em testes. */
export function _resetDefaultClientForTests(): void {
  _defaultClient = null;
}

// Exports funcionais que delegam ao cliente padrão (interface histórica usada em with-tenant.ts)
export async function resolveTenantById(
  tenantId: string,
  correlationId?: string,
): Promise<TenantContext> {
  return getDefaultClient().resolveTenantById(tenantId, correlationId);
}

export async function resolveTenantByUserId(
  userId: string,
  correlationId?: string,
): Promise<TenantContext> {
  return getDefaultClient().resolveTenantByUserId(userId, correlationId);
}
