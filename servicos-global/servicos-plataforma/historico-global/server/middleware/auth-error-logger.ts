/**
 * auth-error-logger.ts
 *
 * Ponto Cego 2 — Captura erros 401/403 que acontecem ANTES dos route handlers
 * (ex: token inválido, tenant ausente) e os registra via securityAudit.
 *
 * Montar ANTES do errorHandler global, DEPOIS das rotas:
 *   app.use(authErrorLogger)
 *   app.use(errorHandler)
 */

import type { Request, Response, NextFunction } from 'express'
import { securityAudit } from '../lib/securityAuditLogger.js'

export function authErrorLogger(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500

  if (statusCode === 401 || statusCode === 403) {
    const id_organizacao =
      (req.headers['x-id-organizacao'] as string) ||
      (req as any).auth?.id_organizacao ||
      'unknown'

    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown'
    const endpoint = req.originalUrl || req.url

    setImmediate(() => {
      if (statusCode === 401) {
        securityAudit.authFailure(id_organizacao, {
          ip,
          reason: err.message,
          endpoint,
        })
      } else {
        // 403 = autenticado mas sem permissão — pode ser tentativa de cross-organizacao
        securityAudit.crossTenantAttempt(id_organizacao, (req as any).auth?.id_usuario ?? 'anonymous', {
          targetTenantId: (req.query.id_organizacao as string) ?? id_organizacao,
          resource: endpoint,
          blocked: true,
        })
      }
    })
  }

  next(err)
}
