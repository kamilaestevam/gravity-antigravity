/**
 * requireInternalKey.ts — Middleware S2S
 * Valida x-internal-key em chamadas entre servicos.
 * Skill: antigravity-autenticacao-s2s
 */
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

const PUBLIC_PATHS = [
  '/health',
  '/api/v1/analytics/pedido',  // Power BI acessa via token separado (ver analyticsAuth)
]

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const isPublic = PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p + '/'))
  if (isPublic) return next()

  const key = req.headers['x-internal-key'] as string | undefined
  const expected = process.env.INTERNAL_SERVICE_KEY

  if (!expected) {
    console.warn('[Pedido] INTERNAL_SERVICE_KEY nao configurada. Bloqueando.')
    return res.status(500).json({ error: 'Servico mal configurado' })
  }

  if (!key || !safeCompare(key, expected)) {
    return res.status(401).json({ error: 'Chave interna invalida', code: 'UNAUTHORIZED' })
  }

  next()
}
