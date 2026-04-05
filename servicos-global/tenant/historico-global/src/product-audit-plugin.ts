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
 *     product_id: 'pedido',
 *     module: 'pedido',
 *     getActorFromReq: (req) => ({
 *       actor_id:   req.auth.userId,
 *       actor_name: req.auth.userName ?? req.auth.userId,
 *       actor_type: 'USER',
 *       tenant_id:  req.auth.tenantId,
 *     }),
 *   })
 *
 *   app.use(auditPlugin)  // antes das rotas — registra todas as mutações
 */

import type { Request, Response, NextFunction } from 'express'
import { auditLog } from './audit-client.js'

export type ActorType = 'USER' | 'API' | 'AI' | 'JOB' | 'INTEGRATION'

export interface AuditActorContext {
  actor_id: string
  actor_name: string
  actor_type: ActorType
  tenant_id: string
}

export interface ProductAuditPluginOptions {
  /** ID do produto que está sendo instrumentado (ex: 'pedido', 'nf-importacao') */
  product_id: string
  /** Módulo padrão para todos os logs deste produto */
  module: string
  /** Extrai dados do ator da requisição autenticada */
  getActorFromReq: (req: Request) => AuditActorContext | null
  /**
   * Rotas a ignorar (default: GET, HEAD, OPTIONS).
   * Aceita regex ou string de prefixo.
   */
  ignoreRoutes?: (string | RegExp)[]
  /**
   * Mapeia o resource_type a partir da URL (opcional).
   * Padrão: usa o primeiro segmento do path após o prefixo.
   * Ex: /pedidos/123 → resource_type = 'pedido', resource_id = '123'
   */
  resourceTypeFromPath?: (req: Request) => string
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * Infere resource_type e resource_id a partir da URL.
 * Ex: /api/v1/pedidos/123/itens/456 → resource_type='pedidos', resource_id='123'
 */
function inferResourceFromPath(req: Request): { resource_type: string; resource_id?: string } {
  const segments = req.path.replace(/^\/+/, '').split('/').filter(Boolean)
  // Remove prefixos comuns de API
  const apiPrefixPatterns = /^(api|v\d+|internal)$/i
  const meaningful = segments.filter((s) => !apiPrefixPatterns.test(s))
  const resource_type = meaningful[0] ?? req.path
  // Se o próximo segmento parece um ID (UUID ou número), usa como resource_id
  const maybeId = meaningful[1]
  const resource_id =
    maybeId && /^[0-9a-f-]{8,}$/i.test(maybeId) ? maybeId : req.params?.id
  return { resource_type, resource_id }
}

function buildActionDetail(method: string, resource_type: string, id?: string): string {
  const map: Record<string, string> = {
    POST: 'Criou',
    PUT: 'Atualizou',
    PATCH: 'Atualizou parcialmente',
    DELETE: 'Removeu',
  }
  const verb = map[method] ?? method
  return id ? `${verb} ${resource_type} #${id}` : `${verb} ${resource_type}`
}

export function createProductAuditPlugin(opts: ProductAuditPluginOptions) {
  const { product_id, module, getActorFromReq, ignoreRoutes = [], resourceTypeFromPath } = opts

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

        const { resource_type, resource_id } =
          resourceTypeFromPath
            ? { resource_type: resourceTypeFromPath(req), resource_id: req.params?.id }
            : inferResourceFromPath(req)

        const resolvedId = (body as any)?.id ?? resource_id ?? req.params?.id

        auditLog({
          tenant_id: actor.tenant_id,
          actor_type: actor.actor_type,
          actor_id: actor.actor_id,
          actor_name: actor.actor_name,
          actor_ip: req.ip,
          actor_metadata: {
            user_agent: req.headers['user-agent'],
            correlation_id: req.headers['x-correlation-id'],
            method: req.method,
          },
          module,
          resource_type,
          resource_id: resolvedId,
          action: req.method,
          action_detail: buildActionDetail(req.method, resource_type, resolvedId),
          after: isSuccess ? (body as Record<string, unknown>) : undefined,
          status: isFailure ? 'FAILURE' : isSuccess ? 'SUCCESS' : 'PARTIAL',
          error_message: isFailure ? (body as any)?.message : undefined,
          product_id,
          user_id: actor.actor_type === 'USER' ? actor.actor_id : undefined,
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
