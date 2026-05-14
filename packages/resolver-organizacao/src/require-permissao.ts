/**
 * Middleware Express `criarRequirePermissao(config)` → factory que devolve
 * uma função `exigirPermissao(secao, acao)` retornando middleware.
 *
 * CADEIA 2 GRANULAR — autorização por `<slug>:<secao>:<acao>` em
 * `UsuarioPermissao`. Deve ser usado APÓS `resolverOrganizacao` (que injeta
 * `req.organizacao`) e idealmente APÓS `verificarAcessoProduto` (Portão 3).
 *
 * Lê `id_workspace` do header `x-id-workspace` (mesma convenção do Portão 3).
 *
 * Faz chamada S2S ao Configurador:
 *   POST /api/v1/internal/permissoes/verificar
 *
 * Master/SuperAdmin/Admin → permitido (bypass server-side no Configurador, Mand. 04).
 * Standard/Fornecedor     → exige linha `<slug>:<secao>:<acao>` em UsuarioPermissao.
 *
 * Cache em memória — TTL 30s por par (usuario, workspace, slug, secao, acao).
 * Janela de inconsistência aceitável (Master altera → próxima request <30s
 * ainda pode ver estado antigo). Cada réplica do produto tem cache próprio
 * (não compartilhado). Padrão consistente com `requireAuth.ts` do Configurador.
 *
 * Feature flag (ENV `<SLUG>_PERMISSOES_GRANULARES_ATIVO`):
 *   - `true`  (default) → bloqueia 403 quando permissão faltar
 *   - `false` → loga shadow audit "rotaria 403" mas LIBERA. Útil pra roll-out
 *     gradual sem lockout. Auditoria preserva visibilidade do blast radius.
 *
 * Em caso de erro de comunicação (503), nega acesso (fail-closed, Mand. 08).
 *
 * USO:
 * ```ts
 * import { resolverOrganizacao, verificarAcessoProduto, criarRequirePermissao }
 *   from '@gravity/resolver-organizacao'
 *
 * app.use(resolverOrganizacao({ chaveProduto: 'pedido', ... }))
 * app.use(verificarAcessoProduto({ chaveProduto: 'pedido', ... }))
 *
 * const exigirPermissao = criarRequirePermissao({
 *   chaveProduto: 'pedido',
 *   configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
 *   chaveInterna: process.env.CHAVE_INTERNA_SERVICO!,
 *   flagAtivaEnvName: 'PEDIDO_PERMISSOES_GRANULARES_ATIVO',
 * })
 *
 * app.use('/api/v1/pedidos/kanban', exigirPermissao('kanban', 'ver'), kanbanRouter)
 * ```
 */

import type { RequestHandler } from 'express';
import { createConfiguradorClient } from './configurador-client.js';
import { AppError } from './errors.js';
import { getLogger } from './observability.js';

export interface ConfigCriarRequirePermissao {
  /** Slug do produto — ex: 'pedido'. Usado na chave canônica `<slug>:<secao>:<acao>`. */
  chaveProduto: string;
  /** Base URL do Configurador. */
  configuradorBaseUrl: string;
  /** Chave S2S compartilhada. */
  chaveInterna: string;
  configuradorTimeoutMs?: number;
  configuradorRetries?: number;
  /**
   * Nome da variável de ambiente que liga/desliga o gating do produto.
   * Quando a env vale `'false'`, o middleware vira NOOP + shadow audit.
   * Default: ligado (flag !== 'false').
   *
   * Convenção: `<SLUG>_PERMISSOES_GRANULARES_ATIVO` (ex.: PEDIDO_..., LPCO_...).
   */
  flagAtivaEnvName?: string;
  /** TTL do cache local em ms. Default 30_000 (30s). */
  cacheTtlMs?: number;
  /**
   * Hook opcional para logar quando a flag está OFF mas a request seria bloqueada
   * com flag ON. Permite medir o blast radius sem causá-lo. Decisão dono 2026-05-13.
   *
   * Fire-and-forget — não bloqueia a request.
   */
  onShadowDeny?: (info: {
    idOrganizacao: string;
    idUsuario: string;
    idWorkspace: string;
    slugProduto: string;
    secao: string;
    acao: string;
    rota: string;
    metodo: string;
  }) => void;
}

interface CacheEntry {
  permitido: boolean;
  expiraEm: number;
}

export type ExigirPermissaoFn = (
  secao: string,
  acao: 'ver' | 'editar',
) => RequestHandler;

export function criarRequirePermissao(config: ConfigCriarRequirePermissao): ExigirPermissaoFn {
  const client = createConfiguradorClient({
    baseUrl: config.configuradorBaseUrl,
    chaveInterna: config.chaveInterna,
    timeoutMs: config.configuradorTimeoutMs,
    retries: config.configuradorRetries,
  });

  const log = getLogger();
  const cacheTtl = config.cacheTtlMs ?? 30_000;
  const cache = new Map<string, CacheEntry>();
  const flagEnvName = config.flagAtivaEnvName;

  function chaveCache(idOrg: string, idUser: string, idWs: string, secao: string, acao: string): string {
    return `${idOrg}|${idUser}|${idWs}|${config.chaveProduto}:${secao}:${acao}`;
  }

  function flagAtiva(): boolean {
    if (!flagEnvName) return true;
    return process.env[flagEnvName] !== 'false';
  }

  return function exigirPermissao(secao: string, acao: 'ver' | 'editar'): RequestHandler {
    return async (req, _res, next) => {
      try {
        const ctx = req.organizacao;
        if (!ctx) {
          throw new AppError(
            'criarRequirePermissao exige resolverOrganizacao antes (req.organizacao ausente)',
            500,
            'SDK_MISCONFIGURED',
          );
        }

        const idWorkspace = req.headers['x-id-workspace'] as string | undefined;
        if (!idWorkspace) {
          throw new AppError(
            'Header x-id-workspace ausente — gating granular exige workspace específico',
            400,
            'WORKSPACE_NAO_INFORMADO',
          );
        }

        // 1) Cache hit
        const key = chaveCache(ctx.idOrganizacao, ctx.idUsuario, idWorkspace, secao, acao);
        const now = Date.now();
        const hit = cache.get(key);
        let permitido: boolean;
        if (hit && hit.expiraEm > now) {
          permitido = hit.permitido;
        } else {
          // 2) S2S ao Configurador
          const r = await client.verificarPermissaoGranular({
            idOrganizacao: ctx.idOrganizacao,
            idUsuario:     ctx.idUsuario,
            idWorkspace,
            slugProduto:   config.chaveProduto,
            secao,
            acao,
            idCorrelacao:  ctx.idCorrelacao,
          });
          permitido = r.permitido;
          cache.set(key, { permitido, expiraEm: now + cacheTtl });
        }

        if (permitido) {
          next();
          return;
        }

        // Negaria. Verifica se a flag está ATIVA antes de bloquear.
        if (!flagAtiva()) {
          // Shadow audit — rotaria 403 mas flag está OFF. Libera o request.
          log.warn(
            {
              idOrganizacao: ctx.idOrganizacao,
              idUsuario:     ctx.idUsuario,
              idWorkspace,
              slugProduto:   config.chaveProduto,
              secao,
              acao,
              rota:          req.originalUrl ?? req.url,
              metodo:        req.method,
            },
            '[shadow-deny] Permissão granular rotaria 403, mas flag está OFF — request liberada',
          );
          try {
            config.onShadowDeny?.({
              idOrganizacao: ctx.idOrganizacao,
              idUsuario:     ctx.idUsuario,
              idWorkspace,
              slugProduto:   config.chaveProduto,
              secao,
              acao,
              rota:          req.originalUrl ?? req.url,
              metodo:        req.method,
            });
          } catch { /* fire-and-forget */ }
          next();
          return;
        }

        // Bloqueia.
        log.warn(
          {
            idOrganizacao: ctx.idOrganizacao,
            idUsuario:     ctx.idUsuario,
            idWorkspace,
            slugProduto:   config.chaveProduto,
            secao,
            acao,
          },
          'Cadeia 2 granular negou acesso',
        );
        throw new AppError(
          `Permissão "${config.chaveProduto}:${secao}:${acao}" negada neste workspace`,
          403,
          'FORBIDDEN_PERMISSION',
        );
      } catch (err) {
        next(err);
      }
    };
  };
}
