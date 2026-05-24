/**
 * validar-chave-interna.ts — Middleware S2S
 * Valida x-internal-key em chamadas entre servicos.
 * Skill: antigravity-autenticacao-s2s
 */
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  // Health check e master-data nao precisam de autenticacao
  if (req.path === '/health' || req.path.startsWith('/api/v1/master-data')) return next()
  // Portal do fornecedor com token publico nao precisa de internal key
  if (req.path.startsWith('/api/v1/bid-frete-internacional/portal/public')) return next()

  const key = req.headers['x-internal-key'] as string | undefined
  const expected = process.env.CHAVE_INTERNA_SERVICO

  if (!expected) {
    console.warn('[BidFreteInternacional] CHAVE_INTERNA_SERVICO nao configurada. Bloqueando.')
    return res.status(500).json({ error: 'Servico mal configurado' })
  }

  if (!key || !safeCompare(key, expected)) {
    return res.status(401).json({ error: 'Chave interna invalida', code: 'UNAUTHORIZED' })
  }

  next()
}
