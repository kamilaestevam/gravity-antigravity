/**
 * product-audit-plugin.ts
 *
 * Ponto Cego 4 — Plugin de auditoria automática para produtos Gravity.
 * Auto-instrumenta todos os métodos mutáveis (POST/PUT/PATCH/DELETE) de um
 * Express Router, sem alterar o código das rotas existentes.
 *
 * Uso em qualquer produto:
 *
 *   import { createProductAuditPlugin } from '@gravity/historico/product-audit-plugin'
 *   import { auditLog } from '@gravity/historico/audit-client'
 *
 *   const auditPlugin = createProductAuditPlugin({
 *     id_produto_historico_log: 'pedido',
 *     modulo_historico_log: 'pedido',
 *     getActorFromReq: (req) => ({
 *       id_ator_historico_log:   req.auth.id_usuario,
 *       nome_ator_historico_log: req.auth.nome_usuario ?? req.auth.id_usuario,
 *       tipo_ator_historico_log: 'USUARIO',
 *       id_organizacao:          req.auth.id_organizacao,
 *     }),
 *   })
 *
 *   app.use(auditPlugin)  // antes das rotas — registra todas as mutações
 */

import type { Request, Response, NextFunction } from 'express'
import { auditLog, type TipoAtorHistoricoLog } from './audit-client.js'

export interface AuditActorContext {
  id_ator_historico_log: string
  nome_ator_historico_log: string
  tipo_ator_historico_log: TipoAtorHistoricoLog
  id_organizacao: string
}

export interface ProductAuditPluginOptions {
  /** ID do produto que está sendo instrumentado (ex: 'pedido', 'nf-importacao') */
  id_produto_historico_log: string
  /** Módulo padrão para todos os logs deste produto */
  modulo_historico_log: string
  /** Extrai dados do ator da requisição autenticada */
  getActorFromReq: (req: Request) => AuditActorContext | null
  /**
   * Rotas a ignorar (default: GET, HEAD, OPTIONS).
   * Aceita regex ou string de prefixo.
   */
  ignoreRoutes?: (string | RegExp)[]
  /**
   * Mapeia o tipo_recurso_historico_log a partir da URL (opcional).
   * Padrão: usa o primeiro segmento do path após o prefixo.
   * Ex: /pedidos/123 → tipo_recurso_historico_log = 'pedido', id_recurso_historico_log = '123'
   */
  resourceTypeFromPath?: (req: Request) => string
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * Infere tipo_recurso_historico_log e id_recurso_historico_log a partir da URL.
 * Ex: /api/v1/pedidos/123/itens/456 → tipo_recurso_historico_log='pedidos', id_recurso_historico_log='123'
 */
function inferResourceFromPath(req: Request): { tipo_recurso_historico_log: string; id_recurso_historico_log?: string } {
  const segments = req.path.replace(/^\/+/, '').split('/').filter(Boolean)
  // Remove prefixos comuns de API
  const apiPrefixPatterns = /^(api|v\d+|internal)$/i
  const meaningful = segments.filter((s) => !apiPrefixPatterns.test(s))
  const tipo_recurso_historico_log = meaningful[0] ?? req.path
  // Se o próximo segmento parece um ID (UUID ou número), usa como id_recurso_historico_log
  const maybeId = meaningful[1]
  const id_recurso_historico_log =
    maybeId && /^[0-9a-f-]{8,}$/i.test(maybeId) ? maybeId : req.params?.id
  return { tipo_recurso_historico_log, id_recurso_historico_log }
}

function buildActionDetail(method: string, tipo_recurso_historico_log: string, id?: string): string {
  const map: Record<string, string> = {
    POST: 'Criou',
    PUT: 'Atualizou',
    PATCH: 'Atualizou parcialmente',
    DELETE: 'Removeu',
  }
  const verb = map[method] ?? method
  return id ? `${verb} ${tipo_recurso_historico_log} #${id}` : `${verb} ${tipo_recurso_historico_log}`
}

export function createProductAuditPlugin(opts: ProductAuditPluginOptions) {
  const { id_produto_historico_log, modulo_historico_log, getActorFromReq, ignoreRoutes = [], resourceTypeFromPath } = opts

  return function auditPluginMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Só instrumenta métodos mutáveis
    if (!MUTATING_METHODS.has(req.method)) {
      next()
      return
    }

    // Verificar rotas ignoradas
    for (const pattern of ignoreRoutes) {
      const path = req.originalUrl || req.url
      if (typeof pattern === 'string' ? path.startsWith(pattern) : pattern.test(path)) {
        next()
        return
      }
    }

    const actor = getActorFromReq(req)
    if (!actor) {
      next()
      return
    }

    const originalJson = res.json.bind(res)

    res.json = function (body: unknown): Response {
      setImmediate(() => {
        try {
        const statusCode = res.statusCode
        const isSuccess = statusCode >= 200 && statusCode < 300
        const isFailure = statusCode >= 400

        const { tipo_recurso_historico_log, id_recurso_historico_log } =
          resourceTypeFromPath
            ? { tipo_recurso_historico_log: resourceTypeFromPath(req), id_recurso_historico_log: req.params?.id }
            : inferResourceFromPath(req)

        const resolvedId = (body as any)?.id ?? id_recurso_historico_log ?? req.params?.id

        auditLog({
          id_organizacao: actor.id_organizacao,
          tipo_ator_historico_log: actor.tipo_ator_historico_log,
          id_ator_historico_log: actor.id_ator_historico_log,
          nome_ator_historico_log: actor.nome_ator_historico_log,
          ip_ator_historico_log: req.ip,
          metadata_ator_historico_log: {
            user_agent: req.headers['user-agent'],
            correlation_id: req.headers['x-correlation-id'],
            method: req.method,
          },
          modulo_historico_log,
          tipo_recurso_historico_log,
          id_recurso_historico_log: resolvedId,
          acao_historico_log: req.method,
          detalhe_acao_historico_log: buildActionDetail(req.method, tipo_recurso_historico_log, resolvedId),
          estado_posterior_historico_log: isSuccess ? (body as Record<string, unknown>) : undefined,
          status_historico_log: isFailure ? 'FALHA' : isSuccess ? 'SUCESSO' : 'PARCIAL',
          mensagem_erro_historico_log: isFailure ? (body as any)?.message : undefined,
          id_produto_historico_log,
          id_usuario: actor.tipo_ator_historico_log === 'USUARIO' ? actor.id_ator_historico_log : undefined,
        })
        } catch (auditErr) {
          // Auditoria é fire-and-forget — nunca deve quebrar a resposta ao cliente
          console.error('[ProductAuditPlugin] Erro no setImmediate:', auditErr)
        }
      })

      return originalJson(body)
    }

    next()
  }
}
