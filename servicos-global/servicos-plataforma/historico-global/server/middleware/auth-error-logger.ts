/**
 * auth-error-logger.ts
 *
 * Ponto Cego 2 — Captura erros 401/403 que acontecem ANTES ou DENTRO dos route
 * handlers e registra apenas eventos de segurança REAIS via `securityAudit`.
 *
 * Política (alinhada a `documentos-tecnicos/historico-alteracoes/regras-de-negocio.md` §2.5):
 *  - 401 (token ausente/inválido) → grava `authFailure` no histórico.
 *  - 403 com `req.query.id_organizacao !== auth.id_organizacao` (cruzamento
 *    real de organização) → grava `crossTenantAttempt` no histórico.
 *  - 403 sem cruzamento de organização (ex: usuário comum tentando rota
 *    `requireGravityAdmin`) → **NÃO** grava no histórico. É falha de patente,
 *    não tentativa maliciosa cross-tenant. Métricas de 403 nessas rotas vão
 *    para Prometheus (`http_403_total`) — separadas do audit trail.
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

  if (statusCode !== 401 && statusCode !== 403) {
    next(err)
    return
  }

  const id_organizacao =
    (req.headers['x-id-organizacao'] as string) ||
    (req as { auth?: { id_organizacao?: string } }).auth?.id_organizacao ||
    'unknown'

  const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown'
  const endpoint = req.originalUrl || req.url

  setImmediate(() => {
    if (statusCode === 401) {
      securityAudit.authFailure(id_organizacao, {
        ip,
        motivo_falha: err.message,
        endpoint,
      })
      return
    }

    // 403 — só grava se for cruzamento REAL de organização.
    // Falha de patente (ex: PADRAO tentando rota requireGravityAdmin) NÃO vai
    // pro histórico. A regra está documentada em regras-de-negocio.md §2.5.
    const id_organizacao_solicitada = req.query.id_organizacao as string | undefined
    const id_organizacao_atual = (req as { auth?: { id_organizacao?: string } }).auth?.id_organizacao
    const cruzouOrganizacao =
      !!id_organizacao_solicitada &&
      !!id_organizacao_atual &&
      id_organizacao_solicitada !== id_organizacao_atual

    if (!cruzouOrganizacao) return

    const id_usuario = (req as { auth?: { id_usuario?: string } }).auth?.id_usuario ?? 'anonymous'
    const nome_usuario = (req as { auth?: { nome_usuario?: string } }).auth?.nome_usuario
    securityAudit.crossTenantAttempt(
      id_organizacao,
      id_usuario,
      {
        id_organizacao_alvo: id_organizacao_solicitada,
        endpoint,
      },
      nome_usuario,
    )
  })

  next(err)
}
