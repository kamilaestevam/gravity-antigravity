/**
 * requireInternalKey.ts — Middleware S2S
 * Valida x-internal-key em chamadas entre serviços.
 * Skill: antigravity-autenticacao-s2s
 */
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  // Health check e master-data (dados públicos) não precisam de autenticação
  if (req.path === '/health' || req.path.startsWith('/api/v1/master-data')) return next()

  const key = req.headers['x-internal-key'] as string | undefined
  const expected = process.env.CHAVE_INTERNA_SERVICO

  if (!expected) {
    console.warn('[SimulaCusto] CHAVE_INTERNA_SERVICO não configurada. Bloqueando.')
    return res.status(500).json({ error: 'Serviço mal configurado' })
  }

  if (!key || !safeCompare(key, expected)) {
    return res.status(401).json({ error: 'Chave interna inválida', code: 'UNAUTHORIZED' })
  }

  next()
}
