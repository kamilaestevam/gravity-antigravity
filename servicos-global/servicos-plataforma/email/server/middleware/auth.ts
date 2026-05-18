// server/middleware/auth.ts
// Valida x-internal-key (ou x-chave-interna-servico) e extrai tenant_id
// obrigatório de toda requisição protegida.
// Nenhum email pode ser enviado sem tenant_id validado.
//
// Lazy-read porque ES modules hoist imports antes de dotenv.config().

import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { AppError } from '../lib/errors.js'

function getInternalKey(): string {
  return process.env.CHAVE_INTERNA_SERVICO ?? ''
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Aceita ambos os nomes de header (legado: x-internal-key, atual: x-chave-interna-servico)
  const internalKey =
    (req.headers['x-internal-key']           as string | undefined) ??
    (req.headers['x-chave-interna-servico']  as string | undefined)
  const expected = getInternalKey()
  const expectedBuf = Buffer.from(expected)
  const receivedBuf = Buffer.from(typeof internalKey === 'string' ? internalKey : '')
  const isValid = !!expected && !!internalKey && expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf)
  if (!isValid) {
    return next(new AppError('Chave interna inválida ou ausente', 401, 'UNAUTHORIZED'))
  }

  const tenantId = req.headers['x-id-organizacao'] as string | undefined
  if (!tenantId) {
    return next(new AppError('tenant_id obrigatório — header x-id-organizacao ausente', 400, 'MISSING_TENANT_ID'))
  }

  const userId = (req.headers['x-id-usuario'] as string | undefined) ?? 'system'

  req.auth = { id_organizacao: tenantId, id_usuario: userId }
  next()
}
