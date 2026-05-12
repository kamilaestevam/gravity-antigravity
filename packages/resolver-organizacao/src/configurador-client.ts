/**
 * Cliente HTTP para o Configurador — fonte de verdade de identidade.
 *
 * Endpoints (mounted em /api/v1/internal no Configurador, ver acesso.ts):
 *   GET /api/v1/internal/organizacoes/:id_organizacao   → resolve organizacao por ID (CRON/worker)
 *   GET /api/v1/internal/usuarios/:id_clerk_usuario     → resolve org pelo Clerk sub (middleware HTTP)
 *
 * Toda chamada inclui `x-chave-interna-servico` (S2S). Falhas mapeadas para `AppError`.
 * Cache fica em `cache.ts` — este módulo faz apenas o fetch + validação Zod.
 */

import { randomUUID } from 'crypto';
import { z } from 'zod';
import type { ContextoOrganizacao } from './types.js';
import { AppError } from './errors.js';
import { buildSchemaName } from './schema-name.js';

// ---------------------------------------------------------------------------
// Schemas Zod — contratos das respostas do Configurador
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/internal/organizacoes/:id_organizacao
 * Chamado por withOrganizacaoContext (background/CRON). Retorna só a organização.
 */
const OrganizacaoByIdSchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'suspended', 'deleted']),
  idWorkspace: z.string().optional().nullable(),
});

/**
 * GET /api/v1/internal/usuarios/:id_clerk_usuario
 * Chamado pelo middleware (path HTTP). Retorna organização + contexto do usuário.
 * O parametro NAO eh o CUID id_usuario — eh o id_clerk_usuario (sub do JWT).
 */
const OrganizacaoByUsuarioSchema = z.object({
  idOrganizacao: z.string(),
  status: z.enum(['active', 'suspended', 'deleted']),
  idUsuario: z.string().min(1),
  tiposUsuario: z.array(z.string()),
  idWorkspace: z.string().optional().nullable(),
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
  chaveInterna: string;
  timeoutMs?: number;
  retries?: number;
}

export interface ConfiguradorClient {
  resolveOrganizacaoById(idOrganizacao: string, idCorrelacao?: string): Promise<ContextoOrganizacao>;
  resolveOrganizacaoByIdUsuario(idUsuario: string, idCorrelacao?: string): Promise<ContextoOrganizacao>;
  /**
   * PORTÃO 3 — verifica se um usuário tem acesso a um produto em um workspace.
   * Master/SuperAdmin/Admin sempre `true` (bypass server-side no Configurador).
   * Falha de comunicação → throws AppError(503). Caller decide se nega ou permite.
   */
  verificarAcessoProduto(args: {
    idOrganizacao: string;
    idUsuario: string;
    idWorkspace: string;
    slugProduto: string;
    idCorrelacao?: string;
  }): Promise<{ permitido: boolean; motivo?: string }>;
}

const AcessoProdutoResponseSchema = z.object({
  permitido: z.boolean(),
  motivo: z.string().optional(),
});

export function createConfiguradorClient(opts: ConfiguradorClientOptions): ConfiguradorClient {
  const timeoutMs = opts.timeoutMs ?? 5_000;
  const retries = opts.retries ?? 3;

  function baseHeaders(idCorrelacao: string): Record<string, string> {
    return {
      'x-chave-interna-servico': opts.chaveInterna,
      'x-id-correlacao': idCorrelacao,
      'Content-Type': 'application/json',
    };
  }

  return {
    async resolveOrganizacaoById(idOrganizacao, idCorrelacao = randomUUID()): Promise<ContextoOrganizacao> {
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/organizacoes/${encodeURIComponent(idOrganizacao)}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries,
      );

      if (res.status === 404) {
        throw new AppError('Organização não encontrada', 404, 'ORGANIZACAO_NOT_FOUND');
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status}`,
          503,
          'CONFIGURADOR_UNAVAILABLE',
        );
      }

      const raw: unknown = await res.json();
      const parsed = OrganizacaoByIdSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          'Resposta inválida do Configurador (organização by ID)',
          503,
          'CONFIGURADOR_INVALID_RESPONSE',
        );
      }

      if (parsed.data.status !== 'active') {
        throw new AppError('Organização inativa ou suspensa', 403, 'ORGANIZACAO_INACTIVE');
      }

      return {
        idOrganizacao: parsed.data.id,
        nomeSchema: buildSchemaName(parsed.data.id),
        idWorkspace: parsed.data.idWorkspace ?? undefined,
        idUsuario: 'system', // background job — sem usuário
        tiposUsuario: [],
        idCorrelacao,
      };
    },

    async resolveOrganizacaoByIdUsuario(idUsuario, idCorrelacao = randomUUID()): Promise<ContextoOrganizacao> {
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/usuarios/${encodeURIComponent(idUsuario)}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries,
      );

      if (res.status === 404) {
        throw new AppError('Usuário ou organização não encontrada', 404, 'ORGANIZACAO_NOT_FOUND');
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status}`,
          503,
          'CONFIGURADOR_UNAVAILABLE',
        );
      }

      const raw: unknown = await res.json();
      const parsed = OrganizacaoByUsuarioSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          'Resposta inválida do Configurador (organização by usuário)',
          503,
          'CONFIGURADOR_INVALID_RESPONSE',
        );
      }

      if (parsed.data.status !== 'active') {
        throw new AppError('Organização inativa ou suspensa', 403, 'ORGANIZACAO_INACTIVE');
      }

      return {
        idOrganizacao: parsed.data.idOrganizacao,
        nomeSchema: buildSchemaName(parsed.data.idOrganizacao),
        idWorkspace: parsed.data.idWorkspace ?? undefined,
        idUsuario: parsed.data.idUsuario,
        tiposUsuario: parsed.data.tiposUsuario,
        idCorrelacao,
      };
    },

    async verificarAcessoProduto({ idOrganizacao, idUsuario, idWorkspace, slugProduto, idCorrelacao = randomUUID() }) {
      const params = new URLSearchParams({
        id_organizacao: idOrganizacao,
        id_usuario: idUsuario,
        id_workspace: idWorkspace,
        slug_produto: slugProduto,
      });
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/acesso-produto/verificar?${params.toString()}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries,
      );

      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status} ao verificar acesso ao produto`,
          503,
          'CONFIGURADOR_UNAVAILABLE',
        );
      }

      const raw: unknown = await res.json();
      const parsed = AcessoProdutoResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          'Resposta inválida do Configurador (acesso-produto)',
          503,
          'CONFIGURADOR_INVALID_RESPONSE',
        );
      }
      return parsed.data;
    },
  };
}

// ---------------------------------------------------------------------------
// Cliente padrão — lê de env (usado por withOrganizacaoContext)
// ---------------------------------------------------------------------------

function resolveEnvConfig(): ConfiguradorClientOptions {
  const baseUrl = process.env.CONFIGURATOR_URL;
  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO;

  if (!baseUrl) {
    throw new AppError(
      '[@gravity/resolver-organizacao] CONFIGURATOR_URL não definido',
      500,
      'SDK_MISCONFIGURED',
    );
  }
  if (!chaveInterna) {
    throw new AppError(
      '[@gravity/resolver-organizacao] CHAVE_INTERNA_SERVICO não definido',
      500,
      'SDK_MISCONFIGURED',
    );
  }

  return { baseUrl, chaveInterna };
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
export async function resolveOrganizacaoById(
  idOrganizacao: string,
  idCorrelacao?: string,
): Promise<ContextoOrganizacao> {
  return getDefaultClient().resolveOrganizacaoById(idOrganizacao, idCorrelacao);
}

export async function resolveOrganizacaoByIdUsuario(
  idUsuario: string,
  idCorrelacao?: string,
): Promise<ContextoOrganizacao> {
  return getDefaultClient().resolveOrganizacaoByIdUsuario(idUsuario, idCorrelacao);
}
