/**
 * requireInternalKey.ts — Middleware S2S
 * Valida x-internal-key em chamadas entre servicos.
 * Skill: antigravity-autenticacao-s2s
 */
import { Request, Response, NextFunction } from 'express'

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  // Health check e master-data nao precisam de autenticacao
  if (req.path === '/health' || req.path.startsWith('/api/v1/master-data')) return next()
  // Portal do fornecedor com token publico nao precisa de internal key
  if (req.path.startsWith('/api/v1/bid-frete/portal/public')) return next()

  const key = req.headers['x-internal-key']
  const expected = process.env.INTERNAL_SERVICE_KEY

  if (!expected) {
    console.warn('[BidFrete] INTERNAL_SERVICE_KEY nao configurada. Bloqueando.')
    return res.status(500).json({ error: 'Servico mal configurado' })
  }

  if (key !== expected) {
    return res.status(401).json({ error: 'Chave interna invalida', code: 'UNAUTHORIZED' })
  }

  next()
}
