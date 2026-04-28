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
    const tenantId =
      (req.headers['x-id-organizacao'] as string) ||
      (req as any).auth?.tenantId ||
      'unknown'

    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown'
    const endpoint = req.originalUrl || req.url

    setImmediate(() => {
      if (statusCode === 401) {
        securityAudit.authFailure(tenantId, {
          ip,
          reason: err.message,
          endpoint,
        })
      } else {
        // 403 = autenticado mas sem permissão — pode ser tentativa de cross-tenant
        securityAudit.crossTenantAttempt(tenantId, (req as any).auth?.userId ?? 'anonymous', {
          targetTenantId: (req.query.tenant_id as string) ?? tenantId,
          resource: endpoint,
          blocked: true,
        })
      }
    })
  }

  next(err)
}
