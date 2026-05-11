// server/middleware/auth.ts
// Valida x-internal-key (ou x-chave-interna-servico) e extrai tenant_id
// obrigatório de toda requisição protegida.
// Nenhum email pode ser enviado sem tenant_id validado.
//
// Aceita as 3 variantes de nome de env var usadas no monorepo (legado nao
// uniformizado): INTERNAL_API_KEY / CHAVE_INTERNA_SERVICO / CHAVE_SERVICO_INTERNO.
// Lazy-read porque ES modules hoist imports antes de dotenv.config().

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'

function getInternalKey(): string {
  return process.env.INTERNAL_API_KEY
      ?? process.env.CHAVE_INTERNA_SERVICO
      ?? process.env.CHAVE_SERVICO_INTERNO
      ?? ''
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
  if (!expected || !internalKey || internalKey !== expected) {
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
