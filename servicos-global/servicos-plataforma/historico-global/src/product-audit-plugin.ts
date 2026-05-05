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
 * Mapa HTTP method → verbo PT-BR UPPER_SNAKE conforme Mandamento 03 e
 * skill `arquitetura/observabilidade/SKILL.md:307`.
 *
 * `acao_historico_log` é VERBO (CRIAR/ATUALIZAR/EXCLUIR), `tipo_recurso_historico_log`
 * é o OBJETO afetado. A combinação dos dois substitui o padrão antigo de codigos
 * compostos como `INVOICE_CREATED`, `WORKSPACE_DELETED` etc.
 */
const HTTP_PARA_ACAO: Record<string, string> = {
  POST:   'CRIAR',
  PUT:    'ATUALIZAR',
  PATCH:  'ATUALIZAR',
  DELETE: 'EXCLUIR',
}

/**
 * Mapa verbo → particípio passado para uso em `detalhe_acao_historico_log`.
 * Ex: CRIAR → "Criou", EXCLUIR → "Excluiu". Usado quando o caller não tem
 * detalhe humano específico (fallback).
 */
const ACAO_PARA_PARTICIPIO: Record<string, string> = {
  CRIAR:     'Criou',
  ATUALIZAR: 'Atualizou',
  EXCLUIR:   'Excluiu',
}

/**
 * Normaliza o segmento de path do recurso para PascalCase canonical (singular).
 * Espelha REGRA 7 de `ddd-nomenclatura` (PascalCase em PT-BR para nomes de model).
 *
 * Heurística:
 *  - retira plural simples (sufixo 's' / 'es')
 *  - aplica PascalCase (primeira letra maiúscula, demais minúsculas)
 *  - hífen / underscore → camel-bound (ex: 'nf-importacao' → 'NfImportacao')
 *
 * Ex: 'workspaces' → 'Workspace', 'pedidos' → 'Pedido', 'organizacoes' → 'Organizacao',
 *     'nf-importacao' → 'NfImportacao', 'campos_calculados' → 'CampoCalculado'
 */
function normalizarTipoRecurso(raw: string): string {
  if (!raw) return raw
  // Singularização ingênua — funciona para os casos PT-BR mais comuns
  let singular = raw
  if (singular.endsWith('oes')) {
    singular = singular.slice(0, -3) + 'ao'  // organizacoes → organizacao
  } else if (singular.endsWith('aes')) {
    singular = singular.slice(0, -3) + 'ao'  // alemães → alemao (raro)
  } else if (singular.endsWith('es') && singular.length > 4 && /[zrs]es$/.test(singular)) {
    singular = singular.slice(0, -2)  // mes - vez - veres → ve (raro, mas seguro)
  } else if (singular.endsWith('s') && !singular.endsWith('ss')) {
    singular = singular.slice(0, -1)  // workspaces → workspace, pedidos → pedido
  }
  // PascalCase com hífen/underscore como separador
  return singular
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join('')
}

/**
 * Infere tipo_recurso_historico_log e id_recurso_historico_log a partir da URL.
 * Ex: /api/v1/pedidos/123/itens/456 → tipo_recurso_historico_log='Pedido', id_recurso_historico_log='123'
 */
function inferResourceFromPath(req: Request): { tipo_recurso_historico_log: string; id_recurso_historico_log?: string } {
  const segments = req.path.replace(/^\/+/, '').split('/').filter(Boolean)
  // Remove prefixos comuns de API
  const apiPrefixPatterns = /^(api|v\d+|internal)$/i
  const meaningful = segments.filter((s) => !apiPrefixPatterns.test(s))
  const rawTipoRecurso = meaningful[0] ?? req.path
  const tipo_recurso_historico_log = normalizarTipoRecurso(rawTipoRecurso)
  // Se o próximo segmento parece um ID (UUID ou número), usa como id_recurso_historico_log
  const maybeId = meaningful[1]
  const id_recurso_historico_log =
    maybeId && /^[0-9a-f-]{8,}$/i.test(maybeId) ? maybeId : req.params?.id
  return { tipo_recurso_historico_log, id_recurso_historico_log }
}

function buildActionDetail(acao: string, tipo_recurso_historico_log: string, id?: string): string {
  const verbo = ACAO_PARA_PARTICIPIO[acao] ?? acao.toLowerCase()
  return id ? `${verbo} ${tipo_recurso_historico_log} #${id}` : `${verbo} ${tipo_recurso_historico_log}`
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
            endpoint: req.originalUrl || req.url,
          },
          modulo_historico_log,
          tipo_recurso_historico_log,
          id_recurso_historico_log: resolvedId,
          acao_historico_log: HTTP_PARA_ACAO[req.method] ?? req.method,
          detalhe_acao_historico_log: buildActionDetail(HTTP_PARA_ACAO[req.method] ?? req.method, tipo_recurso_historico_log, resolvedId),
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
