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

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  // Master-data público: rotas DDD top-level (moedas, tipos-liquidacao, metodos-vencimento, cotacoes-ptax)
  if (req.path === '/health') return next()
  if (
    req.path.startsWith('/api/v1/moedas') ||
    req.path.startsWith('/api/v1/tipos-liquidacao') ||
    req.path.startsWith('/api/v1/metodos-vencimento') ||
    req.path.startsWith('/api/v1/cotacoes-ptax')
  ) return next()
  if (req.path.startsWith('/api/v1/bid-cambio/portal/public')) return next()

  const key = req.headers['x-internal-key'] as string | undefined
  const expected = process.env.INTERNAL_SERVICE_KEY

  if (!expected) {
    console.warn('[BidCambio] INTERNAL_SERVICE_KEY nao configurada. Bloqueando.')
    return res.status(500).json({ error: 'Servico mal configurado' })
  }

  if (!key || !safeCompare(key, expected)) {
    return res.status(401).json({ error: 'Chave interna invalida', code: 'UNAUTHORIZED' })
  }

  next()
}
