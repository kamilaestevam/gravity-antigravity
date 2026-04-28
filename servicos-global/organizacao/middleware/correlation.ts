// middleware/correlation.ts
// Injeta correlation ID em toda requisição para rastreabilidade nos logs.
// Versão compartilhada — usada pelo super-servidor e pode substituir
// as cópias locais em cada serviço tenant.

import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

declare global {
  namespace Express {
    interface Request {
      correlationId: string
      auth: { id_organizacao: string; id_usuario: string }
    }
  }
}

export function correlationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  req.correlationId = (req.headers['x-correlation-id'] as string) ?? randomUUID()
  next()
}
