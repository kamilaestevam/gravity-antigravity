/**
 * requireInternalKey.ts — Middleware S2S
 * Valida x-internal-key em chamadas entre servicos.
 * Skill: antigravity-autenticacao-s2s
 */
import { Request, Response, NextFunction } from 'express'

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  // Health check nao precisa de autenticacao
  if (req.path === '/health') return next()

  const key = req.headers['x-internal-key']
  const expected = process.env.INTERNAL_SERVICE_KEY

  if (!expected) {
    console.warn('[Processo] INTERNAL_SERVICE_KEY nao configurada. Bloqueando.')
    return res.status(500).json({ error: 'Servico mal configurado' })
  }

  if (key !== expected) {
    return res.status(401).json({ error: 'Chave interna invalida', code: 'UNAUTHORIZED' })
  }

  next()
}
