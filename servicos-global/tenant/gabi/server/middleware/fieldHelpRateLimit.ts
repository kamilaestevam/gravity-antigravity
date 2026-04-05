// server/middleware/fieldHelpRateLimit.ts
// Rate limit simples para POST /api/v1/gabi/field-help
// Limite: 30 chamadas / minuto por tenant (sliding window, in-memory)
// In-memory é suficiente aqui — o limite de tokens no banco é a proteção real.

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'

const WINDOW_MS = 60_000  // 1 minuto
const MAX_CALLS = 30       // chamadas por janela por tenant

interface Window {
  count: number
  resetAt: number
}

const windows = new Map<string, Window>()

// Limpa entradas expiradas a cada 5 minutos para evitar vazamento de memória
setInterval(() => {
  const now = Date.now()
  for (const [key, win] of windows) {
    if (win.resetAt < now) windows.delete(key)
  }
}, 5 * 60_000)

export function fieldHelpRateLimit(req: Request, _res: Response, next: NextFunction): void {
  const tenantId = req.auth?.tenantId ?? 'anonymous'
  const now = Date.now()

  let win = windows.get(tenantId)
  if (!win || win.resetAt < now) {
    win = { count: 0, resetAt: now + WINDOW_MS }
    windows.set(tenantId, win)
  }

  win.count++

  if (win.count > MAX_CALLS) {
    return next(new AppError(
      `Limite de chamadas GABI excedido (${MAX_CALLS}/min por tenant)`,
      429,
      'RATE_LIMIT_EXCEEDED',
    ))
  }

  next()
}
