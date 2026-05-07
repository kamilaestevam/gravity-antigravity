/**
 * requireInternalKey.ts — Middleware S2S
 * Valida x-chave-interna-servico em chamadas entre servicos.
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
  '/api/v1/pedidos/analytics',                              // Power BI acessa via token separado (ver analyticsAuth)
  '/api/v1/pedidos/importacoes-inteligentes/template',      // Download público — browser não envia x-chave-interna-servico
]

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const isPublic = PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p + '/'))
  if (isPublic) return next()

  const key = req.headers['x-chave-interna-servico'] as string | undefined
  // Startup em index.ts garante que CHAVE_INTERNA_SERVICO existe antes do servidor aceitar requests
  const expected = process.env.CHAVE_INTERNA_SERVICO!

  if (!key || !safeCompare(key, expected)) {
    return res.status(401).json({ error: 'Chave interna invalida', code: 'UNAUTHORIZED' })
  }

  next()
}
