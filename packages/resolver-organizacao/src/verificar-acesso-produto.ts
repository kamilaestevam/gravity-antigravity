/**
 * Middleware Express `verificarAcessoProduto(config)`.
 *
 * PORTÃO 3 — autorização granular usuário × produto Gravity.
 *
 * Deve ser usado APÓS `resolverOrganizacao` (que injeta req.organizacao).
 * Lê `id_workspace` do header `x-id-workspace` (convenção dos produtos Gravity).
 *
 * Faz chamada S2S ao Configurador:
 *   GET /api/v1/internal/acesso-produto/verificar
 *
 * Master/SuperAdmin/Admin → permitido (bypass server-side no Configurador, Mand. 04).
 * Standard/Fornecedor → exige linha `<slug>:acesso_usuario_produtos_gravity:permitido`
 * em `usuario_permissao` para o workspace específico.
 *
 * Em caso de erro de comunicação (503), nega acesso (fail-closed, Mand. 08).
 *
 * USO:
 * ```ts
 * import { resolverOrganizacao, verificarAcessoProduto } from '@gravity/resolver-organizacao'
 * app.use(resolverOrganizacao({ chaveProduto: 'pedido', ... }))
 * app.use(verificarAcessoProduto({ chaveProduto: 'pedido', ... }))
 * ```
 */

import type { RequestHandler } from 'express';
import { createConfiguradorClient } from './configurador-client.js';
import { AppError } from './errors.js';
import { getLogger } from './observability.js';

export interface ConfigVerificarAcessoProduto {
  /** Slug do produto — ex: 'pedido', 'bid-frete'. */
  chaveProduto: string;
  /** Base URL do Configurador (mesmo valor passado a resolverOrganizacao). */
  configuradorBaseUrl: string;
  /** Chave S2S — mesma usada em resolverOrganizacao. */
  chaveInterna: string;
  configuradorTimeoutMs?: number;
  configuradorRetries?: number;
}

export function verificarAcessoProduto(config: ConfigVerificarAcessoProduto): RequestHandler {
  const client = createConfiguradorClient({
    baseUrl: config.configuradorBaseUrl,
    chaveInterna: config.chaveInterna,
    timeoutMs: config.configuradorTimeoutMs,
    retries: config.configuradorRetries,
  });

  const log = getLogger();

  return async (req, _res, next) => {
    try {
      const ctx = req.organizacao;
      if (!ctx) {
        throw new AppError(
          'verificarAcessoProduto exige resolverOrganizacao antes (req.organizacao ausente)',
          500,
          'SDK_MISCONFIGURED',
        );
      }

      // id_workspace é OBRIGATÓRIO para Portão 3.
      // Convenção: header x-id-workspace (Mand. 08 — sem fallback silencioso).
      const idWorkspace = req.headers['x-id-workspace'] as string | undefined;
      if (!idWorkspace) {
        throw new AppError(
          'Header x-id-workspace ausente — Portão 3 exige workspace específico',
          400,
          'WORKSPACE_NAO_INFORMADO',
        );
      }

      const { permitido, motivo } = await client.verificarAcessoProduto({
        idOrganizacao: ctx.idOrganizacao,
        idUsuario: ctx.idUsuario,
        idWorkspace,
        slugProduto: config.chaveProduto,
        idCorrelacao: ctx.idCorrelacao,
      });

      if (!permitido) {
        log.warn(
          {
            idOrganizacao: ctx.idOrganizacao,
            idUsuario: ctx.idUsuario,
            idWorkspace,
            slugProduto: config.chaveProduto,
            motivo,
          },
          'Portão 3 negou acesso ao produto',
        );
        throw new AppError(
          `Acesso ao produto "${config.chaveProduto}" não autorizado neste workspace`,
          403,
          'ACESSO_PRODUTO_NEGADO',
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
