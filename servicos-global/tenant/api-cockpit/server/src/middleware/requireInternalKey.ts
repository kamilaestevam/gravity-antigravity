/**
 * requireInternalKey.ts — Middleware S2S para API Cockpit
 * Valida x-internal-key em chamadas entre servicos.
 * Skill: antigravity-autenticacao-s2s
 */
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  // Health check nao precisa de autenticacao
  if (req.path === '/health') return next()

  const key = req.headers['x-internal-key']
  const expected = process.env.INTERNAL_SERVICE_KEY

  if (!expected) {
    console.warn('[API-Cockpit] INTERNAL_SERVICE_KEY nao configurada. Bloqueando.')
    return res.status(500).json({ error: 'Servico mal configurado' })
  }

  if (!key) {
    return res.status(403).json({ error: 'Header x-internal-key ausente', code: 'FORBIDDEN' })
  }

  const keyStr = Array.isArray(key) ? key[0] : key
  const bufA = Buffer.from(keyStr, 'utf8')
  const bufB = Buffer.from(expected, 'utf8')

  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return res.status(403).json({ error: 'Chave interna invalida', code: 'FORBIDDEN' })
  }

  if (!timingSafeEqual(bufA, bufB)) {
    return res.status(403).json({ error: 'Chave interna invalida', code: 'FORBIDDEN' })
  }

  next()
}
